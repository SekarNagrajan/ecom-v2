// Dashboard report export — shared helpers for PDF + PowerPoint
import { DateTime } from 'luxon';

import type {
  DashboardReport,
  DashboardReportChartSeries,
  DashboardReportChartType,
  DashboardReportDeltaDirection,
  DashboardReportSection,
  DashboardReportTableSection,
} from '../../types/dashboard-export.types';

export const REPORT_NULL_DISPLAY = '—';

/** Default table chunk size (PPTX layout also exports `TABLE_ROWS_PER_SLIDE`). */
export const DEFAULT_TABLE_BODY_ROWS_PER_CHUNK = 12;

export type ReportFileExtension = 'pdf' | 'pptx';

/**
 * `quarterly-pipeline-review-2026-08-06.pdf` (or `.pptx`). Slugified because
 * the title is free text and Windows rejects a fair few filename characters.
 */
export function buildReportFilename(
  report: DashboardReport,
  extension: ReportFileExtension = 'pdf'
): string {
  const slug =
    report.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'dashboard-report';

  const stamp = DateTime.fromISO(report.generatedAt).isValid
    ? DateTime.fromISO(report.generatedAt).toFormat('yyyy-LL-dd')
    : DateTime.now().toFormat('yyyy-LL-dd');

  return `${slug}-${stamp}.${extension}`;
}

/** Null / undefined / empty → em dash for print and slides. */
export function displayReportCell(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === '') {
    return REPORT_NULL_DISPLAY;
  }
  return String(value);
}

/** KPI / print delta with a directional arrow when direction is known. */
export function formatDeltaWithArrow(
  delta: string | null | undefined,
  direction: DashboardReportDeltaDirection | null | undefined
): string | null {
  if (!delta) {
    return null;
  }
  const arrow =
    direction === 'UP'
      ? '↑'
      : direction === 'DOWN'
      ? '↓'
      : direction === 'FLAT'
      ? '→'
      : '';
  return arrow ? `${arrow} ${delta}` : delta;
}

export interface PptxChartSeriesPoint {
  name: string;
  labels: string[];
  values: number[];
}

/**
 * Converts report chart series into pptxgenjs-ready values.
 *
 * - LINE / AREA: null → 0 (continuous line).
 * - BAR / STACKED_BAR / PIE / DONUT: drop any category index where any
 *   series value is null.
 */
export function buildPptxChartData(
  chartType: DashboardReportChartType,
  categories: string[],
  series: DashboardReportChartSeries[]
): PptxChartSeriesPoint[] | null {
  if (categories.length === 0 || series.length === 0) {
    return null;
  }

  if (chartType === 'LINE' || chartType === 'AREA') {
    return series.map((s) => ({
      name: s.name,
      labels: [...categories],
      values: s.data.map((v) => (v === null ? 0 : v)),
    }));
  }

  if (
    chartType === 'BAR' ||
    chartType === 'STACKED_BAR' ||
    chartType === 'PIE' ||
    chartType === 'DONUT'
  ) {
    const keepIndices = categories
      .map((_, index) => index)
      .filter((index) => series.every((s) => s.data[index] !== null));

    if (keepIndices.length === 0) {
      return null;
    }

    const labels = keepIndices.flatMap((index) => {
      const label = categories[index];
      return label === undefined ? [] : [label];
    });
    return series.map((s) => ({
      name: s.name,
      labels,
      values: keepIndices.map((i) => s.data[i] as number),
    }));
  }

  // FUNNEL is rasterised separately — no native series mapping.
  return null;
}

/** Split table body rows into chunks (header is repeated by the caller). */
export function chunkTableBodyRows<T>(
  rows: T[],
  chunkSize: number = DEFAULT_TABLE_BODY_ROWS_PER_CHUNK
): T[][] {
  if (rows.length === 0) {
    return [[]];
  }
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    chunks.push(rows.slice(i, i + chunkSize));
  }
  return chunks;
}

export interface ReportSectionHandlers {
  onKpi: (section: Extract<DashboardReportSection, { type: 'KPI' }>) => void;
  onChart: (
    section: Extract<DashboardReportSection, { type: 'CHART' }>
  ) => void;
  onTable: (section: DashboardReportTableSection) => void;
}

/** Walk report sections in order; used by PDF and PPTX builders. */
export function iterateReportSections(
  report: DashboardReport,
  handlers: ReportSectionHandlers
): void {
  for (const section of report.sections) {
    switch (section.type) {
      case 'KPI':
        handlers.onKpi(section);
        break;
      case 'CHART':
        handlers.onChart(section);
        break;
      case 'TABLE':
        handlers.onTable(section);
        break;
    }
  }
}

export function revokeObjectUrl(url: string | null | undefined): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

/** Trigger a browser download from an existing object URL (does not revoke). */
export function downloadObjectUrl(url: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
