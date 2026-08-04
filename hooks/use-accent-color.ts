"use client";

import { useEffect } from "react";

import { DEFAULT_ACCENT } from "@/lib/constants";
import { useThemeStore } from "@/stores/theme-store";

function hexToOklchApprox(hex: string) {
  // CSS accepts hex directly for custom properties; keep brand token sync simple.
  return hex;
}

export function useAccentColor() {
  const accentColor = useThemeStore((s) => s.accentColor);

  useEffect(() => {
    const value = hexToOklchApprox(accentColor || DEFAULT_ACCENT);
    const root = document.documentElement;
    root.style.setProperty("--user-accent", value);
    root.style.setProperty("--brand", value);
    root.style.setProperty("--primary", value);
    root.style.setProperty("--ring", value);
    root.style.setProperty("--sidebar-primary", value);
    root.style.setProperty("--sidebar-ring", value);
  }, [accentColor]);
}
