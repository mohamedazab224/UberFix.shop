-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  app_name text NOT NULL DEFAULT 'UberFix.shop'::text,
  app_logo_url text,
  company_email text,
  company_phone text,
  company_address text,
  default_currency text DEFAULT 'EGP'::text,
  timezone text DEFAULT 'Africa/Cairo'::text,
  default_language text DEFAULT 'ar'::text,
  allow_self_registration boolean DEFAULT true,
  order_stages jsonb DEFAULT '["new", "in_progress", "completed", "closed"]'::jsonb,
  max_execution_time integer DEFAULT 24,
  allow_edit_after_start boolean DEFAULT false,
  require_manager_approval boolean DEFAULT true,
  show_technicians_on_map boolean DEFAULT true,
  enable_technician_rating boolean DEFAULT true,
  allow_technician_quotes boolean DEFAULT true,
  technician_statuses jsonb DEFAULT '["available", "busy", "offline"]'::jsonb,
  notification_types jsonb DEFAULT '["email", "sms", "in_app"]'::jsonb,
  enable_email_notifications boolean DEFAULT true,
  enable_sms_notifications boolean DEFAULT false,
  enable_in_app_notifications boolean DEFAULT true,
  enable_reminders boolean DEFAULT true,
  notification_templates jsonb DEFAULT '{}'::jsonb,
  theme_mode text DEFAULT 'light'::text,
  primary_color text DEFAULT '#f5bf23'::text,
  secondary_color text DEFAULT '#111'::text,
  background_color text DEFAULT '#d2d2d2'::text,
  map_style text DEFAULT 'roadmap'::text,
  show_footer boolean DEFAULT true,
  custom_css text,
  google_maps_enabled boolean DEFAULT true,
  erpnext_enabled boolean DEFAULT false,
  erpnext_url text,
  smtp_host text,
  smtp_port integer,
  smtp_username text,
  smtp_password text,
  smtp_from_email text,
  enable_2fa boolean DEFAULT false,
  auto_backup_enabled boolean DEFAULT true,
  backup_frequency text DEFAULT 'daily'::text,
  lock_sensitive_settings boolean DEFAULT true,
  session_timeout integer DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT app_settings_pkey PRIMARY KEY (id),
  CONSTRAINT app_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  appointment_date date NOT NULL,
  appointment_time time without time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'rescheduled'::text])),
  property_id uuid,
  vendor_id uuid,
  maintenance_request_id uuid,
  location text,
  notes text,
  reminder_sent boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT appointments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.branch_locations (
  id text NOT NULL,
  branch text NOT NULL,
  address text,
  branch_type text,
  link text,
  icon text,
  latitude text,
  longitude text,
  CONSTRAINT branch_locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.branches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  city text,
  address text,
  geo jsonb,
  opening_hours text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT branches_pkey PRIMARY KEY (id),
  CONSTRAINT branches_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon_url text,
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cities (
  id bigint NOT NULL DEFAULT nextval('cities_id_seq'::regclass),
  name_ar text NOT NULL UNIQUE,
  CONSTRAINT cities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  billing_cycle text,
  pricing_model text,
  eta_tax_profile_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.districts (
  id bigint NOT NULL DEFAULT nextval('districts_id_seq'::regclass),
  city_id bigint NOT NULL,
  name_ar text NOT NULL,
  CONSTRAINT districts_pkey PRIMARY KEY (id),
  CONSTRAINT districts_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id)
);
CREATE TABLE public.error_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  message text NOT NULL,
  stack text,
  level text NOT NULL DEFAULT 'error'::text CHECK (level = ANY (ARRAY['error'::text, 'warning'::text, 'info'::text])),
  url text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  error_hash text,
  count integer DEFAULT 1,
  first_seen_at timestamp with time zone DEFAULT now(),
  last_seen_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT error_logs_pkey PRIMARY KEY (id),
  CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT error_logs_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid,
  maintenance_request_id uuid,
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  expense_date timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.gallery_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  tags ARRAY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  folder text,
  CONSTRAINT gallery_images_pkey PRIMARY KEY (id)
);
CREATE TABLE public.invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  service_name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id)
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EGP'::text,
  due_date date,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending'::text,
  payment_method text,
  payment_reference text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.maintenance_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  branch_id uuid NOT NULL,
  asset_id uuid,
  opened_by_role text,
  channel text,
  title text NOT NULL,
  description text,
  category_id uuid,
  subcategory_id uuid,
  priority text,
  sla_deadline timestamp with time zone,
  status USER-DEFINED NOT NULL DEFAULT 'Open'::mr_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  client_name text,
  client_phone text,
  client_email text,
  location text,
  service_type text,
  estimated_cost numeric,
  actual_cost numeric,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  workflow_stage text DEFAULT 'draft'::text,
  sla_due_date timestamp with time zone,
  assigned_vendor_id uuid,
  vendor_notes text,
  archived_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  property_id uuid,
  latitude double precision,
  longitude double precision,
  sla_accept_due timestamp with time zone,
  sla_arrive_due timestamp with time zone,
  sla_complete_due timestamp with time zone,
  customer_notes text,
  CONSTRAINT maintenance_requests_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_requests_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT fk_maintenance_requests_assigned_vendor FOREIGN KEY (assigned_vendor_id) REFERENCES public.vendors(id),
  CONSTRAINT maintenance_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT maintenance_requests_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id),
  CONSTRAINT maintenance_requests_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id),
  CONSTRAINT maintenance_requests_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.service_subcategories(id),
  CONSTRAINT maintenance_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT maintenance_requests_assigned_vendor_id_fkey FOREIGN KEY (assigned_vendor_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.message_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid,
  recipient text NOT NULL,
  message_type text NOT NULL CHECK (message_type = ANY (ARRAY['sms'::text, 'whatsapp'::text, 'email'::text])),
  message_content text NOT NULL,
  provider text NOT NULL DEFAULT 'twilio'::text,
  status text NOT NULL DEFAULT 'queued'::text,
  external_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  error_message text,
  sent_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_logs_pkey PRIMARY KEY (id),
  CONSTRAINT message_logs_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.maintenance_requests(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'::text,
  recipient_id uuid NOT NULL,
  sender_id uuid,
  entity_type text,
  entity_id uuid,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  sms_sent boolean DEFAULT false,
  whatsapp_sent boolean DEFAULT false,
  message_log_id uuid,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_message_log_id_fkey FOREIGN KEY (message_log_id) REFERENCES public.message_logs(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL,
  department_id uuid,
  reports_to uuid,
  position text,
  created_by uuid,
  updated_by uuid,
  is_deleted boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  plan_link text,
  photo_link text,
  iframe_key text,
  link_3d text,
  company_id uuid,
  full_name text DEFAULT COALESCE(((first_name || ' '::text) || last_name), name),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.project_phases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'delayed'::text, 'on_hold'::text])),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date date,
  end_date date,
  actual_start_date date,
  actual_end_date date,
  budget numeric,
  actual_cost numeric DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_phases_pkey PRIMARY KEY (id)
);
CREATE TABLE public.project_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT project_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT project_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.project_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  update_type text DEFAULT 'general'::text CHECK (update_type = ANY (ARRAY['general'::text, 'milestone'::text, 'issue'::text, 'progress'::text])),
  attachments ARRAY,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_updates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.project_views (
  id integer NOT NULL DEFAULT nextval('project_views_id_seq'::regclass),
  project_name text NOT NULL,
  slug text DEFAULT replace(lower(project_name), ' '::text, '-'::text),
  category text DEFAULT 'commercial'::text CHECK (category = ANY (ARRAY['commercial'::text, 'residential'::text, 'industrial'::text])),
  city text,
  country text DEFAULT 'مصر'::text,
  status text DEFAULT 'planned'::text CHECK (status = ANY (ARRAY['planned'::text, 'in_progress'::text, 'completed'::text])),
  display_status text DEFAULT 'published'::text,
  cover_image text,
  gallery jsonb,
  plan_link text,
  link_3d text,
  duration_label text,
  area_label text,
  company_name text,
  start_date date,
  end_date date,
  short_description text,
  full_description text,
  challenges text,
  solutions text,
  technical_specs jsonb,
  featured boolean DEFAULT false,
  order_priority integer DEFAULT 0,
  is_deleted boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT project_views_pkey PRIMARY KEY (id)
);
CREATE TABLE public.projects (
  id text NOT NULL,
  name text NOT NULL,
  location text,
  status text NOT NULL DEFAULT 'planning'::text CHECK (status = ANY (ARRAY['planning'::text, 'construction'::text, 'completed'::text])),
  project_type text,
  budget numeric,
  actual_cost numeric,
  start_date date,
  end_date date,
  actual_end_date date,
  magicplan_iframe_url text,
  gallery_url text,
  cover_image_url text,
  progress numeric,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  manager_id text,
  sketch_url text,
  latitude double precision,
  longitude double precision,
  description text,
  company_name text,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'maintenance'::text, 'inactive'::text, 'sold'::text])),
  address text NOT NULL,
  area numeric,
  value numeric,
  manager_id uuid,
  region_id uuid,
  floors integer,
  rooms integer,
  bathrooms integer,
  parking_spaces integer,
  description text,
  amenities ARRAY,
  maintenance_schedule text,
  last_inspection_date date,
  next_inspection_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  qr_code_data text,
  qr_code_generated_at timestamp with time zone,
  latitude double precision,
  longitude double precision,
  icon_url text,
  code text,
  city_id bigint,
  district_id bigint,
  images ARRAY,
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id),
  CONSTRAINT properties_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id)
);
CREATE TABLE public.quick_maintenance_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text,
  issue_description text NOT NULL,
  urgency_level text NOT NULL DEFAULT 'high'::text CHECK (urgency_level = ANY (ARRAY['high'::text, 'urgent'::text, 'emergency'::text])),
  location_details text,
  images ARRAY,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'converted'::text, 'cancelled'::text])),
  converted_to_request_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quick_maintenance_requests_pkey PRIMARY KEY (id),
  CONSTRAINT fk_quick_requests_converted FOREIGN KEY (converted_to_request_id) REFERENCES public.maintenance_requests(id),
  CONSTRAINT quick_maintenance_requests_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.regions (
  id uuid NOT NULL,
  name text NOT NULL,
  code text,
  parent_id uuid,
  level integer NOT NULL,
  coordinates jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT regions_pkey PRIMARY KEY (id),
  CONSTRAINT regions_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.regions(id)
);
CREATE TABLE public.request_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  approval_type text NOT NULL CHECK (approval_type = ANY (ARRAY['request'::text, 'materials'::text, 'completion'::text, 'billing'::text])),
  approver_id uuid NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  comments text,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT request_approvals_pkey PRIMARY KEY (id),
  CONSTRAINT request_approvals_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES auth.users(id)
);
CREATE TABLE public.request_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  file_path text NOT NULL,
  file_name text,
  mime_type text,
  size_bytes integer,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT request_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT request_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);
