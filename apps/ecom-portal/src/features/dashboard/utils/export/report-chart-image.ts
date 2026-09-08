// Created by Sekar Nagarajan (2026-09-08 15:44)
import * as echarts from "echarts";

import type { DashboardReportChartSection } from "../../types/dashboard-export.types";
import {
  buildDashboardChartOption,
  type ReportChartContext,
} from "./report-chart-options";
import { CHART_INK, CHART_RASTER } from "./report-pdf-theme";

/**
 * Renders a report chart section to a PNG data URL via an off-screen
 * ECharts instance (`animation: false` so getDataURL captures a finished frame).
 */
export function renderChartSectionToPng(
  section: DashboardReportChartSection,
  ctx: ReportChartContext,
): string {
  const container = document.createElement("div");
  container.style.width = `${CHART_RASTER.width}px`;
  container.style.height = `${CHART_RASTER.height}px`;
  container.style.position = "absolute";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const chart = echarts.init(container, undefined, {
    renderer: "canvas",
    width: CHART_RASTER.width,
    height: CHART_RASTER.height,
    devicePixelRatio: CHART_RASTER.pixelRatio,
  });

  try {
    chart.setOption(buildDashboardChartOption(section, ctx), true);
    return chart.getDataURL({
      type: "png",
      pixelRatio: CHART_RASTER.pixelRatio,
      backgroundColor: CHART_INK.background,
    });
  } finally {
    chart.dispose();
    container.remove();
  }
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
      console.error(
        "[dashboard-export] chart render failed",
        section.id,
        error,
      );
    }
  }
  return images;
}
