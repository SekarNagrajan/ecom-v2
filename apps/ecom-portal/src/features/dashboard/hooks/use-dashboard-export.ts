// Created by Sekar Nagarajan (2026-09-08 15:44)
import { extractApiError } from "@solverminds/platform";
import {
  useDateFormat,
  useNumberFormat,
  useToast,
} from "@solverminds/shared-ui/hooks";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useChartTokens } from "../../theme/utils/use-portal-chart-tokens";
import { fetchDashboardReport } from "../api/dashboard-export.api";
import type { DashboardReport } from "../types/dashboard-export.types";
import {
  buildReportFilename,
  type ReportExportLabels,
} from "../utils/export/report-shared.utils";

export type DashboardExportFormat = "pdf" | "pptx";

export interface RunDashboardExportArgs {
  reportTitle: string;
  format: DashboardExportFormat;
  activeFilter?: string | null;
}

export interface DashboardExportPreviewResult {
  report: DashboardReport;
  format: DashboardExportFormat;
  filename: string;
}

export interface DashboardExportDownloadResult {
  filename: string;
  missingChartCount: number;
}

interface CachedReport {
  key: string;
  report: DashboardReport;
}

export interface UseDashboardExportArgs {
  activeFilter?: string | null;
}

/**
 * Preview fetches DashboardReport JSON; Download lazy-loads PDF/PPTX builders.
 */
export function useDashboardExport({
  activeFilter = "all",
}: UseDashboardExportArgs = {}) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const toast = useToast();
  const { formatDateTime } = useDateFormat();
  const { formatNumber, formatCurrency } = useNumberFormat();
  const chartTokens = useChartTokens();
  const reportCacheRef = useRef<CachedReport | null>(null);

  const labels: ReportExportLabels = useMemo(
    () => ({
      reportScope: t("export.reportScope"),
      chartUnavailable: t("export.chartUnavailable"),
      chartUnavailableShort: t("export.chartUnavailableShort"),
      pageOf: t("export.pageOf"),
      generatedBy: t("export.generatedBy"),
      appliedFilters: t("export.appliedFilters"),
      continued: t("export.continued"),
    }),
    [t],
  );

  async function resolveReport(reportTitle: string): Promise<DashboardReport> {
    const cacheKey = `${reportTitle}|${activeFilter ?? "all"}`;
    if (reportCacheRef.current?.key === cacheKey) {
      return reportCacheRef.current.report;
    }

    const response = await fetchDashboardReport({
      body: {
        reportTitle,
        activeFilter: activeFilter ?? "all",
      },
    });
    reportCacheRef.current = { key: cacheKey, report: response.data };
    return response.data;
  }

  const previewMutation = useMutation({
    mutationFn: async ({
      reportTitle,
      format,
    }: RunDashboardExportArgs): Promise<DashboardExportPreviewResult> => {
      const report = await resolveReport(reportTitle);
      return {
        report,
        format,
        filename: buildReportFilename(
          report,
          format === "pptx" ? "pptx" : "pdf",
        ),
      };
    },
    onError: (error) => {
      const message = extractApiError(error);
      toast.error(message || t("export.errors.previewFailed"));
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async ({
      report,
      format,
    }: RunDashboardExportArgs & {
      report: DashboardReport;
    }): Promise<DashboardExportDownloadResult> => {
      const renderOptions = {
        formatGeneratedAt: (isoUtc: string) => formatDateTime(isoUtc),
        chartTokens,
        formatNumber: (value: number) => formatNumber(value),
        formatCurrency: (value: number) => formatCurrency(value),
        labels,
      };

      if (format === "pdf") {
        const { downloadReportPdf } = await import(
          "../utils/export/report-pdf.service"
        );
        const { missingChartCount } = await downloadReportPdf(
          report,
          renderOptions,
        );
        return {
          filename: buildReportFilename(report, "pdf"),
          missingChartCount,
        };
      }

      const { downloadReportPptx } = await import(
        "../utils/export/report-pptx.service"
      );
      return downloadReportPptx(report, renderOptions);
    },
    onError: (error) => {
      const message = extractApiError(error);
      toast.error(message || t("export.errors.downloadFailed"));
    },
  });

  return {
    generatePreview: previewMutation.mutateAsync,
    downloadExport: downloadMutation.mutateAsync,
    isGenerating: previewMutation.isPending,
    isDownloading: downloadMutation.isPending,
    exportLabels: labels,
  };
}
