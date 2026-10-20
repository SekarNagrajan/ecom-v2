// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { describe, expect, it, vi } from "vitest";

import { availableTools, executeTool } from "./registry";

vi.mock("../../tracking/api/tracking.api", () => ({
  trackingApi: {
    getTrackingDetails: vi.fn(async () => null),
  },
}));

describe("availableTools gating", () => {
  it("returns ungated tools when not authenticated", () => {
    const names = availableTools(() => false, false);
    expect(names).toContain("track_shipment");
    expect(names).toContain("search_schedules");
    expect(names).not.toContain("list_bookings");
    expect(names).not.toContain("list_shipping_instructions");
  });

  it("includes capability-gated tools when can() allows", () => {
    const can = (code: string) => code === "BKG" || code === "SI";
    const names = availableTools(can, true);
    expect(names).toContain("list_bookings");
    expect(names).toContain("list_shipping_instructions");
    expect(names).not.toContain("list_vgm");
  });
});

describe("executeTool error mapping", () => {
  it("maps unknown tool names", async () => {
    const outcome = await executeTool("nope", {}, {
      can: () => true,
      isAuthenticated: true,
    });
    expect(outcome.ok).toBe(false);
    if (outcome.ok === false) {
      expect(outcome.error.code).toBe("UNKNOWN_TOOL");
    }
  });

  it("maps capability denial", async () => {
    const outcome = await executeTool(
      "list_bookings",
      {},
      { can: () => false, isAuthenticated: true },
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok === false) {
      expect(outcome.error.code).toBe("CAPABILITY_DENIED");
    }
  });

  it("maps invalid args", async () => {
    const outcome = await executeTool(
      "track_shipment",
      { search_type: "CONTAINER" },
      { can: () => true, isAuthenticated: true },
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok === false) {
      expect(outcome.error.code).toBe("INVALID_ARGS");
    }
  });
});
