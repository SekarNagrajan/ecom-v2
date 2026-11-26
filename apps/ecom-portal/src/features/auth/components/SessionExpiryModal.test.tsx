// Created by Sekar Nagarajan (2026-11-26 19:50)
// @vitest-environment jsdom
import { sessionManager, useAuthStore, type UserProfile } from "@solverminds/auth";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SessionExpiryModal } from "./SessionExpiryModal";

const MIN = 60_000;
const user: UserProfile = {
  id: "1",
  name: "T",
  email: "t@x.com",
  company: "C",
  role: "CUSTOMER",
  capabilities: [],
  loginType: "U",
};

const advance = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));

describe("SessionExpiryModal", () => {
  let stop: () => void;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T09:00:00Z"));
    useAuthStore.getState().logout();
    stop = sessionManager.start();
    useAuthStore.getState().login("tok", user, {});
    await advance(26 * MIN); // default config: warning opens at 25 min of a 30 min idle window
    expect(sessionManager.getSnapshot().state).toBe("warning");
  });

  afterEach(() => {
    cleanup();
    stop();
    useAuthStore.getState().logout();
    vi.useRealTimers();
  });

  it("shows the warning with the time left, and ticks down", async () => {
    render(<SessionExpiryModal />);
    expect(screen.getByText("session.warningTitle")).toBeTruthy();
    expect(screen.getByRole("timer").textContent).toBe("04:00");
    await advance(5000);
    expect(screen.getByRole("timer").textContent).toBe("03:55");
  });

  it("'Stay signed in' extends the session and closes the warning", async () => {
    render(<SessionExpiryModal />);
    fireEvent.click(screen.getByText("session.stay"));
    await advance(0);
    expect(sessionManager.getSnapshot().state).toBe("active");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("'Sign out' ends the session", async () => {
    render(<SessionExpiryModal />);
    fireEvent.click(screen.getByText("session.signOut"));
    await advance(0);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().lastLogoutReason).toBe("manual");
  });
});
