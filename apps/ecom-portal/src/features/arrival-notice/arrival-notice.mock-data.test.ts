// Modified by Sekar Nagarajan (2026-10-17 00:35)
import { beforeEach, describe, expect, it } from "vitest";

import {
  arrivalFacts,
  arrivalNoticeDetail,
  arrivalNoticeList,
  arrivalNoticeRows,
  demoAgency,
  filterArrivalNotices,
} from "../../mocks/fixture-api/bridges/arrival-notice.bridge";
import { db, eq, resetDb } from "../../mocks/fixture-api/db";
import {
  getArrivalNoticeListSnapshot,
  markArrivalNoticePrinted,
  resetArrivalNoticeMockStore,
} from "../../mocks/arrival-notice.handlers";
import { formatArnAmount, getArnPrintStatusColor } from "./utils/arn-status";

describe("arrival-notice fixture list (arrivalNotices)", () => {
  beforeEach(() => {
    resetDb();
  });

  it("derives the demo agency and control port from the customer's bookings", () => {
    const scope = demoAgency();
    expect(scope.agency).toBe("INDMUM");
    expect(scope.port).toBe("INNSA");
  });

  it("lists the agency's active notices, one row per notice number, newest first", () => {
    const rows = arrivalNoticeRows();
    const scope = demoAgency();
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(rows.every((r) => eq(r.locationcode, scope.agency) || eq(r.portcode, scope.port))).toBe(true);
    const numbers = rows.map((r) => String(r.arrivalnoticeno));
    expect(new Set(numbers).size).toBe(numbers.length);
    for (let i = 1; i < rows.length; i += 1) {
      expect(+new Date(rows[i - 1].CrDate)).toBeGreaterThanOrEqual(+new Date(rows[i].CrDate));
    }
  });

  it("maps every notice onto ArrivalNoticeListDTO with resolved names", () => {
    const list = arrivalNoticeList();
    expect(list.length).toBe(arrivalNoticeRows().length);
    for (const row of list) {
      expect(row.anNo).not.toBe("");
      expect(row.blNumber).not.toBe("");
      expect(row.vessel).not.toBe("");
      expect(row.dischargePort).toMatch(/^[A-Z0-9]{5}( - .+)?$/);
      expect(["Y", "N"]).toContain(row.printStatus);
      expect(row.chargesDue).toBeGreaterThanOrEqual(0);
      expect(row.arrivalDate).not.toBe("");
    }
  });

  it("covers printed and not-printed notices", () => {
    const statuses = new Set(arrivalNoticeList().map((r) => r.printStatus));
    expect(statuses.has("Y")).toBe(true);
    expect(statuses.has("N")).toBe(true);
  });

  it("takes charges due from the confirmed import invoices of the B/L", () => {
    const withInvoice = arrivalNoticeRows().find((n) =>
      db.invoices.some(
        (inv) => eq(inv.invrefno, n.blnumber) && eq(inv.invtype, "IMPORTINVOICE") && eq(inv.status, "CONFIRM"),
      ),
    );
    expect(withInvoice).toBeDefined();
    const facts = arrivalFacts(withInvoice!);
    const expected = db.invoices
      .filter((inv) => eq(inv.invrefno, withInvoice!.blnumber) && eq(inv.invtype, "IMPORTINVOICE") && eq(inv.status, "CONFIRM"))
      .reduce((sum, inv) => sum + Number(inv.amtbalance), 0);
    expect(facts.chargesDue).toBeCloseTo(expected, 2);
    expect(facts.invoices.length).toBeGreaterThan(0);
  });

  it("reports zero charges for notices whose B/L has no invoice in the sample", () => {
    const row = arrivalNoticeList().find((r) => r.chargesDue === 0);
    expect(row).toBeDefined();
    const detail = arrivalNoticeDetail(row!.anNo);
    expect(detail?.chargeLines).toEqual([]);
  });

  it("filters inclusively by arrival date", () => {
    const list = arrivalNoticeList();
    const day = list[0].arrivalDate.slice(0, 10);
    const filtered = filterArrivalNotices(list, day, day);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((r) => r.arrivalDate.slice(0, 10) === day)).toBe(true);
    expect(filterArrivalNotices(list, "2999-01-01", null)).toEqual([]);
  });
});

describe("arrival-notice fixture detail", () => {
  beforeEach(() => {
    resetArrivalNoticeMockStore();
  });

  it("returns the detail of a listed notice with container and charge arrays", () => {
    const first = arrivalNoticeList()[0];
    const detail = arrivalNoticeDetail(first.anNo);
    expect(detail?.anNo).toBe(first.anNo);
    expect(detail?.blNumber).toBe(first.blNumber);
    expect(Array.isArray(detail?.containers)).toBe(true);
    expect(Array.isArray(detail?.chargeLines)).toBe(true);
    expect(detail?.manifestRef).toBe(String(arrivalNoticeRows()[0].groupcallid));
  });

  it("returns null for an unknown notice", () => {
    expect(arrivalNoticeDetail("ARN-DOES-NOT-EXIST")).toBeNull();
  });

  it("flips printStatus to Y on the fixture row when the document is printed", () => {
    const target = getArrivalNoticeListSnapshot().find((r) => r.printStatus === "N");
    expect(target).toBeDefined();
    expect(markArrivalNoticePrinted(target!.anNo)).toBe(true);
    expect(getArrivalNoticeListSnapshot().find((r) => r.anNo === target!.anNo)?.printStatus).toBe("Y");
    expect(arrivalNoticeDetail(target!.anNo)?.printStatus).toBe("Y");
    expect(db.arrivalNotices.filter((n) => eq(n.arrivalnoticeno, target!.anNo)).every((n) => n.IsPrinted === "Y")).toBe(true);
    expect(markArrivalNoticePrinted("ARN-DOES-NOT-EXIST")).toBe(false);
  });

  it("restores the pristine print status on reset", () => {
    const target = getArrivalNoticeListSnapshot().find((r) => r.printStatus === "N")!;
    markArrivalNoticePrinted(target.anNo);
    resetArrivalNoticeMockStore();
    expect(getArrivalNoticeListSnapshot().find((r) => r.anNo === target.anNo)?.printStatus).toBe("N");
  });
});

describe("arrival-notice status helpers", () => {
  it("returns ant tag colors for print statuses", () => {
    expect(getArnPrintStatusColor("Y")).toBe("success");
    expect(getArnPrintStatusColor("N")).toBe("warning");
  });

  it("formats amounts with currency", () => {
    const formatted = formatArnAmount(12540, "USD");
    expect(formatted.endsWith(" USD")).toBe(true);
    expect(formatted.replace(/[^\d]/g, "")).toContain("1254000");
  });
});
