ALTER TABLE public.valuation_records
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS road_category text,
  ADD COLUMN IF NOT EXISTS market_rate_per_sq_m numeric,
  ADD COLUMN IF NOT EXISTS area_source text NOT NULL DEFAULT 'map_gis',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS valuation_records_district_idx ON public.valuation_records (district);
CREATE INDEX IF NOT EXISTS valuation_records_created_by_idx ON public.valuation_records (created_by);
CREATE INDEX IF NOT EXISTS valuation_records_deleted_at_idx ON public.valuation_records (deleted_at);
CREATE INDEX IF NOT EXISTS valuation_records_created_at_idx ON public.valuation_records (created_at DESC);

DROP POLICY IF EXISTS records_owner_read ON public.valuation_records;
DROP POLICY IF EXISTS records_public_read ON public.valuation_records;

CREATE POLICY records_owner_read ON public.valuation_records
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR (deleted_at IS NULL AND created_by = auth.uid())
  );

CREATE POLICY records_public_read ON public.valuation_records
  FOR SELECT TO anon, authenticated
  USING (visibility = 'universal' AND deleted_at IS NULL);