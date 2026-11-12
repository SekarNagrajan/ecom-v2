// Created by Sekar Nagarajan (2026-11-13 02:40)
/**
 * Off-screen rasteriser for reports (PDF / PPTX): renders an option into a detached container and
 * returns a PNG data URL. Uses the same registered modules as AppChart, so consumers never need
 * the full `echarts` package.
 */
import * as echarts from 'echarts/core';

import type { ChartTokens, ECOption } from './chart-types';
import { createBaseChartTheme } from './create-base-chart-theme';
import { registerEChartsModules } from './echarts-registry';

export interface RenderChartImageOptions {
  width: number;
  height: number;
  pixelRatio?: number;
  backgroundColor?: string;
  /** Register and apply the token theme; omit for print-safe options that set every colour. */
  tokens?: ChartTokens;
}

const registeredThemes = new Set<string>();

export function renderChartToDataUrl(
  option: ECOption | Record<string, unknown>,
  opts: RenderChartImageOptions
): string {
  registerEChartsModules();
  let themeName: string | undefined;
  if (opts.tokens) {
    themeName = opts.tokens.themeName;
    if (!registeredThemes.has(themeName)) {
      type RegisterThemeArgs = Parameters<typeof echarts.registerTheme>;
      echarts.registerTheme(themeName, createBaseChartTheme(opts.tokens) as RegisterThemeArgs[1]);
      registeredThemes.add(themeName);
    }
  }

  const container = document.createElement('div');
  container.style.cssText = `width:${opts.width}px;height:${opts.height}px;position:absolute;left:-10000px;top:0;pointer-events:none;`;
  document.body.appendChild(container);

  const chart = echarts.init(container, themeName, {
    renderer: 'canvas',
    width: opts.width,
    height: opts.height,
    devicePixelRatio: opts.pixelRatio ?? 2,
  });

  try {
    chart.setOption({ animation: false, ...(option as ECOption) }, true);
    return chart.getDataURL({
      type: 'png',
      pixelRatio: opts.pixelRatio ?? 2,
      backgroundColor: opts.backgroundColor ?? '#ffffff',
    });
  } finally {
    chart.dispose();
    container.remove();
  }
}
