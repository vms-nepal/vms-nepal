import { useDeferredValue, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileStack, Map as MapIcon, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/AuthProvider";
import { RecordFilterBar } from "@/features/records/RecordFilterBar";
import { RecordFormDialog } from "@/features/records/RecordFormDialog";
import { RecordList } from "@/features/records/RecordList";
import { countRecords, listDistricts, listRecords } from "@/features/records/recordsService";
import type { RecordFilters, RecordScope } from "@/features/records/recordsService";

export const Route = createFileRoute("/_authenticated/records/")({
  head: () => ({
    meta: [
      { title: "Records — VMS" },
      { name: "description", content: "Universal and personal valuation records." },
    ],
  }),
  component: RecordsPage,
});

function RecordsPage() {
  const { user, isValuator, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scope, setScope] = useState<RecordScope>("universal");
  const [filters, setFilters] = useState<RecordFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const deferredFilters = useDeferredValue(filters);
  const userId = user?.id;

  const universalCount = useQuery({
    queryKey: ["records", "count", "universal"],
    enabled: Boolean(userId),
    queryFn: () => countRecords("universal"),
  });
  const mineCount = useQuery({
    queryKey: ["records", "count", "mine", userId],
    enabled: Boolean(userId),
    queryFn: () => countRecords("mine", userId),
  });
  const deletedCount = useQuery({
    queryKey: ["records", "count", "deleted"],
    enabled: Boolean(userId) && isAdmin,
    queryFn: () => countRecords("deleted"),
  });
  const districts = useQuery({
    queryKey: ["records", "districts"],
    enabled: Boolean(userId),
    queryFn: listDistricts,
  });
  const records = useQuery({
    queryKey: ["records", "list", scope, userId, deferredFilters],
    enabled: Boolean(userId),
    queryFn: () => listRecords(scope, userId, deferredFilters),
  });

  const fmt = (n: number | undefined) => (n == null ? "…" : n.toLocaleString());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Valuation records"
        description="Universal records shared across the platform and records you created. Access is enforced by the database."
        actions={
          isValuator ? (
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" asChild>
                <Link to="/map">
                  <MapIcon className="mr-1 size-4" /> Pin on map
                </Link>
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1 size-4" /> New record
              </Button>
            </div>
          ) : null
        }
      />

      <Tabs value={scope} onValueChange={(value) => setScope(value as RecordScope)}>
        <TabsList className="h-auto w-full justify-start gap-1 p-1 sm:w-auto">
          <TabsTrigger value="universal" className="flex-1 gap-2 px-4 py-2 sm:flex-none">
            Universal Records
            <span className="font-mono text-xs text-muted-foreground">{fmt(universalCount.data)}</span>
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex-1 gap-2 px-4 py-2 sm:flex-none">
            My Records
            <span className="font-mono text-xs text-muted-foreground">{fmt(mineCount.data)}</span>
          </TabsTrigger>
          {isAdmin ? (
            <TabsTrigger value="deleted" className="flex-1 gap-2 px-4 py-2 sm:flex-none">
              Deleted
              <span className="font-mono text-xs text-muted-foreground">{fmt(deletedCount.data)}</span>
            </TabsTrigger>
          ) : null}
        </TabsList>
      </Tabs>

      <RecordFilterBar filters={filters} onChange={setFilters} districts={districts.data ?? []} />

      {records.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-16 w-full" />
          ))}
        </div>
      ) : records.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            Records could not be loaded. {(records.error as Error).message}
          </CardContent>
        </Card>
      ) : records.data && records.data.length > 0 ? (
        <RecordList records={records.data} currentUserId={userId} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="grid size-11 place-items-center rounded-md bg-primary-soft text-accent-foreground">
              <FileStack className="size-5" strokeWidth={1.8} />
            </div>
            <p className="text-sm font-semibold">No records found</p>
            <p className="max-w-md text-sm text-muted-foreground">
              {isValuator
                ? "Drop a pin on the map or create a record to get started."
                : "Universal records shared by verified valuators will appear here."}
            </p>
          </CardContent>
        </Card>
      )}

      {isValuator ? (
        <Button
          size="icon"
          className="fixed bottom-6 right-5 z-30 size-14 rounded-full shadow-elevated sm:hidden"
          aria-label="New record"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-6" />
        </Button>
      ) : null}

      <RecordFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={(saved) =>
          void navigate({ to: "/records/$recordId", params: { recordId: saved.id } })
        }
      />
    </div>
  );
}
