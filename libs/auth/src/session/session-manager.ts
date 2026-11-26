// Modified by Sekar Nagarajan (2026-11-26 22:25)
/**
 * Framework-free session lifecycle: idle timeout, warning window, absolute session cap and
 * proactive access-token refresh.
 *
 * Everything is timestamp-based (never a ticking counter): one timer is armed for the next
 * deadline and `evaluate()` recomputes state from `now()`, so a sleeping laptop or a throttled
 * background tab lands in the right state as soon as it wakes (visibilitychange / focus / online).
 *
 * States: inactive (signed out) → active → warning (inside the warn window) → expired.
 * User activity resets the idle clock only while `active`; once the warning is showing, the user
 * must explicitly `extend()` (standard behaviour, avoids a stray mouse move hiding the warning).
 */
import {
  getStoredSessionActivity,
  hasSessionRefresher,
  refreshAccessToken,
  sessionConfig,
  setStoredSessionActivity,
  type SessionConfig,
} from "@solverminds/platform";

import { useAuthStore, type LogoutReason } from "../auth.store";

export type SessionState = "inactive" | "active" | "warning" | "expired";

export interface SessionSnapshot {
  state: SessionState;
  /** Epoch ms the session ends unless extended; null when signed out. */
  deadlineAt: number | null;
}

export interface SessionHooks {
  /** Called after the session ended (idle, absolute cap, refresh rejected, or a 401). */
  onExpired?: (reason: LogoutReason) => void;
  /** Called before a manual sign-out clears local state (revoke the refresh token here). */
  onSignOut?: () => Promise<void> | void;
  /** Called after a manual sign-out finished clearing local state (navigate away here). */
  onSignedOut?: () => void;
}

export interface SessionManagerOptions {
  config: SessionConfig;
  now: () => number;
  /** Resolves the new token, or null when the session cannot be renewed. */
  refresh: () => Promise<string | null>;
  /** False when no refresh endpoint is wired (mock mode / backend not ready). */
  canRefresh: () => boolean;
}

/** Local events other tabs care about (consumed by session-sync). Remote-applied changes never emit. */
export type SessionEvent = { type: "activity"; at: number } | { type: "extended"; at: number };

const ACTIVITY_THROTTLE_MS = 1000;
const MIN_REFRESH_GAP_MS = 5000;
const PERSIST_THROTTLE_MS = 5000;
const EXPIRE_DEBOUNCE_MS = 2000;
const MAX_TIMER_MS = 2 ** 31 - 1;
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

