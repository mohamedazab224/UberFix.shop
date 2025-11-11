-- إنشاء View محسّنة لإحصائيات Dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  -- إحصائيات الطلبات (استخدام القيم الصحيحة من enum)
  COUNT(*) FILTER (WHERE status = 'Open') AS pending_requests,
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS today_requests,
  COUNT(*) FILTER (WHERE status = 'Completed') AS completed_requests,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) AS this_month_requests,
  
  -- إحصائيات المبالغ
  COALESCE(SUM(estimated_cost) FILTER (WHERE status != 'Cancelled'), 0) AS total_budget,
  COALESCE(SUM(actual_cost) FILTER (WHERE status = 'Completed'), 0) AS actual_cost,
  
  -- معدلات الإنجاز
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'Completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS completion_rate,
  
  -- متوسط وقت الإنجاز (بالأيام)
  ROUND(
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) FILTER (WHERE status = 'Completed'),
    2
  ) AS avg_completion_days,
  
  -- إحصائيات حسب الأولوية
  COUNT(*) FILTER (WHERE priority = 'high') AS high_priority_count,
  COUNT(*) FILTER (WHERE priority = 'medium') AS medium_priority_count,
  COUNT(*) FILTER (WHERE priority = 'low') AS low_priority_count,
  
  -- إحصائيات حسب workflow_stage
  COUNT(*) FILTER (WHERE workflow_stage = 'submitted') AS submitted_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'assigned') AS assigned_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'in_progress') AS in_progress_count,
  COUNT(*) FILTER (WHERE workflow_stage = 'completed') AS workflow_completed_count,
  
  -- آخر تحديث
  MAX(updated_at) AS last_updated
FROM maintenance_requests
WHERE archived_at IS NULL;

-- إضافة تعليق على الـ View
COMMENT ON VIEW dashboard_stats IS 'إحصائيات Dashboard محسّنة للأداء - تُحدّث في الوقت الفعلي';

-- إنشاء View إضافية للإحصائيات الشهرية
CREATE OR REPLACE VIEW monthly_stats AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE status = 'Completed') AS completed_requests,
  COUNT(*) FILTER (WHERE status = 'Open') AS pending_requests,
  COALESCE(SUM(estimated_cost), 0) AS total_estimated,
  COALESCE(SUM(actual_cost), 0) AS total_actual,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'Completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS completion_rate
FROM maintenance_requests
WHERE archived_at IS NULL
  AND created_at >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

COMMENT ON VIEW monthly_stats IS 'إحصائيات شهرية لطلبات الصيانة';