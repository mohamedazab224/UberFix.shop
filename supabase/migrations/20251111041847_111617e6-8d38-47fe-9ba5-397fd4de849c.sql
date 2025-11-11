-- Update all branch locations to use the new pin-pro icon
UPDATE branch_locations 
SET icon = '/icons/pin-pro/pin-pro-24.svg' 
WHERE branch_type IN ('Branch', 'Booth');

-- Add technician icons table if not exists (for future use)
CREATE TABLE IF NOT EXISTS technician_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT,
  latitude TEXT,
  longitude TEXT,
  icon TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on technician_locations
ALTER TABLE technician_locations ENABLE ROW LEVEL SECURITY;

-- Allow public read access to technician locations
CREATE POLICY "Anyone can view technician locations"
  ON technician_locations
  FOR SELECT
  USING (true);

-- Only admins can manage technician locations
CREATE POLICY "Only admins can manage technician locations"
  ON technician_locations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert some sample technicians with different icons based on specialization
INSERT INTO technician_locations (id, name, specialization, latitude, longitude, icon, status)
VALUES
  ('tech-001', 'أحمد محمد', 'electrician', '30.0444', '31.2357', '/icons/technician-electric.svg', 'available'),
  ('tech-002', 'محمود علي', 'plumber', '30.0500', '31.2400', '/icons/technician-plumber.svg', 'busy'),
  ('tech-003', 'خالد حسن', 'hvac', '30.0600', '31.2500', '/icons/technician-hvac.svg', 'available'),
  ('tech-004', 'عمر سعيد', 'carpenter', '30.0700', '31.2600', '/icons/technician-carpenter.svg', 'available'),
  ('tech-005', 'يوسف كمال', 'painter', '30.0350', '31.2250', '/icons/technician-painter.svg', 'offline')
ON CONFLICT (id) DO UPDATE SET
  icon = EXCLUDED.icon;