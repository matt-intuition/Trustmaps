import { List, ListPlace, Place } from '@prisma/client';

type ListWithPlaces = List & {
  places: (ListPlace & {
    place: Place;
  })[];
  creator: {
    username: string;
    displayName: string;
  };
};

/**
 * Generate KML (Keyhole Markup Language) format for Google Maps import
 */
export function generateKML(list: ListWithPlaces): string {
  const escapedTitle = escapeXML(list.title);
  const escapedDescription = escapeXML(
    list.description || `Curated by @${list.creator.username}`
  );

  let placemarks = '';

  list.places
    .sort((a, b) => a.order - b.order)
    .forEach(({ place, notes }) => {
      const escapedName = escapeXML(place.name);
      const escapedAddress = escapeXML(place.address);
      const escapedNotes = notes ? escapeXML(notes) : '';

      const description = escapedNotes
        ? `${escapedNotes}\n\n${escapedAddress}`
        : escapedAddress;

      placemarks += `
    <Placemark>
      <name>${escapedName}</name>
      <description>${description}</description>
      <Point>
        <coordinates>${place.longitude},${place.latitude}</coordinates>
      </Point>
    </Placemark>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapedTitle}</name>
    <description>${escapedDescription}</description>${placemarks}
  </Document>
</kml>`;
}

/**
 * Generate GeoJSON format
 */
export function generateGeoJSON(list: ListWithPlaces): string {
  const features = list.places
    .sort((a, b) => a.order - b.order)
    .map(({ place, notes, order }) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [place.longitude, place.latitude]
      },
      properties: {
        name: place.name,
        address: place.address,
        city: place.city,
        country: place.country,
        category: place.category,
        cuisine: place.cuisine,
        rating: place.rating,
        priceLevel: place.priceLevel,
        notes: notes || null,
        order: order,
        googlePlaceId: place.googlePlaceId
      }
    }));

  const geoJSON = {
    type: 'FeatureCollection',
    metadata: {
      title: list.title,
      description: list.description,
      creator: list.creator.username,
      createdAt: list.createdAt,
      placeCount: list.placeCount
    },
    features
  };

  return JSON.stringify(geoJSON, null, 2);
}

/**
 * Generate CSV format
 */
export function generateCSV(list: ListWithPlaces): string {
  // CSV Header
  const headers = [
    'Order',
    'Name',
    'Address',
    'City',
    'Country',
    'Category',
    'Cuisine',
    'Rating',
    'Price Level',
    'Latitude',
    'Longitude',
    'Notes',
    'Google Place ID'
  ];

  const rows = list.places
    .sort((a, b) => a.order - b.order)
    .map(({ place, notes, order }) => [
      order,
      escapeCSV(place.name),
      escapeCSV(place.address),
      escapeCSV(place.city || ''),
      escapeCSV(place.country || ''),
      escapeCSV(place.category || ''),
      escapeCSV(place.cuisine || ''),
      place.rating || '',
      place.priceLevel || '',
      place.latitude,
      place.longitude,
      escapeCSV(notes || ''),
      place.googlePlaceId || ''
    ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape CSV special characters (quotes, commas, newlines)
 */
function escapeCSV(str: string): string {
  // If the string contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Get the appropriate file extension for the format
 */
export function getFileExtension(format: 'kml' | 'geojson' | 'csv'): string {
  switch (format) {
    case 'kml':
      return 'kml';
    case 'geojson':
      return 'geojson';
    case 'csv':
      return 'csv';
  }
}

/**
 * Get the appropriate MIME type for the format
 */
export function getMimeType(format: 'kml' | 'geojson' | 'csv'): string {
  switch (format) {
    case 'kml':
      return 'application/vnd.google-earth.kml+xml';
    case 'geojson':
      return 'application/geo+json';
    case 'csv':
      return 'text/csv';
  }
}
