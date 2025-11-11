import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwilioMessageRequest {
  to: string;
  message: string;
  type?: 'sms' | 'whatsapp';
  requestId?: string;
  templateId?: string;
  variables?: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+12294082463';
    const twilioWhatsAppNumber = 'whatsapp:+14155238886';

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Missing Twilio credentials');
    }

    const requestData: TwilioMessageRequest = await req.json();
    const { to, message, type = 'sms', requestId, templateId, variables } = requestData;

    console.log('Sending message:', { to, type, requestId, templateId });

    // تجهيز رقم المرسل والمستقبل
    let fromNumber = type === 'whatsapp' ? twilioWhatsAppNumber : twilioPhoneNumber;
    let toNumber = to;

    // إضافة بادئة whatsapp إذا لزم الأمر
    if (type === 'whatsapp' && !to.startsWith('whatsapp:')) {
      toNumber = `whatsapp:${to}`;
    }

    // تحقق من صيغة الرقم المصري
    if (!to.startsWith('whatsapp:') && !to.startsWith('+')) {
      if (to.startsWith('01')) {
        toNumber = `+2${to}`;
      } else if (to.startsWith('201')) {
        toNumber = `+${to}`;
      }
    }

    // إعداد الجسم الأساسي للرسالة
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    let messageBody = message;
    let formData: Record<string, string> = {
      To: toNumber,
      From: fromNumber,
    };

    // إذا كان هناك قالب WhatsApp
    if (type === 'whatsapp' && templateId) {
      formData['ContentSid'] = templateId;
      if (variables) {
        formData['ContentVariables'] = JSON.stringify(variables);
      }
    } else {
      formData['Body'] = messageBody;
    }

    // تحويل البيانات إلى URL-encoded
    const encodedData = Object.entries(formData)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    console.log('Twilio request:', { url: twilioUrl, data: formData });

    // إرسال الطلب إلى Twilio
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`)
      },
      body: encodedData
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResult);
      throw new Error(twilioResult.message || 'Failed to send message');
    }

    console.log('Twilio response:', twilioResult);

    // حفظ السجل في قاعدة البيانات
    if (requestId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from('message_logs').insert({
        request_id: requestId,
        recipient: toNumber,
        message_type: type,
        message_content: messageBody,
        provider: 'twilio',
        status: twilioResult.status,
        external_id: twilioResult.sid,
        metadata: {
          price: twilioResult.price,
          price_unit: twilioResult.price_unit,
          num_segments: twilioResult.num_segments
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: twilioResult.sid,
        status: twilioResult.status,
        to: toNumber,
        type
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in send-twilio-message:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
