// Created by Sekar Nagarajan (2026-11-26 19:10)
import { useAuthStore } from "@solverminds/auth";
import { queryClient } from "@solverminds/platform";

/**
 * Drop everything that belongs to the signed-in user the moment the session ends, whatever ended
 * it (manual sign-out, idle, absolute cap, refresh rejected, 401, or another tab). Without this the
 * query cache — bookings, statements, profile — would still be readable by the next person to log
 * in on this browser. Tenant branding is public data and is intentionally kept.
 * Impersonation lives on the user profile, so `logout()` already clears it.
 */
export function wireSessionCleanup(): void {
  useAuthStore.subscribe((next, prev) => {
    if (!prev.isAuthenticated || next.isAuthenticated) return;
    void queryClient.cancelQueries();
    queryClient.clear();
  });
}
