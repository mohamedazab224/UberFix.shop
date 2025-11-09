-- إضافة أعمدة SLA إلى جدول maintenance_requests
ALTER TABLE public.maintenance_requests
ADD COLUMN IF NOT EXISTS sla_accept_due timestamptz,
ADD COLUMN IF NOT EXISTS sla_arrive_due timestamptz,
ADD COLUMN IF NOT EXISTS sla_complete_due timestamptz;

-- إنشاء trigger لحساب SLA تلقائياً عند إنشاء أو تحديث الطلب
CREATE OR REPLACE FUNCTION public.auto_calculate_sla()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  accept_hours INTEGER := 2;   -- ساعتين للقبول
  arrive_hours INTEGER := 4;   -- 4 ساعات للوصول
  complete_hours INTEGER := 24; -- 24 ساعة للإنجاز
BEGIN
  -- حساب أوقات SLA حسب الأولوية
  CASE NEW.priority
    WHEN 'high' THEN
      accept_hours := 1;
      arrive_hours := 2;
      complete_hours := 8;
    WHEN 'medium' THEN
      accept_hours := 2;
      arrive_hours := 4;
      complete_hours := 24;
    WHEN 'low' THEN
      accept_hours := 4;
      arrive_hours := 8;
      complete_hours := 48;
    ELSE
      accept_hours := 2;
      arrive_hours := 4;
      complete_hours := 24;
  END CASE;

  -- تعيين أوقات SLA
  NEW.sla_accept_due := NEW.created_at + (accept_hours || ' hours')::INTERVAL;
  NEW.sla_arrive_due := NEW.created_at + (arrive_hours || ' hours')::INTERVAL;
  NEW.sla_complete_due := NEW.created_at + (complete_hours || ' hours')::INTERVAL;

  RETURN NEW;
END;
$$;

-- تطبيق trigger على INSERT
DROP TRIGGER IF EXISTS trigger_auto_calculate_sla ON public.maintenance_requests;
CREATE TRIGGER trigger_auto_calculate_sla
  BEFORE INSERT ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_calculate_sla();

-- تحديث الطلبات الموجودة لحساب SLA
UPDATE public.maintenance_requests
SET 
  sla_accept_due = created_at + INTERVAL '2 hours',
  sla_arrive_due = created_at + INTERVAL '4 hours',
  sla_complete_due = created_at + INTERVAL '24 hours'
WHERE sla_accept_due IS NULL;

COMMENT ON COLUMN public.maintenance_requests.sla_accept_due IS 'الموعد النهائي لقبول الطلب';
COMMENT ON COLUMN public.maintenance_requests.sla_arrive_due IS 'الموعد النهائي للوصول إلى الموقع';
COMMENT ON COLUMN public.maintenance_requests.sla_complete_due IS 'الموعد النهائي لإنجاز الطلب';
