// Google Maps client for church-finder.
//
// Written against Famous.ai's proxy at maps.gateway.fastrouter.io, which
// mirrored Google's paths but authenticated with an X-API-Key header. Real
// Google Maps uses the same paths and response shapes -- the only differences
// are the host and that the key travels as a `key` query parameter.

const MAPS_API = 'https://maps.googleapis.com/maps/api';

function key(): string {
  const k = Deno.env.get('GOOGLE_MAPS_API_KEY') ?? Deno.env.get('GATEWAY_API_KEY');
  if (!k) throw new Error('Google Maps is not configured (GOOGLE_MAPS_API_KEY missing)');
  return k;
}

/**
 * Call a Maps endpoint. `path` is e.g. 'geocode/json' or 'place/details/json'.
 * Returns the parsed body; callers keep checking `status` themselves, exactly
 * as they did against the proxy.
 */
export async function mapsRequest(path: string, params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({ ...params, key: key() });
  const res = await fetch(`${MAPS_API}/${path}?${qs.toString()}`);
  return await res.json();
}

// Places API (New).
//
// The legacy Places endpoints (place/nearbysearch, place/details) cannot be
// enabled on Google Cloud projects created after March 2025 -- they return
// REQUEST_DENIED "You're calling a legacy API". Places (New) lives on a
// different host, takes the key in a header, and requires a field mask naming
// exactly which fields to return (fields not listed are not billed).
const PLACES_API = 'https://places.googleapis.com/v1';

export class PlacesError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function placesRequest(
  path: string,
  fieldMask: string,
  body?: Record<string, unknown>,
): Promise<any> {
  const res = await fetch(`${PLACES_API}/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key(),
      'X-Goog-FieldMask': fieldMask,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new PlacesError(data?.error?.message ?? `Places API error ${res.status}`, res.status);
  }
  return data;
}
