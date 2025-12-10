import AdmZip from 'adm-zip';
import { parse } from 'csv-parse';
import { prisma } from '../../config/database';
import { geocodeService } from './geocode';
import fs from 'fs';
import path from 'path';

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
 * Process a Google Takeout ZIP file
 */
export async function processZip(
  zipFilePath: string,
  userId: string
): Promise<ProcessResult> {
  const errors: string[] = [];
  let listsCreated = 0;
  let placesImported = 0;

  try {
    // Extract ZIP
    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip.getEntries();

    // Find Saved Places JSON (usually in Takeout/Maps/My Places/Saved Places.json)
    const savedPlacesEntry = zipEntries.find(
      (entry) => entry.entryName.includes('Saved Places.json') && !entry.isDirectory
    );

    if (!savedPlacesEntry) {
      errors.push('No "Saved Places.json" found in ZIP file');
      return { success: false, listsCreated, placesImported, errors };
    }

    // Parse Saved Places JSON
    const savedPlacesData = savedPlacesEntry.getData().toString('utf8');
    const savedPlaces = JSON.parse(savedPlacesData);

    // Extract features (places) from GeoJSON
    const places: RawPlace[] = [];

    if (savedPlaces.features && Array.isArray(savedPlaces.features)) {
      for (const feature of savedPlaces.features) {
        const props = feature.properties || {};
        const geom = feature.geometry || {};

        const place: RawPlace = {
          name: props.name || props.Title || 'Unnamed Place',
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
        const records = parse(csvData, {
          columns: true,
          skip_empty_lines: true,
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
      return { success: false, listsCreated, placesImported, errors };
    }

    // Geocode places without coordinates
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
