// Created by Sekar Nagarajan (2026-11-26 18:05)
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getStoredSessionActivity } from "@solverminds/platform";

import { useAuthStore, type UserProfile } from "../auth.store";
import { createSessionManager, type SessionManager } from "./session-manager";

const MIN = 60_000;
const config = { idleTimeoutMs: 30 * MIN, warnBeforeMs: 5 * MIN, refreshLeadMs: MIN };

const user: UserProfile = {
  id: "1",
  name: "T",
  email: "t@x.com",
  company: "C",
  role: "CUSTOMER",
  capabilities: [],
  loginType: "U",
};

describe("session manager", () => {
  let mgr: SessionManager;
  let stop: () => void;
  let onExpired: ReturnType<typeof vi.fn>;
  let refresh: ReturnType<typeof vi.fn<() => Promise<string | null>>>;
  let canRefresh = false;

  const start = (opts: { expiresInMs?: number; capInMs?: number } = {}) => {
    mgr = createSessionManager({ config, refresh, canRefresh: () => canRefresh });
    mgr.configure({ onExpired });
    stop = mgr.start();
    useAuthStore.getState().login("tok", user, {
      expiresAt: opts.expiresInMs ? Date.now() + opts.expiresInMs : null,
      sessionExpiresAt: opts.capInMs ? Date.now() + opts.capInMs : null,
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T09:00:00Z"));
    onExpired = vi.fn();
    refresh = vi.fn<() => Promise<string | null>>().mockResolvedValue("tok2");
    canRefresh = false;
    useAuthStore.getState().logout();
  });

  afterEach(() => {
    stop?.();
    useAuthStore.getState().logout();
    vi.useRealTimers();
  });

  it("goes active → warning at 25 min → expired at 30 min (idle)", async () => {
    start();
    expect(mgr.getSnapshot().state).toBe("active");
    await vi.advanceTimersByTimeAsync(25 * MIN);
    expect(mgr.getSnapshot().state).toBe("warning");
    await vi.advanceTimersByTimeAsync(5 * MIN);
    expect(mgr.getSnapshot().state).toBe("expired");
    expect(onExpired).toHaveBeenCalledWith("idle");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().lastLogoutReason).toBe("idle");
  });

  it("activity before the warning pushes the deadline out", async () => {
    start();
    await vi.advanceTimersByTimeAsync(20 * MIN);
    mgr.markActivity();
    await vi.advanceTimersByTimeAsync(20 * MIN); // 40 min total, only 20 idle
    expect(mgr.getSnapshot().state).toBe("active");
    expect(onExpired).not.toHaveBeenCalled();
  });

  it("activity during the warning is ignored; extend() restarts the clock", async () => {
    start();
    await vi.advanceTimersByTimeAsync(26 * MIN);
    expect(mgr.getSnapshot().state).toBe("warning");
    mgr.markActivity();
    expect(mgr.getSnapshot().state).toBe("warning");
    await mgr.extend();
    expect(mgr.getSnapshot().state).toBe("active");
    expect(refresh).not.toHaveBeenCalled(); // no refresher wired → only the idle clock resets
    await vi.advanceTimersByTimeAsync(24 * MIN);
    expect(mgr.getSnapshot().state).toBe("active");
  });

  it("extend() refreshes the token when supported, and expires if the refresh is rejected", async () => {
    canRefresh = true;
    start();
    await vi.advanceTimersByTimeAsync(26 * MIN);
    await mgr.extend();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(mgr.getSnapshot().state).toBe("active");

    await vi.advanceTimersByTimeAsync(26 * MIN);
    refresh.mockResolvedValueOnce(null);
    await mgr.extend();
    expect(mgr.getSnapshot().state).toBe("expired");
    expect(onExpired).toHaveBeenCalledWith("session-expired");
  });

  it("proactively refreshes 60s before the access token expires while active", async () => {
    canRefresh = true;
    refresh.mockImplementation(async () => {
      useAuthStore.getState().setToken("tok2", Date.now() + 15 * MIN);
      return "tok2";
    });
    start({ expiresInMs: 15 * MIN });
    await vi.advanceTimersByTimeAsync(14 * MIN - 1000);
    expect(refresh).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2000);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(mgr.getSnapshot().state).toBe("active");
  });

  it("does not refresh in the warning window (idle user cannot keep the token alive)", async () => {
    canRefresh = true;
    start({ expiresInMs: 28 * MIN });
    await vi.advanceTimersByTimeAsync(27 * MIN + 30_000);
    expect(mgr.getSnapshot().state).toBe("warning");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("expires when the proactive refresh is rejected", async () => {
    canRefresh = true;
    refresh.mockResolvedValue(null);
    start({ expiresInMs: 5 * MIN });
    await vi.advanceTimersByTimeAsync(4 * MIN + 1000);
    expect(mgr.getSnapshot().state).toBe("expired");
    expect(onExpired).toHaveBeenCalledWith("session-expired");
  });

  it("settles to the right state after a sleep (system clock jumps, timers never fired)", () => {
    start();
    vi.setSystemTime(Date.now() + 40 * MIN);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(mgr.getSnapshot().state).toBe("expired");
    expect(onExpired).toHaveBeenCalledWith("idle");
  });

  it("a stray input right after wake cannot rescue an already-idle session", () => {
    start();
    vi.setSystemTime(Date.now() + 27 * MIN);
    window.dispatchEvent(new Event("pointerdown"));
    expect(mgr.getSnapshot().state).toBe("warning");
  });

  it("honours the server's absolute session cap even for an active user", async () => {
    start({ capInMs: 10 * MIN });
    await vi.advanceTimersByTimeAsync(5 * MIN);
    mgr.markActivity();
    await vi.advanceTimersByTimeAsync(5 * MIN);
    expect(mgr.getSnapshot().state).toBe("expired");
    expect(onExpired).toHaveBeenCalledWith("session-expired");
  });

  it("expire() for a guest still notifies (login prompt) without latching an expired state", () => {
    mgr = createSessionManager({ config, refresh, canRefresh: () => false });
    mgr.configure({ onExpired });
    mgr.expire("session-expired");
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(mgr.getSnapshot().state).toBe("inactive");
  });

  it("debounces a burst of expire() calls and recovers on the next login", async () => {
    start();
    mgr.expire("session-expired");
    mgr.expire("session-expired");
    expect(onExpired).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(3000);
    useAuthStore.getState().login("tok3", user, {});
    expect(mgr.getSnapshot().state).toBe("active");
  });

  it("persists last activity (throttled) so a reload can detect an idle session, and clears it on logout", async () => {
    start();
    const loginAt = Date.now();
    expect(getStoredSessionActivity()?.lastActivityAt).toBe(loginAt);

    await vi.advanceTimersByTimeAsync(2000);
    mgr.markActivity(); // inside the 5 s write throttle → not written yet
    expect(getStoredSessionActivity()?.lastActivityAt).toBe(loginAt);

    await vi.advanceTimersByTimeAsync(10_000);
    mgr.markActivity();
    expect(getStoredSessionActivity()?.lastActivityAt).toBe(Date.now());

    useAuthStore.getState().logout();
    expect(getStoredSessionActivity()).toBeNull();
  });

  it("signOut() runs the hook before clearing local state", async () => {
    start();
    const order: string[] = [];
    mgr.configure({
      onSignOut: () => {
        order.push(`hook:${String(useAuthStore.getState().isAuthenticated)}`);
      },
    });
    await mgr.signOut();
    order.push(`after:${String(useAuthStore.getState().isAuthenticated)}`);
    expect(order).toEqual(["hook:true", "after:false"]);
    expect(useAuthStore.getState().lastLogoutReason).toBe("manual");
  });
});
