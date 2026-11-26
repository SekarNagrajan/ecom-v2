// Created by Sekar Nagarajan (2026-11-13 02:40)
import { graphic } from 'echarts/core';

/** `#rrggbb` → `#rrggbbaa`; other colour formats are returned unchanged. */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim();
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

/**
 * Top-to-bottom fade used for area fills under a line. Lives here so consumers never import
 * `echarts/core` themselves (which would pull a second copy of the runtime into their chunk).
 */
export function createVerticalGradient(color: string, topAlpha = 0.21, bottomAlpha = 0) {
  return new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: withAlpha(color, topAlpha) },
    { offset: 1, color: withAlpha(color, bottomAlpha) },
  ]);
}
