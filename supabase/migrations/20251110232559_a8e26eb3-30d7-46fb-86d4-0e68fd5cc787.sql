-- إضافة عمود customer_notes المفقود من جدول maintenance_requests
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS customer_notes TEXT;