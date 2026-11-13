// Created by Sekar Nagarajan (2026-11-12 13:20)
import { useState } from "react";

/**
 * Local, unsaved edits layered over a server list (React Query data) as a per-id overrides map.
 * Replaces the copy-pasted "signature + setState during render" sync: the merged list is derived
 * on every render, so a background refetch never wipes pending edits, and an override that
 * matches the fresh server value simply stops counting as dirty.
 */
export interface DraftList<T> {
  /** Server items with pending overrides applied. */
  items: T[];
  /** Pending edits by id (only keys that differ from the server value). */
  overrides: Record<string, Partial<T>>;
  updateItem: (id: string, patch: Partial<T>) => void;
  revertItem: (id: string) => void;
  reset: () => void;
  isItemDirty: (id: string) => boolean;
  dirtyIds: string[];
  dirtyCount: number;
  isDirty: boolean;
}

function dropUnchanged<T>(base: T | undefined, patch: Partial<T>): Partial<T> {
  if (!base) return patch;
  const next: Partial<T> = {};
  for (const key of Object.keys(patch) as (keyof T)[]) {
    if (!Object.is(patch[key], base[key])) next[key] = patch[key];
  }
  return next;
}

export function useDraftList<T>(
  serverItems: T[],
  getId: (item: T) => string,
): DraftList<T> {
  const [overrides, setOverrides] = useState<Record<string, Partial<T>>>({});

  const byId = new Map(serverItems.map((item) => [getId(item), item]));

  // Derived: an override only counts while it still differs from the server row.
  const effective: Record<string, Partial<T>> = {};
  for (const [id, patch] of Object.entries(overrides)) {
    const trimmed = dropUnchanged(byId.get(id), patch);
    if (Object.keys(trimmed).length > 0) effective[id] = trimmed;
  }

  const items = serverItems.map((item) => {
    const patch = effective[getId(item)];
    return patch ? { ...item, ...patch } : item;
  });

  const updateItem = (id: string, patch: Partial<T>) => {
    setOverrides((prev) => {
      const merged = dropUnchanged(byId.get(id), { ...(prev[id] ?? {}), ...patch });
      const next = { ...prev };
      if (Object.keys(merged).length > 0) next[id] = merged;
      else delete next[id];
      return next;
    });
  };

  const revertItem = (id: string) => {
    setOverrides((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const reset = () => setOverrides({});

  const dirtyIds = Object.keys(effective);

  return {
    items,
    overrides: effective,
    updateItem,
    revertItem,
    reset,
    isItemDirty: (id) => id in effective,
    dirtyIds,
    dirtyCount: dirtyIds.length,
    isDirty: dirtyIds.length > 0,
  };
}
