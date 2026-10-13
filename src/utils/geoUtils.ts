export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export const JAFFNA_AREAS: Record<string, GeoLocation> = {
  'Nallur': { name: 'Nallur', latitude: 9.6732, longitude: 80.0289 },
  'Jaffna Town': { name: 'Jaffna Town', latitude: 9.6615, longitude: 80.0255 },
  'Kopay': { name: 'Kopay', latitude: 9.6897, longitude: 80.0631 },
  'Chunnakam': { name: 'Chunnakam', latitude: 9.7420, longitude: 80.0280 },
  'Manipay': { name: 'Manipay', latitude: 9.7090, longitude: 80.0030 },
  'Chavakachcheri': { name: 'Chavakachcheri', latitude: 9.6548, longitude: 80.1587 },
  'Point Pedro': { name: 'Point Pedro', latitude: 9.8167, longitude: 80.2333 },
  'Chankanai': { name: 'Chankanai', latitude: 9.7510, longitude: 79.9860 },
  'Tellippalai': { name: 'Tellippalai', latitude: 9.7780, longitude: 80.0380 },
  'Karainagar': { name: 'Karainagar', latitude: 9.7340, longitude: 79.8820 },
  'Velanai': { name: 'Velanai', latitude: 9.6500, longitude: 79.9100 },
};

export const JAFFNA_AREA_LIST = Object.keys(JAFFNA_AREAS);

/**
 * Calculates distance in kilometers between two lat/lng points using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Get coordinates for a given Jaffna area name or fallback to Jaffna Town
 */
export function getCoordinatesForArea(area: string): { latitude: number; longitude: number } {
  const match = JAFFNA_AREAS[area];
  if (match) {
    return { latitude: match.latitude, longitude: match.longitude };
  }
  return { latitude: 9.6615, longitude: 80.0255 }; // Default Jaffna Town
}

/**
 * Generates an address-based or coordinates-based Google Maps directions URL
 */
export function getGoogleMapsDirectionsUrl(
  destinationAddress: string,
  lat?: number,
  lng?: number
): string {
  if (lat && lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  const query = encodeURIComponent(`${destinationAddress}, Jaffna, Sri Lanka`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
