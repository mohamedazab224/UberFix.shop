-- Add images column to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS images TEXT[];

COMMENT ON COLUMN public.properties.images IS 'Array of image URLs for the property gallery';