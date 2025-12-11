/**
 * Places API Routes
 *
 * Handles place-related operations including Google Places Photos proxy.
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

/**
 * GET /api/places/photo/:photoRef
 *
 * Proxies Google Places Photo API requests to avoid exposing API key to frontend.
 * Returns the actual image data from Google Places API.
 *
 * Query params:
 * - maxWidth: optional, max image width (default: 400)
 * - maxHeight: optional, max image height
 */
router.get('/photo/:photoRef', async (req: Request, res: Response) => {
  const { photoRef } = req.params;
  const { maxWidth = '400', maxHeight } = req.query;

  // Validate photo reference
  if (!photoRef) {
    return res.status(400).json({
      error: 'Photo reference is required',
    });
  }

  // Check for API key
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not found in environment');
    return res.status(500).json({
      error: 'Google Places API key not configured',
    });
  }

  try {
    // Build Google Places Photo URL
    const googlePhotoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
    googlePhotoUrl.searchParams.append('photoreference', photoRef);
    googlePhotoUrl.searchParams.append('key', apiKey);

    if (maxWidth) {
      googlePhotoUrl.searchParams.append('maxwidth', maxWidth.toString());
    }
    if (maxHeight) {
      googlePhotoUrl.searchParams.append('maxheight', maxHeight.toString());
    }

    // Fetch image from Google Places API
    const response = await axios.get(googlePhotoUrl.toString(), {
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
    });

    // Set appropriate headers
    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Return image data
    res.send(response.data);
  } catch (error: any) {
    console.error('Error fetching Google Places photo:', error.message);

    if (error.response) {
      // Google API returned an error
      return res.status(error.response.status).json({
        error: 'Failed to fetch photo from Google Places',
        details: error.response.data,
      });
    }

    // Network or other error
    return res.status(500).json({
      error: 'Failed to fetch photo',
      message: error.message,
    });
  }
});

export default router;
