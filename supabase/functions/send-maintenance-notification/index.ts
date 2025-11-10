import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  request_id: string;
  old_status?: string;
  new_status?: string;
  old_stage?: string;
  new_stage?: string;
  event_type: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { request_id, old_status, new_status, old_stage, new_stage, event_type, message } = await req.json() as NotificationRequest;

    console.log('Sending notification for request:', request_id, 'Event:', event_type);

    // جلب معلومات الطلب
    const { data: request, error: requestError } = await supabaseClient
      .from('maintenance_requests')
      .select('title, client_name, created_by, status, workflow_stage')
      .eq('id', request_id)
      .single();

    if (requestError) {
      throw new Error(`Failed to fetch request: ${requestError.message}`);
    }

    let notificationTitle = '';
    let notificationMessage = '';

    // تحديد نوع الإشعار بناءً على الحدث
    switch (event_type) {
      case 'status_changed':
        notificationTitle = '🔄 تحديث حالة طلب الصيانة';
        notificationMessage = `تم تحديث حالة طلب "${request.title}" من "${old_status}" إلى "${new_status}"`;
        break;
      case 'stage_changed':
        notificationTitle = '📋 تحديث مرحلة الطلب';
        notificationMessage = `تم نقل طلب "${request.title}" إلى المرحلة: ${new_stage}`;
        break;
      case 'request_created':
        notificationTitle = '✅ طلب صيانة جديد';
        notificationMessage = `تم إنشاء طلب صيانة جديد: "${request.title}"`;
        break;
      case 'request_assigned':
        notificationTitle = '👷 تم تعيين الطلب';
        notificationMessage = `تم تعيين طلب "${request.title}" لفني صيانة`;
        break;
      case 'request_completed':
        notificationTitle = '✅ تم إتمام الطلب';
        notificationMessage = `تم إتمام طلب الصيانة "${request.title}" بنجاح`;
        break;
      default:
        notificationTitle = '📢 تحديث طلب الصيانة';
        notificationMessage = message || `تحديث على طلب "${request.title}"`;
    }

    // إنشاء الإشعار للمستخدم الذي أنشأ الطلب
    if (request.created_by) {
      const { error: notifError } = await supabaseClient
        .from('notifications')
        .insert({
          recipient_id: request.created_by,
          title: notificationTitle,
          message: notificationMessage,
          type: event_type === 'request_completed' ? 'success' : 'info',
          entity_type: 'maintenance_request',
          entity_id: request_id,
        });

      if (notifError) {
        console.error('Failed to create notification:', notifError);
        throw new Error(`Failed to create notification: ${notifError.message}`);
      }
    }

    // إنشاء إشعار للمسؤولين والموظفين
    const { data: staffUsers, error: staffError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'manager', 'staff']);

    if (!staffError && staffUsers) {
      const staffNotifications = staffUsers
        .filter(u => u.user_id !== request.created_by) // تجنب الإشعارات المكررة
        .map(u => ({
          recipient_id: u.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'info',
          entity_type: 'maintenance_request',
          entity_id: request_id,
        }));

      if (staffNotifications.length > 0) {
        await supabaseClient
          .from('notifications')
          .insert(staffNotifications);
      }
    }

    console.log('Notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-maintenance-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});