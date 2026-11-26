// Modified by Sekar Nagarajan (2026-11-25 14:40)
import type { CalendarWeek, DashboardShipment } from "../../dashboard/api/dashboard.api";
import type { PayPendingItem } from "../types/payments.types";

function portLabel(id?: string, desc?: string): string | undefined {
  if (id && desc) return `${id} - ${desc}`;
  return id || desc || undefined;
}

/** Map an outstanding dashboard shipment into a pay-pending line. */
export function shipmentToPayPendingItem(shipment: DashboardShipment): PayPendingItem | null {
  if (!(shipment.amtBal > 0)) return null;
  const invNo = String(shipment.invNo ?? "").trim();
  const blNo = String(shipment.blNo ?? "").trim();
  const bookNo = String(shipment.bookNo ?? "").trim();
  const paymentType = invNo ? "INV" : blNo ? "BL" : "BKG";
  const refNo = invNo || blNo || bookNo;
  if (!refNo) return null;
  const agencyCode = String(shipment.invAgency ?? "").trim() || "UNKNOWN";
  return {
    id: String(shipment.id || bookNo || refNo),
    bookNo,
    blNo,
    invNo,
    agencyCode,
    amountUsd: shipment.amtBal,
    paymentType,
    refNo,
    customerType: paymentType === "INV" ? "IN" : "SH",
    originLabel: portLabel(shipment.originPortId, shipment.originPortDesc),
    deliveryLabel: portLabel(shipment.finalPortId, shipment.finalPortDesc),
  };
}

export function shipmentsToPayPendingItems(shipments: DashboardShipment[]): PayPendingItem[] {
  return shipments
    .map(shipmentToPayPendingItem)
    .filter((item): item is PayPendingItem => Boolean(item));
}

/** Booking numbers in the planning calendar that still need payment. */
export function planningPendingPaymentBookNos(calendar: CalendarWeek[]): Set<string> {
  const out = new Set<string>();
  for (const week of calendar) {
    for (const key of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const) {
      for (const booking of week.days[key]?.bookings ?? []) {
        if (booking.pendingPaymentFlag && booking.bookingNo) {
          out.add(booking.bookingNo);
        }
      }
    }
  }
  return out;
}

export function groupPayPendingByAgency(items: PayPendingItem[]): Map<string, PayPendingItem[]> {
  const groups = new Map<string, PayPendingItem[]>();
  for (const item of items) {
    const list = groups.get(item.agencyCode) ?? [];
    list.push(item);
    groups.set(item.agencyCode, list);
  }
  return groups;
}
