// Modified by Sekar Nagarajan (2026-11-13 02:50)
import { renderChartToDataUrl } from "@solverminds/shared-ui/chart";

import type { DashboardReportChartSection } from "../../types/dashboard-export.types";
import { buildDashboardChartOption, type ReportChartContext } from "./report-chart-options";
import { CHART_INK, CHART_RASTER } from "./report-pdf-theme";

/**
 * Renders a report chart section to a PNG data URL via the shared off-screen renderer
 * (`animation: false` so getDataURL captures a finished frame).
 */
export function renderChartSectionToPng(
  section: DashboardReportChartSection,
  ctx: ReportChartContext,
): string {
  return renderChartToDataUrl(buildDashboardChartOption(section, ctx), {
    width: CHART_RASTER.width,
    height: CHART_RASTER.height,
    pixelRatio: CHART_RASTER.pixelRatio,
    backgroundColor: CHART_INK.background,
  });
}

export function renderChartImages(
  sections: DashboardReportChartSection[],
  ctx: ReportChartContext,
): Map<string, string> {
  const images = new Map<string, string>();
  for (const section of sections) {
    try {
      images.set(section.id, renderChartSectionToPng(section, ctx));
    } catch (error) {
      console.error("[dashboard-export] chart render failed", section.id, error);
    }
  }
  return images;
}
