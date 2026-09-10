import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function PhasePlaceholder({
  icon: Icon,
  title,
  description,
  points,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <Card className="animate-rise border-dashed">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:p-8">
        <div className="grid size-11 shrink-0 place-items-center rounded-md bg-primary-soft text-accent-foreground">
          <Icon className="size-5" strokeWidth={1.8} />
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Scheduled for a later phase. The data model and access rules for this area are already
            in place.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
