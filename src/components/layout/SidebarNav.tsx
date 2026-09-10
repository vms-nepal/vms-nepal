import { Link } from "@tanstack/react-router";

import { primaryNav, secondaryNav } from "@/features/navigation/navigation";
import type { NavItem } from "@/features/navigation/navigation";
import { cn } from "@/lib/utils";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      activeProps={{
        className: cn(
          "relative bg-sidebar-accent text-sidebar-accent-foreground",
          "before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-primary",
        ),
      }}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarNav({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const visibleSecondary = secondaryNav.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      <p className="text-eyebrow px-3 pb-2 pt-1">Workspace</p>
      {primaryNav.map((item) => (
        <NavLink key={item.to} item={item} onNavigate={onNavigate} />
      ))}
      <div className="my-3 h-px bg-sidebar-border" />
      {visibleSecondary.map((item) => (
        <NavLink key={item.to} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
