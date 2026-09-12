/**
 * Geodesic measurement helpers. Pure functions only — no map or UI imports —
 * so they can be reused by the converter and calculator phases.
 *
 * IMPORTANT: results are GIS/map measurements derived from coordinates. They are
 * indicative only and are never a substitute for cadastral / title-deed area.
 */

export interface LngLat {
  lng: number;
  lat: number;
}

const EARTH_RADIUS_M = 6371008.8;
const toRad = (value: number) => (value * Math.PI) / 180;

export const SQ_M_TO_SQ_FT = 10.763910417;

/** Nepalese land units expressed in square metres (for the converter phase). */
export const NEPAL_LAND_UNITS_SQ_M = {
  ropani: 508.7376,
  aana: 31.7961,
  paisa: 7.949,
  daam: 1.98725,
  bigha: 6772.63,
  kattha: 338.63,
  dhur: 16.93,
} as const;

export function haversineDistance(a: LngLat, b: LngLat): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Total length in metres across an ordered list of points. */
export function lineLength(points: LngLat[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += haversineDistance(points[i - 1]!, points[i]!);
  }
  return total;
}

/** Spherical polygon area in square metres (ring is closed automatically). */
export function polygonArea(points: LngLat[]): number {
  if (points.length < 3) return 0;
  const ring = [...points, points[0]!];
  let total = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const p1 = ring[i]!;
    const p2 = ring[i + 1]!;
    total += toRad(p2.lng - p1.lng) * (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  return Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

export function formatDistance(metres: number): string {
  if (metres >= 1000) return `${(metres / 1000).toFixed(3)} km`;
  return `${metres.toFixed(2)} m`;
}

export function formatArea(sqMetres: number): { sqM: string; sqFt: string } {
  return {
    sqM: `${sqMetres.toLocaleString(undefined, { maximumFractionDigits: 2 })} m²`,
    sqFt: `${(sqMetres * SQ_M_TO_SQ_FT).toLocaleString(undefined, { maximumFractionDigits: 2 })} ft²`,
  };
}

/** Prepared for the converter phase: square metres to hill (ropani) units. */
export function toRopaniSystem(sqMetres: number) {
  let remaining = sqMetres;
  const ropani = Math.floor(remaining / NEPAL_LAND_UNITS_SQ_M.ropani);
  remaining -= ropani * NEPAL_LAND_UNITS_SQ_M.ropani;
  const aana = Math.floor(remaining / NEPAL_LAND_UNITS_SQ_M.aana);
  remaining -= aana * NEPAL_LAND_UNITS_SQ_M.aana;
  const paisa = Math.floor(remaining / NEPAL_LAND_UNITS_SQ_M.paisa);
  remaining -= paisa * NEPAL_LAND_UNITS_SQ_M.paisa;
  const daam = remaining / NEPAL_LAND_UNITS_SQ_M.daam;
  return { ropani, aana, paisa, daam };
}

/** Prepared for the converter phase: square metres to terai (bigha) units. */
export function toBighaSystem(sqMetres: number) {
  let remaining = sqMetres;
  const bigha = Math.floor(remaining / NEPAL_LAND_UNITS_SQ_M.bigha);
  remaining -= bigha * NEPAL_LAND_UNITS_SQ_M.bigha;
  const kattha = Math.floor(remaining / NEPAL_LAND_UNITS_SQ_M.kattha);
  remaining -= kattha * NEPAL_LAND_UNITS_SQ_M.kattha;
  const dhur = remaining / NEPAL_LAND_UNITS_SQ_M.dhur;
  return { bigha, kattha, dhur };
}

export const GIS_AREA_DISCLAIMER =
  "GIS / map measurement — indicative only. Not a legally authoritative cadastral or title-deed area.";
