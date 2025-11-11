import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  to: string;
  message: string;
  request_id?: string;
  media_url?: string;
}

// التحقق من صحة رقم الهاتف (صيغة دولية)
function validatePhoneNumber(phone: string): boolean {
  // يجب أن يبدأ بـ + ويحتوي على 10-15 رقم
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phone);
}

// التحقق من طول الرسالة (WhatsApp max: 4096 حرف)
function validateMessage(msg: string): boolean {
  return msg.length > 0 && msg.length <= 4096;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📱 WhatsApp send request received');

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const body: WhatsAppRequest = await req.json();
    const { to, message, request_id, media_url } = body;

    if (!to || !message) {
      throw new Error('Missing required fields: to, message');
    }

    // التحقق من صحة رقم الهاتف
    if (!validatePhoneNumber(to)) {
      throw new Error('Invalid phone number format. Use international format: +201234567890');
    }

    // التحقق من طول الرسالة
    if (!validateMessage(message)) {
      throw new Error('Message must be between 1 and 4096 characters');
    }

    // Rate limiting: التحقق من عدد الرسائل المرسلة في آخر دقيقة
    const { data: recentMessages, error: rateLimitError } = await supabase
      .from('whatsapp_messages')
      .select('created_at')
      .eq('sender_id', user.id)
      .gte('created_at', new Date(Date.now() - 60000).toISOString());

    if (rateLimitError) {
      console.error('⚠️ Error checking rate limit:', rateLimitError);
    }

    if (recentMessages && recentMessages.length >= 5) {
      throw new Error('Rate limit exceeded. Maximum 5 messages per minute.');
    }

    console.log('📤 Sending WhatsApp message to:', to);

    // Get Twilio credentials
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio configuration');
    }

    // Format phone number for WhatsApp
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const whatsappFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

    // Prepare Twilio request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams({
      From: whatsappFrom,
      To: whatsappTo,
      Body: message,
      StatusCallback: `${supabaseUrl}/functions/v1/twilio-delivery-status`,
    });

    if (media_url) {
      params.append('MediaUrl', media_url);
    }

    // Send message via Twilio
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error('❌ Twilio API error:', error);
      throw new Error(`Twilio API error: ${error}`);
    }

    const twilioData = await twilioResponse.json();
    console.log('✅ Message sent via Twilio:', twilioData.sid);

    // Save message to database
    const { data: savedMessage, error: dbError } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_sid: twilioData.sid,
        sender_id: user.id,
        recipient_phone: to,
        message_body: message,
        status: twilioData.status,
        request_id: request_id || null,
        media_url: media_url || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('⚠️ Error saving message to database:', dbError);
      // Don't fail the request if DB save fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم إرسال الرسالة بنجاح',
        data: {
          message_sid: twilioData.sid,
          status: twilioData.status,
          to: whatsappTo,
          saved_message: savedMessage,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'حدث خطأ أثناء إرسال الرسالة',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
