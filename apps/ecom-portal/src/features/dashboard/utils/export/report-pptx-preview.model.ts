// Slide plan for HTML PowerPoint preview — must stay in sync with
// report-pptx.service.ts chunking (one title / KPI / chart / table chunk).
import type {
  DashboardReport,
  DashboardReportChartSection,
  DashboardReportFilter,
  DashboardReportKpiItem,
  DashboardReportTableColumn,
} from '../../types/dashboard-export.types';
import { TABLE_ROWS_PER_SLIDE } from './pptx-layout.constants';
import {
  chunkTableBodyRows,
  displayReportCell,
  formatDeltaWithArrow,
  iterateReportSections,
} from './report-shared.utils';

export interface BuildPptxPreviewOptions {
  formatGeneratedAt: (isoUtc: string) => string;
}

export type PptxPreviewSlide =
  | {
      kind: 'title';
      title: string;
      tenantName: string;
      generatedBy: string;
      generatedAt: string;
      filters: DashboardReportFilter[];
    }
  | {
      kind: 'kpi';
      title: string;
      items: Array<
        DashboardReportKpiItem & {
          displayValue: string;
          deltaText: string | null;
        }
      >;
    }
  | {
      kind: 'chart';
      title: string;
      /** Live AppChart source — same data as native PPTX charts. */
      section: DashboardReportChartSection;
    }
  | {
      kind: 'table';
      title: string;
      columns: DashboardReportTableColumn[];
      rows: string[][];
      footnote: string | null;
    };

/**
 * Builds the same slide list `buildReportPptx` would emit (chunking rules
 * identical). Used by format-aware HTML preview — no PDF/PPTX bytes.
 */
export function buildPptxPreviewSlides(
  report: DashboardReport,
  options: BuildPptxPreviewOptions
): PptxPreviewSlide[] {
  const slides: PptxPreviewSlide[] = [
    {
      kind: 'title',
      title: report.title,
      tenantName: report.tenantName,
      generatedBy: report.generatedBy,
      generatedAt: options.formatGeneratedAt(report.generatedAt),
      filters: report.appliedFilters,
    },
  ];

  iterateReportSections(report, {
    onKpi: (section) => {
      slides.push({
        kind: 'kpi',
        title: section.title,
        items: section.items.slice(0, 8).map((item) => ({
          ...item,
          displayValue: displayReportCell(item.value),
          deltaText: formatDeltaWithArrow(item.delta, item.deltaDirection),
        })),
      });
    },
    onChart: (section) => {
      slides.push({
        kind: 'chart',
        title: section.title,
        section,
      });
    },
    onTable: (section) => {
      const chunks = chunkTableBodyRows(section.rows, TABLE_ROWS_PER_SLIDE);
      chunks.forEach((chunk, index) => {
        slides.push({
          kind: 'table',
          title: index === 0 ? section.title : `${section.title} (cont.)`,
          columns: section.columns,
          rows: chunk.map((row) =>
            section.columns.map((col) => displayReportCell(row[col.key]))
          ),
          footnote:
            index === chunks.length - 1 ? (section.footnote ?? null) : null,
        });
      });
    },
  });

  return slides;
}
