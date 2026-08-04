import { create } from "zustand";

import type { PlannerView } from "@/types";

type PlannerViewState = {
  view: PlannerView;
  search: string;
  statusFilter: string[];
  priorityFilter: string[];
  setView: (view: PlannerView) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (statusFilter: string[]) => void;
  setPriorityFilter: (priorityFilter: string[]) => void;
  resetFilters: () => void;
};

export const usePlannerViewStore = create<PlannerViewState>((set) => ({
  view: "list",
  search: "",
  statusFilter: [],
  priorityFilter: [],
  setView: (view) => set({ view }),
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  resetFilters: () =>
    set({ search: "", statusFilter: [], priorityFilter: [] }),
}));
