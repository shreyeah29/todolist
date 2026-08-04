import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  commandPaletteOpen: boolean;
  panelSizes: {
    left: number;
    right: number;
  };
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (value: boolean) => void;
  setCommandPaletteOpen: (value: boolean) => void;
  setPanelSizes: (sizes: Partial<UiState["panelSizes"]>) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      commandPaletteOpen: false,
      panelSizes: {
        left: 280,
        right: 360,
      },
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarMobileOpen: (value) => set({ sidebarMobileOpen: value }),
      setCommandPaletteOpen: (value) => set({ commandPaletteOpen: value }),
      setPanelSizes: (sizes) =>
        set((state) => ({
          panelSizes: { ...state.panelSizes, ...sizes },
        })),
    }),
    {
      name: "toso-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        panelSizes: state.panelSizes,
      }),
    },
  ),
);
