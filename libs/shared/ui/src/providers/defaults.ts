import {
  type AppCustomConfig,
  type NotificationPreferences,
  type ReadingMaskPreferences,
} from "./types";

export const DEFAULT_READING_MASK: ReadingMaskPreferences = {
  enabled: false,
  size: "medium",
  focusHeight: 120,
  focusWidth: 600,
  opacity: 0.35,
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  customTimingEnabled: false,
  success: { behavior: "auto", timeout: 3 },
  info: { behavior: "auto", timeout: 3 },
  warning: { behavior: "manual", timeout: 5 },
  error: { behavior: "manual", timeout: 5 },
};

/** Single source for accessibility behavior defaults. */
export const ACCESSIBILITY_DEFAULTS = {
  letterSpacing: 0 as const,
  contrastEnabled: false,
  contrastMode: "enhanced" as const,
  pageZoom: 100,
  readingMask: DEFAULT_READING_MASK,
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
};

export const DEFAULT_APP_CONFIG: AppCustomConfig = {
  timezone: "UTC",
  dateFormat: "dd/MM/yyyy",
  timeFormat: "HH:mm",
  locale: "en-US",
  formattingRegion: "en-US",
  currency: "USD",
  currencyDisplay: "symbol",

  // Theme
  themeMode: "light",
  density: "normal",
  borderRadius: 8,

  // Typography
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  baseFontSize: 14,
  lineHeight: "normal",

  // Colors - Standard Ant Design Defaults
  primaryColor: "#1677ff", // Ocean Blue
  // Modified by Sekar Nagarajan (2026-08-31 12:52) — success emerald #047857
  successColor: "#047857",
  warningColor: "#faad14",
  errorColor: "#ff4d4f",
  infoColor: "#1677ff",

  // Colors - Custom
  secondaryColor: "#faad14",
  neutralColor: "#595959",

  // Accessibility
  letterSpacing: ACCESSIBILITY_DEFAULTS.letterSpacing,
  contrastEnabled: ACCESSIBILITY_DEFAULTS.contrastEnabled,
  contrastMode: ACCESSIBILITY_DEFAULTS.contrastMode,
  pageZoom: ACCESSIBILITY_DEFAULTS.pageZoom,
  readingMask: ACCESSIBILITY_DEFAULTS.readingMask,
  notifications: ACCESSIBILITY_DEFAULTS.notifications,
};
