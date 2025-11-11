-- إنشاء جدول لتسجيل الرسائل المرسلة عبر SMS و WhatsApp
CREATE TABLE IF NOT EXISTS public.message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('sms', 'whatsapp', 'email')),
  message_content TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'twilio',
  status TEXT NOT NULL DEFAULT 'queued',
  external_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- إنشاء فهرس لتسريع البحث
CREATE INDEX idx_message_logs_request_id ON public.message_logs(request_id);
CREATE INDEX idx_message_logs_status ON public.message_logs(status);
CREATE INDEX idx_message_logs_sent_at ON public.message_logs(sent_at DESC);
CREATE INDEX idx_message_logs_recipient ON public.message_logs(recipient);

-- تفعيل RLS
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
-- الموظفون والمديرون يمكنهم رؤية جميع السجلات
CREATE POLICY "Staff can view all message logs"
ON public.message_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager', 'staff')
  )
);

-- المستخدمون يمكنهم رؤية سجلات الرسائل الخاصة بطلباتهم فقط
CREATE POLICY "Users can view their own message logs"
ON public.message_logs
FOR SELECT
TO authenticated
USING (
  request_id IN (
    SELECT id FROM public.maintenance_requests
    WHERE created_by = auth.uid()
  )
);

-- فقط النظام يمكنه إضافة سجلات
CREATE POLICY "Service role can insert message logs"
ON public.message_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- فقط النظام يمكنه تحديث السجلات (لتحديث حالة التسليم)
CREATE POLICY "Service role can update message logs"
ON public.message_logs
FOR UPDATE
TO service_role
USING (true);

-- تحديث updated_at تلقائياً
CREATE TRIGGER update_message_logs_updated_at
  BEFORE UPDATE ON public.message_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة حقول للتكامل مع Twilio في جدول notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS message_log_id UUID REFERENCES public.message_logs(id);

COMMENT ON TABLE public.message_logs IS 'سجل جميع الرسائل المرسلة عبر SMS و WhatsApp';
COMMENT ON COLUMN public.message_logs.external_id IS 'معرف الرسالة من مزود الخدمة (مثل Twilio SID)';
COMMENT ON COLUMN public.message_logs.metadata IS 'بيانات إضافية مثل التكلفة وعدد الأجزاء';