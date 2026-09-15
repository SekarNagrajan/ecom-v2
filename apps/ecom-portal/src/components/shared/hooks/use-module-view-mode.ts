// Modified by Sekar Nagarajan (2026-09-15 11:35)
import type { DataViewMode } from "@solverminds/shared-ui/data-view";
import { useCallback, useState } from "react";

export type ModuleListViewMode = "list" | "card";

function readStoredMode(storageKey: string): ModuleListViewMode {
  try {
    const value = sessionStorage.getItem(storageKey);
    if (value === "list" || value === "card") return value;
  } catch {
    // sessionStorage may be unavailable
  }
  return "list";
}

/**
 * Persists list/card view preference in sessionStorage for module dashboards.
 */
export function useModuleViewMode(storageKey: string) {
  const [viewMode, setViewModeState] = useState<ModuleListViewMode>(() =>
    readStoredMode(storageKey),
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
