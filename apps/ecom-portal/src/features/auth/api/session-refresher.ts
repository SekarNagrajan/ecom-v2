// Created by Sekar Nagarajan (2026-11-26 17:15)
import { useAuthStore } from "@solverminds/auth";
import { registerSessionRefresher } from "@solverminds/platform";

import { refreshSession } from "./auth.api";

/**
 * Plug the real `/auth/refresh` call into the shared 401 recovery (libs/platform auth-recovery).
 * The access token in the store/localStorage is swapped in place; the user profile is untouched.
 */
export function wireSessionRefresher(): void {
  registerSessionRefresher(async () => {
    const { token, expiresAt } = await refreshSession();
    useAuthStore.getState().setToken(token, expiresAt);
    return token;
  });
}
