// Modified by Sekar Nagarajan (2026-11-26 17:50)
/**
 * Shared 401 recovery used by BOTH HTTP clients (axios `apiClient` and the portal's fetch `api`).
 *
 * - `registerSessionRefresher` lets the app plug in the real `/auth/refresh` call (platform cannot
 *   import auth/feature code).
 * - `refreshAccessToken` is single-flight: N parallel 401s trigger exactly one refresh.
 * - `notifySessionExpired` is debounced so a burst of failures produces one logout/redirect.
 */
import { getStoredToken } from "./token-storage";

export const UNAUTHORIZED_EVENT = "ecom:unauthorized";

/** Auth endpoints whose 401 is handled by their caller (bad credentials, probe, refresh itself). */
const AUTH_RECOVERY_EXEMPT = /\/auth\/(me|login|admin-login|refresh|logout)(\?|$)/;

export function isAuthRecoveryExempt(url: string | undefined | null): boolean {
  return AUTH_RECOVERY_EXEMPT.test(url ?? "");
}

/** Returns the new access token, or throws when the session cannot be renewed. */
export type SessionRefresher = () => Promise<string>;

let refresher: SessionRefresher | null = null;
let inFlight: Promise<string | null> | null = null;

export function registerSessionRefresher(fn: SessionRefresher | null): void {
  refresher = fn;
}

export function hasSessionRefresher(): boolean {
  return refresher !== null;
}

/**
 * Renew the access token once for all concurrent callers.
 * Resolves null (never throws) when there is no session to renew, no refresher is registered,
 * or the refresh was rejected — callers then treat the session as expired.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refresher || !getStoredToken()) return Promise.resolve(null);
  if (!inFlight) {
    inFlight = refresher()
      .catch(() => null)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

const NOTIFY_WINDOW_MS = 2000;
let lastNotifiedAt = 0;

/** Tell the app the session is over. Debounced; the app listener performs logout + redirect. */
export function notifySessionExpired(reason: "session-expired" = "session-expired"): void {
  const now = Date.now();
  if (now - lastNotifiedAt < NOTIFY_WINDOW_MS) return;
  lastNotifiedAt = now;
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: { reason } }));
}

/** Test hook: clear module state between cases. */
export function resetAuthRecoveryForTests(): void {
  refresher = null;
  inFlight = null;
  lastNotifiedAt = 0;
}

/**
 * Run a request; on 401 refresh once and replay it with the new token, otherwise expire the session.
 * `run` receives the token to use (undefined = whatever the client attaches by default).
 */
export async function withAuthRetry<T>(
  run: (token?: string) => Promise<T>,
  isUnauthorized: (error: unknown) => boolean,
  url: string,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isUnauthorized(error) || isAuthRecoveryExempt(url)) throw error;
    const token = await refreshAccessToken();
    if (!token) {
      notifySessionExpired();
      throw error;
    }
    try {
      return await run(token);
    } catch (retryError) {
      if (isUnauthorized(retryError)) notifySessionExpired();
      throw retryError;
    }
  }
}
