// Modified by Sekar Nagarajan (2026-08-28 10:42)

/** Standard Ant Design Col spans — use across all feature modules for consistent responsive grids. */
export const RESPONSIVE_COL = {
  /** Full width on all breakpoints */
  full: { xs: 24 },
  /** Half width from sm+ */
  half: { xs: 24, sm: 12 },
  /** One third from lg+ */
  third: { xs: 24, sm: 12, lg: 8 },
  /** Quarter (stat cards, quick actions) */
  quarter: { xs: 24, sm: 12, lg: 6 },
  /** Two-thirds / one-third split */
  twoThirds: { xs: 24, lg: 16 },
  oneThird: { xs: 24, lg: 8 },
  /** Form field pairs */
  formHalf: { xs: 24, md: 12 },
  formThird: { xs: 24, md: 8 },
  /** Four commodity fields on one row from lg */
  formQuarter: { xs: 24, md: 12, lg: 6 },
  /** Six equal fields on one row from lg (commodity scalar row) */
  formSixth: { xs: 24, md: 12, lg: 4 },
} as const;
