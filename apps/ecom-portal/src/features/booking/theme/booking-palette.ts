// Created by Sekar Nagarajan (2026-09-02 17:45)
/**
 * Booking module colour seeds (design palette).
 * Hex lives only here — components must consume Ant Design tokens /
 * CSS variables from BookingThemeProvider, never raw literals.
 */
export const BOOKING_PALETTE = {
  brandNavy: "#0B2748",
  primaryAction: "#1677FF",
  activeStep: "#315EFB",
  completed: "#00875A",
  pageBackground: "#F4F7FA",
  cardBackground: "#FFFFFF",
  mainText: "#172B4D",
  secondaryText: "#667085",
  border: "#D9E2EC",
  warning: "#D97706",
  error: "#D92D20",
  informationBackground: "#EAF4FF",
} as const;

export type BookingPaletteKey = keyof typeof BOOKING_PALETTE;
