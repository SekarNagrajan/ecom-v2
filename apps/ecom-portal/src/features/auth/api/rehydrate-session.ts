// Modified by Sekar Nagarajan (2026-09-07 16:56)
import { useAuthStore, useTenantStore } from "@solverminds/auth";

import { fetchCurrentUser } from "./auth.api";

const AUTH_TOKEN_KEY = "ecom_auth_token";

/**
 * Restore auth from localStorage token via GET /api/auth/me.
 * Used by the root route beforeLoad so the pending splash can show.
 */
export async function rehydrateSession(): Promise<void> {
  const { isAuthenticated, setRehydrating, login, logout } =
    useAuthStore.getState();

  if (isAuthenticated) return;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return;

  setRehydrating(true);

  try {
    const user = await fetchCurrentUser(token);
    login(token, user);
    if (user.tenantId) {
      useTenantStore.getState().setTenant(user.tenantId);
    }
  } catch {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    logout();
  } finally {
    setRehydrating(false);
  }
}
