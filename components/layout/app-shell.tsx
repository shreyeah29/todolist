"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { CommandPalette } from "@/components/shared/command-palette";
import { MobileSidebar, Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAccentColor } from "@/hooks/use-accent-color";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  useKeyboardShortcuts();
  useAccentColor();

  return (
    <div className="relative flex min-h-dvh w-full overflow-hidden">
      <Sidebar />
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <motion.main
          key="app-main"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </motion.main>
      </div>

      <CommandPalette />
    </div>
  );
}
