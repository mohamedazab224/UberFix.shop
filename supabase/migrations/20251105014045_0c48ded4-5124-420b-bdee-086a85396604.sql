-- إنشاء جدول الفنيين (Technicians) مع المواقع والتخصصات
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  specialization TEXT NOT NULL, -- نوع التخصص (كهربائي، سباك، نجار، إلخ)
  profile_image TEXT,
  rating NUMERIC(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'offline', 'on_route')),
  current_latitude NUMERIC(10,7),
  current_longitude NUMERIC(10,7),
  location_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hourly_rate NUMERIC(10,2),
  available_from TIME,
  available_to TIME,
  bio TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  service_area_radius NUMERIC(10,2) DEFAULT 10, -- نطاق الخدمة بالكيلومتر
  company_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false
);

-- إنشاء index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_technicians_specialization ON public.technicians(specialization);
CREATE INDEX IF NOT EXISTS idx_technicians_status ON public.technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_location ON public.technicians(current_latitude, current_longitude);
CREATE INDEX IF NOT EXISTS idx_technicians_company ON public.technicians(company_id);

-- إنشاء جدول التقييمات
CREATE TABLE IF NOT EXISTS public.technician_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID NOT NULL REFERENCES public.technicians(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  service_request_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_technician ON public.technician_reviews(technician_id);

-- دالة لتحديث متوسط التقييم
CREATE OR REPLACE FUNCTION public.update_technician_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.technicians
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.technician_reviews
      WHERE technician_id = NEW.technician_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.technician_reviews
      WHERE technician_id = NEW.technician_id
    ),
    updated_at = NOW()
  WHERE id = NEW.technician_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger لتحديث التقييم تلقائياً
DROP TRIGGER IF EXISTS trg_update_technician_rating ON public.technician_reviews;
CREATE TRIGGER trg_update_technician_rating
AFTER INSERT OR UPDATE ON public.technician_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_technician_rating();

-- Trigger لتحديث updated_at
DROP TRIGGER IF EXISTS trg_technicians_updated_at ON public.technicians;
CREATE TRIGGER trg_technicians_updated_at
BEFORE UPDATE ON public.technicians
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

-- جدول ربط التخصصات بالأيقونات
CREATE TABLE IF NOT EXISTS public.specialization_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  icon_path TEXT NOT NULL, -- مسار الأيقونة من pin-pro
  color TEXT DEFAULT '#f5bf23',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- إدراج التخصصات الأساسية
INSERT INTO public.specialization_icons (name, name_ar, icon_path, color, sort_order) VALUES
  ('electrician', 'كهربائي', '/icons/pin-pro/pin-pro-5.svg', '#faab11', 1),
  ('plumber', 'سباك', '/icons/pin-pro/pin-pro-14.svg', '#1800ad', 2),
  ('carpenter', 'نجار', '/icons/pin-pro/pin-pro-49.svg', '#f5bf23', 3),
  ('painter', 'دهان', '/icons/pin-pro/pin-pro-32.svg', '#faab11', 4),
  ('ac_technician', 'فني تكييف', '/icons/pin-pro/pin-pro-5.svg', '#1800ad', 5),
  ('general_maintenance', 'صيانة عامة', '/icons/pin-pro/pin-pro-14.svg', '#f5bf23', 6)
ON CONFLICT (name) DO NOTHING;

-- RLS Policies للفنيين
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم رؤية الفنيين النشطين
CREATE POLICY "public_view_active_technicians"
ON public.technicians FOR SELECT
USING (is_active = true);

-- الفنيين يمكنهم تحديث بياناتهم
CREATE POLICY "technicians_update_own"
ON public.technicians FOR UPDATE
USING (created_by = auth.uid());

-- المديرين يمكنهم إدارة الفنيين
CREATE POLICY "admins_manage_technicians"
ON public.technicians FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
  )
);

-- RLS للتقييمات
ALTER TABLE public.technician_reviews ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم رؤية التقييمات
CREATE POLICY "public_view_reviews"
ON public.technician_reviews FOR SELECT
USING (true);

-- العملاء يمكنهم إضافة تقييمات
CREATE POLICY "customers_create_reviews"
ON public.technician_reviews FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- RLS لأيقونات التخصصات
ALTER TABLE public.specialization_icons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_view_icons"
ON public.specialization_icons FOR SELECT
USING (is_active = true);

-- إدراج بيانات تجريبية للفنيين
INSERT INTO public.technicians (
  name, phone, email, specialization, rating, total_reviews, 
  status, current_latitude, current_longitude, hourly_rate,
  available_from, available_to, bio, is_verified
) VALUES
  ('أحمد حسين', '+201234567890', 'ahmed@uberfix.shop', 'electrician', 4.8, 156, 
   'online', 30.0444, 31.2357, 150.00, '08:00', '18:00', 
   'فني كهربائي معتمد مع خبرة 10 سنوات في الصيانة', true),
  
  ('محمد علي', '+201234567891', 'mohamed@uberfix.shop', 'plumber', 4.9, 203, 
   'online', 30.0644, 31.2557, 120.00, '09:00', '17:00', 
   'متخصص في أعمال السباكة والصرف الصحي', true),
  
  ('خالد سعيد', '+201234567892', 'khaled@uberfix.shop', 'carpenter', 4.7, 98, 
   'busy', 30.0244, 31.2157, 130.00, '08:00', '16:00', 
   'نجار محترف - أعمال الأبواب والنوافذ', true),
  
  ('عمر فاروق', '+201234567893', 'omar@uberfix.shop', 'ac_technician', 4.9, 145, 
   'online', 30.0844, 31.2757, 180.00, '07:00', '19:00', 
   'فني تكييف وتبريد معتمد', true),
  
  ('ياسر محمود', '+201234567894', 'yasser@uberfix.shop', 'painter', 4.6, 87, 
   'online', 30.0344, 31.2257, 100.00, '08:00', '17:00', 
   'دهان محترف - جميع أنواع الدهانات', true);

COMMENT ON TABLE public.technicians IS 'جدول الفنيين والعمال مع مواقعهم وتخصصاتهم';
COMMENT ON TABLE public.technician_reviews IS 'تقييمات العملاء للفنيين';
COMMENT ON TABLE public.specialization_icons IS 'ربط التخصصات بالأيقونات المخصصة';