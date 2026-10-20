// Created by Sekar Nagarajan (2026-10-21 12:30)
// @vitest-environment jsdom
/**
 * Characterization tests for the assistant's interactive surface (A1–A16).
 *
 * These pin CURRENT behaviour before any refactor. They are deliberately
 * behavioural, not snapshot-based: they assert what a click DOES (navigate,
 * toast, confirm-gate, store mutation), so a visual redesign may change
 * markup freely while a behaviour change fails loudly.
 *
 * Inventory and file:line references: docs/assistant-ui-actions.md
 */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

// ── shared mocks ─────────────────────────────────────────────────────────

const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useRouterState: () => "/app/dashboard",
}));

const toast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};
/** Captures the confirm options so a test can assert the gate and then fire onOk. */
const confirmCalls: { variant: string; options: Record<string, unknown> }[] = [];
const confirm = {
  warning: (options: Record<string, unknown>) => {
    confirmCalls.push({ variant: "warning", options });
  },
  danger: (options: Record<string, unknown>) => {
    confirmCalls.push({ variant: "danger", options });
  },
  show: (options: Record<string, unknown>) => {
    confirmCalls.push({ variant: "show", options });
  },
};
vi.mock("@solverminds/shared-ui/hooks", async (orig) => {
  const actual = await (orig() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    useToast: () => toast,
    useConfirm: () => confirm,
    useAntdBreakpoint: () => ({ isMobile: false }),
    // AppButton reads `secondaryColor`; without a provider it throws.
    useAppConfig: () => ({
      secondaryColor: "#1677ff",
      effectiveThemeMode: "light",
      timezone: "UTC",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "HH:mm",
    }),
  };
});

const can = vi.fn(() => true);
vi.mock("@solverminds/auth", () => ({
  usePermission: () => ({ can }),
  useAuthStore: Object.assign(
    (sel: (s: unknown) => unknown) =>
      sel({ user: { capabilities: ["BKG"] }, isAuthenticated: true }),
    { getState: () => ({ user: null }), subscribe: () => () => {} },
  ),
  useTenantStore: Object.assign((sel: (s: unknown) => unknown) => sel({ activeTenant: null }), {
    getState: () => ({ activeTenant: null }),
  }),
}));

// Keep the real module: the tool registry pulls in i18n/config.ts, which
// needs `initReactI18next`. Only the hook is stubbed, so assertions can be
// made against translation KEYS rather than English copy.
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

const searchSchedules = vi.fn();
vi.mock("../../schedules/api/schedules.api", () => ({
  schedulesApi: { searchSchedules: (...a: unknown[]) => searchSchedules(...a) },
}));

const submitBooking = vi.fn();
vi.mock("../../booking/api/booking.api", () => ({
  bookingApi: { submitBooking: (...a: unknown[]) => submitBooking(...a) },
}));

// ── imports under test (after mocks) ─────────────────────────────────────

import { resolveNavigateRoute } from "../actions/navigate.action";
import { dispatchUiAction } from "../actions/ui-action.handler";
import { applyPrefillBooking } from "../actions/prefill-booking.action";
import { ActionCard } from "../components/cards/ActionCard";
import { CitationChips } from "../components/cards/CitationChips";
import { NavigateCard } from "../components/cards/NavigateCard";
import { useBookingStore } from "../../booking/stores/booking.store";
import { useAssistantStore } from "../store/assistant.store";
import type { AssistantCard } from "../types/assistant.types";

function card(partial: Partial<AssistantCard>): AssistantCard {
  return {
    kind: "action",
    callId: "call_1",
    name: "x",
    arguments: {},
    ...partial,
  } as AssistantCard;
}

// The repo has no global test setup, so RTL never unmounts between tests;
// without this, earlier renders stay in document.body and queries match them.
afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  confirmCalls.length = 0;
  can.mockReturnValue(true);
  useAssistantStore.getState().reset();
  // The booking wizard store is module-global; without this, a prefill from
  // an earlier test leaks into the next one's submit path.
  useBookingStore.getState().resetWizard();
});

// ── A1 navigate ──────────────────────────────────────────────────────────

