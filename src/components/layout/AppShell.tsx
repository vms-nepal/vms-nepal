import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/AuthProvider";
import { primaryNav, secondaryNav } from "@/features/navigation/navigation";

function useCurrentTitle(): string {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const match = [...primaryNav, ...secondaryNav].find((item) => pathname.startsWith(item.to));
  if (pathname.startsWith("/onboarding")) return "Complete your profile";
  return match?.label ?? "VMS";
}

export function AppShell({ children }: { children?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, isAdmin, profileLoading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const title = useCurrentTitle();

  useEffect(() => {
    if (profileLoading || !profile) return;
    if (!profile.onboarding_completed && !pathname.startsWith("/onboarding")) {
      void navigate({ to: "/onboarding", replace: true });
    }
  }, [profile, profileLoading, pathname, navigate]);

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <BrandMark />
        </div>
        <SidebarNav isAdmin={isAdmin} />
        <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-muted">
          Nepal property valuation platform
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-sm sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10 lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center border-b border-sidebar-border px-5">
                <BrandMark />
              </div>
              <SidebarNav isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold tracking-tight sm:text-base">{title}</h1>
          </div>
          <UserMenu />
        </header>

        <main className="mx-auto w-full max-w-[1400px] animate-fade px-4 py-6 sm:px-6 sm:py-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
