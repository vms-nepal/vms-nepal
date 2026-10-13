import { lazy, Suspense } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";

// The map library is browser-only, so it is loaded after hydration.
const MapWorkspace = lazy(() => import("@/features/map/MapWorkspace"));

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({
    meta: [
      { title: "Map — VMS" },
      { name: "description", content: "Interactive map of valuation records with measurement tools." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const fallback = <Skeleton className="h-full w-full rounded-none" />;
  return (
    <div className="-mx-4 -my-6 h-[calc(100dvh-4rem)] sm:-mx-6 sm:-my-8">
      <ClientOnly fallback={fallback}>
        <Suspense fallback={fallback}>
          <MapWorkspace />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
