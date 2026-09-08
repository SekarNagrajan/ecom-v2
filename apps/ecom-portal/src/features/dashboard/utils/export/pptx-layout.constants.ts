/**
 * PowerPoint export geometry — inches only (pptxgenjs default).
 *
 * LAYOUT_16x9: 10 × 5.625 in. Do not reuse PDF point constants here.
 */

export const SLIDE_W = 10;
export const SLIDE_H = 5.625;

/** Side margins → content width 9.0 in. */
export const MARGIN_X = 0.5;
export const MARGIN_Y = 0.35;
export const CONTENT_W = SLIDE_W - MARGIN_X * 2; // 9.0

/** Title band above KPI / chart / table body. */
export const TITLE_BAND_H = 0.45;
export const TITLE_BAND_Y = 0.28;

/** KPI: 4 columns × 2 rows; cards ≈ 2.2 × 1.1; 0.5 in top for title band. */
export const KPI = {
  cols: 4,
  rows: 2,
  maxItems: 8,
  cardW: 2.2,
  cardH: 1.1,
  /** (CONTENT_W - 4 * 2.2) / 3 */
  gapX: (CONTENT_W - 2.2 * 4) / 3,
  gapY: 0.15,
  /** Title sits in the top 0.5 in band. */
  titleY: 0.18,
  titleH: 0.32,
  gridTopY: 0.55,
  padX: 0.1,
  padY: 0.08,
} as const;

/** Chart box ≈ 9 × 4.2 below title/description band. */
export const CHART = {
  x: MARGIN_X,
  y: 0.9,
  w: CONTENT_W,
  h: 4.2,
} as const;

export const TABLE_ROWS_PER_SLIDE = 12;

export const TABLE = {
  titleY: TITLE_BAND_Y,
  titleH: TITLE_BAND_H,
  tableY: 0.85,
  /** Bottom band reserved for footnote on last chunk. */
  footnoteH: 0.32,
  footnoteBottomPad: 0.2,
} as const;

export const TITLE_SLIDE = {
  titleY: 0.5,
  titleH: 0.65,
  metaY: 1.25,
  metaH: 0.35,
  filtersHeadingY: 1.85,
  filtersHeadingH: 0.35,
  filtersTableY: 2.3,
  filtersTableH: 2.8,
} as const;

/** Equal column widths that sum exactly to `tableWidth`. */
export function buildEqualColWidths(
  columnCount: number,
  tableWidth: number = CONTENT_W
): number[] {
  const n = Math.max(columnCount, 1);
  const each = tableWidth / n;
  return Array.from({ length: n }, () => each);
}

/** Two-column filter table: 35% / 65% summing to `tableWidth`. */
export function buildFilterColWidths(tableWidth: number = CONTENT_W): number[] {
  const left = tableWidth * 0.35;
  return [left, tableWidth - left];
}

/**
 * Dev-only: throw if an element would extend past the slide bottom.
 * pptxgenjs silently clips past SLIDE_H — catch layout bugs early.
 */
export function assertOnSlide(
  label: string,
  y: number,
  h: number,
  slideH: number = SLIDE_H
): void {
  if (!import.meta.env.DEV) {
    return;
  }
  if (y + h > slideH + 1e-6) {
    throw new Error(
      `[pptx layout] ${label} overflows slide: y=${y} h=${h} slideH=${slideH}`
    );
  }
}
