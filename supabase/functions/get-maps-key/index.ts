// IMPORTANT: This edge function is PUBLIC (no auth required) to allow map loading
// It only returns the Google Maps API key which is public anyway

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
    console.log('🗺️ Google Maps API Key request received');
    
    // محاولة الحصول على المفاتيح بالترتيب
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    if (!googleMapsApiKey) {
      console.error('❌ No Google Maps API Key found in environment');
      throw new Error('Missing Google Maps API Key - please add GOOGLE_MAPS_API_KEY secret');
    }

    console.log('✅ Google Maps API key loaded successfully');

    return new Response(
      JSON.stringify({ apiKey: googleMapsApiKey }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('❌ Error getting Google Maps API key:', error);
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
