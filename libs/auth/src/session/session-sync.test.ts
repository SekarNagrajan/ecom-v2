// Created by Sekar Nagarajan (2026-11-26 18:50)
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore, type UserProfile } from "../auth.store";
import {
  createStorageTransport,
  parseSessionMessage,
  type SessionMessage,
  type SessionTransport,
} from "./session-channel";
import { createSessionManager, type SessionManager } from "./session-manager";
import { startSessionSync } from "./session-sync";

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

/** Fake transport: `posted` = what this tab sent, `receive` = simulate another tab's message. */
function fakeTransport() {
  const posted: SessionMessage[] = [];
  let handler: ((m: SessionMessage) => void) | null = null;
  const transport: SessionTransport = {
    post: (m) => void posted.push(m),
    onMessage: (h) => {
      handler = h;
      return () => {
        handler = null;
      };
    },
    close: vi.fn(),
  };
  return { transport, posted, receive: (m: SessionMessage) => handler?.(m) };
}

describe("session sync", () => {
  let mgr: SessionManager;
  let stopManager: () => void;
  let stopSync: () => void;
  let tab: ReturnType<typeof fakeTransport>;
  let onRemoteLogout: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T09:00:00Z"));
    localStorage.clear();
    useAuthStore.getState().logout();
    mgr = createSessionManager({
      config,
      refresh: () => Promise.resolve("t"),
      canRefresh: () => false,
    });
    stopManager = mgr.start();
    tab = fakeTransport();
    onRemoteLogout = vi.fn();
    stopSync = startSessionSync({ manager: mgr, transport: tab.transport, onRemoteLogout });
    useAuthStore.getState().login("tok", user, {});
  });

  afterEach(() => {
    stopSync();
    stopManager();
    useAuthStore.getState().logout();
    vi.useRealTimers();
  });

  it("broadcasts LOGOUT with the reason when this tab signs out", () => {
    useAuthStore.getState().logout("manual");
    expect(tab.posted).toEqual([{ type: "LOGOUT", reason: "manual" }]);
  });

  it("logs this tab out when another tab logs out, without echoing it back", () => {
    tab.receive({ type: "LOGOUT", reason: "idle" });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().lastLogoutReason).toBe("idle");
    expect(onRemoteLogout).toHaveBeenCalledWith("idle");
    expect(tab.posted).toEqual([]);
  });

  it("maps a remote manual sign-out to reason 'other-tab'", () => {
    tab.receive({ type: "LOGOUT", reason: "manual" });
    expect(useAuthStore.getState().lastLogoutReason).toBe("other-tab");
    expect(onRemoteLogout).toHaveBeenCalledWith("manual");
  });

  it("ignores LOGOUT in a guest tab", () => {
    useAuthStore.getState().logout("manual");
    tab.posted.length = 0;
    tab.receive({ type: "LOGOUT", reason: "idle" });
    expect(onRemoteLogout).not.toHaveBeenCalled();
  });

  it("broadcasts a token swap (expiry only, never the token) and adopts a remote one", () => {
    useAuthStore.getState().setToken("tok2", Date.now() + 15 * MIN);
    expect(tab.posted).toEqual([{ type: "TOKEN_REFRESHED", expiresAt: Date.now() + 15 * MIN }]);
    expect(JSON.stringify(tab.posted)).not.toContain("tok2");

    tab.posted.length = 0;
    localStorage.setItem("ecom_auth_token", "tok3"); // what the refreshing tab wrote
    tab.receive({ type: "TOKEN_REFRESHED", expiresAt: Date.now() + 30 * MIN });
    expect(useAuthStore.getState().token).toBe("tok3");
    expect(useAuthStore.getState().expiresAt).toBe(Date.now() + 30 * MIN);
    expect(tab.posted).toEqual([]);
  });

  it("throttles ACTIVITY broadcasts to one per interval", async () => {
    await vi.advanceTimersByTimeAsync(2000);
    mgr.markActivity();
    await vi.advanceTimersByTimeAsync(2000);
    mgr.markActivity();
    expect(tab.posted.filter((m) => m.type === "ACTIVITY")).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(16_000);
    mgr.markActivity();
    expect(tab.posted.filter((m) => m.type === "ACTIVITY")).toHaveLength(2);
  });

  it("remote ACTIVITY keeps an idle tab from reaching its warning", async () => {
    await vi.advanceTimersByTimeAsync(20 * MIN);
    tab.receive({ type: "ACTIVITY", at: Date.now() });
    await vi.advanceTimersByTimeAsync(20 * MIN); // 40 min after login, 20 after the remote activity
    expect(mgr.getSnapshot().state).toBe("active");
  });

  it("remote EXTENDED dismisses this tab's warning; local extend() broadcasts EXTENDED", async () => {
    await vi.advanceTimersByTimeAsync(26 * MIN);
    expect(mgr.getSnapshot().state).toBe("warning");
    tab.receive({ type: "EXTENDED", at: Date.now() });
    expect(mgr.getSnapshot().state).toBe("active");

    await vi.advanceTimersByTimeAsync(26 * MIN);
    await mgr.extend();
    expect(tab.posted).toContainEqual({ type: "EXTENDED", at: Date.now() });
  });

  it("rejects forged/invalid messages", () => {
    expect(parseSessionMessage({ type: "LOGOUT", reason: "bogus" })).toBeNull();
    expect(parseSessionMessage({ type: "ACTIVITY", at: "now" })).toBeNull();
    expect(parseSessionMessage({ type: "NOPE" })).toBeNull();
    expect(parseSessionMessage(null)).toBeNull();
    expect(parseSessionMessage({ type: "TOKEN_REFRESHED", expiresAt: null })).not.toBeNull();
  });

  it("storage fallback delivers other tabs' messages via the storage event", () => {
    const storage = createStorageTransport();
    const got: SessionMessage[] = [];
    const off = storage.onMessage((m) => got.push(m));
    const payload = JSON.stringify({ n: 1, message: { type: "LOGOUT", reason: "idle" } });
    window.dispatchEvent(
      new StorageEvent("storage", { key: "ecom_session_sync", newValue: payload }),
    );
    window.dispatchEvent(new StorageEvent("storage", { key: "other", newValue: payload }));
    window.dispatchEvent(
      new StorageEvent("storage", { key: "ecom_session_sync", newValue: "{bad" }),
    );
    off();
    expect(got).toEqual([{ type: "LOGOUT", reason: "idle" }]);
  });
});
