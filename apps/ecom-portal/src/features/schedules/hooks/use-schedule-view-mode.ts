// Modified by Sekar Nagarajan (2026-09-15 12:53)
import { useState } from "react";

export type ScheduleViewMode = "list" | "card" | "calendar";

const STORAGE_KEY = "ecom.schedules.viewMode";

function readStoredMode(): ScheduleViewMode {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    if (value === "list" || value === "card" || value === "calendar") {
      return value;
    }
  } catch {
    // sessionStorage may be unavailable
  }
  return "list";
}

/**
 * Persists Schedules list / card / calendar preference in sessionStorage.
 */
export function useScheduleViewMode() {
  const [viewMode, setViewModeState] = useState<ScheduleViewMode>(() =>
    readStoredMode(),
  );

  function setViewMode(mode: ScheduleViewMode) {
    setViewModeState(mode);
    try {
      sessionStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // sessionStorage may be unavailable
    }
  }

  return { viewMode, setViewMode };
}
