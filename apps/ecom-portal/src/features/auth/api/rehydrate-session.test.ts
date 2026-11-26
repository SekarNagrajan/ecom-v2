// Created by Sekar Nagarajan (2026-11-26 22:40)
// @vitest-environment jsdom
import { useAuthStore, type UserProfile } from "@solverminds/auth";
import {
  getStoredToken,
  sessionConfig,
  setStoredSessionActivity,
  setStoredToken,
} from "@solverminds/platform";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rehydrateSession } from "./rehydrate-session";

const fetchCurrentSession = vi.fn();
vi.mock("./auth.api", () => ({
  fetchCurrentSession: (token: string) => fetchCurrentSession(token),
}));

const user = {
  id: "1",
  name: "T",
  email: "t@x.com",
  company: "C",
  role: "CUSTOMER",
  capabilities: [],
  loginType: "U",
} as UserProfile;
const NOW = new Date("2026-01-01T09:00:00Z").getTime();

describe("rehydrateSession", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    localStorage.clear();
    useAuthStore.getState().logout();
    fetchCurrentSession.mockReset();
    fetchCurrentSession.mockResolvedValue({ user });
  });
  afterEach(() => {
    vi.useRealTimers();
    useAuthStore.getState().logout();
  });

  it("does nothing for a guest", async () => {
    expect(await rehydrateSession()).toBe("none");
    expect(fetchCurrentSession).not.toHaveBeenCalled();
  });

  it("restores a recently active session", async () => {
    setStoredToken("tok");
    setStoredSessionActivity({ lastActivityAt: NOW - 5 * 60_000, sessionExpiresAt: null });
    expect(await rehydrateSession()).toBe("restored");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("drops a session idle past the idle window WITHOUT asking the server (no dashboard on refresh)", async () => {
    setStoredToken("tok");
    setStoredSessionActivity({
      lastActivityAt: NOW - sessionConfig.idleTimeoutMs - 1000,
      sessionExpiresAt: null,
    });
    expect(await rehydrateSession()).toBe("expired");
    expect(fetchCurrentSession).not.toHaveBeenCalled();
    expect(getStoredToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().lastLogoutReason).toBe("idle");
  });

  it("drops a session past the absolute cap even if recently active", async () => {
    setStoredToken("tok");
    setStoredSessionActivity({ lastActivityAt: NOW - 1000, sessionExpiresAt: NOW - 1 });
    expect(await rehydrateSession()).toBe("expired");
    expect(fetchCurrentSession).not.toHaveBeenCalled();
  });

  it("treats a missing activity record as 'cannot tell' and lets the server decide", async () => {
    setStoredToken("tok");
    expect(await rehydrateSession()).toBe("restored");
    expect(fetchCurrentSession).toHaveBeenCalledWith("tok");
  });

  it("server rejects the token or is unreachable → expired, credentials wiped", async () => {
    setStoredToken("tok");
    setStoredSessionActivity({ lastActivityAt: NOW, sessionExpiresAt: null });
    fetchCurrentSession.mockRejectedValue(new Error("Network Error"));
    expect(await rehydrateSession()).toBe("expired");
    expect(getStoredToken()).toBeNull();
    expect(useAuthStore.getState().lastLogoutReason).toBe("session-expired");
  });
});
