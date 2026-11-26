// Modified by Sekar Nagarajan (2026-11-25 14:40)
import { describe, expect, it } from "vitest";

import type { DashboardShipment } from "../../dashboard/api/dashboard.api";
import {
  groupPayPendingByAgency,
  shipmentToPayPendingItem,
  shipmentsToPayPendingItems,
} from "./build-pay-pending-items";
import { buildCheckoutRequest } from "../hooks/use-payment-checkout";

const baseShipment = (overrides: Partial<DashboardShipment> = {}): DashboardShipment => ({
  id: "EB1",
  bookNo: "BK1",
  blNo: "BL1",
  onlineRefNo: "EB1",
  originPortId: "INNSA",
  originPortDesc: "NHAVA SHEVA",
  finalPortId: "NLRTM",
  finalPortDesc: "ROTTERDAM",
  polAt: "2026-10-14",
  status: "C",
  siNo: "",
  containerNo: "",
  teus: "1",
  amtBal: 500,
  invNo: "INV1",
  invAgency: "INDMUM",
  filterKey: "origin",
  ...overrides,
});

describe("build-pay-pending-items", () => {
  it("maps outstanding shipments and skips zero balance", () => {
    const item = shipmentToPayPendingItem(baseShipment());
    expect(item).toMatchObject({
      paymentType: "INV",
      refNo: "INV1",
      agencyCode: "INDMUM",
      amountUsd: 500,
      customerType: "IN",
    });
    expect(shipmentToPayPendingItem(baseShipment({ amtBal: 0 }))).toBeNull();
    expect(
      shipmentsToPayPendingItems([baseShipment(), baseShipment({ id: "EB2", amtBal: 0 })]),
    ).toHaveLength(1);
  });

  it("groups by agency and builds a same-agency checkout request", () => {
    const items = shipmentsToPayPendingItems([
      baseShipment(),
      baseShipment({ id: "EB2", bookNo: "BK2", invNo: "INV2", amtBal: 100 }),
      baseShipment({ id: "EB3", bookNo: "BK3", invNo: "INV3", invAgency: "AEESAD", amtBal: 75 }),
    ]);
    const groups = groupPayPendingByAgency(items);
    expect(groups.get("INDMUM")).toHaveLength(2);
    expect(groups.get("AEESAD")).toHaveLength(1);

    const ok = buildCheckoutRequest(items.filter((i) => i.agencyCode === "INDMUM"));
    expect("error" in ok).toBe(false);
    if ("error" in ok) return;
    expect(ok.paymentType).toBe("INV");
    expect(ok.totalAmount).toBe(600);
    expect(ok.references).toHaveLength(2);

    expect(buildCheckoutRequest(items)).toEqual({ error: "mixedAgency" });
    expect(buildCheckoutRequest([])).toEqual({ error: "empty" });
  });
});
