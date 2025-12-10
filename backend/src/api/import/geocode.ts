import axios from 'axios';

const NOMINATIM_URL = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
const NOMINATIM_EMAIL = process.env.NOMINATIM_EMAIL || 'dev@trustmaps.com';
const RATE_LIMIT_MS = parseInt(process.env.GEOCODING_RATE_LIMIT || '1100'); // 1.1 seconds between requests (Nominatim requires 1 req/sec max)

interface GeocodedLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  displayName?: string;
}

class GeocodeService {
  private lastRequestTime = 0;
  private requestQueue: Array<{ query: string; resolve: (value: GeocodedLocation | null) => void }> = [];
  private isProcessing = false;

  /**
   * Geocode an address using Nominatim (OpenStreetMap)
   * Respects 1 request per second rate limit
   */
  async geocode(address: string): Promise<GeocodedLocation | null> {
    return new Promise((resolve) => {
      this.requestQueue.push({ query: address, resolve });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const item = this.requestQueue.shift();
      if (!item) break;

      // Respect rate limit
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < RATE_LIMIT_MS) {
        await this.delay(RATE_LIMIT_MS - timeSinceLastRequest);
      }

      try {
        const result = await this.makeRequest(item.query);
        this.lastRequestTime = Date.now();
        item.resolve(result);
      } catch (error) {
        console.error(`Geocoding failed for "${item.query}":`, error);
        item.resolve(null);
      }
    }

    this.isProcessing = false;
  }

  private async makeRequest(query: string): Promise<GeocodedLocation | null> {
    try {
      const response = await axios.get(`${NOMINATIM_URL}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': `Trustmaps/1.0 (${NOMINATIM_EMAIL})`,
        },
        timeout: 10000,
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          city: result.address?.city || result.address?.town || result.address?.village,
          country: result.address?.country,
          displayName: result.display_name,
        };
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get queue status for progress tracking
   */
  getQueueStatus() {
    return {
      pending: this.requestQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

export const geocodeService = new GeocodeService();
