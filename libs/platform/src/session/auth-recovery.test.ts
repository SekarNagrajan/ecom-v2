// Created by Sekar Nagarajan (2026-11-26 17:30)
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isAuthRecoveryExempt,
  notifySessionExpired,
  refreshAccessToken,
  registerSessionRefresher,
  resetAuthRecoveryForTests,
  UNAUTHORIZED_EVENT,
  withAuthRetry,
} from "./auth-recovery";
import { clearStoredToken, setStoredToken } from "./token-storage";

class Unauthorized extends Error {}
const isUnauthorized = (e: unknown) => e instanceof Unauthorized;

describe("auth-recovery", () => {
  let events: number;
  const onEvent = () => {
    events += 1;
  };

  beforeEach(() => {
    events = 0;
    resetAuthRecoveryForTests();
    setStoredToken("old-token");
    window.addEventListener(UNAUTHORIZED_EVENT, onEvent);
  });

  afterEach(() => {
    window.removeEventListener(UNAUTHORIZED_EVENT, onEvent);
    clearStoredToken();
    vi.useRealTimers();
  });

  it("exempts credential/probe/refresh endpoints", () => {
    for (const p of [
      "/api/auth/me",
      "/api/auth/login",
      "/api/auth/admin-login",
      "/api/auth/refresh",
      "/api/auth/logout",
    ]) {
      expect(isAuthRecoveryExempt(p)).toBe(true);
    }
    expect(isAuthRecoveryExempt("/api/bookings")).toBe(false);
  });

  it("runs ONE refresh for N concurrent callers", async () => {
    const refresher = vi.fn().mockResolvedValue("new-token");
    registerSessionRefresher(refresher);
    const results = await Promise.all([1, 2, 3, 4, 5].map(() => refreshAccessToken()));
    expect(refresher).toHaveBeenCalledTimes(1);
    expect(results).toEqual(Array(5).fill("new-token"));
  });

  it("resolves null (no throw) when refresh fails, no refresher, or no stored token", async () => {
    registerSessionRefresher(() => Promise.reject(new Error("401")));
    expect(await refreshAccessToken()).toBeNull();
    registerSessionRefresher(null);
    expect(await refreshAccessToken()).toBeNull();
    registerSessionRefresher(() => Promise.resolve("x"));
    clearStoredToken();
    expect(await refreshAccessToken()).toBeNull();
  });

  it("debounces expiry notifications", () => {
    vi.useFakeTimers();
    notifySessionExpired();
    notifySessionExpired();
    expect(events).toBe(1);
    vi.advanceTimersByTime(2500);
    notifySessionExpired();
    expect(events).toBe(2);
  });

  it("withAuthRetry: 401 → refresh → replay succeeds with new token", async () => {
    registerSessionRefresher(() => Promise.resolve("fresh"));
    const run = vi
      .fn<(t?: string) => Promise<string>>()
      .mockRejectedValueOnce(new Unauthorized())
      .mockResolvedValueOnce("ok");
    await expect(withAuthRetry(run, isUnauthorized, "/api/x")).resolves.toBe("ok");
    expect(run).toHaveBeenNthCalledWith(2, "fresh");
    expect(events).toBe(0);
  });

  it("withAuthRetry: refresh failure expires the session and rethrows", async () => {
    registerSessionRefresher(() => Promise.reject(new Error("no")));
    const run = vi.fn().mockRejectedValue(new Unauthorized());
    await expect(withAuthRetry(run, isUnauthorized, "/api/x")).rejects.toBeInstanceOf(Unauthorized);
    expect(run).toHaveBeenCalledTimes(1);
    expect(events).toBe(1);
  });

  it("withAuthRetry: replay that still 401s expires once; exempt URLs and non-401 pass through", async () => {
    registerSessionRefresher(() => Promise.resolve("fresh"));
    const stillBad = vi.fn().mockRejectedValue(new Unauthorized());
    await expect(withAuthRetry(stillBad, isUnauthorized, "/api/x")).rejects.toBeInstanceOf(
      Unauthorized,
    );
    expect(stillBad).toHaveBeenCalledTimes(2);
    expect(events).toBe(1);

    const exempt = vi.fn().mockRejectedValue(new Unauthorized());
    await expect(withAuthRetry(exempt, isUnauthorized, "/api/auth/login")).rejects.toBeInstanceOf(
      Unauthorized,
    );
    expect(exempt).toHaveBeenCalledTimes(1);

    const boom = vi.fn().mockRejectedValue(new Error("500"));
    await expect(withAuthRetry(boom, isUnauthorized, "/api/x")).rejects.toThrow("500");
    expect(boom).toHaveBeenCalledTimes(1);
  });
});
