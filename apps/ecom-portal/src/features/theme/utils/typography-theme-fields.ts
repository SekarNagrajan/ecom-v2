// Modified by Sekar Nagarajan (2026-08-24 16:35)
export function getTypographyThemeFields(baseFontSize: number) {
  return {
    fontSize: baseFontSize,
    fontSizeSM: Math.round(baseFontSize * 0.857),
    fontSizeLG: Math.round(baseFontSize * 1.143),
    fontSizeXL: Math.round(baseFontSize * 1.286),
    fontSizeHeading1: Math.round(baseFontSize * 2.375),
    fontSizeHeading2: Math.round(baseFontSize * 1.875),
    fontSizeHeading3: Math.round(baseFontSize * 1.5),
    fontSizeHeading4: Math.round(baseFontSize * 1.25),
    fontSizeHeading5: Math.round(baseFontSize * 1.125),
  };
}
