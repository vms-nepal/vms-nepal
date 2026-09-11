import { supabase } from "@/integrations/supabase/client";
import type { ValuationRecord } from "@/types/domain";

const RECORD_COLUMNS =
  "id, created_by, title, reference_code, status, visibility, province, district, municipality, ward, locality, plot_number, latitude, longitude, land_area_sq_m, estimated_value, currency, valuation_date, created_at, updated_at";

export type RecordScope = "all" | "mine" | "universal";

/**
 * Reads valuation records. Row-level security decides what is actually returned:
 * everyone sees universal records, owners see their own, administrators see everything.
 */
export async function listRecords(scope: RecordScope, userId?: string): Promise<ValuationRecord[]> {
  let query = supabase
    .from("valuation_records")
    .select(RECORD_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (scope === "universal") query = query.eq("visibility", "universal");
  if (scope === "mine" && userId) query = query.eq("created_by", userId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ValuationRecord[];
}

export async function countRecords(scope: RecordScope, userId?: string): Promise<number> {
  let query = supabase
    .from("valuation_records")
    .select("id", { count: "exact", head: true });
  if (scope === "universal") query = query.eq("visibility", "universal");
  if (scope === "mine" && userId) query = query.eq("created_by", userId);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function countGovernmentRates(): Promise<number> {
  const { count, error } = await supabase
    .from("government_rates")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
