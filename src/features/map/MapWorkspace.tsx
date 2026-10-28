import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MlMap, MapMouseEvent, MapTouchEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Hand,
  Layers,
  LocateFixed,
  MapPin,
  Minus,
  Pentagon,
  Plus,
  Ruler,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import { BASE_LAYERS, buildStyle, NEPAL_CENTER, NEPAL_ZOOM } from "@/features/map/mapLayers";
import type { BaseLayerId } from "@/features/map/mapLayers";
import {
  formatArea,
  formatDistance,
  GIS_AREA_DISCLAIMER,
  lineLength,
  polygonArea,
} from "@/features/map/measurement";
import type { LngLat } from "@/features/map/measurement";
import { RecordFormDialog } from "@/features/records/RecordFormDialog";
import type { RecordDraftSeed } from "@/features/records/RecordFormDialog";
import { formatLocation, shortId } from "@/features/records/format";
import { listRecords } from "@/features/records/recordsService";
import type { ValuationRecord } from "@/types/domain";

type Mode = "browse" | "pin" | "distance" | "area";

type GeoJSONFeature = { type: "Feature"; properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } };
type GeoJSONFC = { type: "FeatureCollection"; features: GeoJSONFeature[] };

const MEASURE_SOURCE = "measure";
const LONG_PRESS_MS = 550;

function measureGeoJSON(points: LngLat[], mode: Mode): GeoJSONFC {
  const coords = points.map((p) => [p.lng, p.lat]);
  const features: GeoJSONFeature[] = coords.map((c) => ({
    type: "Feature",
    properties: {},
    geometry: { type: "Point", coordinates: c },
  }));
  if (mode === "area" && coords.length >= 3) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [[...coords, coords[0]!]] },
    });
  } else if (coords.length >= 2) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: coords },
    });
  }
  return { type: "FeatureCollection", features };
}

function ensureMeasureLayers(map: MlMap) {
  if (map.getSource(MEASURE_SOURCE)) return;
  map.addSource(MEASURE_SOURCE, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: "measure-fill",
    type: "fill",
    source: MEASURE_SOURCE,
    filter: ["==", "$type", "Polygon"],
    paint: { "fill-color": "#004AAF", "fill-opacity": 0.15 },
  });
  map.addLayer({
    id: "measure-outline",
    type: "line",
    source: MEASURE_SOURCE,
    filter: ["in", "$type", "Polygon", "LineString"],
    paint: { "line-color": "#004AAF", "line-width": 2.5, "line-dasharray": [2, 1] },
  });
  map.addLayer({
    id: "measure-points",
    type: "circle",
    source: MEASURE_SOURCE,
    filter: ["==", "$type", "Point"],
    paint: {
      "circle-radius": 5,
      "circle-color": "#ffffff",
      "circle-stroke-color": "#004AAF",
      "circle-stroke-width": 2.5,
    },
  });
}

