import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // جلب الطلبات التي تجاوزت SLA
    const { data: overdueTasks, error: fetchError } = await supabase
      .from('maintenance_requests')
      .select(`
        id,
        title,
        priority,
        workflow_stage,
        status,
        sla_accept_due,
        sla_arrive_due,
        sla_complete_due,
        created_by,
        created_at
      `)
      .not('status', 'in', '(completed,cancelled,closed)')
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    const now = new Date();
    const notifications = [];

    for (const task of overdueTasks || []) {
      const violations = [];
      
      // فحص تجاوز موعد القبول
      if (task.sla_accept_due && new Date(task.sla_accept_due) < now && task.workflow_stage === 'SUBMITTED') {
        violations.push({
          type: 'accept',
          due: task.sla_accept_due,
          message: 'تأخر في قبول الطلب'
        });
      }

      // فحص تجاوز موعد الوصول
      if (task.sla_arrive_due && new Date(task.sla_arrive_due) < now && task.workflow_stage === 'ASSIGNED') {
        violations.push({
          type: 'arrive',
          due: task.sla_arrive_due,
          message: 'تأخر في الوصول للموقع'
        });
      }

      // فحص تجاوز موعد الإنجاز
      if (task.sla_complete_due && new Date(task.sla_complete_due) < now && task.workflow_stage !== 'COMPLETED') {
        violations.push({
          type: 'complete',
          due: task.sla_complete_due,
          message: 'تأخر في إنجاز الطلب'
        });
      }

      // إنشاء إشعارات للتجاوزات
      for (const violation of violations) {
        const minutesOverdue = Math.floor((now.getTime() - new Date(violation.due).getTime()) / 60000);
        
        notifications.push({
          recipient_id: task.created_by,
          title: `⚠️ تجاوز SLA - طلب #${task.id.substring(0, 8)}`,
          message: `${violation.message}: تأخر ${minutesOverdue} دقيقة عن الموعد المحدد`,
          type: 'warning',
          entity_type: 'maintenance_request',
          entity_id: task.id
        });

        // تسجيل حدث التجاوز
        await supabase.from('request_events').insert({
          request_id: task.id,
          event_type: 'sla_violation',
          from_stage: task.workflow_stage,
          to_stage: task.workflow_stage,
          meta: {
            violation_type: violation.type,
            due_date: violation.due,
            minutes_overdue: minutesOverdue,
            detected_at: now.toISOString()
          }
        });
      }
    }

    // إرسال الإشعارات دفعة واحدة
    if (notifications.length > 0) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (notifyError) console.error('Error creating notifications:', notifyError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: overdueTasks?.length || 0,
        violations: notifications.length,
        timestamp: now.toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SLA Monitor Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
