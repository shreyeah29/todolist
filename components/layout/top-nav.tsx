"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NAV_ITEMS, PLANNER_SUBNAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

function useBreadcrumbs(pathname: string) {
  return useMemo(() => {
    const primary =
      NAV_ITEMS.find((item) =>
        item.match === "prefix"
          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
          : pathname === item.href,
      ) ?? NAV_ITEMS[0];

    const crumbs = [{ label: primary.label, href: primary.href }];

    if (pathname.startsWith("/planner")) {
      const sub = PLANNER_SUBNAV.find((item) =>
        item.href === "/planner"
          ? pathname === "/planner"
          : pathname.startsWith(item.href),
      );
      if (sub && sub.href !== "/planner") {
        crumbs.push({ label: sub.label, href: sub.href });
      }
    }

    if (pathname.startsWith("/knowledge/") && pathname !== "/knowledge") {
      crumbs.push({ label: "Note", href: pathname });
    }

    return crumbs;
  }, [pathname]);
}

export function TopNav() {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);

  return (
    <header className="glass-subtle border-border/60 sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl md:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={() => setSidebarMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </Button>

      <nav className="text-muted-foreground hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
        {crumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 ? <span className="opacity-40">/</span> : null}
            <span
              className={cn(
                "truncate",
                index === crumbs.length - 1 && "text-foreground font-medium",
              )}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            "hidden h-9 items-center gap-2 rounded-xl border border-transparent px-3 text-sm transition-colors",
            "bg-muted/40 md:flex",
            "min-w-[220px] justify-between",
          )}
        >
          <span className="flex items-center gap-2">
            <Search className="size-3.5 opacity-70" />
            Search everything
          </span>
          <kbd className="bg-background/70 text-muted-foreground rounded-md border px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Open search"
        >
          <Search className="size-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

        <ThemeToggle />

        <Button variant="ghost" size="icon-sm" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>

        <Avatar className="ml-1 size-8 border">
          <AvatarFallback className="bg-brand-soft text-foreground text-xs font-semibold">
            TO
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
