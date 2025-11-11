-- إضافة أعمدة تتبع الموقع في الوقت الفعلي للفنيين في جدول vendors
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS current_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS current_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_tracking_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS map_icon TEXT;

-- إنشاء جدول لتاريخ مواقع الفنيين
CREATE TABLE IF NOT EXISTS vendor_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_vendor_location_history_vendor_id ON vendor_location_history(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_location_history_recorded_at ON vendor_location_history(recorded_at DESC);

-- RLS policies for vendor_location_history
ALTER TABLE vendor_location_history ENABLE ROW LEVEL SECURITY;

-- Staff can view all location history
CREATE POLICY "Staff can view vendor location history"
ON vendor_location_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'manager', 'staff')
  )
);

-- Vendors can insert their own location
CREATE POLICY "Vendors can insert own location"
ON vendor_location_history
FOR INSERT
WITH CHECK (
  vendor_id IN (
    SELECT id FROM vendors WHERE id::text = auth.uid()::text
  )
);

-- إضافة تعليق على الجدول
COMMENT ON TABLE vendor_location_history IS 'تخزين تاريخ مواقع الفنيين للتحليل والتتبع';