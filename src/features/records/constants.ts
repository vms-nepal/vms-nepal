export const PROPERTY_TYPES = [
  "Residential land",
  "Commercial land",
  "Agricultural land",
  "Residential building",
  "Commercial building",
  "Apartment",
  "Industrial",
  "Other",
] as const;

export const ROAD_CATEGORIES = [
  "Highway",
  "Feeder road",
  "Blacktopped",
  "Gravelled",
  "Earthen",
  "Gali (lane)",
  "No road access",
] as const;

export const RECORD_STATUSES = ["draft", "submitted", "approved", "archived"] as const;
export const RECORD_VISIBILITIES = ["private", "universal"] as const;

export const AREA_SOURCES = {
  map_gis: "GIS / map measurement (indicative)",
  document: "Document / cadastral figure",
  survey: "Field survey",
} as const;

export type AreaSource = keyof typeof AREA_SOURCES;
