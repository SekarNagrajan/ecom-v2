// Created by Sekar Nagarajan (2026-09-08 15:44)
/**
 * Generic dashboard report contract — no ecom-specific vocabulary.
 * PDF/PPTX renderers switch on `type` only.
 */

/** Discriminant for the section union. */
export type DashboardReportSectionType = "KPI" | "CHART" | "TABLE";

export type DashboardReportChartType =
  | "BAR"
  | "STACKED_BAR"
  | "LINE"
  | "AREA"
  | "PIE"
  | "DONUT"
  | "FUNNEL";

export type DashboardReportAlign = "LEFT" | "CENTER" | "RIGHT";

export type DashboardReportDeltaDirection = "UP" | "DOWN" | "FLAT";

export interface DashboardReportFilter {
  label: string;
  value: string;
}

export interface DashboardReportKpiItem {
  label: string;
  value: string;
  delta?: string | null;
  deltaDirection?: DashboardReportDeltaDirection | null;
}

export interface DashboardReportChartSeries {
  name: string;
  data: (number | null)[];
}

export interface DashboardReportTableColumn {
  key: string;
  label: string;
  align?: DashboardReportAlign | null;
}

interface DashboardReportSectionBase {
  id: string;
  title: string;
  description?: string | null;
}

export interface DashboardReportKpiSection extends DashboardReportSectionBase {
  type: "KPI";
  items: DashboardReportKpiItem[];
}

export interface DashboardReportChartSection extends DashboardReportSectionBase {
  type: "CHART";
  chartType: DashboardReportChartType;
  categories: string[];
  series: DashboardReportChartSeries[];
  valueSuffix?: string | null;
}

export interface DashboardReportTableSection extends DashboardReportSectionBase {
  type: "TABLE";
  columns: DashboardReportTableColumn[];
  rows: Record<string, string | number | null>[];
  footnote?: string | null;
}

export type DashboardReportSection =
  | DashboardReportKpiSection
  | DashboardReportChartSection
  | DashboardReportTableSection;

export interface DashboardReport {
  title: string;
  generatedAt: string;
  generatedBy: string;
  tenantName: string;
  appliedFilters: DashboardReportFilter[];
  sections: DashboardReportSection[];
}

export interface DashboardExportRequestBody {
  reportTitle: string;
  activeFilter?: string | null;
  sectionIds?: string[];
}
