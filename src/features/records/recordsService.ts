import { supabase } from "@/integrations/supabase/client";
import type { AuditLogEntry, ValuationRecord } from "@/types/domain";

const RECORD_COLUMNS =
  "id, created_by, title, reference_code, status, visibility, province, district, municipality, ward, locality, plot_number, property_type, road_category, latitude, longitude, geometry, land_area_sq_m, area_source, market_rate_per_sq_m, estimated_value, currency, valuation_date, notes, deleted_at, deleted_by, created_at, updated_at";

export type RecordScope = "all" | "mine" | "universal" | "deleted";

export interface RecordFilters {
  search?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  propertyType?: string;
  roadCategory?: string;
  dateFrom?: string;
  dateTo?: string;
  rateMin?: number;
  rateMax?: number;
}

export interface RecordInput {
  title: string;
  reference_code?: string | null;
  district?: string | null;
  municipality?: string | null;
  ward?: string | null;
  locality?: string | null;
  plot_number?: string | null;
  property_type?: string | null;
  road_category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geometry?: unknown;
  land_area_sq_m?: number | null;
  area_source?: string;
  market_rate_per_sq_m?: number | null;
  estimated_value?: number | null;
  valuation_date?: string | null;
  status?: string;
  visibility?: string;
  notes?: string | null;
}

function applyFilters<T>(query: T, filters: RecordFilters): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query as any;
  if (filters.search) {
    const term = `%${filters.search}%`;
    q = q.or(
      `title.ilike.${term},reference_code.ilike.${term},locality.ilike.${term},plot_number.ilike.${term},district.ilike.${term}`,
    );
  }
  if (filters.district) q = q.eq("district", filters.district);
  if (filters.municipality) q = q.ilike("municipality", `%${filters.municipality}%`);
  if (filters.ward) q = q.eq("ward", filters.ward);
  if (filters.propertyType) q = q.eq("property_type", filters.propertyType);
  if (filters.roadCategory) q = q.eq("road_category", filters.roadCategory);
  if (filters.dateFrom) q = q.gte("created_at", filters.dateFrom);
  if (filters.dateTo) q = q.lte("created_at", `${filters.dateTo}T23:59:59`);
  if (typeof filters.rateMin === "number") q = q.gte("market_rate_per_sq_m", filters.rateMin);
  if (typeof filters.rateMax === "number") q = q.lte("market_rate_per_sq_m", filters.rateMax);
  return q as T;
}

function applyScope<T>(query: T, scope: RecordScope, userId?: string): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query as any;
  if (scope === "deleted") return q.not("deleted_at", "is", null) as T;
  q = q.is("deleted_at", null);
  if (scope === "universal") q = q.eq("visibility", "universal");
  if (scope === "mine" && userId) q = q.eq("created_by", userId);
  return q as T;
}

/**
 * Reads valuation records. Row-level security decides what is actually returned:
 * everyone sees universal records, owners see their own, administrators see everything.
 */
export async function listRecords(
  scope: RecordScope,
  userId?: string,
  filters: RecordFilters = {},
): Promise<ValuationRecord[]> {
  let query = supabase
    .from("valuation_records")
    .select(RECORD_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(500);
  query = applyScope(query, scope, userId);
  query = applyFilters(query, filters);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ValuationRecord[];
}

export async function countRecords(
  scope: RecordScope,
  userId?: string,
  filters: RecordFilters = {},
): Promise<number> {
  let query = supabase.from("valuation_records").select("id", { count: "exact", head: true });
  query = applyScope(query, scope, userId);
  query = applyFilters(query, filters);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getRecord(id: string): Promise<ValuationRecord | null> {
  const { data, error } = await supabase
    .from("valuation_records")
    .select(RECORD_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ValuationRecord) ?? null;
}

export async function createRecord(input: RecordInput, userId: string): Promise<ValuationRecord> {
  const { data, error } = await supabase
    .from("valuation_records")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ ...(input as any), created_by: userId })
    .select(RECORD_COLUMNS)
    .single();
  if (error) throw error;
  return data as unknown as ValuationRecord;
}

export async function updateRecord(id: string, input: Partial<RecordInput>): Promise<ValuationRecord> {
  const { data, error } = await supabase
    .from("valuation_records")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(input as any)
    .eq("id", id)
    .select(RECORD_COLUMNS)
    .single();
  if (error) throw error;
  return data as unknown as ValuationRecord;
}

/** Soft delete — the row stays in the database and remains recoverable by admins. */
export async function softDeleteRecord(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("valuation_records")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ deleted_at: new Date().toISOString(), deleted_by: userId, status: "archived" } as any)
    .eq("id", id);
  if (error) throw error;
}

export async function restoreRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from("valuation_records")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ deleted_at: null, deleted_by: null } as any)
    .eq("id", id);
  if (error) throw error;
}

export async function listDistricts(): Promise<string[]> {
  const { data, error } = await supabase
    .from("valuation_records")
    .select("district")
    .not("district", "is", null)
    .limit(1000);
  if (error) throw error;
  const set = new Set((data ?? []).map((row) => (row as { district: string }).district));
  return [...set].sort();
}

export async function listRecordAudit(recordId: string): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity_table", "valuation_records")
    .eq("entity_id", recordId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as AuditLogEntry[];
}

export async function getCreatorName(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("public_profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  return (data as { full_name: string | null } | null)?.full_name ?? null;
}

export async function countGovernmentRates(): Promise<number> {
  const { count, error } = await supabase
    .from("government_rates")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
