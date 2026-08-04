"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronsLeft,
  ChevronsRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  NAV_ITEMS,
  PLANNER_SUBNAV,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen);

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const plannerOpen = pathname.startsWith("/planner");

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className={cn(
        "glass-subtle border-sidebar-border relative z-30 hidden h-dvh shrink-0 flex-col border-r md:flex",
      )}
      style={{ width }}
    >
      <div
        className={cn(
          "flex h-16 items-center px-3",
          collapsed ? "justify-center" : "justify-between gap-2 px-4",
        )}
      >
        <Brand collapsed={collapsed} />
        {!collapsed ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        ) : null}
      </div>

      <ScrollArea className="flex-1 px-2 pb-4">
        <nav className="space-y-1 pt-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(
              pathname,
              item.href,
              item.match ?? "exact",
            );
            const Icon = item.icon;

            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="sidebar-active"
                    className="bg-sidebar-accent absolute inset-0 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                ) : null}
                <Icon className="relative z-10 size-[18px] shrink-0" />
                {!collapsed ? (
                  <span className="relative z-10 truncate">{item.label}</span>
                ) : null}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        <AnimatePresence initial={false}>
          {!collapsed && plannerOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <Separator className="mb-3" />
              <p className="text-muted-foreground mb-2 px-3 text-[11px] font-medium tracking-wider uppercase">
                Planner
              </p>
              <div className="space-y-0.5">
                {PLANNER_SUBNAV.map((item) => {
                  const active =
                    item.href === "/planner"
                      ? pathname === "/planner"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-brand-soft text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </ScrollArea>

      <div className="border-sidebar-border border-t p-3">
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="mx-auto flex"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="size-4" />
          </Button>
        ) : (
          <button
            type="button"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:bg-muted/70 hover:text-foreground flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors"
          >
            <span>Collapse</span>
            <ChevronsLeft className="size-3.5" />
          </button>
        )}
      </div>
    </motion.aside>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const open = useUiStore((s) => s.sidebarMobileOpen);
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="glass border-sidebar-border fixed inset-y-0 left-0 z-50 flex w-[min(88vw,300px)] flex-col border-r md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <Brand />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 px-2 pb-6">
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(
                    pathname,
                    item.href,
                    item.match ?? "exact",
                  );
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
