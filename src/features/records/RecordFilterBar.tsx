import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PROPERTY_TYPES, ROAD_CATEGORIES } from "@/features/records/constants";
import type { RecordFilters } from "@/features/records/recordsService";

interface Props {
  filters: RecordFilters;
  onChange: (filters: RecordFilters) => void;
  districts: string[];
}

const ANY = "__any__";

export function RecordFilterBar({ filters, onChange, districts }: Props) {
  const set = (patch: Partial<RecordFilters>) => onChange({ ...filters, ...patch });
  const activeCount = Object.entries(filters).filter(
    ([key, value]) => key !== "search" && value !== undefined && value !== "",
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search ?? ""}
            onChange={(event) => set({ search: event.target.value })}
            placeholder="Search title, reference, plot, locality"
            className="h-11 pl-9"
            aria-label="Search records"
          />
        </div>
        <Collapsible className="contents">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="h-11 shrink-0">
              Filters{activeCount ? ` (${activeCount})` : ""}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="col-span-full w-full">
            <div className="mt-3 grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="District">
                <Select
                  value={filters.district ?? ANY}
                  onValueChange={(value) => set({ district: value === ANY ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any district</SelectItem>
                    {districts.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Municipality">
                <Input
                  value={filters.municipality ?? ""}
                  onChange={(event) => set({ municipality: event.target.value || undefined })}
                />
              </Field>
              <Field label="Ward">
                <Input
                  value={filters.ward ?? ""}
                  onChange={(event) => set({ ward: event.target.value || undefined })}
                />
              </Field>
              <Field label="Property type">
                <Select
                  value={filters.propertyType ?? ANY}
                  onValueChange={(value) => set({ propertyType: value === ANY ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any type</SelectItem>
                    {PROPERTY_TYPES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Road category">
                <Select
                  value={filters.roadCategory ?? ANY}
                  onValueChange={(value) => set({ roadCategory: value === ANY ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any road</SelectItem>
                    {ROAD_CATEGORIES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Created from">
                <Input
                  type="date"
                  value={filters.dateFrom ?? ""}
                  onChange={(event) => set({ dateFrom: event.target.value || undefined })}
                />
              </Field>
              <Field label="Created to">
                <Input
                  type="date"
                  value={filters.dateTo ?? ""}
                  onChange={(event) => set({ dateTo: event.target.value || undefined })}
                />
              </Field>
              <Field label="Market rate (NPR / m²)">
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="decimal"
                    placeholder="Min"
                    value={filters.rateMin ?? ""}
                    onChange={(event) =>
                      set({ rateMin: event.target.value ? Number(event.target.value) : undefined })
                    }
                  />
                  <Input
                    inputMode="decimal"
                    placeholder="Max"
                    value={filters.rateMax ?? ""}
                    onChange={(event) =>
                      set({ rateMax: event.target.value ? Number(event.target.value) : undefined })
                    }
                  />
                </div>
              </Field>
              <div className="sm:col-span-2 lg:col-span-4">
                <Button variant="ghost" size="sm" onClick={() => onChange({ search: filters.search })}>
                  <X className="mr-1 size-4" /> Clear filters
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
