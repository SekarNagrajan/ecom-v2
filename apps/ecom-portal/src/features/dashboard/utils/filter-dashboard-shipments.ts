// Modified by Sekar Nagarajan (2026-08-25 17:35)
/**
 * Enhanced-dashboard shipment filter — parity with enhancedDashboard.jsp
 * `enhOpenDetail(filterKey)` / DataTables client filter.
 */
import type { DashboardShipment } from "../api/dashboard.api";

export type DashboardFilterKey =
  | "all"
  | "bkConfirmed"
  | "siPending"
  | "payPending"
  | "origin"
  | "inTransit"
  | "delivered";

type TranslateFn = (key: string) => string;

const FILTER_I18N_KEYS: Record<DashboardFilterKey, string> = {
  all: "kpi.totalShipments",
  bkConfirmed: "kpi.bookingConfirmed",
  siPending: "kpi.siPending",
  payPending: "kpi.paymentPending",
  origin: "kpi.atOrigin",
  inTransit: "kpi.inTransit",
  delivered: "kpi.delivered",
};

/** English fallbacks for non-UI callers (e.g. export Phase 2/3). */
const FILTER_LABELS: Record<DashboardFilterKey, string> = {
  all: "Total Shipments",
  bkConfirmed: "Booking Confirmed",
  siPending: "SI Pending",
  payPending: "Payment Pending",
  origin: "At Origin",
  inTransit: "In Transit",
  delivered: "Delivered",
};

function resolveFilterKey(key: string): DashboardFilterKey {
  return key in FILTER_I18N_KEYS ? (key as DashboardFilterKey) : "all";
}

/** Display label for a dashboard KPI filter key. Pass `t` for language-reactive UI. */
export function getDashboardFilterLabel(key: string, t?: TranslateFn): string {
  const filterKey = resolveFilterKey(key);
  if (t) return t(FILTER_I18N_KEYS[filterKey]);
  return FILTER_LABELS[filterKey];
}

function matchesLifecycle(
  shipment: DashboardShipment,
  filter: DashboardFilterKey,
): boolean {
  const key = (shipment.filterKey || "").toLowerCase();
  switch (filter) {
    case "origin":
      return key === "origin" || key === "orgcou";
    case "inTransit":
      return key === "intransit" || key === "intransitcou";
    case "delivered":
      return key === "delivered" || key === "delcou";
    default:
      return true;
  }
}

/** Client-side filter matching JSP enhanced dashboard detail panel. */
export function filterDashboardShipments(
  shipments: DashboardShipment[],
  activeFilter: string,
  searchText = "",
): DashboardShipment[] {
  let data = shipments;

  if (activeFilter && activeFilter !== "all") {
    if (activeFilter === "siPending") {
      data = data.filter((s) => !s.siNo && !s.blNo);
    } else if (activeFilter === "bkConfirmed") {
      data = data.filter((s) => s.status === "C" || s.status === "I");
    } else if (activeFilter === "payPending") {
      data = data.filter((s) => s.amtBal > 0);
    } else if (
      activeFilter === "origin" ||
      activeFilter === "inTransit" ||
      activeFilter === "delivered"
    ) {
      data = data.filter((s) =>
        matchesLifecycle(s, activeFilter as DashboardFilterKey),
      );
    } else {
      data = data.filter(
        (s) => (s.filterKey || "").toLowerCase() === activeFilter.toLowerCase(),
      );
    }
  }

  const q = searchText.trim().toLowerCase();
  if (q) {
    data = data.filter(
      (s) =>
        s.bookNo.toLowerCase().includes(q) ||
        s.blNo.toLowerCase().includes(q) ||
        s.onlineRefNo.toLowerCase().includes(q) ||
        s.originPortDesc.toLowerCase().includes(q) ||
        s.finalPortDesc.toLowerCase().includes(q) ||
        s.originPortId.toLowerCase().includes(q) ||
        s.finalPortId.toLowerCase().includes(q),
    );
  }

  return data;
}
