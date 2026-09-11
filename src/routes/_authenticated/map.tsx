import { createFileRoute } from "@tanstack/react-router";
import { Map } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PhasePlaceholder } from "@/components/layout/PhasePlaceholder";

export const Route = createFileRoute("/_authenticated/map")({
  component: MapPage,
});

function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Geospatial"
        title="Map"
        description="Map-based browsing and pin creation for valuation records."
      />
      <PhasePlaceholder
        icon={Map}
        title="Map workspace"
        description="Records already store coordinates and a geometry field, so parcel outlines and spatial queries can be added without changing the data model."
        points={[
          "Record pins with owner-aware visibility",
          "Parcel geometry storage (GeoJSON today, PostGIS ready)",
          "District, municipality and ward filters",
          "Map logic kept separate from interface code",
        ]}
      />
    </div>
  );
}
