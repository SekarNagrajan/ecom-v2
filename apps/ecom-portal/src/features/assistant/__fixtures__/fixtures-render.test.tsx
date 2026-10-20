// Created for Phase 8 — renders each shared fixture through the real
// MessageBubble and asserts the Definition-of-Done invariants so the fixtures
// used by the Playwright visual spec are also guarded by fast unit checks.
// @vitest-environment jsdom
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("@solverminds/auth", async (orig) => {
  const actual = await (orig() as Promise<Record<string, unknown>>);
  return { ...actual, usePermission: () => ({ can: () => true }) };
});

vi.mock("@solverminds/shared-ui/hooks", async (orig) => {
  const actual = await (orig() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    useAppConfig: () => ({ secondaryColor: "#1677ff", effectiveThemeMode: "light" }),
  };
});

// Message action bar (copy/feedback) pulls in toast/confirm providers we don't
// need for layout assertions.
vi.mock("../components/MessageActions", () => ({
  MessageActions: () => null,
}));

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await (importOriginal() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, opts?: Record<string, unknown>) => {
        if (opts?.tools != null) return String(opts.tools);
        if (opts?.returned != null && opts?.total != null) {
          return `${opts.returned} of ${opts.total}`;
        }
        return (opts?.defaultValue as string) ?? key;
      },
      i18n: { language: "en" },
    }),
  };
});

import { MessageBubble } from "../components/MessageBubble";
import { ASSISTANT_FIXTURES } from "./conversations";

afterEach(cleanup);

function assistantOf(key: string) {
  const fx = ASSISTANT_FIXTURES.find((f) => f.key === key);
  if (!fx) throw new Error(`fixture ${key} missing`);
  const msg = fx.messages.find((m) => m.role === "assistant");
  if (!msg) throw new Error(`fixture ${key} has no assistant message`);
  return msg;
}

function renderAssistant(key: string) {
  return render(
    <MessageBubble message={assistantOf(key)} onRetry={() => {}} />,
  );
}

describe("Phase 8 — fixture DoD invariants", () => {
  it("every fixture renders without crashing", () => {
    for (const fx of ASSISTANT_FIXTURES) {
      const { unmount } = render(
        <MessageBubble message={assistantOf(fx.key)} onRetry={() => {}} />,
      );
      unmount();
    }
  });

  it("answer-with-table renders a real table", () => {
    const { container } = renderAssistant("answer-with-table");
    expect(container.querySelector("table")).not.toBeNull();
    expect(container.querySelector(".assistant-md__table-wrap")).not.toBeNull();
  });

  it("multi-round keeps text → card → text order and shows card rows", () => {
    const { container } = renderAssistant("multi-round");
    const text = container.textContent ?? "";
    const introAt = text.indexOf("Let me pull up");
    const rowAt = text.indexOf("BKON260016");
    const outroAt = text.indexOf("2 active bookings");
    expect(introAt).toBeGreaterThanOrEqual(0);
    expect(rowAt).toBeGreaterThan(introAt);
    expect(outroAt).toBeGreaterThan(rowAt);
    // The record card shows rows, not the empty state.
    expect(text).not.toContain("cards.records.empty");
    // Completed message collapses its successful tool row into a group.
    expect(container.querySelector(".assistant-tool-group")).not.toBeNull();
  });

  it("failed-tool shows a translated reason, never the raw error code", () => {
    const { container } = renderAssistant("failed-tool");
    expect(container.querySelector(".assistant-card--error")).not.toBeNull();
    const text = container.textContent ?? "";
    expect(text).toContain("toolErrors.forbidden");
    expect(text).not.toContain("FORBIDDEN");
  });

  it("tracking shows the container reference", () => {
    const { container } = renderAssistant("tracking");
    expect(within(container).getByText(/SMLU8829102/)).toBeTruthy();
  });

  it("schedule-list shows the recommended sailing", () => {
    const { container } = renderAssistant("schedule-list");
    expect(container.textContent).toContain("MAERSK CHENNAI");
  });
});
