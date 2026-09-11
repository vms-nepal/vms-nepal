import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileStack, Globe2, Landmark, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/AuthProvider";
import { countGovernmentRates, countRecords } from "@/features/records/recordsService";
import { VERIFICATION_LABELS } from "@/types/domain";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function MetricCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number | undefined;
  icon: typeof FileStack;
  loading: boolean;
}) {
  return (
    <Card className="animate-rise">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-eyebrow">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-14" />
          ) : (
            <p className="numeric text-3xl font-semibold tracking-tight">{value ?? 0}</p>
          )}
        </div>
        <div className="grid size-9 place-items-center rounded-md bg-primary-soft text-accent-foreground">
          <Icon className="size-[18px]" strokeWidth={1.8} />
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { profile, user, isValuator, isAdmin } = useAuth();

  const metrics = useQuery({
    queryKey: ["dashboard-metrics", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const [mine, universal, rates] = await Promise.all([
        countRecords("mine", user!.id),
        countRecords("universal"),
        countGovernmentRates(),
      ]);
      return { mine, universal, rates };
    },
  });

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        description="Your valuation workspace. Records, maps, conversions and rates in one place."
        actions={
          <Button asChild variant="outline">
            <Link to="/records">Open records</Link>
          </Button>
        }
      />

      {profile && profile.verification_status === "verification_pending" ? (
        <Card className="animate-rise border-warning/40 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Verification under review</p>
              <p className="text-sm text-muted-foreground">
                An administrator is reviewing your NEC credentials. You can browse universal records
                in the meantime; record creation unlocks once you are verified.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="My records"
          value={metrics.data?.mine}
          icon={FileStack}
          loading={metrics.isLoading}
        />
        <MetricCard
          label="Universal records"
          value={metrics.data?.universal}
          icon={Globe2}
          loading={metrics.isLoading}
        />
        <MetricCard
          label="Government rates"
          value={metrics.data?.rates}
          icon={Landmark}
          loading={metrics.isLoading}
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">Account status</h3>
            {profile ? (
              <Badge variant={isAdmin ? "default" : "secondary"} className="font-normal">
                {VERIFICATION_LABELS[profile.verification_status]}
              </Badge>
            ) : null}
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {isAdmin
              ? "You have administrator access: full visibility of records, rates, verification requests and audit history."
              : isValuator
                ? "You are a verified valuator. You can create records and map pins, and edit the records you created."
                : "Guest access: you can view universal records. Provide your NEC details in settings to request valuator verification."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
