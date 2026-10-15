export interface LocationResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

interface NominatimResult {
  display_name?: unknown;
  lat?: unknown;
  lon?: unknown;
  address?: {
    state?: unknown;
    region?: unknown;
    province?: unknown;
    country?: unknown;
  };
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const locationCache = new Map<string, LocationResult>();

function parseLocation(item: NominatimResult): LocationResult | null {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const address = item.address;
  const displayName = [
    address?.state,
    address?.region,
    address?.province,
    address?.country,
  ].find((value) => typeof value === 'string' && value.trim()) ?? item.display_name;

  return {
    displayName: typeof displayName === 'string' ? displayName : 'Selected area',
    latitude,
    longitude,
  };
}

export async function geocodeLocation(
  locationName: string,
  signal?: AbortSignal,
): Promise<LocationResult> {
  const normalized = locationName.trim().toLowerCase();
  if (!normalized) throw new Error('A location name is required.');

  const cacheKey = `geo:${normalized}`;
  const cached = locationCache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: locationName,
    format: 'jsonv2',
    limit: '1',
  });
  const response = await fetch(`${NOMINATIM_URL}/search?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Location search failed (${response.status}).`);
  const results = await response.json() as NominatimResult[];
  const location = results.map(parseLocation).find((item): item is LocationResult => item !== null);
  if (!location) throw new Error(`No map location found for "${locationName}".`);

  locationCache.set(cacheKey, location);
  return location;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<LocationResult> {
  // Quantize coordinates to ~1km grid to avoid flooding Nominatim
  const roundedLat = Math.round(latitude * 100) / 100;
  const roundedLng = Math.round(longitude * 100) / 100;
  const cacheKey = `rev:${roundedLat},${roundedLng}`;

  const cached = locationCache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: 'jsonv2',
    zoom: '10',
  });
  const response = await fetch(`${NOMINATIM_URL}/reverse?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Location lookup failed (${response.status}).`);
  const result = await response.json() as NominatimResult;
  const location = parseLocation(result);
  if (!location) throw new Error('Unable to identify the selected map area.');

  locationCache.set(cacheKey, location);
  return location;
}
