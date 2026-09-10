import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary font-mono text-[13px] font-semibold tracking-tight text-primary-foreground">
        VM
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">VMS</div>
          <div className="text-[11px] text-muted-foreground">Valuation Management System</div>
        </div>
      )}
    </div>
  );
}
