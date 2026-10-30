// Modified by Sekar Nagarajan (2026-10-17 00:35)
import { beforeEach, describe, expect, it } from "vitest";

import {
  computeCroEligibility,
  croBookings,
  croDetail,
  croEligibilityByBooking,
  croList,
  croSourcesFor,
  filterCros,
} from "../../mocks/fixture-api/bridges/cro.bridge";
import { db, eq, resetDb } from "../../mocks/fixture-api/db";
import {
  getCROListSnapshot,
  markCROPrinted,
  resetCROMockStore,
} from "../../mocks/cro.handlers";
import { getCroReleaseStatusColor } from "./utils/cro-status";

describe("container-release-order fixture list (derived from export bookings)", () => {
  beforeEach(() => {
    resetDb();
  });

  it("derives at least 8 CRO rows from the demo customer's confirmed / cancelled LRP bookings", () => {
    const list = croList();
    expect(list.length).toBeGreaterThanOrEqual(8);
    const mine = new Set(db.lrpBookingCust.filter((c) => eq(c.custId, "20001374")).map((c) => String(c.book_no)));
    expect(list.every((r) => mine.has(r.bookingNo))).toBe(true);
    expect(croBookings().every((b) => eq(b.status, "C") || eq(b.status, "D"))).toBe(true);
  });

  it("keeps quantities consistent and resolves ports, vessel and depot", () => {
    for (const row of croList()) {
      expect(row.qtyBooked).toBeGreaterThan(0);
      expect(row.qtyReleased).toBeLessThanOrEqual(row.qtyBooked);
      expect(row.loadPort).toMatch(/^[A-Z0-9]{5}( - .+)?$/);
      expect(row.vessel).not.toBe("");
      expect(row.emptyReleaseDepot).toContain(" - ");
      expect(row.emptyReleaseDepot).not.toMatch(/test/i);
      expect(["Y", "N"]).toContain(row.printStatus);
      expect(row.croDate).not.toBe("");
      expect(row.validTo).not.toBe("");
    }
  });

  it("covers Eligible, Released and Cancelled release statuses", () => {
    const statuses = new Set(croList().map((row) => row.releaseStatus));
    expect(statuses.has("Eligible")).toBe(true);
    expect(statuses.has("Released")).toBe(true);
    expect(statuses.has("Cancelled")).toBe(true);
  });

  it("splits a multi-equipment booking into one CRO per equipment type", () => {
    const booking = db.lrpBookings.find((b) => eq(b.book_no, "SVMDMU2694098"))!;
    const sources = croSourcesFor(booking);
    expect(sources.map((s) => s.croNo)).toEqual(["CRO-SVMDMU2694098", "CRO-SVMDMU2694098-RE40"]);
    expect(sources.map((s) => s.qtyBooked)).toEqual([2, 1]);
  });

  it("marks a booking whose containers moved empty (containerMoves mode M) as Released", () => {
    const row = croList().find((r) => r.croNo === "CRO-SVMDMU2694098");
    expect(row?.qtyReleased).toBe(2);
    expect(row?.releaseStatus).toBe("Released");
    expect(row?.printStatus).toBe("Y");
  });

  it("marks cancelled LRP bookings (status D) as Cancelled", () => {
    const row = croList().find((r) => r.bookingNo === "SVMCAI000000074");
    expect(row?.releaseStatus).toBe("Cancelled");
    expect(croDetail(row!.croNo)?.eligibility.eligible).toBe(false);
  });

  it("uses the booking confirmation cut-off as validity when the e-commerce booking is linked", () => {
    const row = croList().find((r) => r.bookingNo === "SVMDMU2694105");
    const ecom = db.bookings.find((b) => eq(b.extBookNo, "SVMDMU2694105"))!;
    const conf = db.bookingConf.find((c) => eq(c.ebookno, ecom.ebookno))!;
    expect(row?.validTo).toBe(new Date(conf.bkgCutoff).toISOString());
  });

  it("filters inclusively by CRO date", () => {
    const list = croList();
    const day = list[0].croDate.slice(0, 10);
    expect(filterCros(list, day, day).every((r) => r.croDate.slice(0, 10) === day)).toBe(true);
    expect(filterCros(list, "2999-01-01", null)).toEqual([]);
  });
});

describe("CRO eligibility helper", () => {
  it("marks payment-hold rows as ineligible", () => {
    const result = computeCroEligibility({ releaseStatus: "Blocked", validTo: "2026-12-31", paymentHold: true }, "2026-08-25");
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes("payment"))).toBe(true);
  });

  it("marks expired validity as ineligible", () => {
    const result = computeCroEligibility({ releaseStatus: "Eligible", validTo: "2026-07-20T00:00:00.000Z" }, "2026-08-25");
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.toLowerCase().includes("validity"))).toBe(true);
  });

  it("allows happy-path eligible CRO", () => {
    const result = computeCroEligibility({ releaseStatus: "Eligible", validTo: "2026-09-30T00:00:00.000Z" }, "2026-08-25");
    expect(result.eligible).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it("answers eligibility by LRP booking number or linked e-commerce number", () => {
    resetDb();
    const byLrp = croEligibilityByBooking("SVMDMU2694105");
    const byEcom = croEligibilityByBooking("BKON7312");
    expect(byLrp).toEqual(byEcom);
    expect(croEligibilityByBooking("NOPE-1").eligible).toBe(false);
    expect(croEligibilityByBooking("NOPE-1").reasons[0]).toMatch(/No container release order/);
  });
});

describe("CRO fixture detail", () => {
  beforeEach(() => {
    resetCROMockStore();
  });

  it("returns detail with containers and embedded eligibility", () => {
    const detail = croDetail("CRO-SVMDMU2694098");
    expect(detail?.croNo).toBe("CRO-SVMDMU2694098");
    expect(detail?.containers.length).toBe(2);
    expect(detail?.containers.every((c) => c.containerNo && c.eqpSize === "40DV")).toBe(true);
    expect(detail?.eligibility.reasons).toBeDefined();
    expect(detail?.printCount).toBe(1);
    expect(croDetail("CRO-NOPE")).toBeNull();
  });

  it("flips printStatus to Y and counts prints when the document is printed", () => {
    const target = getCROListSnapshot().find((r) => r.printStatus === "N");
    expect(target).toBeDefined();
    expect(markCROPrinted(target!.croNo)).toBe(true);
    expect(getCROListSnapshot().find((r) => r.croNo === target!.croNo)?.printStatus).toBe("Y");
    expect(croDetail(target!.croNo)?.printCount).toBe(1);
    markCROPrinted(target!.croNo);
    expect(croDetail(target!.croNo)?.printCount).toBe(2);
    expect(markCROPrinted("CRO-NOPE")).toBe(false);
    resetCROMockStore();
    expect(getCROListSnapshot().find((r) => r.croNo === target!.croNo)?.printStatus).toBe("N");
  });
});

describe("CRO status helpers", () => {
  it("returns ant tag colors for release statuses", () => {
    expect(getCroReleaseStatusColor("Eligible")).toBe("processing");
    expect(getCroReleaseStatusColor("Blocked")).toBe("error");
    expect(getCroReleaseStatusColor("Released")).toBe("success");
  });
});
