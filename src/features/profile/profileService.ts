import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/domain";

export interface OnboardingInput {
  full_name: string;
  organization: string | null;
  phone: string | null;
  nec_number: string | null;
  nec_obtained_year: number | null;
}

/**
 * Persists onboarding data.
 * Verification status transitions are intentionally conservative:
 * providing NEC details moves a guest to `verification_pending`; an administrator
 * grants the `registered_valuator` role after review. Admin accounts are untouched.
 */
export async function completeOnboarding(userId: string, input: OnboardingInput): Promise<Profile> {
  const { data: current, error: readError } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", userId)
    .maybeSingle();
  if (readError) throw readError;

  const currentStatus = current?.verification_status ?? "guest";
  const hasNec = Boolean(input.nec_number);
  const nextStatus =
    currentStatus === "admin" || currentStatus === "verified_valuator"
      ? currentStatus
      : hasNec
        ? "verification_pending"
        : "guest";

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...input,
      verification_status: nextStatus,
      onboarding_completed: true,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  input: Partial<Pick<Profile, "full_name" | "organization" | "phone" | "avatar_url">>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}
