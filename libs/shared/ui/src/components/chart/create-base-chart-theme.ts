import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components';

import type { ChartTokens } from './chart-types';

/**
 * ECharts `registerTheme` accepts `Dictionary<any>` internally and does not
 * export a public type. We expose a record-shape alias so consumers and
 * tests don't have to reach into ECharts internals.
 */
export type AppChartTheme = Record<string, unknown>;

/**
 * Builds the ECharts theme object registered as `tokens.themeName`. Covers
 * broad strokes — text color, font family, palette, axis defaults — so that
 * any option that does not explicitly set those values still picks up the
 * AntD theme. Per-chart option factories should still apply tokens
 * explicitly for tooltip backgrounds, axis split lines, and other elements
 * where the theme defaults are not enough.
 */
export function createBaseChartTheme(tokens: ChartTokens): AppChartTheme {
  return {
    color: tokens.palette,
    backgroundColor: 'transparent',
    textStyle: {
      color: tokens.colorText,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
    },
    title: {
      textStyle: {
        color: tokens.colorText,
        fontFamily: tokens.fontFamily,
      },
      subtextStyle: {
        color: tokens.colorTextSecondary,
        fontFamily: tokens.fontFamily,
      },
    },
    legend: {
      textStyle: {
        color: tokens.colorTextSecondary,
        fontFamily: tokens.fontFamily,
      },
    },
    valueAxis: {
      axisLine: { lineStyle: { color: tokens.colorBorder } },
      axisTick: { lineStyle: { color: tokens.colorBorder } },
      axisLabel: { color: tokens.colorTextSecondary },
      splitLine: { lineStyle: { color: tokens.colorBorderSecondary } },
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: tokens.colorBorder } },
      axisTick: { lineStyle: { color: tokens.colorBorder } },
      axisLabel: { color: tokens.colorTextSecondary },
      splitLine: {
        show: false,
        lineStyle: { color: tokens.colorBorderSecondary },
      },
    },
  };
}

export function createBaseTooltip(
  tokens: ChartTokens,
  overrides: TooltipComponentOption = {}
): TooltipComponentOption {
  return {
    backgroundColor: tokens.colorBgElevated,
    borderColor: tokens.colorBorder,
    borderWidth: 1,
    padding: 8,
    textStyle: {
      color: tokens.colorText,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSizeSM,
    },
    extraCssText: `border-radius: ${tokens.borderRadius}px;`,
    ...overrides,
  };
}

export function createBaseLegend(
  tokens: ChartTokens,
  overrides: LegendComponentOption = {}
): LegendComponentOption {
  return {
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 12,
    textStyle: {
      color: tokens.colorTextSecondary,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSizeSM,
    },
    ...overrides,
  };
}

export function createBaseGrid(
  overrides: GridComponentOption = {}
): GridComponentOption {
  return {
    left: 16,
    right: 16,
    top: 24,
    bottom: 24,
    containLabel: true,
    ...overrides,
  };
}

export interface BaseAxisStyle {
  axisLine: { lineStyle: { color: string } };
  axisTick: { lineStyle: { color: string } };
  axisLabel: {
    color: string;
    fontFamily: string;
    fontSize: number;
  };
  splitLine: { lineStyle: { color: string; type: 'dashed' } };
}

export function createBaseAxisStyle(tokens: ChartTokens): BaseAxisStyle {
  return {
    axisLine: { lineStyle: { color: tokens.colorBorder } },
    axisTick: { lineStyle: { color: tokens.colorBorder } },
    axisLabel: {
      color: tokens.colorTextSecondary,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSizeSM,
    },
    splitLine: {
      lineStyle: { color: tokens.colorBorderSecondary, type: 'dashed' },
    },
  };
}
