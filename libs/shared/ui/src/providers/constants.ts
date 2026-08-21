// Spacing System (Base unit: 4px)
export const SPACING = {
  XXS: 2, // 0.5x
  XS: 4, // 1x
  SM: 8, // 2x
  MD: 16, // 4x (Standard)
  LG: 24, // 6x
  XL: 32, // 8x
  XXL: 48, // 12x
  XXXL: 64, // 16x
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  XS: 480, // Extra Small
  SM: 640, // Mobile < 640px
  MD: 768, // Tablet Start (AntD Standard)
  LG: 1024, // Desktop Start
  XL: 1280, // Desktop Standard
  XXL: 1920, // Wide Desktop Start
} as const;
