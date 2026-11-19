/**
 * Persist `db.vgm` to mock-data/runtime/vgm/ via Vite
 * GET|PUT|DELETE /api/_mock/vgm-db so VGM submit survives refresh.
 *
 * Seed fixtures stay in fixtures/vgm.json; runtime overlay replaces the
 * vgm table after resetDb(). UI never talks to this module — only MSW handlers.
 */
import { bypass } from 'msw';

import {
  ciRow,
  db,
  getRefCounters,
  setRefCounters,
  type Row,
  type TableName,
} from './db';

/** Tables mutated by VGM submit (versioned ecom_vgmsolas rows). */
export const VGM_PERSIST_TABLES = ['vgm'] as const satisfies readonly TableName[];

export type VgmPersistTable = (typeof VGM_PERSIST_TABLES)[number];

export type VgmDbOverlay = {
  version: number;
  counters: Record<string, number>;
  tables: Record<string, Row[]> | null;
};

const VGM_DB_PATH = '/api/_mock/vgm-db';

let readyPromise: Promise<void> | null = null;
let readyResolved = false;

/** Absolute URL — MSW `bypass()` requires a parseable URL (relative paths fail in Node/vitest). */
function vgmDbUrl(): string {
  if (typeof location !== 'undefined' && location.origin) {
    return new URL(VGM_DB_PATH, location.origin).href;
  }
  return `http://localhost${VGM_DB_PATH}`;
}

/** Plain JSON rows (Proxies do not survive stringify). */
function plainRows(rows: Row[] | undefined): Row[] {
  return JSON.parse(JSON.stringify(rows ?? [])) as Row[];
}

/** Snapshot current VGM table + nextRef counters. */
export function snapshotVgmDb(): VgmDbOverlay {
  const tables: Record<string, Row[]> = {};
  for (const name of VGM_PERSIST_TABLES) {
    tables[name] = plainRows(db[name]);
  }
  return { version: 1, counters: getRefCounters(), tables };
}

/**
 * Apply an overlay in memory (tests + rehydrate). Replaces listed tables;
 * missing table keys leave the current db slice unchanged.
 */
export function applyVgmOverlay(overlay: VgmDbOverlay | null | undefined) {
  if (!overlay?.tables) return;
  for (const name of VGM_PERSIST_TABLES) {
    if (!Object.prototype.hasOwnProperty.call(overlay.tables, name)) continue;
    const rows = overlay.tables[name];
    db[name] = (Array.isArray(rows) ? rows : []).map((r) => ciRow({ ...r }));
  }
  setRefCounters(overlay.counters);
}

function canUseRuntimeApi(): boolean {
  try {
    return typeof fetch === 'function' && import.meta.env.DEV === true;
  } catch {
    return false;
  }
}

/** Fire-and-forget write to mock-data/runtime/vgm via Vite. No-op outside DEV. */
export function persistVgmDb(): void {
  if (!canUseRuntimeApi()) return;
  const payload = snapshotVgmDb();
  void fetch(
    bypass(vgmDbUrl(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  ).catch(() => {
    /* Vite middleware absent (vitest / preview) — in-memory state still valid for the session */
  });
}

/** Clear on-disk overlay (demo reset). */
export async function clearVgmDbOverlay(): Promise<void> {
  if (!canUseRuntimeApi()) return;
  try {
    await fetch(bypass(vgmDbUrl(), { method: 'DELETE' }));
  } catch {
    /* ignore */
  }
}

/**
 * Load overlay from disk and apply. Safe to call multiple times; concurrent
 * callers share one promise. Marks the VGM DB ready even when empty/404.
 */
export async function rehydrateVgmDb(): Promise<void> {
  if (readyResolved) return;
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    try {
      if (!canUseRuntimeApi()) return;
      const res = await fetch(bypass(vgmDbUrl()));
      if (!res.ok) return;
      const json = (await res.json()) as { data?: VgmDbOverlay };
      applyVgmOverlay(json.data);
    } catch {
      /* no overlay yet */
    } finally {
      readyResolved = true;
    }
  })();

  return readyPromise;
}

/**
 * Gate search/submit handlers so the first request after boot waits for rehydrate.
 * Outside DEV (or when rehydrate was never started) resolves immediately.
 */
export function ensureVgmDbReady(): Promise<void> {
  if (readyResolved) return Promise.resolve();
  if (readyPromise) return readyPromise;
  return rehydrateVgmDb();
}

/** Test helper: reset the ready gate after resetDb(). */
export function resetVgmDbReadyGate() {
  readyPromise = null;
  readyResolved = false;
}
