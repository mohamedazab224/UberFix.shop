import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

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

    const emailHtml = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>طلب موافقة على صيانة #${requestNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f4f6; font-family: Tahoma, Arial, 'Segoe UI', sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 24px 0;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0b1b3b; padding: 20px; text-align: center;">
              <img src="https://al-azab.co/w.png" width="120" height="40" alt="UberFix" style="display: inline-block;">
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="color: #111; font-size: 22px; font-weight: 700; margin: 0 0 20px; text-align: right;">طلب موافقة على صيانة</h1>
              <p style="color: #111; font-size: 16px; line-height: 1.8; margin: 0 0 14px; text-align: right;">
                رقم الطلب: <strong style="color: #f5bf23; font-weight: 700;">#${requestNumber}</strong>
              </p>
              <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <tr>
                  <td>
                    <p style="color: #111; font-size: 15px; line-height: 1.8; margin: 8px 0; text-align: right;">
                      <strong>العميل:</strong> ${customerName}
                    </p>
                    <p style="color: #111; font-size: 15px; line-height: 1.8; margin: 8px 0; text-align: right;">
                      <strong>الموقع:</strong> ${location}
                    </p>
                    <p style="color: #111; font-size: 15px; line-height: 1.8; margin: 8px 0; text-align: right;">
                      <strong>الوصف:</strong> ${description}
                    </p>
                    ${estimatedCost ? `<p style="color: #111; font-size: 15px; line-height: 1.8; margin: 8px 0; text-align: right;">
                      <strong>التكلفة المتوقعة:</strong> ${estimatedCost}
                    </p>` : ''}
                  </td>
                </tr>
              </table>
              <table role="presentation" style="width: 100%; margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${approvalUrl}" style="background-color: #f5bf23; color: #111; font-size: 16px; font-weight: 700; text-decoration: none; display: inline-block; padding: 12px 28px; margin: 8px; border-radius: 10px;">
                      ✓ الموافقة على الطلب
                    </a>
                    <a href="${rejectUrl}" style="background-color: #dc2626; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; display: inline-block; padding: 12px 28px; margin: 8px; border-radius: 10px;">
                      ✗ رفض الطلب
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #666; font-size: 14px; text-align: center; margin: 16px 0;">
                أو <a href="${viewUrl}" style="color: #f5bf23; text-decoration: underline;">عرض تفاصيل الطلب كاملة</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #666; font-size: 12px; margin: 4px 0;">
                © 2025 UberFix — خدمة الصيانة الاحترافية
              </p>
              <p style="color: #666; font-size: 12px; margin: 4px 0;">
                <a href="https://uberfix.app" style="color: #f5bf23; text-decoration: none;">الموقع الإلكتروني</a>
                |
                <a href="https://uberfix.app/policy.html" style="color: #f5bf23; text-decoration: none;">سياسة الخصوصية</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

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
