/**
 * Persist SI-related `db` tables to mock-data/runtime/si/ via Vite
 * GET|PUT|DELETE /api/_mock/si-db so demo creates survive refresh.
 *
 * Seed fixtures stay in fixtures/*.json; runtime overlay replaces SI tables
 * after resetDb(). Also covers B/L amendment writes (same SI tables).
 * UI never talks to this module — only MSW handlers.
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

/** Tables mutated by SI submit/cancel and B/L draft/submit/amend (shared ecomSI family). */
export const SI_PERSIST_TABLES = [
  'shippingInstructions',
  'siCust',
  'siCargo',
  'siCommodity',
  'siDg',
  'siOog',
  'siReefer',
  'siCharges',
  'siPayers',
  'siFiles',
  'siIcs',
  'siReference',
  'siRequestMaster',
  'siSummary',
  'siLocks',
] as const satisfies readonly TableName[];

export type SiPersistTable = (typeof SI_PERSIST_TABLES)[number];

export type SiDbOverlay = {
  version: number;
  counters: Record<string, number>;
  tables: Record<string, Row[]> | null;
};

const SI_DB_PATH = '/api/_mock/si-db';

let readyPromise: Promise<void> | null = null;
let readyResolved = false;

/** Absolute URL — MSW `bypass()` requires a parseable URL (relative paths fail in Node/vitest). */
function siDbUrl(): string {
  if (typeof location !== 'undefined' && location.origin) {
    return new URL(SI_DB_PATH, location.origin).href;
  }
  return `http://localhost${SI_DB_PATH}`;
}

/** Plain JSON rows (Proxies do not survive stringify). */
function plainRows(rows: Row[] | undefined): Row[] {
  return JSON.parse(JSON.stringify(rows ?? [])) as Row[];
}

/** Snapshot current SI tables + nextRef counters. */
export function snapshotSiDb(): SiDbOverlay {
  const tables: Record<string, Row[]> = {};
  for (const name of SI_PERSIST_TABLES) {
    tables[name] = plainRows(db[name]);
  }
  return { version: 1, counters: getRefCounters(), tables };
}

/**
 * Apply an overlay in memory (tests + rehydrate). Replaces listed tables;
 * missing table keys leave the current db slice unchanged.
 */
export function applySiOverlay(overlay: SiDbOverlay | null | undefined) {
  if (!overlay?.tables) return;
  for (const name of SI_PERSIST_TABLES) {
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

/** Fire-and-forget write to mock-data/runtime/si via Vite. No-op outside DEV. */
export function persistSiDb(): void {
  if (!canUseRuntimeApi()) return;
  const payload = snapshotSiDb();
  void fetch(
    bypass(siDbUrl(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  ).catch(() => {
    /* Vite middleware absent (vitest / preview) — in-memory state still valid for the session */
  });
}

/** Clear on-disk overlay (demo reset). */
export async function clearSiDbOverlay(): Promise<void> {
  if (!canUseRuntimeApi()) return;
  try {
    await fetch(bypass(siDbUrl(), { method: 'DELETE' }));
  } catch {
    /* ignore */
  }
}

/**
 * Load overlay from disk and apply. Safe to call multiple times; concurrent
 * callers share one promise. Marks the SI DB ready even when empty/404.
 */
export async function rehydrateSiDb(): Promise<void> {
  if (readyResolved) return;
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    try {
      if (!canUseRuntimeApi()) return;
      const res = await fetch(bypass(siDbUrl()));
      if (!res.ok) return;
      const json = (await res.json()) as { data?: SiDbOverlay };
      applySiOverlay(json.data);
    } catch {
      /* no overlay yet */
    } finally {
      readyResolved = true;
    }
  })();

  return readyPromise;
}

/**
 * Gate list/detail handlers so the first request after boot waits for rehydrate.
 * Outside DEV (or when rehydrate was never started) resolves immediately.
 */
export function ensureSiDbReady(): Promise<void> {
  if (readyResolved) return Promise.resolve();
  if (readyPromise) return readyPromise;
  return rehydrateSiDb();
}

/** Test helper: reset the ready gate after resetDb(). */
export function resetSiDbReadyGate() {
  readyPromise = null;
  readyResolved = false;
}
