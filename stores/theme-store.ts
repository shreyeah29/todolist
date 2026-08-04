import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_ACCENT } from "@/lib/constants";
import type { ThemeMode } from "@/types";

type ThemeState = {
  theme: ThemeMode;
  accentColor: string;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: string) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      accentColor: DEFAULT_ACCENT,
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
    }),
    {
      name: "toso-theme",
    },
  ),
);
