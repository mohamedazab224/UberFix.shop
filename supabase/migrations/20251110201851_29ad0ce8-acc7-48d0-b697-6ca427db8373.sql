-- حذف الجدول القديم إذا كان موجود وإعادة إنشائه
DROP TABLE IF EXISTS public.error_logs CASCADE;

-- إنشاء جدول error_logs متقدم مع جميع التفاصيل
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  stack TEXT,
  level TEXT NOT NULL DEFAULT 'error' CHECK (level IN ('error', 'warning', 'info')),
  url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  error_hash TEXT, -- للتجميع المتشابه
  count INTEGER DEFAULT 1, -- عدد مرات الحدوث
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء فهارس للأداء
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_level ON public.error_logs(level);
CREATE INDEX idx_error_logs_error_hash ON public.error_logs(error_hash);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_resolved_at ON public.error_logs(resolved_at) WHERE resolved_at IS NULL;

-- تفعيل RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول: فقط الأدمن والمانجر يمكنهم القراءة
CREATE POLICY "Admins and managers can view all error logs"
  ON public.error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- سياسة للإدراج: Edge Function فقط (عبر service role)
CREATE POLICY "Service role can insert error logs"
  ON public.error_logs
  FOR INSERT
  WITH CHECK (true);

-- سياسة للتحديث: فقط الأدمن يمكنه حل الأخطاء
CREATE POLICY "Admins can resolve errors"
  ON public.error_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_error_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_error_logs_updated_at
  BEFORE UPDATE ON public.error_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_error_logs_updated_at();

-- دالة لحساب hash الخطأ وتجميع الأخطاء المتشابهة
CREATE OR REPLACE FUNCTION public.set_error_hash_and_group()
RETURNS TRIGGER AS $$
DECLARE
  existing_error_id UUID;
  computed_hash TEXT;
BEGIN
  -- حساب hash من message + stack (أول 100 حرف)
  computed_hash := md5(NEW.message || COALESCE(substring(NEW.stack, 1, 100), ''));
  NEW.error_hash := computed_hash;
  
  -- البحث عن خطأ مشابه في آخر 24 ساعة
  SELECT id INTO existing_error_id
  FROM public.error_logs
  WHERE error_hash = computed_hash
    AND resolved_at IS NULL
    AND created_at > now() - INTERVAL '24 hours'
  ORDER BY created_at DESC
  LIMIT 1;

  -- إذا وجد خطأ مشابه، زيادة العداد بدلاً من إنشاء سجل جديد
  IF existing_error_id IS NOT NULL THEN
    UPDATE public.error_logs
    SET count = count + 1,
        last_seen_at = now(),
        metadata = CASE 
          WHEN metadata ? 'occurrences' THEN
            jsonb_set(metadata, '{occurrences}', ((metadata->>'occurrences')::int + 1)::text::jsonb)
          ELSE
            metadata || jsonb_build_object('occurrences', 2)
        END
    WHERE id = existing_error_id;
    
    RETURN NULL; -- إلغاء الإدراج
  END IF;

  RETURN NEW; -- السماح بالإدراج
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_error_hash_and_group_trigger
  BEFORE INSERT ON public.error_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_error_hash_and_group();