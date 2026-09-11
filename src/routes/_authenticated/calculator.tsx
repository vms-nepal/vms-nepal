import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PhasePlaceholder } from "@/components/layout/PhasePlaceholder";

export const Route = createFileRoute("/_authenticated/calculator")({
  component: CalculatorPage,
});

function CalculatorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tools"
        title="Advanced Calculator"
        description="Structured valuation calculations for land, structures and composite properties."
      />
      <PhasePlaceholder
        icon={Calculator}
        title="Valuation engine"
        description="Valuation records already carry estimated value, currency and a flexible metadata field so calculation outputs can be attached without a schema rewrite."
        points={[
          "Land, building and composite valuation",
          "Depreciation and construction-cost inputs",
          "Government rate cross-checks",
          "Calculation layer separate from the interface",
        ]}
      />
    </div>
  );
}
