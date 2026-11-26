// Modified by Sekar Nagarajan (2026-11-26 22:30)
import { useAuthStore, useTenantStore } from "@solverminds/auth";
import {
  clearStoredSessionActivity,
  clearStoredToken,
  getStoredSessionActivity,
  getStoredToken,
  isStoredSessionStale,
  sessionConfig,
} from "@solverminds/platform";

import { sessionMetaOf } from "../utils/session-meta";
import { fetchCurrentSession } from "./auth.api";

/**
 * - `none`: nothing to restore (guest, or already signed in) — carry on.
 * - `restored`: the stored session was verified and is active again.
 * - `expired`: a stored session existed but could not be restored (idle too long, past the absolute
 *   cap, rejected by the server, or the server was unreachable). Credentials are wiped; the caller
 *   sends the user to the login panel.
 */
export type RehydrateResult = "none" | "restored" | "expired";

/**
 * Restore auth from the localStorage token via GET /api/auth/me.
 * Used by the root route beforeLoad so the pending splash can show.
 *
 * A session that sat idle past the idle window (laptop closed, tab forgotten, browser reopened
 * the next day) is dropped BEFORE asking the server: otherwise a refresh would start a fresh idle
 * window and any token the backend still accepts would land on the dashboard.
 */
export async function rehydrateSession(): Promise<RehydrateResult> {
  const { isAuthenticated, setRehydrating, login, logout } = useAuthStore.getState();

  if (isAuthenticated) return "none";

  const token = getStoredToken();
  if (!token) return "none";

  if (isStoredSessionStale(getStoredSessionActivity(), sessionConfig.idleTimeoutMs)) {
    clearStoredToken();
    clearStoredSessionActivity();
    logout("idle");
    return "expired";
  }

  setRehydrating(true);

  try {
    const session = await fetchCurrentSession(token);
    const { user } = session;
    login(token, user, sessionMetaOf(session));
    if (user.tenantId) {
      useTenantStore.getState().setTenant(user.tenantId);
    }
    return "restored";
  } catch {
    clearStoredToken();
    clearStoredSessionActivity();
    logout("session-expired");
    return "expired";
  } finally {
    setRehydrating(false);
  }
}
