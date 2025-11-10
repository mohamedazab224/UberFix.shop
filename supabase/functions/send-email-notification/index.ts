import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { MaintenanceNotification } from '../_shared/email-templates/maintenance-notification.tsx';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  recipient_email: string;
  recipient_name: string;
  notification_type: string;
  request_number: string;
  customer_name?: string;
  technician_name?: string;
  location?: string;
  description?: string;
  due_date?: string;
  message?: string;
}

const generateNotificationHTML = async (data: EmailNotificationRequest): Promise<string> => {
  return await renderAsync(
    React.createElement(MaintenanceNotification, {
      requestNumber: data.request_number,
      notificationType: data.notification_type,
      customerName: data.customer_name,
      technicianName: data.technician_name,
      location: data.location,
      description: data.description,
      dueDate: data.due_date,
      message: data.message,
    })
  );
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailNotificationRequest = await req.json();
    console.log('Sending email notification:', emailData);

    const htmlContent = await generateNotificationHTML(emailData);
    
    const subjectMap: Record<string, string> = {
      new_request: 'طلب صيانة جديد - UberFix',
      accepted: 'تم قبول الطلب - UberFix',
      technician_assigned: 'تم تعيين فني - UberFix',
      on_the_way: 'الفني في الطريق - UberFix',
      arrived: 'وصل الفني - UberFix',
      completed: 'تم إكمال الصيانة - UberFix',
      sla_warning: 'تحذير: اقتراب موعد الإنجاز - UberFix',
    };
    
    const subject = subjectMap[emailData.notification_type] || 'إشعار صيانة - UberFix';

    const emailResponse = await resend.emails.send({
      from: "UberFix <onboarding@resend.dev>",
      to: [emailData.recipient_email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email notification:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
