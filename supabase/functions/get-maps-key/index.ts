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
    // Get Google Maps API key from environment
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      console.error('❌ GOOGLE_MAPS_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'يرجى تكوين مفتاح Google Maps API في إعدادات المشروع'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Google Maps API key retrieved successfully');

    return new Response(
      JSON.stringify({ apiKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ Error in get-maps-key function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'حدث خطأ أثناء جلب مفتاح API'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
