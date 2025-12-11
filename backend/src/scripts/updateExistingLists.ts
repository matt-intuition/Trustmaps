/**
 * Script to update existing lists with new fields
 * Run with: npx ts-node src/scripts/updateExistingLists.ts
 */

import { prisma } from '../config/database';

async function updateExistingLists() {
  console.log('Starting update of existing lists...\n');

  // Get all lists
  const lists = await prisma.list.findMany({
    include: {
      places: {
        include: {
          place: true,
        },
      },
    },
  });

  console.log(`Found ${lists.length} lists to update\n`);

  let updated = 0;

  for (const list of lists) {
    try {
      // Skip if no places
      if (list.places.length === 0) {
        console.log(`Skipping "${list.title}" - no places`);
        continue;
      }

      // Calculate center coordinates
      const coordinates = list.places
        .filter(lp => lp.place.latitude && lp.place.longitude)
        .map(lp => ({
          latitude: lp.place.latitude,
          longitude: lp.place.longitude,
        }));

      if (coordinates.length === 0) {
        console.log(`Skipping "${list.title}" - no valid coordinates`);
        continue;
      }

      const centerLatitude = coordinates.reduce((sum, p) => sum + p.latitude, 0) / coordinates.length;
      const centerLongitude = coordinates.reduce((sum, p) => sum + p.longitude, 0) / coordinates.length;

      // Derive category from title
      let category = null;
      const lowerTitle = list.title.toLowerCase();
      if (lowerTitle.includes('food') || lowerTitle.includes('restaurant') || lowerTitle.includes('cafe') || lowerTitle.includes('coffee')) {
        category = 'Food & Drink';
      } else if (lowerTitle.includes('travel') || lowerTitle.includes('visit') || lowerTitle.includes('trip')) {
        category = 'Travel';
      } else if (lowerTitle.includes('night') || lowerTitle.includes('bar') || lowerTitle.includes('club')) {
        category = 'Nightlife';
      } else if (lowerTitle.includes('shop') || lowerTitle.includes('store')) {
        category = 'Shopping';
      } else if (lowerTitle.includes('culture') || lowerTitle.includes('museum') || lowerTitle.includes('art')) {
        category = 'Culture';
      }

      // Extract city from first place
      let city = null;
      const firstPlace = list.places[0].place;
      if (firstPlace.address) {
        const addressParts = firstPlace.address.split(',').map(p => p.trim());
        if (addressParts.length >= 2) {
          city = addressParts[1];
        }
      }
      // Fallback to place's city field
      if (!city && firstPlace.city) {
        city = firstPlace.city;
      }

      // Update list
      await prisma.list.update({
        where: { id: list.id },
        data: {
          centerLatitude,
          centerLongitude,
          category,
          city,
          isPublic: true, // Make public so it appears in marketplace
        },
      });

      console.log(`✓ Updated "${list.title}"`);
      console.log(`  - Center: ${centerLatitude.toFixed(4)}, ${centerLongitude.toFixed(4)}`);
      console.log(`  - Category: ${category || 'none'}`);
      console.log(`  - City: ${city || 'none'}`);
      console.log(`  - Made public: yes\n`);

      updated++;
    } catch (error) {
      console.error(`✗ Failed to update "${list.title}":`, error);
    }
  }

  console.log(`\n✅ Updated ${updated} of ${lists.length} lists`);

  // Disconnect from database
  await prisma.$disconnect();
}

updateExistingLists()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
