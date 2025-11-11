-- Add code column for property coding
ALTER TABLE properties ADD COLUMN IF NOT EXISTS code TEXT;

-- Add city_id and district_id for proper city/district relationship
ALTER TABLE properties ADD COLUMN IF NOT EXISTS city_id BIGINT REFERENCES cities(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS district_id BIGINT REFERENCES districts(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_properties_code ON properties(code);
CREATE INDEX IF NOT EXISTS idx_properties_city_id ON properties(city_id);
CREATE INDEX IF NOT EXISTS idx_properties_district_id ON properties(district_id);

-- Update icon_url to be auto-generated based on type (we'll handle this in the app)
COMMENT ON COLUMN properties.icon_url IS 'Auto-generated based on property type';

-- Add comment for QR code columns
COMMENT ON COLUMN properties.qr_code_data IS 'Automatically generated QR code data for quick access';
COMMENT ON COLUMN properties.qr_code_generated_at IS 'Timestamp when QR code was generated';