describe("A1 navigate ui_action", () => {
  it("resolves only whitelisted /app routes", () => {
    expect(resolveNavigateRoute({ route: "/app/booking" })).toBe("/app/booking");
    expect(resolveNavigateRoute({ route: "/evil" })).toBeNull();
    expect(resolveNavigateRoute({ route: "https://x.com" })).toBeNull();
    expect(resolveNavigateRoute({})).toBeNull();
  });

  it("dispatch returns invalid_route rather than navigating", async () => {
    expect(await dispatchUiAction("navigate", { route: "/nope" })).toEqual({
      kind: "invalid_route",
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("NavigateCard renders nothing for an invalid route", () => {
    const { container } = render(<NavigateCard card={card({ arguments: { route: "/nope" } })} />);
    expect(container.textContent).toBe("");
  });

  it("Open screen navigates and closes the window", () => {
    const { container } = render(
      <NavigateCard card={card({ arguments: { route: "/app/booking" } })} />,
    );
    fireEvent.click(
      container.querySelector(".assistant-card__footer button")!,
    );
    expect(navigate).toHaveBeenCalledWith({ to: "/app/booking" });
    expect(useAssistantStore.getState().open).toBe(false);
  });
});

// ── A2 prefill_booking ───────────────────────────────────────────────────

describe("A2 prefill_booking", () => {
  it("applies master details into the booking wizard store", async () => {
    const result = await applyPrefillBooking({
      master_details: { origin: "INNSA", delivery: "AEJEA" },
    });
    expect(result.ok).toBe(true);
    expect(useBookingStore.getState().payload.masterDetails).toBeTruthy();
  });

  it("refuses a sailing that is not bookable", async () => {
    searchSchedules.mockResolvedValue([
      { id: "S1", bookingAllowed: false, vesselName: "V", voyage: "1" },
    ]);
    const result = await applyPrefillBooking({ schedule_id: "S1" });
    expect(result).toMatchObject({ ok: false, reason: "not_allowed" });
  });

  it("reports not_found for an unknown sailing", async () => {
    searchSchedules.mockResolvedValue([]);
    const result = await applyPrefillBooking({ schedule_id: "GONE" });
    expect(result).toMatchObject({ ok: false, reason: "not_found" });
  });
});

// ── A3 propose_booking_submit (the safety-critical one) ──────────────────

describe("A3 propose_booking_submit", () => {
  it("is card-only: dispatch never submits", async () => {
    const result = await dispatchUiAction("propose_booking_submit", {});
    expect(result).toEqual({ kind: "propose_booking_submit", shown: true });
    expect(submitBooking).not.toHaveBeenCalled();
  });

  it("NEVER submits without passing through confirm.warning", async () => {
    const { container } = render(
      <ActionCard
        card={card({ kind: "automation_confirm", name: "propose_booking_submit",
                     arguments: { summary: "Book SGSIN to NLRTM" } })}
      />,
    );
    const button = container.querySelector(
      ".assistant-card__footer button",
    ) as HTMLButtonElement;
    fireEvent.click(button);

    // The click opens a confirm dialog and submits nothing yet.
    expect(confirmCalls).toHaveLength(1);
    expect(confirmCalls[0].variant).toBe("warning");
    expect(submitBooking).not.toHaveBeenCalled();
  });

  it("KNOWN DEFECT: a re-rendered card is confirmable again", () => {
    // How this shows up for a user: they confirm a submit, the window
    // closes, then they reopen the chat from history. The card comes back
    // from the store and nothing records that it was already submitted,
    // so the button invites a second submit.
    //
    // Phase 4B is expected to flip this by persisting card state; when it
    // does, this test should be updated to assert `disabled === true`.
    const submitted = card({
      kind: "automation_confirm",
      name: "propose_booking_submit",
      arguments: { origin: "INNSA", delivery: "AEJEA" },
    });

    // Nothing on the card model can express "already submitted".
    expect("state" in submitted).toBe(false);

    const { container } = render(<ActionCard card={submitted} />);
    const button = container.querySelector(
      ".assistant-card__footer button",
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.disabled).toBe(false);
  });
});

// ── A5 unknown ui_action ─────────────────────────────────────────────────

describe("A5 unknown ui_action", () => {
  it("dispatch reports unsupported", async () => {
    expect(await dispatchUiAction("teleport", {})).toEqual({
      kind: "unsupported",
      name: "teleport",
    });
  });

  it("renders a name + unsupported notice with no action buttons", () => {
    const { container } = render(
      <ActionCard card={card({ kind: "action", name: "teleport" })} />,
    );
    expect(screen.getByText("teleport")).toBeTruthy();
    expect(screen.getByText("unsupportedAction")).toBeTruthy();
    // No footer => nothing actionable on an unsupported card.
    expect(container.querySelector(".assistant-card__footer")).toBeNull();
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});

// ── A8 citation chips ────────────────────────────────────────────────────

describe("A8 citation chips", () => {
  it("navigates to the citation route", () => {
    const { container } = render(
      <CitationChips
        citations={[{ route: "/app/tracking", title: "Tracking", marker: "m1" }]}
      />,
    );
    fireEvent.click(container.querySelector("button")!);
    expect(navigate).toHaveBeenCalledWith({ to: "/app/tracking" });
  });

  it("drops citations whose route is not whitelisted", () => {
    const { container } = render(
      <CitationChips citations={[{ route: "/evil", title: "X", marker: "m" }]} />,
    );
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("renders nothing when there are no citations", () => {
    const { container } = render(<CitationChips citations={[]} />);
    expect(container.textContent).toBe("");
  });
});

// ── A16 browser tool execution gating ────────────────────────────────────

describe("A16 browser tool registry", () => {
  it("hides capability-gated tools from users without the capability", async () => {
    const { availableTools } = await import("../tools/registry");
    const withBkg = availableTools((c: string) => c === "BKG", true);
    const without = availableTools(() => false, true);
    expect(withBkg).toContain("list_bookings");
    expect(without).not.toContain("list_bookings");
  });

  it("exposes public tools to guests", async () => {
    const { availableTools } = await import("../tools/registry");
    expect(availableTools(() => false, false)).toContain("search_schedules");
  });
});
