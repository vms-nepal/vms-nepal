import type { ValuationRecord } from "@/types/domain";

export const shortId = (id: string) => id.slice(0, 8).toUpperCase();

export function formatLocation(record: ValuationRecord): string {
  return (
    [record.locality, record.municipality, record.ward && `Ward ${record.ward}`, record.district]
      .filter(Boolean)
      .join(", ") || "Location not set"
  );
}

export function formatNpr(value: number | null | undefined): string {
  if (value == null) return "—";
  return `NPR ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatSqM(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} m²`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
