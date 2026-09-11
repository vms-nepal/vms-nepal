import { createFileRoute } from "@tanstack/react-router";
import { Ruler } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PhasePlaceholder } from "@/components/layout/PhasePlaceholder";

export const Route = createFileRoute("/_authenticated/converter")({
  component: ConverterPage,
});

function ConverterPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tools"
        title="Land Area Converter"
        description="Conversion between Nepali and metric land-area units."
      />
      <PhasePlaceholder
        icon={Ruler}
        title="Conversion engine"
        description="Records store land area in square metres as the canonical unit, so the conversion engine can be added as a pure calculation module with no interface coupling."
        points={[
          "Ropani · Aana · Paisa · Daam",
          "Bigha · Kattha · Dhur",
          "Square metre, square foot, hectare",
          "Calculation logic isolated and unit-testable",
        ]}
      />
    </div>
  );
}
