// Created by Sekar Nagarajan (2026-09-08 17:45)
import { create } from "zustand";

export const SCHEDULES_HEADER_SEARCH_SLOT_ID = "schedules-header-search-slot";

interface SchedulesHeaderSearchState {
  /** Schedules route is mounted. */
  active: boolean;
  /** In-page search panel scrolled out of view. */
  pinned: boolean;
  setActive: (active: boolean) => void;
  setPinned: (pinned: boolean) => void;
  reset: () => void;
}

export const useSchedulesHeaderSearchStore = create<SchedulesHeaderSearchState>(
  (set) => ({
    active: false,
    pinned: false,
    setActive: (active) =>
      set(active ? { active: true } : { active: false, pinned: false }),
    setPinned: (pinned) => set({ pinned }),
    reset: () => set({ active: false, pinned: false }),
  }),
);