CREATE TABLE public.request_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  event_type text NOT NULL,
  from_stage text,
  to_stage text,
  by_user uuid,
  notes text,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  nonce text,
  CONSTRAINT request_events_pkey PRIMARY KEY (id),
  CONSTRAINT request_events_by_user_fkey FOREIGN KEY (by_user) REFERENCES auth.users(id)
);
CREATE TABLE public.request_lifecycle (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  status USER-DEFINED NOT NULL,
  update_type USER-DEFINED NOT NULL,
  updated_by uuid,
  update_notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT request_lifecycle_pkey PRIMARY KEY (id)
);
CREATE TABLE public.request_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  service_id text NOT NULL,
  description text,
  qty numeric NOT NULL DEFAULT 1,
  rate numeric NOT NULL DEFAULT 0,
  vat_rate numeric NOT NULL DEFAULT 0.14,
  amount numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT request_lines_pkey PRIMARY KEY (id)
);
CREATE TABLE public.request_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  reviewer_id uuid,
  reviewer_type text DEFAULT 'customer'::text,
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  service_quality integer CHECK (service_quality >= 1 AND service_quality <= 5),
  timeliness integer CHECK (timeliness >= 1 AND timeliness <= 5),
  professionalism integer CHECK (professionalism >= 1 AND professionalism <= 5),
  feedback_text text,
  photos ARRAY,
  would_recommend boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT request_reviews_pkey PRIMARY KEY (id)
);
CREATE TABLE public.request_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  from_status USER-DEFINED,
  to_status USER-DEFINED NOT NULL,
  changed_by uuid,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  note text,
  CONSTRAINT request_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT request_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  technician_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  request_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  images ARRAY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id)
);
CREATE TABLE public.service_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT service_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.service_checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  item text NOT NULL,
  required boolean DEFAULT false,
  evidence_type text CHECK (evidence_type = ANY (ARRAY['photo'::text, 'reading'::text, 'form'::text, 'video'::text])),
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT service_checklists_pkey PRIMARY KEY (id),
  CONSTRAINT service_checklists_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.service_icons (
  name text NOT NULL,
  svg_content text,
  CONSTRAINT service_icons_pkey PRIMARY KEY (name)
);
CREATE TABLE public.service_price_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  tier_name text NOT NULL,
  min_quantity numeric,
  max_quantity numeric,
  price numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT service_price_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT service_price_tiers_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.service_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL,
  branch_id uuid,
  vendor_id uuid,
  price numeric NOT NULL,
  vat_rate numeric,
  CONSTRAINT service_prices_pkey PRIMARY KEY (id),
  CONSTRAINT service_prices_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id)
);
CREATE TABLE public.service_subcategories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT service_subcategories_pkey PRIMARY KEY (id),
  CONSTRAINT service_subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subcategory_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  unit text,
  pricing_type text NOT NULL DEFAULT 'fixed'::text CHECK (pricing_type = ANY (ARRAY['fixed'::text, 'per_unit'::text, 'per_hour'::text, 'per_sqm'::text])),
  base_price numeric DEFAULT 0,
  min_qty numeric DEFAULT 1,
  max_qty numeric,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  icon_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category_id uuid,
  name text,
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sla_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  priority text NOT NULL,
  accept_within_min integer NOT NULL,
  arrive_within_min integer NOT NULL,
  complete_within_min integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sla_policies_pkey PRIMARY KEY (id),
  CONSTRAINT sla_policies_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.specialization_icons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  icon_path text NOT NULL,
  color text DEFAULT '#f5bf23'::text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  CONSTRAINT specialization_icons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.status_defs (
  status text NOT NULL,
  sort integer NOT NULL,
  label_ar text,
  label_en text,
  CONSTRAINT status_defs_pkey PRIMARY KEY (status)
);
CREATE TABLE public.status_transitions (
  from_status text NOT NULL,
  to_status text NOT NULL,
  roles_allowed ARRAY NOT NULL,
  CONSTRAINT status_transitions_pkey PRIMARY KEY (from_status, to_status)
);
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  location text,
  phone text,
  email USER-DEFINED,
  category text,
  status text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
  area numeric,
  opening_date timestamp without time zone,
  region_id uuid,
  created_by uuid,
  updated_by uuid,
  is_deleted boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  map_url text,
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subcategories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT subcategories_pkey PRIMARY KEY (id),
  CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.technician_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  specialization text NOT NULL,
  country text,
  city text,
  experience_years integer DEFAULT 0,
  center_id uuid,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'scheduled'::text, 'passed'::text, 'failed'::text, 'rejected'::text, 'cancelled'::text])),
  exam_date timestamp with time zone,
  examiner_name text,
  score numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT technician_applications_pkey PRIMARY KEY (id),
  CONSTRAINT technician_applications_center_id_fkey FOREIGN KEY (center_id) REFERENCES public.technician_centers(id)
);
CREATE TABLE public.technician_centers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  city text,
  address text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT technician_centers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.technician_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  technician_id uuid,
  doc_type text NOT NULL,
  file_url text NOT NULL,
  verified boolean DEFAULT false,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT technician_documents_pkey PRIMARY KEY (id),
  CONSTRAINT technician_documents_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id)
);
CREATE TABLE public.technician_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  technician_id uuid,
  step_name text NOT NULL,
  progress_value integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT technician_progress_pkey PRIMARY KEY (id),
  CONSTRAINT technician_progress_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id)
);
CREATE TABLE public.technician_regions (
  technician_id uuid NOT NULL,
  region_id uuid NOT NULL,
  CONSTRAINT technician_regions_pkey PRIMARY KEY (technician_id, region_id),
  CONSTRAINT technician_regions_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id),
  CONSTRAINT technician_regions_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id)
);
CREATE TABLE public.technician_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  technician_id uuid NOT NULL,
  customer_id uuid,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  service_request_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT technician_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT technician_reviews_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id),
  CONSTRAINT technician_reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES auth.users(id)
);
CREATE TABLE public.technician_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  technician_id uuid,
  task_name text NOT NULL,
  progress_value integer CHECK (progress_value >= 0 AND progress_value <= 100),
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  CONSTRAINT technician_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT technician_tasks_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id)
);
CREATE TABLE public.technicians (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  specialization text NOT NULL,
  profile_image text,
  rating numeric DEFAULT 0.00 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  total_reviews integer DEFAULT 0,
  status text DEFAULT 'offline'::text CHECK (status = ANY (ARRAY['online'::text, 'busy'::text, 'offline'::text, 'on_route'::text])),
  current_latitude numeric,
  current_longitude numeric,
  location_updated_at timestamp with time zone DEFAULT now(),
  hourly_rate numeric,
  available_from time without time zone,
  available_to time without time zone,
  bio text,
  certifications jsonb DEFAULT '[]'::jsonb,
  service_area_radius numeric DEFAULT 10,
  company_id uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  application_id uuid,
  code text UNIQUE,
  level text NOT NULL DEFAULT 'certified'::text CHECK (level = ANY (ARRAY['certified'::text, 'senior'::text, 'expert'::text, 'supervisor'::text])),
  verification_center_id uuid,
  verified_at timestamp with time zone,
  verification_notes text,
  icon_url text,
  country_code text,
  city_id bigint,
  district_id bigint,
  CONSTRAINT technicians_pkey PRIMARY KEY (id),
  CONSTRAINT technicians_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.technician_applications(id),
  CONSTRAINT technicians_verification_center_id_fkey FOREIGN KEY (verification_center_id) REFERENCES public.technician_centers(id),
  CONSTRAINT technicians_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id),
  CONSTRAINT technicians_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id),
  CONSTRAINT technicians_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.units (
  code text NOT NULL,
  name_ar text NOT NULL,
  name_en text,
  CONSTRAINT units_pkey PRIMARY KEY (code)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  monthly_budget numeric,
  timezone text DEFAULT 'Africa/Cairo'::text,
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id)
);
CREATE TABLE public.vendor_location_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vendor_location_history_pkey PRIMARY KEY (id),
  CONSTRAINT vendor_location_history_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id)
);
CREATE TABLE public.vendor_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vendor_locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_name text,
  specialization ARRAY DEFAULT '{}'::text[],
  phone text,
  email text,
  address text,
  rating numeric DEFAULT 0,
  total_jobs integer DEFAULT 0,
  status text DEFAULT 'active'::text,
  profile_image text,
  experience_years integer DEFAULT 0,
  unit_rate numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  current_latitude double precision,
  current_longitude double precision,
  location_updated_at timestamp with time zone,
  is_tracking_enabled boolean DEFAULT false,
  map_icon text,
  CONSTRAINT vendors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.whatsapp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_sid text NOT NULL UNIQUE,
  sender_id uuid,
  recipient_phone text NOT NULL,
  message_body text NOT NULL,
  status text NOT NULL DEFAULT 'queued'::text,
  request_id uuid,
  media_url text,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  error_code text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id),
  CONSTRAINT whatsapp_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id),
  CONSTRAINT whatsapp_messages_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.maintenance_requests(id)
);
CREATE TABLE public.work_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  task_name text NOT NULL,
  description text,
  status text DEFAULT 'pending'::text,
  assigned_to uuid,
  estimated_duration integer,
  actual_duration integer,
  materials_needed ARRAY,
  completed_at timestamp with time zone,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT work_tasks_pkey PRIMARY KEY (id)
);
