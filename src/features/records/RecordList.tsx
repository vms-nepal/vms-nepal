import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatLocation, formatNpr, formatSqM, shortId } from "@/features/records/format";
import type { ValuationRecord } from "@/types/domain";

interface Props {
  records: ValuationRecord[];
  currentUserId?: string | undefined;
}

function CreatorLabel({ record, currentUserId }: { record: ValuationRecord; currentUserId?: string | undefined }) {
  const mine = record.created_by === currentUserId;
  return mine ? (
    <Badge className="font-normal">You</Badge>
  ) : (
    <span className="text-muted-foreground">Another valuator</span>
  );
}

export function RecordList({ records, currentUserId }: Props) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Record ID</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 text-right font-medium">Area</th>
              <th className="px-4 py-3 text-right font-medium">Market rate</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Created by</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link
                    to="/records/$recordId"
                    params={{ recordId: record.id }}
                    className="font-mono text-xs font-medium text-primary hover:underline"
                  >
                    {shortId(record.id)}
                  </Link>
                  <p className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground">
                    {record.title}
                  </p>
                </td>
                <td className="max-w-[280px] truncate px-4 py-3">{formatLocation(record)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">{formatSqM(record.land_area_sq_m)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs">
                  {formatNpr(record.market_rate_per_sq_m)}
                </td>
                <td className="px-4 py-3 text-xs">{formatDate(record.created_at)}</td>
                <td className="px-4 py-3 text-xs">
                  <CreatorLabel record={record} currentUserId={currentUserId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {records.map((record) => (
          <Link
            key={record.id}
            to="/records/$recordId"
            params={{ recordId: record.id }}
            className="block"
          >
            <Card className="active:bg-muted/50">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] text-primary">{shortId(record.id)}</p>
                    <p className="truncate text-sm font-semibold">{record.title}</p>
                  </div>
                  <span className="shrink-0 text-xs">
                    <CreatorLabel record={record} currentUserId={currentUserId} />
                  </span>
                </div>
                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" /> {formatLocation(record)}
                </p>
                <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p className="font-mono">{formatSqM(record.land_area_sq_m)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rate / m²</p>
                    <p className="font-mono">{formatNpr(record.market_rate_per_sq_m)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>{formatDate(record.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
