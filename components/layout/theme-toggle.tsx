"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore } from "@/stores/theme-store";
import type { ThemeMode } from "@/types";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const setThemeStore = useThemeStore((s) => s.setTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const applyTheme = (value: ThemeMode) => {
    setTheme(value);
    setThemeStore(value);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" aria-label="Toggle theme">
        <Sun className="size-4 opacity-40" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Toggle theme">
          {theme === "dark" ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass min-w-36">
        <DropdownMenuItem onClick={() => applyTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
