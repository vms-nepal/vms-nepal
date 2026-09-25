import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/features/auth/AuthProvider";
import { createRecord, updateRecord } from "@/features/records/recordsService";
import type { RecordInput } from "@/features/records/recordsService";
import {
  PROPERTY_TYPES,
  RECORD_STATUSES,
  RECORD_VISIBILITIES,
  ROAD_CATEGORIES,
} from "@/features/records/constants";
import { GIS_AREA_DISCLAIMER } from "@/features/map/measurement";
import type { ValuationRecord } from "@/types/domain";

export interface RecordDraftSeed {
  latitude: number;
  longitude: number;
  land_area_sq_m?: number | null;
  geometry?: unknown;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: ValuationRecord | null;
  seed?: RecordDraftSeed | null;
  onSaved?: (record: ValuationRecord) => void;
}

type FormState = {
  title: string;
  reference_code: string;
  district: string;
  municipality: string;
  ward: string;
  locality: string;
  plot_number: string;
  property_type: string;
  road_category: string;
  land_area_sq_m: string;
  market_rate_per_sq_m: string;
  estimated_value: string;
  valuation_date: string;
  status: string;
  visibility: string;
  notes: string;
};

const EMPTY: FormState = {
  title: "",
  reference_code: "",
  district: "",
  municipality: "",
  ward: "",
  locality: "",
  plot_number: "",
  property_type: "",
  road_category: "",
  land_area_sq_m: "",
  market_rate_per_sq_m: "",
  estimated_value: "",
  valuation_date: "",
  status: "draft",
  visibility: "private",
  notes: "",
};

const num = (value: string) => (value.trim() === "" ? null : Number(value));

export function RecordFormDialog({ open, onOpenChange, record, seed, onSaved }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        title: record.title ?? "",
        reference_code: record.reference_code ?? "",
        district: record.district ?? "",
        municipality: record.municipality ?? "",
        ward: record.ward ?? "",
        locality: record.locality ?? "",
        plot_number: record.plot_number ?? "",
        property_type: record.property_type ?? "",
        road_category: record.road_category ?? "",
        land_area_sq_m: record.land_area_sq_m?.toString() ?? "",
        market_rate_per_sq_m: record.market_rate_per_sq_m?.toString() ?? "",
        estimated_value: record.estimated_value?.toString() ?? "",
        valuation_date: record.valuation_date ?? "",
        status: record.status,
        visibility: record.visibility,
        notes: record.notes ?? "",
      });
    } else {
      setForm({
        ...EMPTY,
        land_area_sq_m: seed?.land_area_sq_m ? seed.land_area_sq_m.toFixed(2) : "",
      });
    }
  }, [open, record, seed]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: RecordInput = {
        title: form.title.trim(),
        reference_code: form.reference_code.trim() || null,
        district: form.district.trim() || null,
        municipality: form.municipality.trim() || null,
        ward: form.ward.trim() || null,
        locality: form.locality.trim() || null,
        plot_number: form.plot_number.trim() || null,
        property_type: form.property_type || null,
        road_category: form.road_category || null,
        land_area_sq_m: num(form.land_area_sq_m),
        market_rate_per_sq_m: num(form.market_rate_per_sq_m),
        estimated_value: num(form.estimated_value),
        valuation_date: form.valuation_date || null,
        status: form.status,
        visibility: form.visibility,
        notes: form.notes.trim() || null,
      };
      if (record) return updateRecord(record.id, payload);
      if (!user) throw new Error("You must be signed in.");
      return createRecord(
        {
          ...payload,
          latitude: seed?.latitude ?? null,
          longitude: seed?.longitude ?? null,
          geometry: seed?.geometry ?? null,
          area_source: seed?.land_area_sq_m ? "map_gis" : "document",
        },
        user.id,
      );
    },
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ["records"] });
      void queryClient.invalidateQueries({ queryKey: ["record", saved.id] });
      void queryClient.invalidateQueries({ queryKey: ["map-records"] });
      toast.success(record ? "Record updated" : "Record created");
      onOpenChange(false);
      onSaved?.(saved);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not save the record");
    },
  });

  const coords = record
    ? { lat: record.latitude, lng: record.longitude }
    : { lat: seed?.latitude ?? null, lng: seed?.longitude ?? null };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? "Edit record" : "New valuation record"}</DialogTitle>
          <DialogDescription>
            {coords.lat != null && coords.lng != null
              ? `Pinned at ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
              : "Location can be added later from the map."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.title.trim()) {
              toast.error("A record title is required");
              return;
            }
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
              placeholder="e.g. Residential plot, Budhanilkantha-10"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reference code" id="reference_code">
              <Input
                id="reference_code"
                value={form.reference_code}
                onChange={(event) => set("reference_code", event.target.value)}
              />
            </Field>
            <Field label="Plot number" id="plot_number">
              <Input
                id="plot_number"
                value={form.plot_number}
                onChange={(event) => set("plot_number", event.target.value)}
              />
            </Field>
            <Field label="District" id="district">
              <Input
                id="district"
                value={form.district}
                onChange={(event) => set("district", event.target.value)}
              />
            </Field>
            <Field label="Municipality" id="municipality">
              <Input
                id="municipality"
                value={form.municipality}
                onChange={(event) => set("municipality", event.target.value)}
              />
            </Field>
            <Field label="Ward" id="ward">
              <Input id="ward" value={form.ward} onChange={(event) => set("ward", event.target.value)} />
            </Field>
            <Field label="Locality" id="locality">
              <Input
                id="locality"
                value={form.locality}
                onChange={(event) => set("locality", event.target.value)}
              />
            </Field>

            <Field label="Property type" id="property_type">
              <Select value={form.property_type} onValueChange={(value) => set("property_type", value)}>
                <SelectTrigger id="property_type">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Road category" id="road_category">
              <Select value={form.road_category} onValueChange={(value) => set("road_category", value)}>
                <SelectTrigger id="road_category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {ROAD_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Land area (m²)" id="land_area_sq_m">
              <Input
                id="land_area_sq_m"
                inputMode="decimal"
                value={form.land_area_sq_m}
                onChange={(event) => set("land_area_sq_m", event.target.value)}
              />
            </Field>
            <Field label="Market rate (NPR per m²)" id="market_rate_per_sq_m">
              <Input
                id="market_rate_per_sq_m"
                inputMode="decimal"
                value={form.market_rate_per_sq_m}
                onChange={(event) => set("market_rate_per_sq_m", event.target.value)}
              />
            </Field>
            <Field label="Estimated value (NPR)" id="estimated_value">
              <Input
                id="estimated_value"
                inputMode="decimal"
                value={form.estimated_value}
                onChange={(event) => set("estimated_value", event.target.value)}
              />
            </Field>
            <Field label="Valuation date" id="valuation_date">
              <Input
                id="valuation_date"
                type="date"
                value={form.valuation_date}
                onChange={(event) => set("valuation_date", event.target.value)}
              />
            </Field>

            <Field label="Status" id="status">
              <Select value={form.status} onValueChange={(value) => set("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_STATUSES.map((item) => (
                    <SelectItem key={item} value={item} className="capitalize">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Visibility" id="visibility">
              <Select value={form.visibility} onValueChange={(value) => set("visibility", value)}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_VISIBILITIES.map((item) => (
                    <SelectItem key={item} value={item} className="capitalize">
                      {item === "universal" ? "Universal (shared)" : "Private (only me)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Notes" id="notes">
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
            />
          </Field>

          {seed?.land_area_sq_m ? (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Area pre-filled from the map. {GIS_AREA_DISCLAIMER}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : record ? "Save changes" : "Create record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
