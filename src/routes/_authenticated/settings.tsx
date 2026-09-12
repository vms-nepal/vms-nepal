import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { completeOnboarding } from "@/features/profile/profileService";
import { ROLE_LABELS, VERIFICATION_LABELS } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, user, roles, refreshProfile } = useAuth();
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

  async function handleSave(event: React.FormEvent) {
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
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save changes");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your profile, verification state and access level."
      />

      <Card className="animate-rise">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">Access</h3>
            {profile ? (
              <Badge variant="secondary" className="font-normal">
                {VERIFICATION_LABELS[profile.verification_status]}
              </Badge>
            ) : null}
            {roles.map((role) => (
              <Badge key={role} variant="outline" className="font-normal">
                {ROLE_LABELS[role]}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>. Roles
            and permissions are enforced in the database, so they cannot be changed from this
            device.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <form className="space-y-5" onSubmit={handleSave}>
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
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  className="h-11"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
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
              <p className="text-sm font-medium">NEC credentials (private)</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Visible only to you and administrators. Adding or changing these details sends your
                account for verification review.
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
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="h-11 w-full sm:w-auto" disabled={busy}>
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
