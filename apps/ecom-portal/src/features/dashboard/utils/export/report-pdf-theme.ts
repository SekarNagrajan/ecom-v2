// Created by Sekar Nagarajan (2026-08-06 12:51)
/**
 * Palette for the exported PDF (print-safe colours).
 *
 * Geometry lives in `pdf-layout.constants.ts` (points). Re-exported below so
 * existing layout imports keep working.
 */
export {
  CHART_PRINT,
  CHART_RASTER,
  CONTENT_WIDTH,
  FONT,
  KPI_CARD,
  PAGE,
  SPACING,
} from './pdf-layout.constants';

/**
 * RGB triples. jsPDF wants three separate channel arguments, so tuples keep
 * the call sites tidy: `doc.setTextColor(...INK.heading)`.
 */
export const INK = {
  heading: [17, 24, 39],
  body: [55, 65, 81],
  muted: [107, 114, 128],
  rule: [229, 231, 235],
  tableHeadBg: [243, 244, 246],
  tableStripe: [249, 250, 251],
  positive: [22, 101, 52],
  negative: [153, 27, 27],
  positiveSoft: [220, 252, 231],
  negativeSoft: [254, 226, 226],
  accent: [37, 99, 235],
  accentSoft: [239, 246, 255],
  /** Scope panel behind the applied-filter grid in the header. */
  headerPanelBg: [249, 250, 251],
  headerPanelBorder: [229, 231, 235],
  cardBg: [255, 255, 255],
} as const satisfies Record<string, readonly [number, number, number]>;

/**
 * Chart series palette. Print-safe: distinguishable in greyscale, no pure
 * saturated primaries that bleed on office laser printers.
 */
export const CHART_PALETTE = [
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
] as const;

/**
 * Ordered stage palette for funnel-style charts. Mirrors the semantic AntD
 * tokens the on-screen Sales Funnel maps each stage to — primary, purple,
 * success, warning, error — so the exported funnel matches the dashboard
 * (Leads = blue, Qualified = purple, Opportunity = green, Negotiation =
 * amber, Won = red). Cycles for funnels with more than five stages.
 */
export const CHART_STAGE_PALETTE = [
  '#4f46e5',
  '#7c3aed',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
] as const;

export const CHART_INK = {
  axis: '#6b7280',
  axisLine: '#e5e7eb',
  splitLine: '#f3f4f6',
  label: '#374151',
  background: '#ffffff',
} as const;

/**
 * Light tint backgrounds for KPI tiles — one per card, cycling. Mirrors the
 * semantic tones on-screen (primary, success, info, warning, etc.) while
 * staying print-safe and legible with dark text on top.
 */
export const KPI_CARD_TINTS = [
  INK.accentSoft,
  INK.positiveSoft,
  [237, 233, 254] as const, // purple
  [254, 243, 199] as const, // amber
  [207, 250, 254] as const, // cyan
  [252, 231, 243] as const, // pink
  [236, 253, 245] as const, // teal
  [255, 237, 213] as const, // orange
] as const;
