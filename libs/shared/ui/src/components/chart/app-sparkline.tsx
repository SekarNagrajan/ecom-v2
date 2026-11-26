// Created by Sekar Nagarajan (2026-11-13 02:40)
/**
 * Minimal trend line for KPI tiles and table cells: no axes, no grid, optional area fade.
 * Renders through AppChart so it shares the registered modules, theme and resize handling.
 */
import { useMemo } from 'react';

import { AppChart } from './app-chart';
import { createVerticalGradient } from './chart-gradients';
import type { ECOption } from './chart-types';
import { useChartTokens } from './use-chart-tokens';

export interface AppSparklineProps {
  data: readonly number[];
  /** Line colour; defaults to the primary token. */
  color?: string;
  /** Fill the area under the line with a fade of `color`. */
  area?: boolean;
  smooth?: boolean;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

export function AppSparkline({
  data,
  color,
  area = true,
  smooth = true,
  height = 40,
  className,
  ariaLabel,
}: AppSparklineProps) {
  const tokens = useChartTokens();
  const lineColor = color ?? tokens.colorPrimary;
  // Imperative-library exception: ECharts re-applies the option on identity change.
  const option = useMemo<ECOption>(
    () => ({
      animation: false,
      grid: { top: 2, right: 0, bottom: 2, left: 0 },
      xAxis: { type: 'category', boundaryGap: false, show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value', show: false },
      tooltip: { show: false },
      series: [
        {
          type: 'line',
          data: [...data],
          smooth,
          symbol: 'none',
          lineStyle: { color: lineColor, width: 2 },
          areaStyle: area ? { color: createVerticalGradient(lineColor) } : undefined,
        },
      ],
    }),
    [data, lineColor, smooth, area]
  );

  return (
    <AppChart
      option={option}
      height={height}
      className={className}
      ariaLabel={ariaLabel ?? `Trend of ${data.length} points`}
      accessible={false}
    />
  );
}
