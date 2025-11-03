import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // محاولة الحصول على المفاتيح بالترتيب
    let googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') 
      || Deno.env.get('GOOGLE_MAPS_API_KEY2')
      || Deno.env.get('GOOGLE_MAPS_KEY')
      || Deno.env.get('MAPS_API_KEY');

    if (!googleMapsApiKey) {
      console.error('No Google Maps API Key found in environment');
      throw new Error('Missing Google Maps API Key');
    }

    console.log('Google Maps API key loaded successfully');

    return new Response(
      JSON.stringify({ apiKey: googleMapsApiKey }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error getting Google Maps API key:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get Google Maps API key',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
