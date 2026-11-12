// Created by Sekar Nagarajan (2026-11-13 02:00)
/**
 * Token-driven styles for AppTimeline. Rendered once per mounted timeline; React hoists and
 * de-duplicates `<style precedence>` elements, so many timelines share one sheet.
 */
import { theme } from 'antd';

const mix = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

export function AppTimelineStyles() {
  const { token } = theme.useToken();
  const css = `
.sm-timeline { list-style: none; margin: 0; padding: 0; }
.sm-timeline--vertical { display: flex; flex-direction: column; overflow-y: auto; padding-inline-end: ${token.paddingXS}px; }
.sm-timeline--horizontal { display: flex; flex-direction: row; align-items: flex-start; overflow-x: auto; overflow-y: hidden; padding: ${token.paddingXS}px 0 ${token.paddingSM}px; width: 100%; }

.sm-timeline__step { position: relative; min-width: 0; }
.sm-timeline--horizontal .sm-timeline__step { display: flex; flex-direction: column; align-items: stretch; flex: 1 1 0; min-width: 148px; }
.sm-timeline--vertical .sm-timeline__step { display: grid; grid-template-columns: var(--sm-timeline-node) minmax(0, 1fr); column-gap: ${token.marginSM}px; align-items: stretch; }

.sm-timeline__rail { display: flex; align-items: center; justify-content: center; }
.sm-timeline--horizontal .sm-timeline__rail { flex-direction: row; width: 100%; min-height: var(--sm-timeline-node); margin-bottom: ${token.marginMD}px; }
.sm-timeline--vertical .sm-timeline__rail { flex-direction: column; }

.sm-timeline__line { flex: 1 1 0; border: 0 solid ${token.colorBorder}; }
.sm-timeline--horizontal .sm-timeline__line { height: 0; min-width: 0; border-top-width: 2px; }
.sm-timeline--horizontal .sm-timeline__line--before { margin-inline-end: ${token.marginXXS}px; }
.sm-timeline--horizontal .sm-timeline__line--after { margin-inline-start: ${token.marginXXS}px; }
.sm-timeline--vertical .sm-timeline__line { width: 0; min-height: ${token.controlHeightLG}px; margin: ${token.marginXXS}px 0; border-inline-start-width: 2px; }
.sm-timeline--vertical .sm-timeline__line--before { display: none; }
.sm-timeline__line--solid { border-color: ${token.colorSuccess}; border-style: solid; }
.sm-timeline__line--dashed { border-color: ${token.colorBorder}; border-style: dashed; }
.sm-timeline__line--ghost { visibility: hidden; }
.sm-timeline__line--hidden { display: none; }

.sm-timeline__node { position: relative; width: var(--sm-timeline-node); height: var(--sm-timeline-node); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 1; line-height: 1; border: 2px solid ${token.colorBorder}; background: ${token.colorBgContainer}; color: ${token.colorTextTertiary}; font-size: var(--sm-timeline-icon); }
.sm-timeline__node > * { position: relative; z-index: 1; color: inherit; }
.sm-timeline__node > * svg { color: inherit; stroke: currentColor; }
.sm-timeline__node svg { width: var(--sm-timeline-icon); height: var(--sm-timeline-icon); }
.sm-timeline__node-pulse { position: absolute; inset: 0; border-radius: 50%; background: ${mix(token.colorPrimary, 45)}; z-index: 0; animation: sm-timeline-pulse 1.8s ease-out infinite; }
.sm-timeline__node-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.sm-timeline__step--done .sm-timeline__node { background: ${token.colorSuccess}; border-color: ${token.colorSuccess}; color: ${token.colorTextLightSolid}; }
.sm-timeline__step--current .sm-timeline__node { background: ${token.colorPrimary}; border-color: ${token.colorPrimary}; color: ${token.colorTextLightSolid}; box-shadow: 0 0 0 4px ${token.colorPrimaryBg}; }
.sm-timeline__step--error .sm-timeline__node { background: ${token.colorErrorBg}; border-color: ${token.colorError}; color: ${token.colorError}; }
.sm-timeline__step--neutral .sm-timeline__node { background: ${token.colorFillAlter}; border-color: ${token.colorBorderSecondary}; color: ${token.colorTextSecondary}; }

.sm-timeline__body { min-width: 0; display: flex; flex-direction: column; gap: ${token.marginXXS}px; }
.sm-timeline--horizontal .sm-timeline__body { align-items: center; text-align: center; width: 100%; padding-inline: ${token.paddingXXS}px; }
.sm-timeline--vertical .sm-timeline__body { align-items: flex-start; text-align: start; padding-bottom: ${token.paddingLG}px; }
.sm-timeline--vertical .sm-timeline__step:last-child .sm-timeline__body { padding-bottom: 0; }
.sm-timeline--sm.sm-timeline--vertical .sm-timeline__body { padding-bottom: ${token.paddingSM}px; }

.sm-timeline__title { display: block; margin: 0; max-width: 100%; font-size: var(--sm-timeline-font); font-weight: ${token.fontWeightStrong}; color: ${token.colorText}; line-height: 1.35; }
.sm-timeline--horizontal .sm-timeline__title, .sm-timeline--horizontal .sm-timeline__subtitle { width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sm-timeline__step--upcoming .sm-timeline__title { color: ${token.colorTextSecondary}; }
.sm-timeline__subtitle { display: block; margin: 0; max-width: 100%; font-size: ${token.fontSizeSM}px; color: ${token.colorTextSecondary}; line-height: 1.35; }
.sm-timeline__badge { display: inline-flex; align-items: center; gap: ${token.marginXXS}px; padding: 2px ${token.paddingSM}px; border-radius: ${token.borderRadiusLG * 2}px; font-size: ${token.fontSizeSM - 1}px; font-weight: ${token.fontWeightStrong}; line-height: 1.4; white-space: nowrap; border: 1px solid ${token.colorBorderSecondary}; background: ${token.colorFillAlter}; color: ${token.colorTextSecondary}; }
.sm-timeline__step--done .sm-timeline__badge { background: ${mix(token.colorSuccess, 12)}; color: ${token.colorSuccess}; border-color: ${mix(token.colorSuccess, 22)}; }
.sm-timeline__step--current .sm-timeline__badge { background: ${token.colorPrimaryBg}; color: ${token.colorPrimary}; border-color: ${mix(token.colorPrimary, 30)}; }
.sm-timeline__step--error .sm-timeline__badge { background: ${token.colorErrorBg}; color: ${token.colorError}; border-color: ${token.colorErrorBorder}; }
.sm-timeline__time { display: block; margin: 0; font-size: ${token.fontSizeSM}px; color: ${token.colorTextSecondary}; line-height: 1.35; min-height: 1.35em; }
.sm-timeline__time--empty { visibility: hidden; }
.sm-timeline__time-value { font-weight: ${token.fontWeightStrong}; color: ${token.colorText}; }
.sm-timeline__step--done .sm-timeline__time-value { color: ${token.colorSuccess}; }
.sm-timeline__step--current .sm-timeline__time-value { color: ${token.colorPrimary}; }
.sm-timeline__meta { font-size: ${token.fontSizeSM}px; color: ${token.colorText}; line-height: 1.4; }

.sm-timeline--md { --sm-timeline-node: 40px; --sm-timeline-icon: 18px; --sm-timeline-font: ${token.fontSize}px; }
.sm-timeline--sm { --sm-timeline-node: 28px; --sm-timeline-icon: 14px; --sm-timeline-font: ${token.fontSizeSM}px; }

.sm-timeline__empty { padding: ${token.paddingSM}px 0; color: ${token.colorTextTertiary}; font-size: ${token.fontSizeSM}px; }
.sm-timeline__skeleton-row { display: grid; grid-template-columns: var(--sm-timeline-node) minmax(0, 1fr); column-gap: ${token.marginSM}px; padding-bottom: ${token.paddingLG}px; }

@keyframes sm-timeline-pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.9); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .sm-timeline__node-pulse { animation: none; } }
`;
  return (
    <style precedence="sm-timeline" href="sm-timeline">
      {css}
    </style>
  );
}
