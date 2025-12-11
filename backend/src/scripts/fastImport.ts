/**
 * Fast import - skips geocoding entirely, uses placeholder coordinates
 * This is useful when geocoding services are down or slow
 */

import { prisma } from '../config/database';
import AdmZip from 'adm-zip';
import { parse } from 'csv-parse/sync';
import path from 'path';

const getDefaultCoordinates = (listName: string): { latitude: number; longitude: number; city: string } => {
  const lower = listName.toLowerCase();
  if (lower.includes('tokyo')) return { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo' };
  if (lower.includes('nyc') || lower.includes('new york')) return { latitude: 40.7128, longitude: -74.0060, city: 'New York' };
  if (lower.includes('seoul')) return { latitude: 37.5665, longitude: 126.9780, city: 'Seoul' };
  if (lower.includes('frankfurt')) return { latitude: 50.1109, longitude: 8.6821, city: 'Frankfurt' };
  if (lower.includes('park city')) return { latitude: 40.6461, longitude: -111.4980, city: 'Park City' };
  return { latitude: 37.7749, longitude: -122.4194, city: 'Unknown' };
};

const deriveCategory = (listName: string): string | null => {
  const lower = listName.toLowerCase();
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('bakery') || lower.includes('sushi') || lower.includes('market') || lower.includes('dessert')) return 'Food & Drink';
  if (lower.includes('travel') || lower.includes('visit') || lower.includes('trip') || lower.includes('hotel') || lower.includes('activities')) return 'Travel';
  if (lower.includes('night') || lower.includes('bar') || lower.includes('club') || lower.includes('drinks')) return 'Nightlife';
  if (lower.includes('shop') || lower.includes('store') || lower.includes('compression')) return 'Shopping';
  if (lower.includes('culture') || lower.includes('museum') || lower.includes('art')) return 'Culture';
  if (lower.includes('health') || lower.includes('wellness')) return 'Health';
  return null;
};

async function fastImport(zipPath: string, userId: string) {
  console.log(`Fast importing from: ${zipPath}\n`);

  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  const csvEntries = entries.filter(e => e.entryName.includes('Saved/') && e.entryName.endsWith('.csv') && !e.isDirectory);

  console.log(`Found ${csvEntries.length} saved lists\n`);

  let totalLists = 0;
  let totalPlaces = 0;

  for (const entry of csvEntries) {
    const listName = path.basename(entry.entryName, '.csv');
    const csvContent = entry.getData().toString('utf8');

    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const validRecords = records.filter((r: any) => r.Title && r.Title.trim() !== '');

      if (validRecords.length === 0) {
        console.log(`⏭️  Skipping empty list: ${listName}`);
        continue;
      }

      const coords = getDefaultCoordinates(listName);
      const category = deriveCategory(listName);

      // Create list with all places using placeholder coordinates
      const places = validRecords.map((record: any, index: number) => {
        const offset = index * 0.001; // Small offset
        return {
          name: record.Title,
          latitude: coords.latitude + offset,
          longitude: coords.longitude + offset,
          address: `${record.Title} (location approximate)`,
          rating: null,
          priceLevel: null,
          category: 'general',
          googlePlaceId: null,
        };
      });

      const list = await prisma.list.create({
        data: {
          title: listName,
          description: `Imported from Google Maps on ${new Date().toLocaleDateString()}`,
          creatorId: userId,
          isPublic: true, // Make public so it appears in marketplace
          placeCount: places.length,
          centerLatitude: coords.latitude,
          centerLongitude: coords.longitude,
          city: coords.city,
          category,
          places: {
            create: places.map((place, index) => ({
              place: {
                create: place,
              },
              order: index,
              notes: validRecords[index].Note || null,
            })),
          },
        },
      });

      totalLists++;
      totalPlaces += places.length;

      console.log(`✅ ${listName} (${places.length} places)`);

    } catch (error) {
      console.error(`❌ Failed to import ${listName}:`, error);
    }
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`   ${totalLists} lists created`);
  console.log(`   ${totalPlaces} places imported\n`);

  await prisma.$disconnect();
}

// Run it
const zipPath = process.argv[2] || 'uploads/takeout-1765408106983-479746558.zip';
const userId = '68e0bf96-8312-4531-8bdc-5b385dfaf890';

fastImport(zipPath, userId).catch(console.error);
