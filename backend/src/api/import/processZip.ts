import AdmZip from 'adm-zip';
import { parse } from 'csv-parse';
import { prisma } from '../../config/database';
import { geocodeService } from './geocode';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

interface RawPlace {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  category?: string;
  notes?: string;
}

interface ParsedList {
  name: string;
  places: RawPlace[];
}

export interface ProcessResult {
  success: boolean;
  listsCreated: number;
  placesImported: number;
  errors?: string[];
}

/**
 * Import job tracking for real-time progress updates
 */
export interface ImportJob {
  id: string;
  userId: string;
  stage: 'uploading' | 'extracting' | 'detecting' | 'parsing' | 'geocoding' | 'saving' | 'complete' | 'error';
  progress: number; // 0-100
  listsProcessed: number;
  placesProcessed: number;
  totalLists: number;
  totalPlaces: number;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

export type ProgressCallback = (job: ImportJob) => void;

// In-memory store for import jobs (move to Redis/DB for production)
export const importJobs = new Map<string, ImportJob>();

/**
 * Extract Google Place ID from Maps URL
 * URL format: https://www.google.com/maps/place/[NAME]/data=!4m2!3m1!1s[PLACE_ID]
 */
function extractPlaceIdFromUrl(url: string): string {
  if (!url) {
    return `imported_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  // Try to extract place ID from URL
  const match = url.match(/1s([^:&!]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Generate fallback ID from URL hash
  const urlHash = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  return `imported_${urlHash}`;
}

/**
 * Process Saved/*.csv files from Google Takeout (NEW FORMAT)
 * Each CSV file represents a separate saved list
 */
async function processSavedListsCsv(
  csvEntries: AdmZip.IZipEntry[],
  userId: string,
  jobId: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  const job = importJobs.get(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  const listsCreated: string[] = [];
  let totalPlacesImported = 0;
  const errors: string[] = [];

  job.stage = 'parsing';
  job.totalLists = csvEntries.length;
  job.progress = 40; // Start at 40% after extraction and detection
  if (onProgress) onProgress(job);

  for (let i = 0; i < csvEntries.length; i++) {
    const csvEntry = csvEntries[i];

    try {
      // Extract list name from filename (remove "Saved/" prefix and ".csv" suffix)
      const listName = path.basename(csvEntry.entryName, '.csv');
      console.log(`Processing list: ${listName}`);

      // Parse CSV
      const csvData = csvEntry.getData().toString('utf8');
      const records: any[] = await new Promise((resolve, reject) => {
        parse(csvData, {
          columns: true,
          skip_empty_lines: true,
        }, (err, records) => {
          if (err) reject(err);
          else resolve(records);
        });
      });

      // Filter out empty rows (need at least Title and URL)
      const validRecords = records.filter(r => r.Title && r.URL);
      console.log(`Found ${validRecords.length} places in ${listName}`);

      if (validRecords.length === 0) {
        console.log(`Skipping empty list: ${listName}`);
        continue;
      }

      // Extract places from CSV records
      const rawPlaces: RawPlace[] = validRecords.map((record, idx) => ({
        name: record.Title || `Unnamed Place ${idx + 1}`,
        notes: record.Note || '', // PRESERVE USER NOTES
        googlePlaceId: extractPlaceIdFromUrl(record.URL),
        category: 'general',
      }));

      // Geocode places (CSV doesn't include coordinates)
      job.stage = 'geocoding';
      if (onProgress) onProgress(job);

      const geocodedPlaces: RawPlace[] = [];
      for (const place of rawPlaces) {
        // Try to geocode by place name (since we don't have address in CSV)
        const geocoded = await geocodeService.geocode(place.name);
        if (geocoded) {
          geocodedPlaces.push({
            ...place,
            latitude: geocoded.latitude,
            longitude: geocoded.longitude,
            address: geocoded.displayName,
          });

          // Small delay to respect Nominatim rate limits
          await new Promise(resolve => setTimeout(resolve, 1100));
        } else {
          console.log(`Failed to geocode: ${place.name}`);
          errors.push(`Failed to geocode ${place.name} in list ${listName}`);
        }
      }

      if (geocodedPlaces.length === 0) {
        console.log(`No places could be geocoded for list: ${listName}`);
        errors.push(`No places could be geocoded for list: ${listName}`);
        continue;
      }

      // Create List in database
      job.stage = 'saving';
      if (onProgress) onProgress(job);

      const list = await prisma.list.create({
        data: {
          creatorId: userId,
          title: listName,
          description: `Imported from Google Maps`,
          isPublic: false,
          isPaid: false,
          price: 0,
          placeCount: geocodedPlaces.length,
        },
      });

      // Create Places and ListPlace associations
      for (let j = 0; j < geocodedPlaces.length; j++) {
        const placeData = geocodedPlaces[j];

        try {
          // Find or create Place
          let place = await prisma.place.findUnique({
            where: { googlePlaceId: placeData.googlePlaceId },
          });

          if (!place) {
            place = await prisma.place.create({
              data: {
                googlePlaceId: placeData.googlePlaceId,
                name: placeData.name,
                address: placeData.address || '',
                latitude: placeData.latitude!,
                longitude: placeData.longitude!,
                category: placeData.category || 'general',
              },
            });
          }

          // Create ListPlace with notes
          await prisma.listPlace.create({
            data: {
              listId: list.id,
              placeId: place.id,
              order: j,
              notes: placeData.notes, // PRESERVE USER NOTES
            },
          });

          totalPlacesImported++;
        } catch (placeError) {
          console.error(`Error storing place ${placeData.name}:`, placeError);
          errors.push(`Failed to store ${placeData.name} in list ${listName}`);
        }
      }

      listsCreated.push(listName);
      console.log(`Created list "${listName}" with ${geocodedPlaces.length} places`);

      // Update progress
      job.listsProcessed = i + 1;
      job.placesProcessed = totalPlacesImported;
      job.progress = 40 + Math.floor(((i + 1) / csvEntries.length) * 50); // 40-90%
      if (onProgress) onProgress(job);

    } catch (listError) {
      console.error(`Error processing list ${csvEntry.entryName}:`, listError);
      errors.push(`Failed to process ${path.basename(csvEntry.entryName, '.csv')}`);
    }
  }

  return {
    success: listsCreated.length > 0,
    listsCreated: listsCreated.length,
    placesImported: totalPlacesImported,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Process a Google Takeout ZIP file
 */
export async function processZip(
  zipFilePath: string,
  userId: string,
  jobId: string,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  // Initialize job tracking
  const job: ImportJob = {
    id: jobId,
    userId,
    stage: 'extracting',
    progress: 0,
    listsProcessed: 0,
    placesProcessed: 0,
    totalLists: 0,
    totalPlaces: 0,
    errors: [],
    startedAt: new Date(),
  };
  importJobs.set(jobId, job);
  if (onProgress) onProgress(job);

  const errors: string[] = [];
  let listsCreated = 0;
  let placesImported = 0;

  try {
    // Extract ZIP
    job.stage = 'extracting';
    job.progress = 10;
    if (onProgress) onProgress(job);

    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip.getEntries();

    // Format Detection: Priority 1 - Check for Saved/*.csv (NEW FORMAT)
    job.stage = 'detecting';
    job.progress = 30;
    if (onProgress) onProgress(job);

    const savedCsvEntries = zipEntries.filter(
      (entry) => entry.entryName.includes('Saved/') &&
                 entry.entryName.endsWith('.csv') &&
                 !entry.isDirectory
    );

    if (savedCsvEntries.length > 0) {
      console.log(`Found ${savedCsvEntries.length} saved lists in CSV format (NEW)`);
      const result = await processSavedListsCsv(savedCsvEntries, userId, jobId, onProgress);

      // Clean up ZIP file
      fs.unlinkSync(zipFilePath);

      return result;
    }

    // Format Detection: Priority 2 - Fallback to Labeled Places JSON (OLD FORMAT)
    console.log('No Saved/*.csv files found, trying Labeled places.json (OLD FORMAT)');
    const labeledPlacesEntry = zipEntries.find(
      (entry) => entry.entryName.includes('Labeled places.json') && !entry.isDirectory
    );

    if (!labeledPlacesEntry) {
      errors.push('No "Saved/*.csv" or "Labeled places.json" found in ZIP file');
      console.log('Available files:', zipEntries.map(e => e.entryName));

      job.stage = 'error';
      job.errors = errors;
      if (onProgress) onProgress(job);

      return { success: false, listsCreated, placesImported, errors };
    }

    // Parse Labeled Places JSON
    const labeledPlacesData = labeledPlacesEntry.getData().toString('utf8');
    const labeledPlaces = JSON.parse(labeledPlacesData);

    // Extract features (places) from GeoJSON
    const places: RawPlace[] = [];

    if (labeledPlaces.features && Array.isArray(labeledPlaces.features)) {
      for (const feature of labeledPlaces.features) {
        const props = feature.properties || {};
        const geom = feature.geometry || {};

        const place: RawPlace = {
          name: props.name || props.Title || 'Unnamed Place',
          address: props.address,
          googlePlaceId: props['Google Maps URL']?.split('/').pop(),
          category: props.Location?.['Business Status'] || 'general',
        };

        // Extract coordinates from geometry
        if (geom.type === 'Point' && geom.coordinates) {
          place.longitude = geom.coordinates[0];
          place.latitude = geom.coordinates[1];
        }

        // Extract address
        if (props.Location?.Address) {
          place.address = props.Location.Address;
        }

        places.push(place);
      }
    }

    // If no places found in JSON, try parsing CSV files
    const csvEntries = zipEntries.filter(
      (entry) => entry.entryName.endsWith('.csv') && !entry.isDirectory
    );

    for (const csvEntry of csvEntries) {
      try {
        const csvData = csvEntry.getData().toString('utf8');

        // Use async parse with promise
        const records: any[] = await new Promise((resolve, reject) => {
          parse(csvData, {
            columns: true,
            skip_empty_lines: true,
          }, (err, records) => {
            if (err) reject(err);
            else resolve(records);
          });
        });

        for (const record of records) {
          places.push({
            name: record.Title || record.Name || 'Unnamed Place',
            address: record.Address || record.Location,
            notes: record.Note || record.Comment,
          });
        }
      } catch (csvError) {
        console.error(`Error parsing CSV ${csvEntry.entryName}:`, csvError);
        errors.push(`Failed to parse ${csvEntry.entryName}`);
      }
    }

    if (places.length === 0) {
      errors.push('No places found in ZIP file');
      job.stage = 'error';
      job.errors = errors;
      if (onProgress) onProgress(job);
      return { success: false, listsCreated, placesImported, errors };
    }

    // Geocode places without coordinates
    job.stage = 'geocoding';
    job.progress = 60;
    if (onProgress) onProgress(job);

    console.log(`Geocoding ${places.filter(p => !p.latitude).length} places...`);

    for (const place of places) {
      if (!place.latitude && place.address) {
        const geocoded = await geocodeService.geocode(place.address);
        if (geocoded) {
          place.latitude = geocoded.latitude;
          place.longitude = geocoded.longitude;
          if (!place.address) place.address = geocoded.displayName;
        }
      }
    }

    // Create default list name
    const listName = `Imported List - ${new Date().toLocaleDateString()}`;

    // Create list in database
    job.stage = 'saving';
    job.progress = 90;
    if (onProgress) onProgress(job);

    const list = await prisma.list.create({
      data: {
        creatorId: userId,
        title: listName,
        description: 'Imported from Google Takeout',
        isPublic: false,
        isPaid: false,
        price: 0,
      },
    });

    listsCreated = 1;

    // Process and store places
    for (const [index, rawPlace] of places.entries()) {
      if (!rawPlace.latitude || !rawPlace.longitude) {
        console.log(`Skipping place without coordinates: ${rawPlace.name}`);
        continue;
      }

      try {
        // Create or find place
        let place = rawPlace.googlePlaceId
          ? await prisma.place.findUnique({
              where: { googlePlaceId: rawPlace.googlePlaceId },
            })
          : null;

        if (!place) {
          place = await prisma.place.create({
            data: {
              googlePlaceId: rawPlace.googlePlaceId || `imported-${Date.now()}-${index}`,
              name: rawPlace.name,
              address: rawPlace.address || '',
              latitude: rawPlace.latitude,
              longitude: rawPlace.longitude,
              category: rawPlace.category || 'general',
            },
          });
        }

        // Link place to list
        await prisma.listPlace.create({
          data: {
            listId: list.id,
            placeId: place.id,
            order: index,
            notes: rawPlace.notes,
          },
        });

        placesImported++;
      } catch (placeError) {
        console.error(`Error storing place ${rawPlace.name}:`, placeError);
        errors.push(`Failed to store ${rawPlace.name}`);
      }
    }

    // Update list place count
    await prisma.list.update({
      where: { id: list.id },
      data: { placeCount: placesImported },
    });

    // Update job to complete
    job.stage = 'complete';
    job.progress = 100;
    job.listsProcessed = listsCreated;
    job.placesProcessed = placesImported;
    job.completedAt = new Date();
    if (onProgress) onProgress(job);

    // Clean up ZIP file
    fs.unlinkSync(zipFilePath);

    return {
      success: true,
      listsCreated,
      placesImported,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Error processing ZIP:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown error');

    // Update job to error state
    const job = importJobs.get(jobId);
    if (job) {
      job.stage = 'error';
      job.errors = errors;
      if (onProgress) onProgress(job);
    }

    // Clean up ZIP file on error
    try {
      if (fs.existsSync(zipFilePath)) {
        fs.unlinkSync(zipFilePath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up ZIP file:', cleanupError);
    }

    return {
      success: false,
      listsCreated,
      placesImported,
      errors,
    };
  }
}
