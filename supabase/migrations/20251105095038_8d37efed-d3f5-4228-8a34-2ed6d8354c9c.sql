-- Function to create notification when maintenance request status changes
CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_customer_id uuid;
  v_title text;
  v_message text;
  v_stage_name text;
BEGIN
  -- Only create notification if workflow_stage changed
  IF OLD.workflow_stage IS DISTINCT FROM NEW.workflow_stage THEN
    
    -- Get customer_id (could be customer_id or created_by depending on table structure)
    v_customer_id := COALESCE(NEW.customer_id, NEW.created_by);
    
    -- Skip if no customer found
    IF v_customer_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Get Arabic stage name
    v_stage_name := CASE NEW.workflow_stage
      WHEN 'DRAFT' THEN 'مسودة'
      WHEN 'SUBMITTED' THEN 'مُقدم'
      WHEN 'TRIAGED' THEN 'تم الفرز'
      WHEN 'ASSIGNED' THEN 'تم التخصيص'
      WHEN 'SCHEDULED' THEN 'مجدول'
      WHEN 'IN_PROGRESS' THEN 'قيد التنفيذ'
      WHEN 'INSPECTION' THEN 'تحت الفحص'
      WHEN 'COMPLETED' THEN 'مكتمل'
      WHEN 'BILLED' THEN 'تم إصدار الفاتورة'
      WHEN 'PAID' THEN 'تم الدفع'
      WHEN 'CLOSED' THEN 'مغلق'
      WHEN 'CANCELLED' THEN 'ملغي'
      WHEN 'ON_HOLD' THEN 'معلق'
      WHEN 'WAITING_PARTS' THEN 'بانتظار القطع'
      WHEN 'REJECTED' THEN 'مرفوض'
      ELSE NEW.workflow_stage
    END;
    
    -- Create notification title and message
    v_title := 'تحديث حالة طلب الصيانة #' || SUBSTRING(NEW.id::text, 1, 8);
    v_message := 'تم تحديث حالة طلبك إلى: ' || v_stage_name;
    
    -- Add additional details if available
    IF NEW.status IS NOT NULL THEN
      v_message := v_message || ' - الحالة: ' || NEW.status;
    END IF;
    
    -- Insert notification
    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      type,
      entity_type,
      entity_id
    ) VALUES (
      v_customer_id,
      v_title,
      v_message,
      CASE 
        WHEN NEW.workflow_stage IN ('COMPLETED', 'PAID', 'CLOSED') THEN 'success'
        WHEN NEW.workflow_stage IN ('CANCELLED', 'REJECTED') THEN 'error'
        WHEN NEW.workflow_stage IN ('ON_HOLD', 'WAITING_PARTS') THEN 'warning'
        ELSE 'info'
      END,
      'maintenance_request',
      NEW.id
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on maintenance_requests table
DROP TRIGGER IF EXISTS trigger_notify_customer_on_status_change ON public.maintenance_requests;
CREATE TRIGGER trigger_notify_customer_on_status_change
  AFTER UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_customer_on_status_change();