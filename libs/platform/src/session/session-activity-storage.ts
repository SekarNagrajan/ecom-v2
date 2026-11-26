// Created by Sekar Nagarajan (2026-11-26 22:10)
/**
 * Persisted idle bookkeeping, so the idle timeout survives a page reload / reopened browser.
 * Without it a refresh starts a brand-new idle window and a long-abandoned token would restore
 * straight onto the dashboard. Written by the session manager; read before a session is rehydrated.
 */
const ACTIVITY_KEY = "ecom_session_activity";

export interface StoredSessionActivity {
  /** Epoch ms of the user's last activity in ANY tab. */
  lastActivityAt: number;
  /** Absolute session end (epoch ms), when the server provided one. */
  sessionExpiresAt: number | null;
}

export function getStoredSessionActivity(): StoredSessionActivity | null {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { lastActivityAt, sessionExpiresAt } = parsed as Record<string, unknown>;
    if (typeof lastActivityAt !== "number" || !Number.isFinite(lastActivityAt)) return null;
    return {
      lastActivityAt,
      sessionExpiresAt:
        typeof sessionExpiresAt === "number" && Number.isFinite(sessionExpiresAt)
          ? sessionExpiresAt
          : null,
    };
  } catch {
    return null;
  }
}

export function setStoredSessionActivity(value: StoredSessionActivity): void {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — idle then only applies within this page load */
  }
}

export function clearStoredSessionActivity(): void {
  try {
    localStorage.removeItem(ACTIVITY_KEY);
  } catch {
    /* nothing to clear */
  }
}

/**
 * True when a stored session is past its idle window or absolute cap and must not be restored.
 * No record (first run after upgrade, cleared storage) is NOT stale — we cannot tell, so the
 * server's verdict on the token decides.
 */
export function isStoredSessionStale(
  stored: StoredSessionActivity | null,
  idleTimeoutMs: number,
  now: number = Date.now(),
): boolean {
  if (!stored) return false;
  if (now - stored.lastActivityAt >= idleTimeoutMs) return true;
  return stored.sessionExpiresAt !== null && now >= stored.sessionExpiresAt;
}
