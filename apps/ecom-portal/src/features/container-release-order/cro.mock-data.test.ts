// Modified by Sekar Nagarajan (2026-08-26 14:57)
import { beforeEach, describe, expect, it } from "vitest";

import {
  getCROListSnapshot,
  markCROPrinted,
  resetCROMockStore,
} from "../../mocks/cro.handlers";
import {
  computeCROEligibility,
  getMockCRODetail,
  mockCROListSeed,
} from "./mocks/cro.mock";
import { getCroReleaseStatusColor } from "./utils/cro-status";

describe("container-release-order mock data", () => {
  it("seeds at least 8 CRO list rows", () => {
    expect(mockCROListSeed.length).toBeGreaterThanOrEqual(8);
  });

  it("covers primary release statuses", () => {
    const statuses = new Set(mockCROListSeed.map((row) => row.releaseStatus));
    expect(statuses.has("Eligible")).toBe(true);
    expect(statuses.has("Blocked")).toBe(true);
    expect(statuses.has("Released")).toBe(true);
    expect(statuses.has("Cancelled")).toBe(true);
  });

  it("links CRO-1001 to booking BKG-778901", () => {
    const row = mockCROListSeed.find((r) => r.croNo === "CRO-1001");
    expect(row?.bookingNo).toBe("BKG-778901");
    expect(row?.printStatus).toBe("N");
    expect(row?.releaseStatus).toBe("Eligible");
  });
});

describe("CRO eligibility helper", () => {
  it("marks payment-hold rows as ineligible", () => {
    const row = mockCROListSeed.find((r) => r.croNo === "CRO-1003")!;
    const result = computeCROEligibility(row);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes("payment"))).toBe(
      true,
    );
  });

  it("marks expired validity as ineligible", () => {
    const row = mockCROListSeed.find((r) => r.croNo === "CRO-1005")!;
    const result = computeCROEligibility(row, "2026-08-25");
    expect(result.eligible).toBe(false);
    expect(
      result.reasons.some((r) => r.toLowerCase().includes("validity")),
    ).toBe(true);
  });

  it("allows happy-path eligible CRO", () => {
    const row = mockCROListSeed.find((r) => r.croNo === "CRO-1001")!;
    const result = computeCROEligibility(row, "2026-08-25");
    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });
});

describe("CRO detail seed", () => {
  beforeEach(() => {
    resetCROMockStore();
  });

  it("returns detail with embedded eligibility for CRO-1001", () => {
    const detail = getMockCRODetail("CRO-1001");
    expect(detail?.croNo).toBe("CRO-1001");
    expect(detail?.eligibility.eligible).toBe(true);
    expect(detail?.containers.length).toBeGreaterThan(0);
  });

  it("flips printStatus to Y when document is printed", () => {
    expect(
      getCROListSnapshot().find((r) => r.croNo === "CRO-1001")?.printStatus,
    ).toBe("N");
    expect(markCROPrinted("CRO-1001")).toBe(true);
    expect(
      getCROListSnapshot().find((r) => r.croNo === "CRO-1001")?.printStatus,
    ).toBe("Y");
  });
});

describe("CRO status helpers", () => {
  it("returns ant tag colors for release statuses", () => {
    expect(getCroReleaseStatusColor("Eligible")).toBe("processing");
    expect(getCroReleaseStatusColor("Blocked")).toBe("error");
    expect(getCroReleaseStatusColor("Released")).toBe("success");
  });
});
