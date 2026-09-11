import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileStack, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/AuthProvider";
import { listRecords } from "@/features/records/recordsService";
import type { RecordScope } from "@/features/records/recordsService";

export const Route = createFileRoute("/_authenticated/records")({
  component: Records,
});

function Records() {
  const { user, isValuator } = useAuth();
  const [scope, setScope] = useState<RecordScope>("all");

  const records = useQuery({
    queryKey: ["records", scope, user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => listRecords(scope, user!.id),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Valuation records"
        description="Records you created, plus universal records shared across the platform. Access is enforced by the database, not the interface."
        actions={
          <Button disabled={!isValuator} title={isValuator ? undefined : "Verified valuators only"}>
            <Plus className="mr-1 size-4" /> New record
          </Button>
        }
      />

      <Tabs value={scope} onValueChange={(value) => setScope(value as RecordScope)}>
        <TabsList>
          <TabsTrigger value="all">All visible</TabsTrigger>
          <TabsTrigger value="mine">Mine</TabsTrigger>
          <TabsTrigger value="universal">Universal</TabsTrigger>
        </TabsList>
      </Tabs>

      {records.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-20 w-full" />
          ))}
        </div>
      ) : records.data && records.data.length > 0 ? (
        <div className="space-y-3">
          {records.data.map((record) => (
            <Card key={record.id} className="animate-rise">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-semibold">{record.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[record.district, record.municipality, record.ward && `Ward ${record.ward}`]
                      .filter(Boolean)
                      .join(" · ") || "Location not set"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-normal capitalize">
                    {record.status}
                  </Badge>
                  <Badge
                    variant={record.visibility === "universal" ? "default" : "outline"}
                    className="font-normal capitalize"
                  >
                    {record.visibility}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="grid size-11 place-items-center rounded-md bg-primary-soft text-accent-foreground">
              <FileStack className="size-5" strokeWidth={1.8} />
            </div>
            <p className="text-sm font-semibold">No records yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              {isValuator
                ? "The full record form arrives in the next phase. Records you create will be listed here."
                : "Verified valuators can create records. Universal records shared with everyone will appear here."}
            </p>
          </CardContent>
        </Card>
      )}

      {isValuator ? (
        <Button
          size="icon"
          className="fixed bottom-6 right-5 z-30 size-14 rounded-full shadow-elevated lg:hidden"
          aria-label="New record"
        >
          <Plus className="size-6" />
        </Button>
      ) : null}
    </div>
  );
}
