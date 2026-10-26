/** Nominatim (OSM) — без ключей. Соблюдать rate-limit: не чаще ~1 req/s, с debounce на UI. */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
/** Контакт для политики Nominatim (query `email`). */
const NOMINATIM_EMAIL = 'nastolka@local.dev';

export interface TGeoPoint {
  lat: number;
  lng: number;
}

export interface TGeocodeResult extends TGeoPoint {
  address: string;
}

interface TNominatimSearchItem {
  lat: string;
  lon: string;
  display_name: string;
}

interface TNominatimReverse {
  lat: string;
  lon: string;
  display_name?: string;
  error?: string;
}

function buildUrl(path: string, params: Record<string, string>): string {
  const url = new URL(path, NOMINATIM_BASE);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set('email', NOMINATIM_EMAIL);
  return url.toString();
}

async function nominatimFetch<T>(url: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(url, {
      signal,
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'ru',
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null;
    return null;
  }
}

/** Forward geocode: строка адреса → первая подходящая точка. */
export async function searchAddress(query: string, signal?: AbortSignal): Promise<TGeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;

  const url = buildUrl('/search', {
    q,
    format: 'json',
    limit: '1',
    addressdetails: '0',
  });
  const data = await nominatimFetch<TNominatimSearchItem[]>(url, signal);
  const hit = data?.[0];
  if (!hit) return null;

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return { lat, lng, address: hit.display_name };
}

/** Reverse geocode: координаты → текстовый адрес. */
export async function reverseGeocode(point: TGeoPoint, signal?: AbortSignal): Promise<TGeocodeResult | null> {
  const url = buildUrl('/reverse', {
    lat: String(point.lat),
    lon: String(point.lng),
    format: 'json',
    zoom: '18',
    addressdetails: '0',
  });
  const data = await nominatimFetch<TNominatimReverse>(url, signal);
  if (!data?.display_name || data.error) return null;

  const lat = Number(data.lat);
  const lng = Number(data.lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return { lat, lng, address: data.display_name };
}

/** Ссылка на точку в OSM (для mapUrl в API). */
export function buildOsmMapUrl(lat: number, lng: number, zoom = 17): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}
