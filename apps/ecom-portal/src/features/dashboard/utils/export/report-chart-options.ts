// Created by Sekar Nagarajan (2026-09-08 15:44)
import type { ChartTokens } from "../../../theme/utils/use-portal-chart-tokens";
import type { DashboardReportChartSection } from "../../types/dashboard-export.types";
import { CHART_PALETTE } from "./report-pdf-theme";

export interface ReportChartContext {
  tokens: ChartTokens;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number) => string;
}

export type ECOption = Record<string, unknown>;

const DEFAULT_PALETTE = [...CHART_PALETTE];

/** Builds a print-safe ECharts option from the generic chart section payload. */
export function buildDashboardChartOption(
  section: DashboardReportChartSection,
  ctx: ReportChartContext,
): ECOption {
  return finalizePrintOption(buildGenericChartOption(section, ctx), ctx.tokens);
}

function finalizePrintOption(option: ECOption, tokens: ChartTokens): ECOption {
  return {
    ...option,
    animation: false,
    tooltip: { show: false },
    backgroundColor: tokens.colorBgContainer,
  };
}

function numberAt(
  section: DashboardReportChartSection,
  seriesIndex: number,
  categoryIndex: number,
): number {
  const value = section.series[seriesIndex]?.data[categoryIndex];
  return typeof value === "number" ? value : 0;
}

function buildGenericChartOption(
  section: DashboardReportChartSection,
  ctx: ReportChartContext,
): ECOption {
  const palette = DEFAULT_PALETTE;
  const suffix = section.valueSuffix ?? "";
  const isLine = section.chartType === "LINE" || section.chartType === "AREA";
  const stacked = section.chartType === "STACKED_BAR";
  const isCircular =
    section.chartType === "PIE" || section.chartType === "DONUT";
  const showLegend = section.series.length > 1;

  const axisStyle = {
    axisLabel: {
      color: ctx.tokens.colorTextSecondary,
      fontSize: 11,
      fontFamily: ctx.tokens.fontFamily,
    },
    axisLine: { lineStyle: { color: ctx.tokens.colorBorderSecondary } },
    splitLine: { lineStyle: { color: ctx.tokens.colorBorderSecondary } },
  };

  if (isCircular) {
    const values = section.series[0]?.data ?? [];
    return {
      color: palette,
      series: [
        {
          type: "pie",
          radius: section.chartType === "DONUT" ? ["42%", "62%"] : "70%",
          center: ["50%", "46%"],
          data: section.categories.map((name, index) => ({
            name,
            value: values[index] ?? 0,
          })),
          label: { show: true, color: ctx.tokens.colorTextSecondary },
        },
      ],
    };
  }

  return {
    color: palette,
    legend: showLegend
      ? {
          top: 0,
          textStyle: {
            color: ctx.tokens.colorTextSecondary,
            fontFamily: ctx.tokens.fontFamily,
          },
        }
      : undefined,
    grid: {
      left: 48,
      right: 16,
      top: showLegend ? 36 : 16,
      bottom: 40,
      containLabel: false,
    },
    xAxis: {
      type: "category",
      data: section.categories,
      ...axisStyle,
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      ...axisStyle,
      axisLabel: {
        ...axisStyle.axisLabel,
        formatter: (value: number) =>
          `${ctx.formatNumber(value)}${suffix}`,
      },
    },
    series: section.series.map((series, index) =>
      isLine
        ? {
            name: series.name,
            type: "line" as const,
            data: series.data.map((v) => (v === null ? 0 : v)),
            smooth: true,
            showSymbol: series.data.length <= 12,
            symbolSize: 6,
            lineStyle: { width: 2 },
            areaStyle:
              section.chartType === "AREA" ? { opacity: 0.16 } : undefined,
            itemStyle: {
              color: palette[index % palette.length],
            },
          }
        : {
            name: series.name,
            type: "bar" as const,
            stack: stacked ? "total" : undefined,
            data: series.data.map((v, i) =>
              v === null
                ? null
                : {
                    value: v,
                    itemStyle: {
                      color: palette[i % palette.length],
                      borderRadius: stacked ? 0 : [4, 4, 0, 0],
                    },
                  },
            ),
            barCategoryGap: "40%",
          },
    ),
  };
}

export { numberAt };
