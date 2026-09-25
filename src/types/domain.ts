/**
 * Domain types shared across the application.
 * These mirror the database schema and are the single source of truth for the UI.
 */

export type AppRole = "guest" | "registered_valuator" | "admin";

export type VerificationStatus =
  | "guest"
  | "verification_pending"
  | "verified_valuator"
  | "admin";

export type RecordStatus = "draft" | "submitted" | "approved" | "archived";
export type RecordVisibility = "private" | "universal";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  organization: string | null;
  verification_status: VerificationStatus;
  nec_number: string | null;
  nec_obtained_year: number | null;
  onboarding_completed: boolean;
  verification_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValuationRecord {
  id: string;
  created_by: string;
  title: string;
  reference_code: string | null;
  status: RecordStatus;
  visibility: RecordVisibility;
  province: string | null;
  district: string | null;
  municipality: string | null;
  ward: string | null;
  locality: string | null;
  plot_number: string | null;
  property_type: string | null;
  road_category: string | null;
  latitude: number | null;
  longitude: number | null;
  geometry: unknown;
  land_area_sq_m: number | null;
  area_source: string;
  market_rate_per_sq_m: number | null;
  estimated_value: number | null;
  currency: string;
  valuation_date: string | null;
  notes: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GovernmentRate {
  id: string;
  province: string | null;
  district: string;
  municipality: string | null;
  ward: string | null;
  area_name: string | null;
  land_category: string | null;
  rate_per_sq_m: number | null;
  rate_unit: string;
  fiscal_year: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  entity_table: string;
  entity_id: string | null;
  previous_value: unknown;
  new_value: unknown;
  created_at: string;
}

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  guest: "Guest",
  verification_pending: "Verification pending",
  verified_valuator: "Verified valuator",
  admin: "Administrator",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  guest: "Guest",
  registered_valuator: "Registered valuator",
  admin: "Administrator",
};
