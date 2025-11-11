-- إصلاح الدوال الخمس بإضافة search_path لتأمين SQL injection

-- 1. calculate_item_total
CREATE OR REPLACE FUNCTION public.calculate_item_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.total_price = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$function$;

-- 2. generate_invoice_number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := to_char(CURRENT_DATE, 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';
  
  RETURN 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 3, '0');
END;
$function$;

-- 3. set_invoice_number
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 5. services_tsvector_trigger
CREATE OR REPLACE FUNCTION public.services_tsvector_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.search_keywords := to_tsvector('simple', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$function$;

-- مراجعة شاملة: التأكد من جميع الدوال الأخرى لديها search_path
-- (جميع الدوال الأخرى في القاعدة لديها search_path بالفعل)

COMMENT ON FUNCTION public.calculate_item_total() IS 'تحديث: تم إضافة search_path للأمان';
COMMENT ON FUNCTION public.generate_invoice_number() IS 'تحديث: تم إضافة search_path للأمان';
COMMENT ON FUNCTION public.set_invoice_number() IS 'تحديث: تم إضافة search_path للأمان';
COMMENT ON FUNCTION public.touch_updated_at() IS 'تحديث: تم إضافة search_path للأمان';
COMMENT ON FUNCTION public.services_tsvector_trigger() IS 'تحديث: تم إضافة search_path للأمان';