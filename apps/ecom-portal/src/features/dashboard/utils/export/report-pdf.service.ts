// Created by Sekar Nagarajan (2026-09-08 15:44)
import type { jsPDF as JsPdfType } from "jspdf";

import type { ChartTokens } from "../../../theme/utils/use-portal-chart-tokens";
import type {
  DashboardReport,
  DashboardReportChartSection,
} from "../../types/dashboard-export.types";
import { PAGE } from "./pdf-layout.constants";
import { renderChartImages } from "./report-chart-image";
import type { ReportChartContext } from "./report-chart-options";
import { drawFooters, drawHeaderBlock, drawSection } from "./report-pdf-layout";
import {
  buildReportFilename,
  iterateReportSections,
} from "./report-shared.utils";

export interface BuildReportPdfOptions {
  formatGeneratedAt: (isoUtc: string) => string;
  chartTokens: ChartTokens;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
}

export interface DownloadReportPdfResult {
  missingChartCount: number;
}

export async function buildReportPdf(
  report: DashboardReport,
  options: BuildReportPdfOptions,
): Promise<{ doc: JsPdfType; missingChartCount: number }> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  doc.setProperties({
    title: report.title,
    subject: "E-com Dashboard Report",
    author: report.generatedBy,
    creator: report.tenantName,
  });

  const chartSections = report.sections.filter(
    (section): section is DashboardReportChartSection =>
      section.type === "CHART",
  );
  const chartContext: ReportChartContext = {
    tokens: options.chartTokens,
    formatNumber: options.formatNumber,
    formatCurrency: options.formatCurrency,
  };
  const chartImages = renderChartImages(chartSections, chartContext);
  const missingChartCount = chartSections.length - chartImages.size;

  let y = drawHeaderBlock(
    doc,
    report,
    options.formatGeneratedAt(report.generatedAt),
  );

  iterateReportSections(report, {
    onKpi: (section) => {
      y = drawSection(doc, y, section, chartImages);
    },
    onChart: (section) => {
      y = drawSection(doc, y, section, chartImages);
    },
    onTable: (section) => {
      y = drawSection(doc, y, section, chartImages);
    },
  });

  drawFooters(doc, report);

  return { doc, missingChartCount };
}

export async function downloadReportPdf(
  report: DashboardReport,
  options: BuildReportPdfOptions,
): Promise<DownloadReportPdfResult> {
  const { doc, missingChartCount } = await buildReportPdf(report, options);
  doc.save(buildReportFilename(report, "pdf"));
  return { missingChartCount };
}

export const REPORT_PAGE_SIZE = PAGE;

export { buildReportFilename } from "./report-shared.utils";
