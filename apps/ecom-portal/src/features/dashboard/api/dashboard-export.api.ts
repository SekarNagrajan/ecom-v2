// Created by Sekar Nagarajan (2026-09-08 15:44)
import type {
  DashboardExportRequestBody,
  DashboardReport,
} from "../types/dashboard-export.types";

export interface FetchDashboardReportArgs {
  body: DashboardExportRequestBody;
}

export async function fetchDashboardReport({
  body,
}: FetchDashboardReportArgs): Promise<{ data: DashboardReport }> {
  const response = await fetch("/api/v1/dashboard/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to generate dashboard report");
  }

  return response.json() as Promise<{ data: DashboardReport }>;
}
