/**
 * PDF export geometry — typographic points only.
 *
 * A4 portrait: 210×297 mm ≡ 595.28×841.89 pt (jsPDF `unit: 'pt'`, `format: 'a4'`).
 * Do not reuse these numbers in pptxgenjs (inches).
 */
export const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 40,
  marginTop: 44,
  marginBottom: 52,
} as const;

export const CONTENT_WIDTH = PAGE.width - PAGE.marginX * 2;

export const FONT = {
  family: 'helvetica',
  reportTitle: 22,
  sectionTitle: 13,
  body: 9,
  small: 8,
  metaLabel: 7,
  kpiValue: 16,
  kpiLabel: 8,
  kpiHint: 7,
} as const;

export const SPACING = {
  afterTitle: 8,
  afterMeta: 14,
  afterHeaderBlock: 20,
  beforeSection: 20,
  afterSectionTitle: 4,
  afterSectionDescription: 10,
  afterSection: 16,
  filterRow: 28,
  filterColumnGap: 16,
} as const;

/**
 * Off-screen chart raster size in CSS pixels, upscaled by `pixelRatio`
 * before it reaches the PDF.
 */
export const CHART_RASTER = {
  width: 900,
  height: 420,
  pixelRatio: 2,
} as const;

/** Printed width/height of a chart image, in points. */
export const CHART_PRINT = {
  width: CONTENT_WIDTH,
  height: CONTENT_WIDTH * (CHART_RASTER.height / CHART_RASTER.width),
} as const;

export const KPI_CARD = {
  gap: 10,
  minHeight: 56,
  paddingX: 10,
  paddingTop: 10,
  radius: 4,
} as const;
