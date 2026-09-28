// Modified by Sekar Nagarajan (2026-09-28 16:17)
import {
  ACCESSIBILITY_DEFAULTS,
  NOTIFICATION_TIMEOUT_OPTIONS,
  type AppCustomConfig,
  type ContrastMode,
  type LetterSpacingLevel,
  type NotificationBehavior,
  type ReadingMaskSize,
} from "@solverminds/shared-ui/providers";
import { type ColorPickerProps } from "antd";

import { BE_COLOR_MAP } from "./utils/config-mapper";
import { getDensityThemeFields } from "./utils/density-theme-fields";

export {
  NOTIFICATION_TIMEOUT_OPTIONS,
  READING_MASK_FOCUS_HEIGHT_MAX,
  READING_MASK_FOCUS_HEIGHT_MIN,
  READING_MASK_FOCUS_WIDTH_MAX,
  READING_MASK_FOCUS_WIDTH_MIN,
  READING_MASK_OPACITY_MAX,
  READING_MASK_OPACITY_MIN,
  READING_MASK_PRESET_DIMENSIONS,
} from "@solverminds/shared-ui/providers";

export const READING_MASK_SIZE_OPTIONS: ReadonlyArray<{
  label: string;
  value: ReadingMaskSize;
}> = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
  { label: "Custom", value: "custom" },
];

export const NOTIFICATION_BEHAVIOR_OPTIONS: ReadonlyArray<{
  label: string;
  value: NotificationBehavior;
}> = [
  { label: "Auto-Close (Default)", value: "auto" },
  { label: "Manual Close", value: "manual" },
];

export const TOAST_TIMEOUT_SELECT_OPTIONS = NOTIFICATION_TIMEOUT_OPTIONS.map(
  (seconds) => ({
    label: `${seconds} Sec(s)`,
    value: seconds,
  }),
);

export const INTER_FONT_STACK =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" as const;

export const THEME_MODE_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Auto", value: "auto" },
] as const;

export const DENSITY_LEVEL_OPTIONS = [
  { label: "Compact", value: "compact" },
  { label: "Normal", value: "normal" },
  { label: "Comfortable", value: "comfortable" },
] as const;

export const FONT_FAMILY_OPTIONS = [
  { label: "Inter", value: INTER_FONT_STACK },
  { label: "Roboto", value: "'Roboto Flex', sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
] as const;

export const BASE_FONT_SIZE_OPTIONS = [
  { label: "12px", value: 12 },
  { label: "14px", value: 14 },
  { label: "16px", value: 16 },
  { label: "18px", value: 18 },
  { label: "28px", value: 28 },
] as const;

/** Letter-spacing steps (em) for ABCD tiles — index 0–6. */
export const LETTER_SPACING_EM: Record<LetterSpacingLevel, number> = {
  0: 0,
  1: 0.02,
  2: 0.04,
  3: 0.06,
  4: 0.1,
  5: 0.14,
  6: 0.2,
};

export const LETTER_SPACING_OPTIONS: ReadonlyArray<{
  label: string;
  value: LetterSpacingLevel;
}> = (
  [0, 1, 2, 3, 4, 5, 6] as const satisfies readonly LetterSpacingLevel[]
).map((value) => ({ label: "ABCD", value }));

export const CONTRAST_MODE_OPTIONS: ReadonlyArray<{
  label: string;
  value: ContrastMode;
}> = [
  { label: "Enhanced Contrast", value: "enhanced" },
  { label: "High Contrast", value: "high" },
];

export const PAGE_ZOOM_MIN = 100;
export const PAGE_ZOOM_MAX = 150;
export const PAGE_ZOOM_STEP = 5;

export const DATE_FORMAT_OPTIONS = [
  { label: "DD/MM/YYYY (31/01/2024)", value: "dd/MM/yyyy" },
  { label: "MM/DD/YYYY (01/31/2024)", value: "MM/dd/yyyy" },
  { label: "YYYY-MM-DD (2024-01-31)", value: "yyyy-MM-dd" },
  { label: "DD MMM YYYY (31 Jan 2024)", value: "dd MMM yyyy" },
] as const;

export const TIME_FORMAT_OPTIONS = [
  { label: "12-hour (01:30 PM)", value: "hh:mm a" },
  { label: "24-hour (13:30)", value: "HH:mm" },
] as const;

export const REGION_OPTIONS = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
  { label: "French (France)", value: "fr-FR" },
  { label: "German (Germany)", value: "de-DE" },
  { label: "Spanish (Spain)", value: "es-ES" },
] as const;

export const NUMBER_FORMAT_OPTIONS = [
  { label: "1,234,567.89 (US/UK)", value: "en-US" },
  { label: "12,34,567.89 (Indian)", value: "en-IN" },
  { label: "1.234.567,89 (EU)", value: "de-DE" },
] as const;

export const CURRENCY_FORMAT_OPTIONS = [
  { label: "1,234,567.89 (US/UK)", value: "US/UK" },
  { label: "12,34,567.89 (Indian)", value: "INDIAN" },
  { label: "1.234.567,89 (EU)", value: "EU" },
] as const;

