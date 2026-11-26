// Created by Sekar Nagarajan (2026-11-26 18:40)
/**
 * Glue between the auth store, the session manager and the tab channel.
 *
 * Outbound: logout and token swaps (observed on the store, so every logout path is covered),
 * plus the manager's local `activity` / `extended` events (activity throttled to ~15 s).
 * Inbound: applied under `applyingRemote` so a change caused by another tab is never echoed back.
 */
import { getStoredToken } from "@solverminds/platform";

import { useAuthStore, type LogoutReason } from "../auth.store";
import { createDefaultTransport, type SessionTransport } from "./session-channel";
import type { SessionManager } from "./session-manager";

export interface SessionSyncOptions {
  manager: SessionManager;
  /** Defaults to BroadcastChannel with a localStorage fallback. */
  transport?: SessionTransport;
  /** The session ended in another tab; the app navigates to the login screen. */
  onRemoteLogout?: (reason: LogoutReason) => void;
  /** Minimum gap between ACTIVITY broadcasts. */
  activityBroadcastIntervalMs?: number;
  now?: () => number;
}

export function startSessionSync(options: SessionSyncOptions): () => void {
  const { manager, onRemoteLogout } = options;
  const transport = options.transport ?? createDefaultTransport();
  const activityIntervalMs = options.activityBroadcastIntervalMs ?? 15_000;
  const now = options.now ?? (() => Date.now());

  let applyingRemote = false;
  let lastActivityPostAt = Number.NEGATIVE_INFINITY;
  const applyRemote = (fn: () => void) => {
    applyingRemote = true;
    try {
      fn();
    } finally {
      applyingRemote = false;
    }
  };

  // --- outbound ---
  const unsubscribeStore = useAuthStore.subscribe((next, prev) => {
    if (applyingRemote) return;
    if (prev.isAuthenticated && !next.isAuthenticated) {
      transport.post({ type: "LOGOUT", reason: next.lastLogoutReason ?? "manual" });
    } else if (
      prev.isAuthenticated &&
      next.isAuthenticated &&
      prev.token &&
      next.token &&
      prev.token !== next.token
    ) {
      transport.post({ type: "TOKEN_REFRESHED", expiresAt: next.expiresAt });
    }
  });

  const unsubscribeEvents = manager.subscribeEvents((event) => {
    if (event.type === "extended") {
      transport.post({ type: "EXTENDED", at: event.at });
      return;
    }
    const t = now();
    if (t - lastActivityPostAt < activityIntervalMs) return;
    lastActivityPostAt = t;
    transport.post({ type: "ACTIVITY", at: event.at });
  });

  // --- inbound ---
  const unsubscribeMessages = transport.onMessage((message) => {
    const auth = useAuthStore.getState();
    switch (message.type) {
      case "LOGOUT": {
        if (!auth.isAuthenticated) return; // guest tab: nothing to end
        applyRemote(() => auth.logout(message.reason === "manual" ? "other-tab" : message.reason));
        onRemoteLogout?.(message.reason);
        return;
      }
      case "TOKEN_REFRESHED": {
        if (!auth.isAuthenticated) return;
        // The new token is already in localStorage (shared); the message only carries the expiry.
        const stored = getStoredToken();
        if (stored && stored !== auth.token) {
          applyRemote(() => auth.setToken(stored, message.expiresAt));
        }
        return;
      }
      case "ACTIVITY":
        manager.syncActivity(message.at);
        return;
      case "EXTENDED":
        manager.syncExtended(message.at);
        return;
    }
  });

  return () => {
    unsubscribeStore();
    unsubscribeEvents();
    unsubscribeMessages();
    transport.close();
  };
}
