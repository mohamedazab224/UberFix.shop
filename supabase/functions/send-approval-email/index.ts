import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { ApprovalRequest } from '../_shared/email-templates/approval-request.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  approverEmail: string;
  requestNumber: string;
  customerName: string;
  location: string;
  description: string;
  estimatedCost?: string;
  requestId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      approverEmail,
      requestNumber,
      customerName,
      location,
      description,
      estimatedCost,
      requestId
    }: ApprovalEmailRequest = await req.json();

    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace("/v1", "") || "https://uberfix.app";
    const approvalUrl = `${baseUrl}/approve/${requestId}`;
    const rejectUrl = `${baseUrl}/reject/${requestId}`;
    const viewUrl = `${baseUrl}/requests/${requestId}`;

    const emailHtml = await renderAsync(
      React.createElement(ApprovalRequest, {
        requestNumber: requestNumber,
        customerName: customerName,
        location: location,
        description: description,
        estimatedCost: estimatedCost,
        approvalUrl: approvalUrl,
        rejectUrl: rejectUrl,
        viewUrl: viewUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: "UberFix <onboarding@resend.dev>",
      to: [approverEmail],
      subject: `طلب موافقة - صيانة #${requestNumber}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending approval email:", error);
      throw error;
    }

    console.log("Approval email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
