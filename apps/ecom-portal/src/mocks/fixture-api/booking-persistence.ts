/**
 * Persist booking-related `db` tables to mock-data/runtime/ via Vite
 * GET|PUT|DELETE /api/_mock/booking-db so demo creates survive refresh.
 *
 * Seed fixtures stay in fixtures/*.json; runtime overlay replaces booking
 * tables after resetDb(). UI never talks to this module — only MSW handlers.
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

/** Tables mutated by booking submit / draft / amend / cancel / templates. */
export const BOOKING_PERSIST_TABLES = [
  'bookings',
  'bookingCust',
  'bookingCargo',
  'bookingCommodity',
  'bookingDg',
  'bookingOog',
  'bookingRefer',
  'bookingLeg',
  'bookingHaulage',
  'bookingConf',
  'bookingFiles',
  'bookingIcs',
  'insurance',
  'bookingReference',
  'bookingCancel',
  'bookingSummary',
] as const satisfies readonly TableName[];

export type BookingPersistTable = (typeof BOOKING_PERSIST_TABLES)[number];

export type BookingDbOverlay = {
  version: number;
  counters: Record<string, number>;
  tables: Record<string, Row[]> | null;
};

const BOOKING_DB_PATH = '/api/_mock/booking-db';

let readyPromise: Promise<void> | null = null;
let readyResolved = false;

/** Absolute URL — MSW `bypass()` requires a parseable URL (relative paths fail in Node/vitest). */
function bookingDbUrl(): string {
  if (typeof location !== 'undefined' && location.origin) {
    return new URL(BOOKING_DB_PATH, location.origin).href;
  }
  return `http://localhost${BOOKING_DB_PATH}`;
}

/** Plain JSON rows (Proxies do not survive stringify). */
function plainRows(rows: Row[] | undefined): Row[] {
  return JSON.parse(JSON.stringify(rows ?? [])) as Row[];
}

/** Snapshot current booking tables + nextRef counters. */
export function snapshotBookingDb(): BookingDbOverlay {
  const tables: Record<string, Row[]> = {};
  for (const name of BOOKING_PERSIST_TABLES) {
    tables[name] = plainRows(db[name]);
  }
  return { version: 1, counters: getRefCounters(), tables };
}

/**
 * Apply an overlay in memory (tests + rehydrate). Replaces listed tables;
 * missing table keys leave the current db slice unchanged.
 */
export function applyBookingOverlay(overlay: BookingDbOverlay | null | undefined) {
  if (!overlay?.tables) return;
  for (const name of BOOKING_PERSIST_TABLES) {
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

/** Fire-and-forget write to mock-data/runtime via Vite. No-op outside DEV. */
export function persistBookingDb(): void {
  if (!canUseRuntimeApi()) return;
  const payload = snapshotBookingDb();
  void fetch(
    bypass(bookingDbUrl(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  ).catch(() => {
    /* Vite middleware absent (vitest / preview) — in-memory state still valid for the session */
  });
}

/** Clear on-disk overlay (demo reset). */
export async function clearBookingDbOverlay(): Promise<void> {
  if (!canUseRuntimeApi()) return;
  try {
    await fetch(bypass(bookingDbUrl(), { method: 'DELETE' }));
  } catch {
    /* ignore */
  }
}

/**
 * Load overlay from disk and apply. Safe to call multiple times; concurrent
 * callers share one promise. Marks the booking DB ready even when empty/404.
 */
export async function rehydrateBookingDb(): Promise<void> {
  if (readyResolved) return;
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    try {
      if (!canUseRuntimeApi()) return;
      const res = await fetch(bypass(bookingDbUrl()));
      if (!res.ok) return;
      const json = (await res.json()) as { data?: BookingDbOverlay };
      applyBookingOverlay(json.data);
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
export function ensureBookingDbReady(): Promise<void> {
  if (readyResolved) return Promise.resolve();
  if (readyPromise) return readyPromise;
  return rehydrateBookingDb();
}

/** Test helper: reset the ready gate after resetDb(). */
export function resetBookingDbReadyGate() {
  readyPromise = null;
  readyResolved = false;
}
