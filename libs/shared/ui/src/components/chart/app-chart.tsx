import * as echarts from 'echarts/core';
import { useEffect, useRef } from 'react';

import { ChartEmptyState } from './chart-empty-state';
import { ChartLoadingState } from './chart-loading-state';
import type {
  AppChartProps,
  ChartTokens,
  EChartsInstance,
} from './chart-types';
import { createBaseChartTheme } from './create-base-chart-theme';
import { registerEChartsModules } from './echarts-registry';
import { patchPassivePointerListeners } from './patch-passive-pointer-listeners';
import { useChartTokens } from './use-chart-tokens';

const registeredThemes = new Set<string>();

function ensureThemeRegistered(tokens: ChartTokens): void {
  if (registeredThemes.has(tokens.themeName)) return;
  // ECharts `registerTheme` accepts `Dictionary<any>` (an unexported internal
  // type). Cast through the function's own parameter type so we don't reach
  // into ECharts internals.
  type RegisterThemeArgs = Parameters<typeof echarts.registerTheme>;
  echarts.registerTheme(
    tokens.themeName,
    createBaseChartTheme(tokens) as RegisterThemeArgs[1]
  );
  registeredThemes.add(tokens.themeName);
}

const DEFAULT_HEIGHT = 320;

/**
 * Imperative host for ECharts. Owns the chart instance lifecycle so callers
 * get a declarative React API without React-Compiler / StrictMode pitfalls
 * around an external library that cares about object identity.
 *
 * Lifecycle:
 * - first mount: register modules + theme, `init`, `setOption`, install
 *   ResizeObserver
 * - option change: `setOption(option, { notMerge, replaceMerge, lazyUpdate })`
 * - tokens.themeName or renderer change: dispose + re-init, `setOption`
 *   re-fires automatically because the option effect depends on those keys
 * - container resize: `chart.resize()` via ResizeObserver, throttled to one
 *   call per animation frame so AntD layout settling doesn't trigger many
 *   relayouts back-to-back
 * - unmount: cancel pending raf, disconnect observer, dispose
 *
 * `loading` and `empty` overlay the chart instead of swapping it out, so the
 * chart instance stays alive across loading flips (every refetch/filter
 * change) — avoiding init/dispose churn on the imperative library.
 */
export function AppChart({
  option,
  tokens: tokensProp,
  loading,
  empty,
  emptyMessage,
  emptyIcon,
  renderer = 'canvas',
  notMerge,
  replaceMerge,
  lazyUpdate,
  onChartReady,
  className,
  style,
  height,
  minHeight,
  ariaLabel,
}: AppChartProps) {
  const fallbackTokens = useChartTokens();
  const tokens = tokensProp ?? fallbackTokens;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<EChartsInstance | null>(null);

  // Init / dispose. Re-runs only when the underlying chart instance must be
  // recreated — i.e. theme name or renderer changes. Option updates are
  // handled by the dedicated effect below so option-only changes never
  // recreate the canvas.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    registerEChartsModules();
    ensureThemeRegistered(tokens);

    // Zrender attaches `mousewheel` / `wheel` / `touchstart` / `touchmove`
    // listeners inside `echarts.init` without an options object, which
    // Chrome flags as scroll-blocking. We don't enable the
    // `DataZoomInsideComponent`, so ECharts never calls `preventDefault` on
    // those events — force them passive for the duration of init, then
    // restore the prototype method so nothing else is affected.
    const restorePassivePatch = patchPassivePointerListeners(container);
    const chart = echarts.init(container, tokens.themeName, { renderer });
    restorePassivePatch();
    chartRef.current = chart;
    onChartReady?.(chart);

    // ResizeObserver fires synchronously on every layout settle. AntD layout
    // can produce multiple resizes in a single frame (sidebar collapse,
    // <Col> width recompute). Coalesce to one `chart.resize()` per frame.
    let rafId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        chart.resize();
      });
    });
    observer.observe(container);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
    // `tokens.themeName` is the only token-derived dep that should trigger a
    // re-init; all visual token changes flow through the hash. `option` is
    // intentionally excluded — see the option effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens.themeName, renderer]);

  // Apply option. Runs:
  // - on first mount, immediately after the init effect set up `chartRef`
  // - whenever option/notMerge/replaceMerge/lazyUpdate change
  // - whenever theme/renderer change (re-init created a fresh chart that
  //   needs the option re-applied) — that's why themeName/renderer are deps
  // Net effect: exactly one `setOption` call per relevant change, no double
  // application on first mount.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setOption(option, { notMerge, replaceMerge, lazyUpdate });
  }, [option, notMerge, replaceMerge, lazyUpdate, tokens.themeName, renderer]);

  const showOverlay = Boolean(loading || empty);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: height ?? DEFAULT_HEIGHT,
        minHeight,
        ...style,
      }}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
        // Hide the chart visually while overlaying, but keep it mounted so
        // the ECharts instance doesn't churn between init/dispose cycles on
        // every loading flip.
        aria-hidden={showOverlay || undefined}
      />
      {showOverlay ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Match the surrounding card so the chart underneath isn't
            // visible while loading/empty. `colorBgContainer` is the same
            // token DashboardSection uses for its Card.
            backgroundColor: tokens.colorBgContainer,
          }}
        >
          {empty ? (
            <ChartEmptyState message={emptyMessage} icon={emptyIcon} />
          ) : (
            <ChartLoadingState />
          )}
        </div>
      ) : null}
    </div>
  );
}
