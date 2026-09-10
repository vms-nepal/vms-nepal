import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, Landmark, Map, Ruler, ArrowRight, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const title = "VMS — Valuation Management System for Nepal";
const description =
  "A professional platform for organizing property valuation records, geographic information, land-area calculations, valuation calculations and government rates.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Welcome,
});

const capabilities = [
  {
    icon: Map,
    title: "Map-based Records",
    body: "Valuation records anchored to precise locations, ready for parcel geometry and geospatial analysis.",
  },
  {
    icon: Ruler,
    title: "Land Area Converter",
    body: "Ropani, aana, paisa, daam, bigha, kattha, dhur and metric units in one consistent engine.",
  },
  {
    icon: Calculator,
    title: "Advanced Valuation Calculator",
    body: "Structured valuation workflows for land, buildings and composite properties.",
  },
  {
    icon: Landmark,
    title: "Government Rates",
    body: "Official district and municipality rates organised by fiscal year and land category.",
  },
];

function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl animate-rise">
            <p className="text-eyebrow">Nepal · Property valuation infrastructure</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Valuation Management System
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get Started <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Built for engineers, valuers, banks and valuation companies.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {capabilities.map((item) => (
              <Card key={item.title} className="h-full border-border/80 shadow-none">
                <CardContent className="space-y-3 p-6">
                  <div className="grid size-10 place-items-center rounded-md bg-primary-soft text-accent-foreground">
                    <item.icon className="size-5" strokeWidth={1.8} />
                  </div>
                  <h2 className="text-[15px] font-semibold tracking-tight">{item.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>VMS — Valuation Management System</span>
          <span>Property valuation platform for Nepal</span>
        </div>
      </footer>
    </div>
  );
}
