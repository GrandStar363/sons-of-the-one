
import { mapsRequest } from '../_shared/maps.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, location, placeId } = await req.json();

    if (action === 'geocode') {
      // Geocode the location to get coordinates
      const geocodeData = await mapsRequest('geocode/json', { address: location });
      
      if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
        return new Response(JSON.stringify({ 
          error: 'Location not found',
          status: geocodeData.status 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;
      const formattedAddress = geocodeData.results[0].formatted_address;

      return new Response(JSON.stringify({
        success: true,
        coordinates: { lat, lng },
        formattedAddress
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'searchChurches') {
      // First geocode the location
      const geocodeData = await mapsRequest('geocode/json', { address: location });
      
      if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
        return new Response(JSON.stringify({ 
          error: 'Location not found',
          status: geocodeData.status 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;
      const formattedAddress = geocodeData.results[0].formatted_address;

      // Search for churches nearby using Places API
      const placesData = await mapsRequest('place/nearbysearch/json', {
        location: `${lat},${lng}`, radius: '16000', type: 'church', keyword: 'church'
      });

      if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
        return new Response(JSON.stringify({ 
          error: 'Error searching for churches',
          status: placesData.status 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const churches = (placesData.results || []).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        location: place.geometry.location,
        rating: place.rating,
        totalRatings: place.user_ratings_total,
        isOpen: place.opening_hours?.open_now
      }));

      return new Response(JSON.stringify({
        success: true,
        coordinates: { lat, lng },
        formattedAddress,
        churches
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'getChurchDetails') {
      // Get detailed information about a specific church
      const detailsData = await mapsRequest('place/details/json', {
        place_id: placeId, fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,geometry,rating,reviews'
      });

      if (detailsData.status !== 'OK') {
        return new Response(JSON.stringify({ 
          error: 'Church details not found',
          status: detailsData.status 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const place = detailsData.result;
      const churchDetails = {
        id: placeId,
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        location: place.geometry?.location,
        rating: place.rating,
        hours: place.opening_hours?.weekday_text,
        reviews: place.reviews?.slice(0, 3)
      };

      return new Response(JSON.stringify({
        success: true,
        church: churchDetails
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
