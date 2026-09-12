import type { StyleSpecification } from "maplibre-gl";

/**
 * Map tile providers are declared in one place so a provider can be swapped
 * (or replaced by a licensed commercial source) without touching UI code.
 * OpenStreetMap does NOT provide satellite imagery; the satellite layer uses a
 * separate imagery provider.
 */
export type BaseLayerId = "standard" | "terrain" | "satellite";

interface RasterLayerConfig {
  id: BaseLayerId;
  label: string;
  description: string;
  tiles: string[];
  tileSize: number;
  maxzoom: number;
  attribution: string;
}

export const BASE_LAYERS: RasterLayerConfig[] = [
  {
    id: "standard",
    label: "Standard",
    description: "OpenStreetMap street map",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    tileSize: 256,
    maxzoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: "terrain",
    label: "Terrain",
    description: "Topographic relief and contours",
    tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
    tileSize: 256,
    maxzoom: 17,
    attribution: '© OpenTopoMap, © OpenStreetMap contributors (CC-BY-SA)',
  },
  {
    id: "satellite",
    label: "Satellite",
    description: "Aerial / satellite imagery",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    maxzoom: 19,
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
  },
];

export function buildStyle(layerId: BaseLayerId): StyleSpecification {
  const layer = BASE_LAYERS.find((item) => item.id === layerId) ?? BASE_LAYERS[0]!;
  return {
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: layer.tiles,
        tileSize: layer.tileSize,
        maxzoom: layer.maxzoom,
        attribution: layer.attribution,
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#eef1f5" } },
      { id: "base", type: "raster", source: "base" },
    ],
  };
}

/** Centre of Nepal — sensible default viewport. */
export const NEPAL_CENTER: [number, number] = [84.124, 28.3949];
export const NEPAL_ZOOM = 6.4;
