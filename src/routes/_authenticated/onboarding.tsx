import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { completeOnboarding } from "@/features/profile/profileService";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [necNumber, setNecNumber] = useState("");
  const [necYear, setNecYear] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setOrganization(profile.organization ?? "");
    setPhone(profile.phone ?? "");
    setNecNumber(profile.nec_number ?? "");
    setNecYear(profile.nec_obtained_year ? String(profile.nec_obtained_year) : "");
  }, [profile]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await completeOnboarding(user.id, {
        full_name: fullName.trim(),
        organization: organization.trim() || null,
        phone: phone.trim() || null,
        nec_number: necNumber.trim() || null,
        nec_obtained_year: necYear ? Number(necYear) : null,
      });
      await refreshProfile();
      toast.success(
        necNumber.trim()
          ? "Profile saved. Your NEC details are queued for administrator review."
          : "Profile saved. You have guest access until NEC details are provided.",
      );
      void navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Onboarding"
        title="Complete your profile"
        description="Tell us who you are. Provide your Nepal Engineering Council registration if you want valuator access — an administrator will review it."
      />
      <Card className="animate-rise">
        <CardContent className="p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                className="h-11"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization (optional)</Label>
                <Input
                  id="organization"
                  className="h-11"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  className="h-11"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
              <p className="text-sm font-medium">Valuator verification (optional)</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Your NEC number is private. It is visible only to you and VMS administrators, and is
                never shown to other users.
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nec">NEC number</Label>
                  <Input
                    id="nec"
                    className="h-11 font-mono"
                    value={necNumber}
                    onChange={(event) => setNecNumber(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="necYear">NEC obtained year</Label>
                  <Input
                    id="necYear"
                    className="h-11 font-mono"
                    value={necYear}
                    onChange={(event) => setNecYear(event.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="2018"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="h-11 w-full sm:w-auto" disabled={busy}>
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save and continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
