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
  onProgress?: ProgressCallback,
  selectedLists?: Array<{ name: string; displayName?: string; isPaid: boolean; price: number }>
): Promise<ProcessResult> {
  const job = importJobs.get(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  const listsCreated: string[] = [];
  let totalPlacesImported = 0;
  const errors: string[] = [];

  // Filter entries if selectedLists is provided
  let entriesToProcess = csvEntries;
  if (selectedLists && selectedLists.length > 0) {
    const selectedNames = new Set(selectedLists.map(l => l.name));
    entriesToProcess = csvEntries.filter(entry => {
      const listName = path.basename(entry.entryName, '.csv');
      return selectedNames.has(listName);
    });
    console.log(`Processing ${entriesToProcess.length} selected lists out of ${csvEntries.length} total`);
  }

  job.stage = 'parsing';
  job.totalLists = entriesToProcess.length;
  job.progress = 40; // Start at 40% after extraction and detection
  if (onProgress) onProgress(job);

  for (let i = 0; i < entriesToProcess.length; i++) {
    const csvEntry = entriesToProcess[i];

    try {
      // Extract list name from filename (remove "Saved/" prefix and ".csv" suffix)
      const listName = path.basename(csvEntry.entryName, '.csv');
      console.log(`Processing list: ${listName}`);

      // Get configuration for this list (pricing + custom name)
      const listConfig = selectedLists?.find(l => l.name === listName);
      const isPaid = listConfig?.isPaid ?? false;
      const price = listConfig?.price ?? 0;
      const displayName = listConfig?.displayName || listName; // Use custom name if provided

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

      // Determine default coordinates based on list name (fallback when geocoding fails)
      const getDefaultCoordinates = (listName: string): { latitude: number; longitude: number; city: string } => {
        const lower = listName.toLowerCase();
        if (lower.includes('tokyo')) return { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo' };
        if (lower.includes('nyc') || lower.includes('new york')) return { latitude: 40.7128, longitude: -74.0060, city: 'New York' };
        if (lower.includes('seoul')) return { latitude: 37.5665, longitude: 126.9780, city: 'Seoul' };
        if (lower.includes('frankfurt')) return { latitude: 50.1109, longitude: 8.6821, city: 'Frankfurt' };
        if (lower.includes('park city')) return { latitude: 40.6461, longitude: -111.4980, city: 'Park City' };
        // Default: San Francisco
        return { latitude: 37.7749, longitude: -122.4194, city: 'Unknown' };
      };

      // Geocode places (CSV doesn't include coordinates)
      // Using placeholder coordinates if geocoding fails
      job.stage = 'geocoding';
      if (onProgress) onProgress(job);

      const geocodedPlaces: RawPlace[] = [];
      const defaultCoords = getDefaultCoordinates(listName);

      for (const place of rawPlaces) {
        let geocoded = null;

        // Try to geocode, but don't fail if it doesn't work
        try {
          geocoded = await geocodeService.geocode(place.name);
          if (geocoded) {
            // Small delay to respect Nominatim rate limits
            await new Promise(resolve => setTimeout(resolve, 1100));
          }
        } catch (geocodeError) {
          console.log(`Geocoding error for ${place.name}: ${geocodeError}`);
        }

        if (geocoded) {
          geocodedPlaces.push({
            ...place,
            latitude: geocoded.latitude,
            longitude: geocoded.longitude,
            address: geocoded.displayName,
          });
        } else {
          // Use default coordinates + slight offset to avoid all places being in same spot
          const offset = geocodedPlaces.length * 0.001; // Small offset
          console.log(`Using placeholder coordinates for: ${place.name}`);
          geocodedPlaces.push({
            ...place,
            latitude: defaultCoords.latitude + offset,
            longitude: defaultCoords.longitude + offset,
            address: `${place.name} (location approximate)`,
          });
        }
      }

      if (geocodedPlaces.length === 0) {
        console.log(`No places to import for list: ${listName}`);
        continue;
      }

      // Calculate center coordinates from places
      const centerLatitude = geocodedPlaces.reduce((sum, p) => sum + (p.latitude || 0), 0) / geocodedPlaces.length;
      const centerLongitude = geocodedPlaces.reduce((sum, p) => sum + (p.longitude || 0), 0) / geocodedPlaces.length;

      // Derive category from list name (simple heuristic)
      let category = null;
      const lowerName = listName.toLowerCase();
      if (lowerName.includes('food') || lowerName.includes('restaurant') || lowerName.includes('cafe') || lowerName.includes('coffee')) {
        category = 'Food & Drink';
      } else if (lowerName.includes('travel') || lowerName.includes('visit') || lowerName.includes('trip')) {
        category = 'Travel';
      } else if (lowerName.includes('night') || lowerName.includes('bar') || lowerName.includes('club')) {
        category = 'Nightlife';
      } else if (lowerName.includes('shop') || lowerName.includes('store')) {
        category = 'Shopping';
      } else if (lowerName.includes('culture') || lowerName.includes('museum') || lowerName.includes('art')) {
        category = 'Culture';
      }

      // Extract city from first place's address
      let city = null;
      if (geocodedPlaces[0].address) {
        // Try to extract city from address (format varies by country)
        // Common pattern: "Street, City, State/Province, Country"
        const addressParts = geocodedPlaces[0].address.split(',').map(p => p.trim());
        if (addressParts.length >= 2) {
          // Usually city is the second part (after street)
          city = addressParts[1];
        }
      }

      // Create List in database
      job.stage = 'saving';
      if (onProgress) onProgress(job);

      const list = await prisma.list.create({
        data: {
          creatorId: userId,
          title: displayName, // Use user's custom name
          description: `Imported from Google Maps`,
          isPublic: !isPaid, // Make free lists public by default
          isPaid,
          price,
          placeCount: geocodedPlaces.length,
          centerLatitude,
          centerLongitude,
          category,
          city,
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
  onProgress?: ProgressCallback,
  selectedLists?: Array<{ name: string; displayName?: string; isPaid: boolean; price: number }>
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
      const result = await processSavedListsCsv(savedCsvEntries, userId, jobId, onProgress, selectedLists);

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
