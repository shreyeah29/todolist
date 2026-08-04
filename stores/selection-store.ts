import { create } from "zustand";

type SelectionState = {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  toggleId: (id: string) => void;
  clear: () => void;
};

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: [],
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  toggleId: (id) => {
    const current = get().selectedIds;
    set({
      selectedIds: current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    });
  },
  clear: () => set({ selectedIds: [] }),
}));
