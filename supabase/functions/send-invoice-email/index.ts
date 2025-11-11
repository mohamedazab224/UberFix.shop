import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { InvoiceEmail } from '../_shared/email-templates/invoice-email.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  invoice: {
    invoice_number: string;
    invoice_date: string;
    customer_name: string;
    customer_address?: string;
    items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>;
    subtotal: number;
    tax?: number;
    total: number;
    notes?: string;
  };
  customer_email: string;
}

const generateInvoiceHTML = async (invoice: InvoiceEmailRequest['invoice']): Promise<string> => {
  return await renderAsync(
    React.createElement(InvoiceEmail, {
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      customerName: invoice.customer_name,
      customerAddress: invoice.customer_address,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      notes: invoice.notes,
    })
  );
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice, customer_email }: InvoiceEmailRequest = await req.json();

    console.log(`Sending invoice ${invoice.invoice_number} to ${customer_email}`);

    const emailHtml = await generateInvoiceHTML(invoice);

    const emailResponse = await resend.emails.send({
      from: "UberFix <onboarding@resend.dev>",
      to: [customer_email],
      subject: `فاتورة #${invoice.invoice_number} - UberFix`,
      html: emailHtml,
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
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
