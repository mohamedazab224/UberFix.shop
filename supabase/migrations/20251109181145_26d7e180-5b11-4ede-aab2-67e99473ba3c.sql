-- Create reviews table for technician ratings
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  request_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = customer_id);

-- Create index for faster queries
CREATE INDEX idx_reviews_technician_id ON public.reviews(technician_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_reviews_updated_at();

-- Update technician rating when review is added
CREATE OR REPLACE FUNCTION public.update_technician_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.technicians
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE technician_id = NEW.technician_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE technician_id = NEW.technician_id
    )
  WHERE id = NEW.technician_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to update technician rating
CREATE TRIGGER update_technician_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_technician_rating();