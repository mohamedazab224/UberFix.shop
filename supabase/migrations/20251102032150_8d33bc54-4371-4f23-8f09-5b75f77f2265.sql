-- Create app_settings table to store system configurations
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- General Settings
  app_name TEXT NOT NULL DEFAULT 'UberFix.shop',
  app_logo_url TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_address TEXT,
  default_currency TEXT DEFAULT 'EGP',
  timezone TEXT DEFAULT 'Africa/Cairo',
  default_language TEXT DEFAULT 'ar',
  allow_self_registration BOOLEAN DEFAULT true,
  
  -- Work Order Settings
  order_stages JSONB DEFAULT '["new", "in_progress", "completed", "closed"]'::jsonb,
  max_execution_time INTEGER DEFAULT 24, -- in hours
  allow_edit_after_start BOOLEAN DEFAULT false,
  require_manager_approval BOOLEAN DEFAULT true,
  
  -- Technicians & Clients Settings
  show_technicians_on_map BOOLEAN DEFAULT true,
  enable_technician_rating BOOLEAN DEFAULT true,
  allow_technician_quotes BOOLEAN DEFAULT true,
  technician_statuses JSONB DEFAULT '["available", "busy", "offline"]'::jsonb,
  
  -- Notifications Settings
  notification_types JSONB DEFAULT '["email", "sms", "in_app"]'::jsonb,
  enable_email_notifications BOOLEAN DEFAULT true,
  enable_sms_notifications BOOLEAN DEFAULT false,
  enable_in_app_notifications BOOLEAN DEFAULT true,
  enable_reminders BOOLEAN DEFAULT true,
  notification_templates JSONB DEFAULT '{}'::jsonb,
  
  -- UI/UX Settings
  theme_mode TEXT DEFAULT 'light',
  primary_color TEXT DEFAULT '#f5bf23',
  secondary_color TEXT DEFAULT '#111',
  background_color TEXT DEFAULT '#d2d2d2',
  map_style TEXT DEFAULT 'roadmap',
  show_footer BOOLEAN DEFAULT true,
  custom_css TEXT,
  
  -- Integrations Settings
  google_maps_enabled BOOLEAN DEFAULT true,
  erpnext_enabled BOOLEAN DEFAULT false,
  erpnext_url TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  smtp_from_email TEXT,
  
  -- Security & Backup Settings
  enable_2fa BOOLEAN DEFAULT false,
  auto_backup_enabled BOOLEAN DEFAULT true,
  backup_frequency TEXT DEFAULT 'daily',
  lock_sensitive_settings BOOLEAN DEFAULT true,
  session_timeout INTEGER DEFAULT 30, -- in minutes
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "app_settings_admin_select"
ON public.app_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Only admins can update settings
CREATE POLICY "app_settings_admin_update"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can insert settings (one-time setup)
CREATE POLICY "app_settings_admin_insert"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger to update updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO public.app_settings (app_name) 
VALUES ('UberFix.shop')
ON CONFLICT DO NOTHING;

-- Create audit log for settings changes
CREATE OR REPLACE FUNCTION log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    'SETTINGS_UPDATE',
    'app_settings',
    NEW.id,
    row_to_json(OLD),
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_app_settings_changes
AFTER UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION log_settings_change();