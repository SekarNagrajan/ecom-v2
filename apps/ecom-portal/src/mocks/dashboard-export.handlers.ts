// Modified by Sekar Nagarajan (2026-10-16 23:45)
import { http, HttpResponse } from "msw";

import type { DashboardExportRequestBody } from "../features/dashboard/types/dashboard-export.types";
import { fixtureDashboardReport } from "./fixture-api/bridges/dashboard.bridge";

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const dashboardExportHandlers = [
  http.post("/api/v1/dashboard/export", async ({ request }) => {
    await delay(400); // ~400ms report assembly

    const body = (await request.json()) as DashboardExportRequestBody;

    if (!body?.reportTitle || body.reportTitle.trim().length < 3) {
      return HttpResponse.json(
        { message: "Report title must be at least 3 characters" },
        { status: 400 },
      );
    }

    const report = fixtureDashboardReport({
      reportTitle: body.reportTitle,
      activeFilter: body.activeFilter ?? "all",
    });

    return HttpResponse.json({ data: report });
  }),
];
