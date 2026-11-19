// Modified by Sekar Nagarajan (2026-09-18 00:15)
import { useState } from "react";

export type ScheduleViewMode = "list" | "card" | "calendar";

const STORAGE_KEY = "ecom.schedules.viewMode.v2";

function readStoredMode(): ScheduleViewMode {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    if (value === "list" || value === "card" || value === "calendar") {
      return value;
    }
  } catch {
    // sessionStorage may be unavailable
  }
  // Default: card view for search results
  return "card";
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