export default function MapWorkspace() {
  const { user, profile, isValuator } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const draftMarkerRef = useRef<maplibregl.Marker | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [baseLayer, setBaseLayer] = useState<BaseLayerId>("standard");
  const [mode, setMode] = useState<Mode>("browse");
  const [points, setPoints] = useState<LngLat[]>([]);
  const [draft, setDraft] = useState<{ point: LngLat; at: Date } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [seed, setSeed] = useState<RecordDraftSeed | null>(null);
  const [selected, setSelected] = useState<ValuationRecord | null>(null);
  const [locating, setLocating] = useState(false);

  // Refs let long-lived map handlers read current state without re-binding.
  const modeRef = useRef(mode);
  const valuatorRef = useRef(isValuator);
  modeRef.current = mode;
  valuatorRef.current = isValuator;

  const records = useQuery({
    queryKey: ["map-records", user?.id],
    enabled: Boolean(user),
    queryFn: () => listRecords("all", user?.id),
  });

  const dropPin = useCallback((point: LngLat) => {
    if (!valuatorRef.current) {
      toast.info("Only verified valuators can create record pins.");
      return;
    }
    setSelected(null);
    setDraft({ point, at: new Date() });
  }, []);

  // Initialise the map once.
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle("standard"),
      center: NEPAL_CENTER,
      zoom: NEPAL_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");
    map.on("style.load", () => ensureMeasureLayers(map));

    map.on("click", (event: MapMouseEvent) => {
      const point = { lng: event.lngLat.lng, lat: event.lngLat.lat };
      const current = modeRef.current;
      if (current === "distance" || current === "area") {
        setPoints((prev) => [...prev, point]);
      } else if (current === "pin") {
        dropPin(point);
      }
    });
    map.on("contextmenu", (event: MapMouseEvent) => {
      if (modeRef.current === "browse" || modeRef.current === "pin") {
        dropPin({ lng: event.lngLat.lng, lat: event.lngLat.lat });
      }
    });

    // Long-press to drop a pin on touch devices.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const cancel = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };
    map.on("touchstart", (event: MapTouchEvent) => {
      cancel();
      if (event.points.length !== 1) return;
      if (modeRef.current !== "browse" && modeRef.current !== "pin") return;
      const lngLat = event.lngLat;
      timer = setTimeout(() => dropPin({ lng: lngLat.lng, lat: lngLat.lat }), LONG_PRESS_MS);
    });
    map.on("touchend", cancel);
    map.on("touchmove", cancel);
    map.on("dragstart", cancel);

    return () => {
      cancel();
      map.remove();
      mapRef.current = null;
    };
  }, [dropPin]);

  // Switch base layer.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(buildStyle(baseLayer));
  }, [baseLayer]);

  // Sync measurement geometry.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      ensureMeasureLayers(map);
      (map.getSource(MEASURE_SOURCE) as GeoJSONSource | undefined)?.setData(
        measureGeoJSON(points, mode),
      );
    };
    if (map.isStyleLoaded()) apply();
    else map.once("idle", apply);
  }, [points, mode, baseLayer]);

  // Cursor feedback.
  useEffect(() => {
    const canvas = mapRef.current?.getCanvas();
    if (canvas) canvas.style.cursor = mode === "browse" ? "" : "crosshair";
  }, [mode]);

  // Record markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    for (const record of records.data ?? []) {
      if (record.latitude == null || record.longitude == null) continue;
      const mine = record.created_by === user?.id;
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `Record ${record.title}`);
      el.className = cn(
        "size-4 rounded-full border-2 border-white shadow-md ring-1 ring-black/20 transition-transform hover:scale-125",
        mine ? "bg-primary" : "bg-foreground/70",
      );
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        setDraft(null);
        setSelected(record);
      });
      markersRef.current.push(
        new maplibregl.Marker({ element: el }).setLngLat([record.longitude, record.latitude]).addTo(map),
      );
    }
  }, [records.data, user?.id]);

  // Draft pin marker.
  useEffect(() => {
    const map = mapRef.current;
    draftMarkerRef.current?.remove();
    draftMarkerRef.current = null;
    if (!map || !draft) return;
    draftMarkerRef.current = new maplibregl.Marker({ color: "#004AAF" })
      .setLngLat([draft.point.lng, draft.point.lat])
      .addTo(map);
  }, [draft]);

  const switchMode = (next: Mode) => {
    setMode((current) => (current === next ? "browse" : next));
    setPoints([]);
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Location is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { longitude, latitude } = position.coords;
        const map = mapRef.current;
        if (!map) return;
        userMarkerRef.current?.remove();
        const el = document.createElement("div");
        el.className = "size-4 rounded-full border-2 border-white bg-sky-500 shadow-[0_0_0_6px_rgba(14,165,233,0.25)]";
        userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(map);
        map.flyTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), 16) });
      },
      (error) => {
        setLocating(false);
        toast.warning(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. You can still browse and search the map."
            : "Your location could not be determined right now.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const distance = useMemo(() => lineLength(points), [points]);
  const area = useMemo(() => polygonArea(points), [points]);
  const areaText = formatArea(area);

  const startRecordFromDraft = () => {
    if (!draft) return;
    setSeed({ latitude: draft.point.lat, longitude: draft.point.lng });
    setFormOpen(true);
  };

  const startRecordFromArea = () => {
    if (points.length < 3) return;
    const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
    setSeed({
      latitude: lat,
      longitude: lng,
      land_area_sq_m: area,
      geometry: {
        type: "Polygon",
        coordinates: [[...points.map((p) => [p.lng, p.lat]), [points[0]!.lng, points[0]!.lat]]],
      },
    });
    setFormOpen(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Tool bar */}
      <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-5rem)] flex-wrap gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-elevated">
        <ToolButton active={mode === "browse"} onClick={() => switchMode("browse")} icon={Hand} label="Browse" />
        {isValuator ? (
          <ToolButton active={mode === "pin"} onClick={() => switchMode("pin")} icon={MapPin} label="Drop pin" />
        ) : null}
        <ToolButton active={mode === "distance"} onClick={() => switchMode("distance")} icon={Ruler} label="Distance" />
        <ToolButton active={mode === "area"} onClick={() => switchMode("area")} icon={Pentagon} label="Area" />
      </div>

      {/* Map controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-elevated">
          <IconControl label="Zoom in" onClick={() => mapRef.current?.zoomIn()} icon={Plus} />
          <div className="h-px bg-border" />
          <IconControl label="Zoom out" onClick={() => mapRef.current?.zoomOut()} icon={Minus} />
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-elevated">
          <IconControl
            label="Current location"
            onClick={locate}
            icon={LocateFixed}
            className={locating ? "animate-pulse text-primary" : undefined}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Map layers"
              className="grid size-11 place-items-center rounded-lg border border-border bg-background shadow-elevated hover:bg-muted"
            >
              <Layers className="size-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-60 p-2">
            <p className="px-2 pb-2 pt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              Base layer
            </p>
            {BASE_LAYERS.map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setBaseLayer(layer.id)}
                className={cn(
                  "flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-muted",
                  baseLayer === layer.id && "bg-primary-soft",
                )}
              >
                <span className={cn("text-sm font-medium", baseLayer === layer.id && "text-primary")}>
                  {layer.label}
                </span>
                <span className="text-xs text-muted-foreground">{layer.description}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>

      {/* Hints */}
      {mode !== "browse" && points.length === 0 && !draft ? (
        <div className="pointer-events-none absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-full bg-foreground/85 px-4 py-1.5 text-xs text-background">
          {mode === "pin"
            ? "Tap the map to drop a record pin"
            : mode === "distance"
              ? "Tap points to measure distance"
              : "Tap at least three points to measure area"}
        </div>
      ) : null}

      {/* Bottom panels */}
      <div className="absolute inset-x-3 bottom-8 z-10 flex flex-col gap-3 sm:right-auto sm:w-[360px]">
        {(mode === "distance" || mode === "area") && points.length > 0 ? (
          <Panel>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {mode === "distance" ? "Distance" : "Area"} · {points.length} point{points.length === 1 ? "" : "s"}
                </p>
                {mode === "distance" ? (
                  <div className="mt-1 space-y-0.5 font-mono">
                    <p className="text-lg font-semibold">{distance.toFixed(2)} m</p>
                    <p className="text-sm text-muted-foreground">{(distance / 1000).toFixed(4)} km</p>
                  </div>
                ) : (
                  <div className="mt-1 space-y-0.5 font-mono">
                    <p className="text-lg font-semibold">{areaText.sqM}</p>
                    <p className="text-sm text-muted-foreground">{areaText.sqFt}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <IconControl label="Undo last point" onClick={() => setPoints((p) => p.slice(0, -1))} icon={Undo2} small />
                <IconControl label="Clear" onClick={() => setPoints([])} icon={Trash2} small />
              </div>
            </div>
            {mode === "area" ? (
              <>
                <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{GIS_AREA_DISCLAIMER}</p>
                {isValuator && points.length >= 3 ? (
                  <Button size="sm" className="mt-3 w-full" onClick={startRecordFromArea}>
                    Create record from this area
                  </Button>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Segment total {formatDistance(distance)} · map measurement
              </p>
            )}
          </Panel>
        ) : null}

        {draft ? (
          <Panel>
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold">New record pin</p>
              <IconControl label="Cancel pin" onClick={() => setDraft(null)} icon={X} small />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <Detail label="Latitude" value={draft.point.lat.toFixed(6)} mono />
              <Detail label="Longitude" value={draft.point.lng.toFixed(6)} mono />
              <Detail label="Created by" value={profile?.full_name || profile?.email || "You"} />
              <Detail label="Created" value={draft.at.toLocaleString()} />
            </dl>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={startRecordFromDraft}>
                Continue
              </Button>
            </div>
          </Panel>
        ) : null}

        {selected ? (
          <Panel>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-primary">REC-{shortId(selected.id)}</p>
                <p className="truncate text-sm font-semibold">{selected.title}</p>
                <p className="truncate text-xs text-muted-foreground">{formatLocation(selected)}</p>
                <p className="mt-1 text-xs">
                  {selected.created_by === user?.id ? "Created by you" : "Created by another valuator"}
                </p>
              </div>
              <IconControl label="Close" onClick={() => setSelected(null)} icon={X} small />
            </div>
            <Button asChild size="sm" className="mt-3 w-full">
              <Link to="/records/$recordId" params={{ recordId: selected.id }}>
                Open record
              </Link>
            </Button>
          </Panel>
        ) : null}
      </div>

      <RecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        seed={seed}
        onSaved={(saved) => {
          setDraft(null);
          setPoints([]);
          setMode("browse");
          void navigate({ to: "/records/$recordId", params: { recordId: saved.id } });
        }}
      />
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-rise rounded-lg border border-border bg-background/97 p-4 shadow-elevated">
      {children}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={cn("truncate", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Hand;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function IconControl({
  label,
  onClick,
  icon: Icon,
  className,
  small,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Hand;
  className?: string | undefined;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid place-items-center hover:bg-muted",
        small ? "size-8 rounded-md" : "size-11",
        className,
      )}
    >
      <Icon className={small ? "size-4" : "size-5"} />
    </button>
  );
}
