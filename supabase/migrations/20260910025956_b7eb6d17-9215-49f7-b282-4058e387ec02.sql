-- Enums
CREATE TYPE public.app_role AS ENUM ('guest', 'registered_valuator', 'admin');
CREATE TYPE public.verification_status AS ENUM ('guest', 'verification_pending', 'verified_valuator', 'admin');
CREATE TYPE public.record_status AS ENUM ('draft', 'submitted', 'approved', 'archived');
CREATE TYPE public.record_visibility AS ENUM ('private', 'universal');

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  organization TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'guest',
  nec_number TEXT,
  nec_obtained_year INTEGER,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  verification_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_valuator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'registered_valuator') OR public.has_role(auth.uid(), 'admin');
$$;

-- Profile policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Limited public profile view (never exposes NEC data)
CREATE VIEW public.public_profiles
WITH (security_invoker = off) AS
  SELECT id, full_name, avatar_url, organization, verification_status, created_at
  FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Role policies
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "user_roles_admin_write" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- New user bootstrap: profile + role, founding admins recognised server-side
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails TEXT[] := ARRAY[
    'vms.app.nepal@gmail.com',
    'neokern.np@gmail.com',
    'kiran@modernedge.com.np'
  ];
  is_founding_admin BOOLEAN := lower(NEW.email) = ANY (admin_emails);
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, verification_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
    CASE WHEN is_founding_admin THEN 'admin'::public.verification_status ELSE 'guest'::public.verification_status END
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN is_founding_admin THEN 'admin'::public.app_role ELSE 'guest'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- VALUATION RECORDS
CREATE TABLE public.valuation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reference_code TEXT,
  status public.record_status NOT NULL DEFAULT 'draft',
  visibility public.record_visibility NOT NULL DEFAULT 'private',
  province TEXT,
  district TEXT,
  municipality TEXT,
  ward TEXT,
  locality TEXT,
  plot_number TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geometry JSONB,
  land_area_sq_m NUMERIC(14, 4),
  estimated_value NUMERIC(16, 2),
  currency TEXT NOT NULL DEFAULT 'NPR',
  valuation_date DATE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX valuation_records_created_by_idx ON public.valuation_records (created_by);
CREATE INDEX valuation_records_visibility_idx ON public.valuation_records (visibility);
CREATE INDEX valuation_records_coords_idx ON public.valuation_records (latitude, longitude);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.valuation_records TO authenticated;
GRANT SELECT ON public.valuation_records TO anon;
GRANT ALL ON public.valuation_records TO service_role;
ALTER TABLE public.valuation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "records_public_read" ON public.valuation_records
  FOR SELECT TO anon, authenticated USING (visibility = 'universal');
CREATE POLICY "records_owner_read" ON public.valuation_records
  FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "records_valuator_insert" ON public.valuation_records
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND public.is_valuator());
CREATE POLICY "records_owner_update" ON public.valuation_records
  FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "records_owner_delete" ON public.valuation_records
  FOR DELETE TO authenticated USING (created_by = auth.uid() OR public.is_admin());

CREATE TRIGGER valuation_records_set_updated_at
  BEFORE UPDATE ON public.valuation_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- GOVERNMENT RATES
CREATE TABLE public.government_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province TEXT,
  district TEXT NOT NULL,
  municipality TEXT,
  ward TEXT,
  area_name TEXT,
  land_category TEXT,
  rate_per_sq_m NUMERIC(16, 2),
  rate_unit TEXT NOT NULL DEFAULT 'NPR_PER_SQ_M',
  fiscal_year TEXT NOT NULL,
  source TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX government_rates_lookup_idx ON public.government_rates (district, municipality, fiscal_year);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.government_rates TO authenticated;
GRANT SELECT ON public.government_rates TO anon;
GRANT ALL ON public.government_rates TO service_role;
ALTER TABLE public.government_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rates_public_read" ON public.government_rates
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "rates_admin_write" ON public.government_rates
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER government_rates_set_updated_at
  BEFORE UPDATE ON public.government_rates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_table TEXT NOT NULL,
  entity_id UUID,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_entity_idx ON public.audit_logs (entity_table, entity_id);
CREATE INDEX audit_logs_actor_idx ON public.audit_logs (actor_id);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());

-- Generic audit trigger, reusable by future phases
CREATE OR REPLACE FUNCTION public.record_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity_table, entity_id, previous_value, new_value)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER valuation_records_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.valuation_records
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event();

CREATE TRIGGER government_rates_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.government_rates
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event();