import {
  Calculator,
  FileStack,
  LayoutDashboard,
  Map,
  Ruler,
  Settings,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const primaryNav: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Records", to: "/records", icon: FileStack },
  { label: "Map", to: "/map", icon: Map },
  { label: "Converter", to: "/converter", icon: Ruler },
  { label: "Advanced Calculator", to: "/calculator", icon: Calculator },
  { label: "Government Rates", to: "/government-rates", icon: Landmark },
];

export const secondaryNav: NavItem[] = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Admin Console", to: "/admin", icon: ShieldCheck, adminOnly: true },
];
