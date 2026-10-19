/**
 * Persist user / account-lifecycle `db` tables + session sidecars to
 * mock-data/runtime/user/ via Vite GET|PUT|DELETE /api/_mock/user-db so
 * My Account, sub-users, registration, activate, quotes, and profile photo
 * survive refresh.
 *
 * Seed fixtures stay in fixtures/*.json; runtime overlay replaces listed
 * tables and restores session state after resetDb(). UI never talks to this
 * module — only MSW handlers.
 */
import { bypass } from 'msw';

import type { QuoteDTO } from '../../features/rates/types/rates.types';
import type { AlertPreference } from '../../features/user-modules/types/user-modules.types';
import {
  getProfilePhoto,
  replaceProfilePhoto,
  type ProfilePhotoSnapshot,
} from '../profile-photo.store';
import {
  getSessionQuotes,
  replaceSessionQuotes,
} from './bridges/rates.bridge';
import {
  getAlertOverrides,
  replaceAlertOverrides,
} from './bridges/user.bridge';
import {
  ciRow,
  db,
  getRefCounters,
  setRefCounters,
  type Row,
  type TableName,
} from './db';

/** Tables mutated by profile, alerts, sub-users, registration, activate. */
export const USER_PERSIST_TABLES = [
  'users',
  'userDetails',
  'mailAlerts',
  'customerNotifications',
  'customerUsers',
  'ECOMRegHistory',
] as const satisfies readonly TableName[];

export type UserPersistTable = (typeof USER_PERSIST_TABLES)[number];

export type UserSessionSidecar = {
  alertOverrides: Partial<AlertPreference>;
  quotes: QuoteDTO[];
  profilePhoto: ProfilePhotoSnapshot;
};

export type UserDbOverlay = {
  version: number;
  counters: Record<string, number>;
  tables: Record<string, Row[]> | null;
  sidecars?: {
    session?: UserSessionSidecar;
  };
};

const USER_DB_PATH = '/api/_mock/user-db';

let readyPromise: Promise<void> | null = null;
let readyResolved = false;

/** Absolute URL — MSW `bypass()` requires a parseable URL (relative paths fail in Node/vitest). */
function userDbUrl(): string {
  if (typeof location !== 'undefined' && location.origin) {
    return new URL(USER_DB_PATH, location.origin).href;
  }
  return `http://localhost${USER_DB_PATH}`;
}

/** Plain JSON rows (Proxies do not survive stringify). */
function plainRows(rows: Row[] | undefined): Row[] {
  return JSON.parse(JSON.stringify(rows ?? [])) as Row[];
}

/** Snapshot current user tables + nextRef counters + session sidecar. */
export function snapshotUserDb(): UserDbOverlay {
  const tables: Record<string, Row[]> = {};
  for (const name of USER_PERSIST_TABLES) {
    tables[name] = plainRows(db[name]);
  }
  return {
    version: 1,
    counters: getRefCounters(),
    tables,
    sidecars: {
      session: {
        alertOverrides: getAlertOverrides(),
        quotes: getSessionQuotes(),
        profilePhoto: getProfilePhoto(),
      },
    },
  };
}

/**
 * Apply an overlay in memory (tests + rehydrate). Replaces listed tables;
 * missing table keys leave the current db slice unchanged. Session sidecar
 * always replaces when present.
 */
export function applyUserOverlay(overlay: UserDbOverlay | null | undefined) {
  if (!overlay) return;
  if (overlay.tables) {
    for (const name of USER_PERSIST_TABLES) {
      if (!Object.prototype.hasOwnProperty.call(overlay.tables, name)) continue;
      const rows = overlay.tables[name];
      db[name] = (Array.isArray(rows) ? rows : []).map((r) => ciRow({ ...r }));
    }
  }
  if (overlay.counters) setRefCounters(overlay.counters);
  const session = overlay.sidecars?.session;
  if (session) {
    replaceAlertOverrides(session.alertOverrides ?? {});
    replaceSessionQuotes(session.quotes ?? []);
    replaceProfilePhoto(session.profilePhoto);
  }
}

function canUseRuntimeApi(): boolean {
  try {
    return typeof fetch === 'function' && import.meta.env.DEV === true;
  } catch {
    return false;
  }
}

/** Fire-and-forget write to mock-data/runtime/user via Vite. No-op outside DEV. */
export function persistUserDb(): void {
  if (!canUseRuntimeApi()) return;
  const payload = snapshotUserDb();
  void fetch(
    bypass(userDbUrl(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  ).catch(() => {
    /* Vite middleware absent (vitest / preview) — in-memory state still valid for the session */
  });
}

/** Clear on-disk overlay (demo reset). */
export async function clearUserDbOverlay(): Promise<void> {
  if (!canUseRuntimeApi()) return;
  try {
    await fetch(bypass(userDbUrl(), { method: 'DELETE' }));
  } catch {
    /* ignore */
  }
}

/**
 * Load overlay from disk and apply. Safe to call multiple times; concurrent
 * callers share one promise. Marks the user DB ready even when empty/404.
 */
export async function rehydrateUserDb(): Promise<void> {
  if (readyResolved) return;
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    try {
      if (!canUseRuntimeApi()) return;
      const res = await fetch(bypass(userDbUrl()));
      if (!res.ok) return;
      const json = (await res.json()) as { data?: UserDbOverlay };
      applyUserOverlay(json.data);
    } catch {
      /* no overlay yet */
    } finally {
      readyResolved = true;
    }
  })();

  return readyPromise;
}

/**
 * Gate account / profile handlers so the first request after boot waits for rehydrate.
 * Outside DEV (or when rehydrate was never started) resolves immediately.
 */
export function ensureUserDbReady(): Promise<void> {
  if (readyResolved) return Promise.resolve();
  if (readyPromise) return readyPromise;
  return rehydrateUserDb();
}

/** Test helper: reset the ready gate after resetDb(). */
export function resetUserDbReadyGate() {
  readyPromise = null;
  readyResolved = false;
}
