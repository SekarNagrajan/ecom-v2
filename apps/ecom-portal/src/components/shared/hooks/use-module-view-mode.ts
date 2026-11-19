// Modified by Sekar Nagarajan (2026-09-18 00:15)
import type { DataViewMode } from "@solverminds/shared-ui/data-view";
import { useCallback, useState } from "react";

export type ModuleListViewMode = "list" | "card";

function readStoredMode(
  storageKey: string,
  fallback: ModuleListViewMode,
): ModuleListViewMode {
  try {
    const value = sessionStorage.getItem(storageKey);
    if (value === "list" || value === "card") return value;
  } catch {
    // sessionStorage may be unavailable
  }
  return fallback;
}

/**
 * Persists list/card view preference in sessionStorage for module dashboards.
 * @param defaultMode — used when nothing is stored (Booking/SI/BL stay list; Rates uses card).
 */
export function useModuleViewMode(
  storageKey: string,
  defaultMode: ModuleListViewMode = "list",
) {
  const [viewMode, setViewModeState] = useState<ModuleListViewMode>(() =>
    readStoredMode(storageKey, defaultMode),
  );

  const setViewMode = useCallback(
    (mode: ModuleListViewMode | DataViewMode) => {
      const next: ModuleListViewMode = mode === "card" ? "card" : "list";
      setViewModeState(next);
      try {
        sessionStorage.setItem(storageKey, next);
      } catch {
        // sessionStorage may be unavailable
      }
    },
    [storageKey],
  );

  return { viewMode, setViewMode };
}
