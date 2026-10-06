// church-finder
//
// Finds churches near a typed place or the visitor's GPS position.
//
//   geocode          { location }                        -> { success, coordinates, formattedAddress }
//   searchChurches   { location?, userLat?, userLng? }   -> { success, coordinates, formattedAddress, churches[] }
//   getChurchDetails { placeId, userLat?, userLng? }     -> { success, church }
//
// Contract with ChurchFinder.tsx:
//   * Each church carries `distance` in miles -- from the visitor when their
//     position is known, otherwise from the searched place -- nearest first.
//   * Problems the visitor can fix (unknown place, nothing typed) come back as
//     200 + { error } so the UI shows the message. A non-2xx response makes the
//     UI open a Google Maps tab, so that path is reserved for "the service is
//     down", signalled as 200 + { apiUnavailable, mapsLink }.
//
// Uses Places API (New): the legacy Places endpoints can't be enabled on
// Google Cloud projects created after March 2025.

import { mapsRequest, placesRequest } from '../_shared/maps.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const SEARCH_RADIUS_METERS = 16000;   // ~10 miles
const MAX_RESULTS = 20;               // Places (New) maximum per request

// Only request fields the UI displays -- Places (New) bills by field.
const SEARCH_FIELDS = [
  'places.id', 'places.displayName', 'places.shortFormattedAddress', 'places.formattedAddress',
  'places.location', 'places.rating', 'places.userRatingCount', 'places.currentOpeningHours.openNow',
].join(',');
const DETAIL_FIELDS = [
  'id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'internationalPhoneNumber',
  'websiteUri', 'location', 'rating', 'userRatingCount', 'regularOpeningHours.weekdayDescriptions',
].join(',');

type LatLng = { lat: number; lng: number };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });

const mapsSearchLink = (query: string) =>
  `https://www.google.com/maps/search/churches+near+${encodeURIComponent(query || 'me')}`;

function parseLatLng(lat: unknown, lng: unknown): LatLng | null {
  if (lat == null || lng == null) return null;
  const a = Number(lat), b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180
    ? { lat: a, lng: b }
    : null;
}

/** Great-circle distance in miles, rounded to 0.1. */
function milesBetween(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

function placeLatLng(p: any): LatLng | null {
  return parseLatLng(p?.location?.latitude, p?.location?.longitude);
}

/** Forward-geocode a typed place. Returns null when Google doesn't know it. */
async function geocode(address: string): Promise<{ coords: LatLng; formattedAddress: string } | null> {
  const d = await mapsRequest('geocode/json', { address });
  if (d.status === 'OK' && d.results?.length) {
    return { coords: d.results[0].geometry.location, formattedAddress: d.results[0].formatted_address };
  }
  if (d.status === 'ZERO_RESULTS' || d.status === 'INVALID_REQUEST') return null;
  // REQUEST_DENIED / OVER_QUERY_LIMIT / UNKNOWN_ERROR: the service itself failed.
  throw new Error(`Geocoding failed: ${d.status} ${d.error_message ?? ''}`.trim());
}

/** Best-effort "City, ST, Country" label for GPS coordinates. */
async function reverseGeocode(c: LatLng): Promise<string> {
  try {
    const d = await mapsRequest('geocode/json', { latlng: `${c.lat},${c.lng}`, result_type: 'locality' });
    return d.results?.[0]?.formatted_address ?? 'your location';
  } catch {
    return 'your location';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const { action, placeId } = body;
  const query = typeof body.location === 'string' ? body.location.trim() : '';
  const user = parseLatLng(body.userLat, body.userLng);
  const notFound = () =>
    json({ error: `We couldn't find "${query}". Try a city, street address, or zip code.` });

  try {
    if (action === 'geocode') {
      if (!query) return json({ error: 'Please enter a city or zip code.' });
      const g = await geocode(query);
      if (!g) return notFound();
      return json({ success: true, coordinates: g.coords, formattedAddress: g.formattedAddress });
    }

    if (action === 'searchChurches') {
      let center: LatLng;
      let formattedAddress: string;
      if (query) {
        const g = await geocode(query);
        if (!g) return notFound();
        center = g.coords;
        formattedAddress = g.formattedAddress;
      } else if (user) {
        center = user;
        formattedAddress = await reverseGeocode(user);
      } else {
        return json({ error: 'Please enter a city or zip code, or enable location services.' });
      }

      const data = await placesRequest('places:searchNearby', SEARCH_FIELDS, {
        // Primary type only: includedTypes also matches organisations that merely
        // list "church" as a secondary type (councils, ministries, businesses).
        includedPrimaryTypes: ['church'],
        maxResultCount: MAX_RESULTS,
        rankPreference: 'DISTANCE',
        locationRestriction: {
          circle: { center: { latitude: center.lat, longitude: center.lng }, radius: SEARCH_RADIUS_METERS },
        },
      });

      // Distance from the visitor when we know where they are, else from the searched place.
      const origin = user ?? center;
      const churches = (data.places ?? [])
        .map((p: any) => {
          const loc = placeLatLng(p);
          return {
            id: p.id,
            name: p.displayName?.text ?? 'Church',
            address: p.shortFormattedAddress ?? p.formattedAddress ?? '',
            location: loc,
            rating: p.rating,
            totalRatings: p.userRatingCount,
            isOpen: p.currentOpeningHours?.openNow,
            distance: loc ? milesBetween(origin, loc) : undefined,
          };
        })
        .sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

      return json({ success: true, coordinates: center, formattedAddress, churches });
    }

    if (action === 'getChurchDetails') {
      // Place IDs are URL-safe base64; reject anything else before building a URL with it.
      if (typeof placeId !== 'string' || !/^[A-Za-z0-9_-]+$/.test(placeId)) {
        return json({ error: 'Invalid church id' });
      }
      const p = await placesRequest(`places/${placeId}`, DETAIL_FIELDS);
      const loc = placeLatLng(p);
      return json({
        success: true,
        church: {
          id: p.id ?? placeId,
          name: p.displayName?.text ?? 'Church',
          address: p.formattedAddress ?? '',
          phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber,
          website: p.websiteUri,
          location: loc,
          rating: p.rating,
          totalRatings: p.userRatingCount,
          hours: p.regularOpeningHours?.weekdayDescriptions,
          distance: user && loc ? milesBetween(user, loc) : undefined,
        },
      });
    }

    return json({ error: 'Invalid action' }, 400);
  } catch (err) {
    // Google unreachable, quota exhausted, key or API not enabled: let the UI
    // fall back to a Google Maps search instead of showing a dead end.
    console.error('[church-finder]', action, err);
    return json({
      apiUnavailable: true,
      error: 'Church search is temporarily unavailable.',
      mapsLink: mapsSearchLink(query),
      formattedAddress: query || undefined,
    });
  }
});