// Modified by Sekar Nagarajan (2026-09-10 21:49) — warm earth palette for style actions
export const COLOR_OPTIONS = [
  { label: "Maritime Blue", value: BE_COLOR_MAP.MARITIME },
  { label: "Harbor Blue", value: BE_COLOR_MAP.HARBOR },
  { label: "Signal Blue", value: BE_COLOR_MAP.SIGNAL },
  { label: "Ocean Blue", value: BE_COLOR_MAP.BLUE },
  { label: "Charcoal Blue", value: BE_COLOR_MAP.CHARCOAL_BLUE },
  { label: "Verdigris", value: BE_COLOR_MAP.VERDIGRIS },
  { label: "Tuscan Sun", value: BE_COLOR_MAP.TUSCAN_SUN },
  { label: "Sandy Brown", value: BE_COLOR_MAP.SANDY_BROWN },
  { label: "Burnt Peach", value: BE_COLOR_MAP.BURNT_PEACH },
  { label: "Sunlit Gold", value: BE_COLOR_MAP.GOLD },
  { label: "Forest Green", value: BE_COLOR_MAP.GREEN },
  { label: "Sunset Red", value: BE_COLOR_MAP.RED },
  { label: "Royal Purple", value: BE_COLOR_MAP.PURPLE },
  { label: "Crystal Cyan", value: BE_COLOR_MAP.CYAN },
  { label: "Bright Orange", value: BE_COLOR_MAP.ORANGE },
  { label: "Neutral Grey", value: BE_COLOR_MAP.GREY },
] as const;

export const CURRENCY_OPTIONS = [
  { label: "US Dollar (USD)", value: "USD" },
  { label: "Euro (EUR)", value: "EUR" },
  { label: "British Pound (GBP)", value: "GBP" },
  { label: "Indian Rupee (INR)", value: "INR" },
  { label: "Australian Dollar (AUD)", value: "AUD" },
  { label: "Japanese Yen (JPY)", value: "JPY" },
] as const;

export const CURRENCY_DISPLAY_OPTIONS = [
  { label: "Symbol ($)", value: "symbol" },
  { label: "Code (USD)", value: "code" },
  { label: "Name (Dollar)", value: "name" },
] as const;

export const PRESET_COLORS: ColorPickerProps["presets"] = [
  {
    label: "Standard",
    colors: COLOR_OPTIONS.map((c) => c.value),
  },
];

const DEFAULT_DENSITY = DENSITY_LEVEL_OPTIONS[1].value;
const DEFAULT_DENSITY_FIELDS = getDensityThemeFields(DEFAULT_DENSITY);

export const DEFAULT_APP_CONFIG: AppCustomConfig = {
  timezone: "UTC",
  dateFormat: DATE_FORMAT_OPTIONS[0].value,
  timeFormat: TIME_FORMAT_OPTIONS[1].value, // 24h
  locale: REGION_OPTIONS[0].value,
  formattingRegion: "en-US",
  currency: CURRENCY_OPTIONS[0].value,
  currencyDisplay: CURRENCY_DISPLAY_OPTIONS[0].value,

  // Theme
  themeMode: THEME_MODE_OPTIONS[0].value,
  density: DEFAULT_DENSITY,
  borderRadius: DEFAULT_DENSITY_FIELDS.borderRadius,

  // Typography — Inter @ 14px is the cleared-storage / first-visit default
  fontFamily: FONT_FAMILY_OPTIONS[0].value,
  baseFontSize: BASE_FONT_SIZE_OPTIONS[1].value, // 14px
  lineHeight: DEFAULT_DENSITY_FIELDS.lineHeight,

  // Colors — Signal Blue primary when no persisted preference exists
  primaryColor: BE_COLOR_MAP.SIGNAL,
  successColor: BE_COLOR_MAP.GREEN,
  warningColor: BE_COLOR_MAP.GOLD,
  errorColor: BE_COLOR_MAP.RED,
  infoColor: BE_COLOR_MAP.BLUE,
  secondaryColor: BE_COLOR_MAP.GOLD,
  neutralColor: BE_COLOR_MAP.GREY,

  // Accessibility — Vision + behavior preferences
  letterSpacing: ACCESSIBILITY_DEFAULTS.letterSpacing,
  contrastEnabled: ACCESSIBILITY_DEFAULTS.contrastEnabled,
  contrastMode: ACCESSIBILITY_DEFAULTS.contrastMode,
  pageZoom: ACCESSIBILITY_DEFAULTS.pageZoom,
  readingMask: { ...ACCESSIBILITY_DEFAULTS.readingMask },
  notifications: {
    customTimingEnabled:
      ACCESSIBILITY_DEFAULTS.notifications.customTimingEnabled,
    success: { ...ACCESSIBILITY_DEFAULTS.notifications.success },
    info: { ...ACCESSIBILITY_DEFAULTS.notifications.info },
    warning: { ...ACCESSIBILITY_DEFAULTS.notifications.warning },
    error: { ...ACCESSIBILITY_DEFAULTS.notifications.error },
  },
};