export function createSessionManager(overrides: Partial<SessionManagerOptions> = {}) {
  const config = overrides.config ?? sessionConfig;
  const now = overrides.now ?? (() => Date.now());
  const refresh = overrides.refresh ?? refreshAccessToken;
  const canRefresh = overrides.canRefresh ?? hasSessionRefresher;

  let state: SessionState = "inactive";
  let snapshot: SessionSnapshot = { state: "inactive", deadlineAt: null };
  let lastActivityAt = now();
  let lastRefreshAt = Number.NEGATIVE_INFINITY;
  let lastExpiredAt = Number.NEGATIVE_INFINITY;
  let refreshing = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let hooks: SessionHooks = {};
  let stopListening: (() => void) | null = null;
  const listeners = new Set<() => void>();
  const eventListeners = new Set<(event: SessionEvent) => void>();
  const emit = (event: SessionEvent) => eventListeners.forEach((listener) => listener(event));

  const auth = () => useAuthStore.getState();

  let lastPersistAt = Number.NEGATIVE_INFINITY;
  /**
   * Mirror the idle clock into localStorage so a reload / reopened browser can tell the session
   * went stale (see `rehydrateSession`). `throttled` limits write frequency; `force` always writes
   * but never moves another tab's newer activity backwards; `reset` writes exactly (fresh login).
   */
  const persist = (mode: "throttled" | "force" | "reset" = "throttled") => {
    if (!auth().isAuthenticated) return;
    const t = now();
    if (mode === "throttled" && t - lastPersistAt < PERSIST_THROTTLE_MS) return;
    lastPersistAt = t;
    const newest =
      mode === "reset"
        ? lastActivityAt
        : Math.max(getStoredSessionActivity()?.lastActivityAt ?? 0, lastActivityAt);
    setStoredSessionActivity({ lastActivityAt: newest, sessionExpiresAt: auth().sessionExpiresAt });
  };

  // Re-read after awaits: `state` is mutated by timers/expire() while a call is suspended.
  const currentState = (): SessionState => state;

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const publish = (deadlineAt: number | null) => {
    if (snapshot.state === state && snapshot.deadlineAt === deadlineAt) return;
    snapshot = { state, deadlineAt };
    listeners.forEach((listener) => listener());
  };

  const idleDeadline = () => lastActivityAt + config.idleTimeoutMs;

  /** Earlier of the idle deadline and the server's absolute session cap. */
  const deadline = () => {
    const cap = auth().sessionExpiresAt;
    return cap !== null ? Math.min(idleDeadline(), cap) : idleDeadline();
  };

  /** When to silently renew the access token; null when unknown or unsupported. */
  const refreshAt = (): number | null => {
    const { expiresAt } = auth();
    if (expiresAt === null || !canRefresh()) return null;
    return Math.max(expiresAt - config.refreshLeadMs, lastRefreshAt + MIN_REFRESH_GAP_MS);
  };

  function expire(reason: LogoutReason): void {
    const t = now();
    if (t - lastExpiredAt < EXPIRE_DEBOUNCE_MS) return; // burst of 401s / racing timers
    lastExpiredAt = t;
    const wasAuthenticated = auth().isAuthenticated;
    clearTimer();
    if (wasAuthenticated) {
      state = "expired";
      publish(null);
    }
    auth().logout(reason);
    hooks.onExpired?.(reason);
  }

  async function runRefresh(): Promise<void> {
    if (refreshing) return;
    refreshing = true;
    lastRefreshAt = now();
    try {
      const token = await refresh();
      if (!token) {
        expire("session-expired");
        return;
      }
    } catch {
      expire("session-expired");
      return;
    } finally {
      refreshing = false;
    }
    evaluate();
  }

  function evaluate(): void {
    clearTimer();
    if (!auth().isAuthenticated) {
      if (state !== "expired") {
        state = "inactive";
        publish(null);
      }
      return;
    }

    const t = now();
    const end = deadline();
    if (t >= end) {
      const capHit = auth().sessionExpiresAt !== null && t >= (auth().sessionExpiresAt as number);
      expire(capHit ? "session-expired" : "idle");
      return;
    }

    const warnAt = end - config.warnBeforeMs;
    state = t >= warnAt ? "warning" : "active";
    publish(end);

    let next = state === "warning" ? end : warnAt;
    if (state === "active") {
      const renewAt = refreshAt();
      if (renewAt !== null) {
        if (t >= renewAt) void runRefresh();
        else next = Math.min(next, renewAt);
      }
    }
    timer = setTimeout(evaluate, Math.min(Math.max(next - t, 0), MAX_TIMER_MS));
  }

  /** User interacted. Resets the idle clock only while `active` (see header). */
  function markActivity(): void {
    if (state !== "active") return;
    const t = now();
    if (t - lastActivityAt < ACTIVITY_THROTTLE_MS) return;
    // Timers may have been throttled/slept past the warn window: settle state before trusting this input.
    if (t >= deadline() - config.warnBeforeMs) {
      evaluate();
      return;
    }
    lastActivityAt = t;
    persist();
    evaluate();
    emit({ type: "activity", at: t });
  }

  /** Activity reported by another tab: a busy tab keeps every tab's idle clock alive. */
  function syncActivity(at: number): void {
    if (state !== "active" || at <= lastActivityAt || at > now()) return;
    lastActivityAt = at;
    persist();
    evaluate();
  }

  /** "Stay signed in" clicked in another tab: dismiss our warning and restart the idle clock. */
  function syncExtended(at: number): void {
    if (!auth().isAuthenticated || state === "expired") return;
    if (at <= lastActivityAt || at > now()) return;
    lastActivityAt = at;
    persist();
    evaluate();
  }

  /** "Stay signed in": renew the token (when supported) and restart the idle clock. */
  async function extend(): Promise<void> {
    if (!auth().isAuthenticated || state === "expired") return;
    if (canRefresh()) {
      let token: string | null = null;
      try {
        token = await refresh();
      } catch {
        token = null;
      }
      if (!token) {
        expire("session-expired");
        return;
      }
      lastRefreshAt = now();
    }
    if (currentState() === "expired" || !auth().isAuthenticated) return; // ended while we waited
    lastActivityAt = now();
    persist("force");
    evaluate();
    emit({ type: "extended", at: lastActivityAt });
  }

  async function signOut(): Promise<void> {
    try {
      await hooks.onSignOut?.();
    } catch {
      /* best effort — local sign-out proceeds regardless */
    }
    clearTimer();
    auth().logout("manual");
    hooks.onSignedOut?.();
  }

  function configure(next: SessionHooks): void {
    hooks = next;
  }

  /** Begin watching the auth store and the page. Returns a stop function. */
  function start(): () => void {
    if (stopListening) return stopListening;

    const unsubscribeStore = useAuthStore.subscribe((next, prev) => {
      if (next.isAuthenticated && !prev.isAuthenticated) {
        lastActivityAt = now(); // a fresh login / rehydrate starts a fresh idle window
        persist("reset");
        evaluate();
      } else if (
        next.isAuthenticated !== prev.isAuthenticated ||
        next.expiresAt !== prev.expiresAt ||
        next.sessionExpiresAt !== prev.sessionExpiresAt
      ) {
        if (next.sessionExpiresAt !== prev.sessionExpiresAt) persist("force");
        evaluate();
      }
    });

    const onActivity = () => markActivity();
    const onWake = () => {
      if (typeof document === "undefined" || document.visibilityState !== "hidden") evaluate();
      else persist("force"); // tab hidden / about to close: leave an accurate last-activity behind
    };
    const onPageHide = () => persist("force");
    ACTIVITY_EVENTS.forEach((name) =>
      window.addEventListener(name, onActivity, { passive: true, capture: true }),
    );
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);
    window.addEventListener("pagehide", onPageHide);

    stopListening = () => {
      unsubscribeStore();
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity, true));
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
      window.removeEventListener("pagehide", onPageHide);
      clearTimer();
      stopListening = null;
    };

    if (auth().isAuthenticated) {
      lastActivityAt = now();
      persist("reset");
      evaluate();
    }
    return stopListening;
  }

  return {
    start,
    configure,
    extend,
    signOut,
    expire,
    markActivity,
    syncActivity,
    syncExtended,
    evaluate,
    subscribeEvents: (listener: (event: SessionEvent) => void) => {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
}

export type SessionManager = ReturnType<typeof createSessionManager>;

/** App-wide instance; wired in `main.tsx`. */
export const sessionManager: SessionManager = createSessionManager();
