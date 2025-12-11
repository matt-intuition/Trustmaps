/**
 * Image Service
 * Generates image URLs for lists using various strategies
 */

export type ImageType = 'map' | 'photo' | 'gradient';

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  zoom?: number;
}

/**
 * Generate a Mapbox Static Image URL from coordinates
 * Requires MAPBOX_TOKEN environment variable
 */
export function generateMapboxImageUrl(
  latitude: number,
  longitude: number,
  options: ImageGenerationOptions = {}
): string {
  const { width = 600, height = 400, zoom = 12 } = options;
  const token = process.env.MAPBOX_TOKEN;

  if (!token) {
    console.warn('MAPBOX_TOKEN not configured, skipping map image generation');
    return '';
  }

  // Mapbox Static Images API
  // https://docs.mapbox.com/api/maps/static-images/
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${longitude},${latitude},${zoom}/${width}x${height}@2x?access_token=${token}`;
}

/**
 * Generate an Unsplash Source URL based on category and city
 * No API key required for basic usage
 */
export function generateUnsplashImageUrl(
  city: string | null,
  category: string | null,
  options: ImageGenerationOptions = {}
): string {
  const { width = 600, height = 400 } = options;

  // Build search query from city and category
  const queryParts: string[] = [];
  if (city) queryParts.push(city);
  if (category) queryParts.push(category);

  // Fallback to generic travel image if no query
  const query = queryParts.length > 0 ? queryParts.join(',') : 'travel,city';

  // Unsplash Source API (simple random images)
  // Note: This is a basic implementation. For production, consider using the full Unsplash API
  return `https://source.unsplash.com/${width}x${height}/?${query}`;
}

/**
 * Generate a gradient data URL as final fallback
 * Returns a base64-encoded SVG gradient
 */
export function generateGradientImageUrl(
  category: string | null,
  emoji: string = '📍'
): string {
  // Category-specific gradient colors
  const categoryGradients: Record<string, [string, string]> = {
    'Food & Drink': ['#FEE2E2', '#FCA5A5'], // Red gradient
    'Travel': ['#DBEAFE', '#93C5FD'], // Blue gradient
    'Nightlife': ['#F3E8FF', '#D8B4FE'], // Purple gradient
    'Shopping': ['#FCE7F3', '#F9A8D4'], // Pink gradient
    'Culture': ['#FEF3C7', '#FCD34D'], // Amber gradient
    'Health': ['#D1FAE5', '#6EE7B7'], // Green gradient
  };

  const [startColor, endColor] = categoryGradients[category || ''] || ['#EEF2FF', '#C7D2FE']; // Default indigo

  // Create SVG gradient with emoji overlay
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#grad)" />
      <text x="50%" y="50%" font-size="120" text-anchor="middle" dominant-baseline="middle">
        ${emoji}
      </text>
    </svg>
  `.trim();

  // Return as data URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Calculate the center point (centroid) from an array of coordinates
 */
export function calculateCenterPoint(
  coordinates: Array<{ latitude: number; longitude: number }>
): { latitude: number; longitude: number } | null {
  if (coordinates.length === 0) {
    return null;
  }

  if (coordinates.length === 1) {
    return coordinates[0];
  }

  // Calculate average latitude and longitude
  const sum = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  };
}

/**
 * Determine the best image URL for a list based on available data
 * Implements the fallback chain: Mapbox → Unsplash → Gradient
 */
export function generateListImageUrl(
  list: {
    centerLatitude?: number | null;
    centerLongitude?: number | null;
    city?: string | null;
    category?: string | null;
    coverImage?: string | null; // emoji or existing image URL
  },
  options: ImageGenerationOptions = {}
): { url: string; type: ImageType } {
  // Priority 1: Use Mapbox if coordinates are available
  if (list.centerLatitude && list.centerLongitude && process.env.MAPBOX_TOKEN) {
    return {
      url: generateMapboxImageUrl(list.centerLatitude, list.centerLongitude, options),
      type: 'map',
    };
  }

  // Priority 2: Use Unsplash for category-based images
  if (list.city || list.category) {
    return {
      url: generateUnsplashImageUrl(list.city, list.category, options),
      type: 'photo',
    };
  }

  // Priority 3: Generate gradient with emoji fallback
  return {
    url: generateGradientImageUrl(list.category, list.coverImage || '📍'),
    type: 'gradient',
  };
}
