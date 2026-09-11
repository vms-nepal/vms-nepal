import { createFileRoute } from "@tanstack/react-router";
import { Landmark } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PhasePlaceholder } from "@/components/layout/PhasePlaceholder";

export const Route = createFileRoute("/_authenticated/government-rates")({
  component: GovernmentRatesPage,
});

function GovernmentRatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reference data"
        title="Government Rates"
        description="Official land rates by district, municipality, ward and fiscal year."
      />
      <PhasePlaceholder
        icon={Landmark}
        title="Rate library"
        description="The rates table is live: readable by everyone and writable only by administrators. Browsing, import and management arrive in a later phase."
        points={[
          "Province, district, municipality and ward",
          "Land category and rate per square metre",
          "Fiscal-year versioning",
          "Every change captured in the audit log",
        ]}
      />
    </div>
  );
}
