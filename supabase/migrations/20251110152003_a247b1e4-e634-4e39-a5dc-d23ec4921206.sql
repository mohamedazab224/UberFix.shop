-- Create whatsapp_messages table
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_sid TEXT NOT NULL UNIQUE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  media_url TEXT,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own sent messages
CREATE POLICY "Users can view their own sent messages"
  ON public.whatsapp_messages
  FOR SELECT
  USING (auth.uid() = sender_id);

-- Allow authenticated users to insert messages
CREATE POLICY "Users can send messages"
  ON public.whatsapp_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Allow service role to update message status (for webhooks)
CREATE POLICY "Service role can update message status"
  ON public.whatsapp_messages
  FOR UPDATE
  USING (true);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON public.whatsapp_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX idx_whatsapp_messages_sender ON public.whatsapp_messages(sender_id);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_request ON public.whatsapp_messages(request_id);

-- Trigger to update updated_at
CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
