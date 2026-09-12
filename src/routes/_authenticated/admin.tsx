import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, ShieldX } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PhasePlaceholder } from "@/components/layout/PhasePlaceholder";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/AuthProvider";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminConsole,
});

function AdminConsole() {
  const { isAdmin, profileLoading } = useAuth();

  if (profileLoading) return null;

  if (!isAdmin) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <ShieldX className="size-6 text-destructive" />
          <p className="text-sm font-semibold">Administrator access required</p>
          <p className="max-w-md text-sm text-muted-foreground">
            This area is restricted. Database rules also block administrator data for non-admin
            accounts, so nothing sensitive is exposed here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Admin Console"
        description="Verification review, user roles, rate management and audit history."
      />
      <PhasePlaceholder
        icon={ShieldCheck}
        title="Administrator tools"
        description="Roles, verification states and the audit trail already exist in the database. The management interface arrives in a later phase."
        points={[
          "Approve or reject valuator verification",
          "Grant and revoke roles",
          "Manage government rates",
          "Review the full audit trail",
        ]}
      />
    </div>
  );
}
