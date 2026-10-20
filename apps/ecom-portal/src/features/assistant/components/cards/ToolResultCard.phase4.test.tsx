// Created for Phase 4 — card correctness.
// Pins the four problems the phase fixes:
//   1. get_booking renders a detail card (not the record empty state).
//   2. Record cards show at most RECORD_ROW_LIMIT rows and an honest count.
//   3. A known status code renders a Tag (label, not raw guesswork).
//   4. A failed tool renders a translated reason, never the raw error string.
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// antd's responsive observer needs matchMedia, which jsdom does not provide.
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

const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

// Assert against translation KEYS, not English copy, so copy edits don't break.
vi.mock("react-i18next", async (importOriginal) => {
  const actual = await (importOriginal() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, opts?: Record<string, unknown>) =>
        (opts?.defaultValue as string) ?? key,
      i18n: { language: "en" },
    }),
  };
});

// AppButton reads useAppConfig; without a provider it throws.
vi.mock("@solverminds/shared-ui/hooks", async (orig) => {
  const actual = await (orig() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    useAppConfig: () => ({
      secondaryColor: "#1677ff",
      effectiveThemeMode: "light",
    }),
  };
});

import type { AssistantCard } from "../../types/assistant.types";
import { ToolResultCard } from "./ToolResultCard";

function card(partial: Partial<AssistantCard>): AssistantCard {
  return {
    kind: "tool_result",
    name: "list_bookings",
    ok: true,
    data: {},
    ...partial,
  } as AssistantCard;
}

afterEach(cleanup);

describe("Phase 4 — card correctness", () => {
  it("get_booking renders a detail card, not the record empty state", () => {
    const { container } = render(
      <ToolResultCard
        card={card({
          name: "get_booking",
          data: {
            booking_id: "BKON260016",
            status: "Confirmed",
            masterDetails: {
              origin: "Chennai",
              delivery: "Rotterdam",
              cargoReadyDate: "2026-11-01",
            },
          },
        })}
      />,
    );
    expect(screen.getByText("BKON260016")).toBeTruthy();
    // The record list empty-state key must never appear for a single booking.
    expect(screen.queryByText("cards.records.empty")).toBeNull();
    // Route label joins origin → delivery.
    expect(container.textContent).toContain("Chennai → Rotterdam");
  });

  it("caps a record list at RECORD_ROW_LIMIT rows", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: `BK${i}`,
      bookingNo: `BK${i}`,
      status: "Confirmed",
    }));
    const { container } = render(
      <ToolResultCard
        card={card({
          name: "list_bookings",
          data: { items, total: 12, returned: 10, truncated: true },
        })}
      />,
    );
    expect(
      container.querySelectorAll(".assistant-card__sailing-row"),
    ).toHaveLength(10);
  });

  it("renders a status Tag for a known status code", () => {
    const { container } = render(
      <ToolResultCard
        card={card({
          name: "list_bookings",
          data: {
            items: [{ id: "BK1", bookingNo: "BK1", status: "Confirmed" }],
            total: 1,
            returned: 1,
          },
        })}
      />,
    );
    const tag = container.querySelector(".assistant-card__sailing-row .ant-tag");
    expect(tag).not.toBeNull();
    expect((tag?.textContent ?? "").length).toBeGreaterThan(0);
  });

  it("a failed tool shows a translated reason, not the raw error", () => {
    render(
      <ToolResultCard
        card={card({
          name: "get_booking",
          ok: false,
          error: "FORBIDDEN: capability missing",
          data: {},
        })}
      />,
    );
    // The mapped i18n key is shown; the raw error string is not.
    expect(screen.getByText("toolErrors.forbidden")).toBeTruthy();
    expect(screen.queryByText(/capability missing/)).toBeNull();
  });
});
