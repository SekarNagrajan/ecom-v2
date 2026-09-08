// Created by Sekar Nagarajan (2026-09-08 15:44)
import { DateTime } from "luxon";

import type { DashboardCounts, DashboardShipment } from "../features/dashboard/api/dashboard.api";
import {
  MOCK_DASHBOARD_COUNTS,
  MOCK_DASHBOARD_SHIPMENTS,
  MOCK_TOP_CONSIGNEES,
  MOCK_TOP_LANES,
  MOCK_VOLUME_KPIS,
  MOCK_VOLUME_TREND,
} from "../features/dashboard/mocks/dashboard.mock";
import type { DashboardReport } from "../features/dashboard/types/dashboard-export.types";
import {
  filterDashboardShipments,
  getDashboardFilterLabel,
} from "../features/dashboard/utils/filter-dashboard-shipments";

export interface BuildMockDashboardReportArgs {
  reportTitle: string;
  activeFilter?: string | null;
  counts?: DashboardCounts;
  shipments?: DashboardShipment[];
  generatedBy?: string;
  tenantName?: string;
}

function statusLabel(status: DashboardShipment["status"]): string {
  switch (status) {
    case "C":
      return "Confirmed";
    case "I":
      return "In Progress";
    case "D":
      return "Draft";
    case "V":
      return "Void";
    default:
      return status;
  }
}

/** Assembles a DashboardReport from existing dashboard mocks + filter. */
export function buildMockDashboardReport({
  reportTitle,
  activeFilter = "all",
  counts = MOCK_DASHBOARD_COUNTS,
  shipments = MOCK_DASHBOARD_SHIPMENTS,
  generatedBy = "Portal User",
  tenantName = "E-com Portal",
}: BuildMockDashboardReportArgs): DashboardReport {
  const filterKey = activeFilter || "all";
  const filtered = filterDashboardShipments(shipments, filterKey);
  const filterLabel = getDashboardFilterLabel(filterKey);

  return {
    title: reportTitle.trim() || "Dashboard Report",
    generatedAt: DateTime.utc().toISO() ?? new Date().toISOString(),
    generatedBy,
    tenantName,
    appliedFilters: [
      { label: "KPI filter", value: filterLabel },
      {
        label: "Shipments",
        value: `${filtered.length} of ${shipments.length}`,
      },
    ],
    sections: [
      {
        id: "shipmentKpis",
        type: "KPI",
        title: "Shipment overview",
        description: "Key operational counts from the enhanced dashboard.",
        items: [
          { label: "Total shipments", value: String(counts.totCou) },
          { label: "Booking confirmed", value: String(counts.bkConfirmed) },
          { label: "SI pending", value: String(counts.siPending) },
          { label: "Payment pending", value: String(counts.payPending) },
          { label: "At origin", value: String(counts.orgCou) },
          { label: "In transit", value: String(counts.inTransitCou) },
          { label: "Delivered", value: String(counts.delCou) },
          {
            label: "Pending amount",
            value: `$${counts.pendingAmount.toLocaleString()}`,
          },
        ],
      },
      {
        id: "ongoingTransactions",
        type: "TABLE",
        title: "Ongoing transactions",
        description:
          filterKey === "all"
            ? "All ongoing shipments."
            : `Filtered by: ${filterLabel}.`,
        columns: [
          { key: "bookNo", label: "Booking" },
          { key: "blNo", label: "B/L" },
          { key: "route", label: "Route" },
          { key: "polAt", label: "Departure" },
          { key: "status", label: "Status" },
          { key: "teus", label: "TEUs", align: "RIGHT" },
          { key: "amtBal", label: "Balance", align: "RIGHT" },
        ],
        rows: filtered.map((row) => ({
          bookNo: row.bookNo,
          blNo: row.blNo || "—",
          route: `${row.originPortId} → ${row.finalPortId}`,
          polAt: row.polAt,
          status: statusLabel(row.status),
          teus: row.teus,
          amtBal: row.amtBal > 0 ? `$${row.amtBal.toLocaleString()}` : "—",
        })),
        footnote:
          filtered.length === 0
            ? "No shipments match the current filter."
            : null,
      },
      {
        id: "volumeKpis",
        type: "KPI",
        title: "Volume (FEUs)",
        items: MOCK_VOLUME_KPIS.map((kpi) => ({
          label: kpi.label,
          value: `${kpi.value} ${kpi.unit}`,
          delta: `${kpi.change > 0 ? "+" : ""}${kpi.change}%`,
          deltaDirection:
            kpi.change > 0 ? "UP" : kpi.change < 0 ? "DOWN" : "FLAT",
        })),
      },
      {
        id: "volumeTrend",
        type: "CHART",
        title: "Volume trend",
        description: "Monthly FEU volume.",
        chartType: "LINE",
        categories: MOCK_VOLUME_TREND.map((p) => p.month),
        series: [
          {
            name: "FEUs",
            data: MOCK_VOLUME_TREND.map((p) => p.feus),
          },
        ],
        valueSuffix: null,
      },
      {
        id: "topLanes",
        type: "TABLE",
        title: "Top active lanes",
        columns: [
          { key: "rank", label: "#", align: "RIGHT" },
          { key: "lane", label: "Lane" },
          { key: "feus", label: "FEUs", align: "RIGHT" },
          { key: "pct", label: "% of total", align: "RIGHT" },
        ],
        rows: MOCK_TOP_LANES.map((lane) => ({
          rank: lane.rank,
          lane: `${lane.pol} → ${lane.pod}`,
          feus: lane.feus,
          pct: `${lane.pctOfTotal}%`,
        })),
      },
      {
        id: "topConsignees",
        type: "TABLE",
        title: "Top consignees",
        columns: [
          { key: "name", label: "Consignee" },
          { key: "feus", label: "FEUs", align: "RIGHT" },
          { key: "pct", label: "% of total", align: "RIGHT" },
        ],
        rows: MOCK_TOP_CONSIGNEES.map((c) => ({
          name: c.name,
          feus: c.feus,
          pct: `${c.pctOfTotal}%`,
        })),
      },
      {
        id: "lanesChart",
        type: "CHART",
        title: "Top lanes by FEU",
        chartType: "BAR",
        categories: MOCK_TOP_LANES.map((l) => `${l.pol}-${l.pod}`),
        series: [
          {
            name: "FEUs",
            data: MOCK_TOP_LANES.map((l) => l.feus),
          },
        ],
      },
    ],
  };
}
