// Modified by Sekar Nagarajan (2026-11-13 02:40)
import type {
  BarSeriesOption,
  FunnelSeriesOption,
  GaugeSeriesOption,
  HeatmapSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
  RadarSeriesOption,
  SankeySeriesOption,
  ScatterSeriesOption,
  TreemapSeriesOption,
} from 'echarts/charts';
import type {
  AriaComponentOption,
  DatasetComponentOption,
  DataZoomComponentOption,
  GraphicComponentOption,
  GridComponentOption,
  LegendComponentOption,
  MarkLineComponentOption,
  MarkPointComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components';
import type { ComposeOption, EChartsType } from 'echarts/core';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Composed ECharts option type covering only the modules registered in
 * `echarts-registry.ts`. Keeping this narrow keeps autocomplete focused and
 * surfaces missing module registrations as type errors instead of runtime
 * surprises.
 */
export type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | FunnelSeriesOption
  | TreemapSeriesOption
  | GaugeSeriesOption
  | ScatterSeriesOption
  | HeatmapSeriesOption
  | SankeySeriesOption
  | RadarSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | DatasetComponentOption
  | TitleComponentOption
  | DataZoomComponentOption
  | GraphicComponentOption
  | MarkLineComponentOption
  | MarkPointComponentOption
  | VisualMapComponentOption
  | ToolboxComponentOption
  | AriaComponentOption
>;

/** ECharts event handlers keyed by event name (`click`, `legendselectchanged`, …). */
export type ChartEventHandlers = Record<string, (params: unknown) => void>;

export type EChartsInstance = EChartsType;
export type ChartRenderer = 'canvas' | 'svg';

/**
 * Chart-flavored subset of AntD design tokens. Option factories receive these
 * tokens explicitly so that axes, tooltips, legends, and series colors match
 * the surrounding tenant/light/dark theme without relying solely on
 * `echarts.registerTheme`.
 */
export interface ChartTokens {
  colorText: string;
  colorTextSecondary: string;
  colorTextTertiary: string;
  colorBorder: string;
  colorBorderSecondary: string;
  colorBgContainer: string;
  colorBgElevated: string;
  colorBgLayout: string;
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  colorPurple: string;
  colorCyan: string;
  fontFamily: string;
  fontSize: number;
  fontSizeSM: number;
  borderRadius: number;
  /**
   * Stable identifier hashed from the visually-relevant tokens. Used as the
   * ECharts theme name so the chart can re-init cleanly when the user
   * switches light/dark mode or changes tenant theme.
   */
  themeName: string;
  /** Categorical color palette derived from the token system. */
  palette: readonly string[];
}

export interface AppChartProps {
  /** Fully-built ECharts option. Stabilize at the consumer with `useMemo`. */
  option: ECOption;
  /** Optional explicit tokens. Defaults to `useChartTokens()`. */
  tokens?: ChartTokens;
  /** Show the built-in chart loading overlay. */
  loading?: boolean;
  /** Show the built-in empty state instead of the chart. */
  empty?: boolean;
  /** Optional custom message inside the empty state. */
  emptyMessage?: ReactNode;
  /** Optional custom icon inside the empty state. */
  emptyIcon?: ReactNode;
  /** ECharts renderer. Defaults to `canvas`. */
  renderer?: ChartRenderer;
  /** Forward to `setOption` — replaces option instead of merging. */
  notMerge?: boolean;
  /** Forward to `setOption` — replace specific option keys. */
  replaceMerge?: string | string[];
  /** Forward to `setOption` — defer rendering until next animation frame. */
  lazyUpdate?: boolean;
  /** Fires once after `init`, then again on each re-init (theme change). */
  onChartReady?: (chart: EChartsInstance) => void;
  /**
   * ECharts events to subscribe to. Handlers are read through a ref, so passing a new object on
   * every render is fine and never re-binds the instance.
   */
  onEvents?: ChartEventHandlers;
  /**
   * Enable ECharts' built-in screen-reader description (`aria.enabled`) unless the option sets
   * `aria` itself. Defaults to true.
   */
  accessible?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Convenience prop: applied as `style.height`. `"auto"` leaves sizing to the consumer's CSS. */
  height?: number | string;
  /** Convenience prop: applied as `style.minHeight`. */
  minHeight?: number | string;
  /** Accessible label for the chart container. */
  ariaLabel?: string;
}
