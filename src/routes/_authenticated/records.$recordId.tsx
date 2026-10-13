import { lazy, Suspense, useState } from "react";
import { ClientOnly, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, History, Pencil, RotateCcw, Trash2, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/AuthProvider";
import { AREA_SOURCES } from "@/features/records/constants";
import type { AreaSource } from "@/features/records/constants";
import { formatDate, formatLocation, formatNpr, formatSqM, shortId } from "@/features/records/format";
import { RecordFormDialog } from "@/features/records/RecordFormDialog";
import {
  getCreatorName,
  getRecord,
  listRecordAudit,
  restoreRecord,
  softDeleteRecord,
} from "@/features/records/recordsService";

const MiniMap = lazy(() => import("@/features/map/MiniMap"));

export const Route = createFileRoute("/_authenticated/records/$recordId")({
  head: () => ({ meta: [{ title: "Record detail — VMS" }] }),
  component: RecordDetail,
});

function RecordDetail() {
  const { recordId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const record = useQuery({
    queryKey: ["record", recordId],
    enabled: Boolean(user),
    queryFn: () => getRecord(recordId),
  });
  const data = record.data;
  const mine = data?.created_by === user?.id;
  const canEdit = Boolean(data) && (mine || isAdmin);

  const creator = useQuery({
    queryKey: ["creator", data?.created_by],
    enabled: Boolean(data) && !mine,
    queryFn: () => getCreatorName(data!.created_by),
  });
  const audit = useQuery({
    queryKey: ["record-audit", recordId],
    enabled: isAdmin,
    queryFn: () => listRecordAudit(recordId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["records"] });
    void queryClient.invalidateQueries({ queryKey: ["record", recordId] });
    void queryClient.invalidateQueries({ queryKey: ["record-audit", recordId] });
    void queryClient.invalidateQueries({ queryKey: ["map-records"] });
  };

  const remove = useMutation({
    mutationFn: () => softDeleteRecord(recordId, user!.id),
    onSuccess: () => {
      invalidate();
      toast.success("Record deleted");
      if (!isAdmin) void navigate({ to: "/records" });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const restore = useMutation({
    mutationFn: () => restoreRecord(recordId),
    onSuccess: () => {
      invalidate();
      toast.success("Record restored");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (record.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8 text-center">
          <p className="text-sm font-semibold">Record not available</p>
          <p className="text-sm text-muted-foreground">
            It does not exist, was deleted, or you do not have permission to view it.
          </p>
          <Button variant="outline" asChild>
            <Link to="/records">Back to records</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasCoords = data.latitude != null && data.longitude != null;
  const areaSource = AREA_SOURCES[data.area_source as AreaSource] ?? data.area_source;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Link
            to="/records"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Records
          </Link>
          <p className="font-mono text-xs text-primary">REC-{shortId(data.id)}</p>
          <h2 className="text-2xl font-semibold tracking-tight">{data.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-normal capitalize">
              {data.status}
            </Badge>
            <Badge
              variant={data.visibility === "universal" ? "default" : "outline"}
              className="font-normal capitalize"
            >
              {data.visibility}
            </Badge>
            {data.deleted_at ? (
              <Badge variant="destructive" className="font-normal">
                Deleted {formatDate(data.deleted_at)}
              </Badge>
            ) : null}
          </div>
        </div>

        {canEdit ? (
          <div className="flex shrink-0 gap-2">
            {data.deleted_at ? (
              isAdmin ? (
                <Button onClick={() => restore.mutate()} disabled={restore.isPending}>
                  <RotateCcw className="mr-1 size-4" /> Restore
                </Button>
              ) : null
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-1 size-4" /> Edit
                </Button>
                <Button variant="outline" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="mr-1 size-4" /> Delete
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div
        className={
          mine
            ? "flex items-center gap-3 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm"
            : "flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
        }
      >
        {mine ? (
          <UserCheck className="size-4 text-primary" />
        ) : (
          <Users className="size-4 text-muted-foreground" />
        )}
        <span>
          {mine ? (
            <strong className="font-semibold">Created by you</strong>
          ) : (
            <>
              <strong className="font-semibold">
                Created by {creator.data ?? "another valuator"}
              </strong>
              {isAdmin ? " · you can edit as administrator" : " · read-only"}
            </>
          )}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden">
          <div className="h-72 bg-muted sm:h-80">
            {hasCoords ? (
              <ClientOnly fallback={<Skeleton className="h-full w-full rounded-none" />}>
                <Suspense fallback={<Skeleton className="h-full w-full rounded-none" />}>
                  <MiniMap lat={data.latitude!} lng={data.longitude!} />
                </Suspense>
              </ClientOnly>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                No map location recorded
              </div>
            )}
          </div>
          <CardContent className="grid grid-cols-2 gap-4 p-4 text-sm">
            <Info label="Latitude" mono value={data.latitude?.toFixed(6) ?? "—"} />
            <Info label="Longitude" mono value={data.longitude?.toFixed(6) ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap x-4 gap-y-4 text-sm">
            <Info label="Record ID" mono value={data.id} wide />
            <Info label="Location" value={formatLocation(data)} wide />
            <Info label="Plot number" value={data.plot_number ?? "—"} />
            <Info label="Reference" value={data.reference_code ?? "—"} />
            <Info label="Property type" value={data.property_type ?? "—"} />
            <Info label="Road category" value={data.road_category ?? "—"} />
            <Info label="Land area" mono value={formatSqM(data.land_area_sq_m)} />
            <Info label="Area source" value={data.land_area_sq_m != null ? areaSource : "—"} />
            <Info label="Market rate / m²" mono value={formatNpr(data.market_rate_per_sq_m)} />
            <Info label="Estimated value" mono value={formatNpr(data.estimated_value)} />
            <Info label="Valuation date" value={formatDate(data.valuation_date)} />
            <Info label="Created" value={formatDate(data.created_at)} />
            <Info label="Last updated" value={formatDate(data.updated_at)} />
            {data.notes ? <Info label="Notes" value={data.notes} wide /> : null}
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <History className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Audit history</CardTitle>
          </CardHeader>
          <CardContent>
            {audit.data && audit.data.length > 0 ? (
              <ol className="space-y-2 text-sm">
                {audit.data.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0"
                  >
                    <span className="font-mono text-xs">{describeAudit(entry)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No audit entries.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <RecordFormDialog open={editOpen} onOpenChange={setEditOpen} record={data} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              The record will be removed from all lists. Administrators can still recover it, and the
              deletion is recorded in the audit log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function describeAudit(entry: { action: string; previous_value: unknown; new_value: unknown }) {
  const prev = entry.previous_value as { deleted_at?: string | null } | null;
  const next = entry.new_value as { deleted_at?: string | null } | null;
  if (entry.action === "UPDATE" && !prev?.deleted_at && next?.deleted_at) return "SOFT DELETE";
  if (entry.action === "UPDATE" && prev?.deleted_at && !next?.deleted_at) return "RESTORE";
  return entry.action;
}

function Info({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2 min-w-0" : "min-w-0"}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={mono ? "break-all font-mono text-xs" : "break-words"}>{value}</p>
    </div>
  );
}
