// Modified by Sekar Nagarajan (2026-08-24 15:42)
import { type AppCustomConfig } from '@solverminds/shared-ui/providers';
import { type ColorPickerProps } from 'antd';

import { BE_COLOR_MAP } from './utils/config-mapper';
import { getDensityThemeFields } from './utils/density-theme-fields';

export const INTER_FONT_STACK =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" as const;

export const THEME_MODE_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'auto' },
] as const;

export const DENSITY_LEVEL_OPTIONS = [
  { label: 'Compact', value: 'compact' },
  { label: 'Normal', value: 'normal' },
  { label: 'Comfortable', value: 'comfortable' },
] as const;

export const FONT_FAMILY_OPTIONS = [
  { label: 'Inter (28px)', value: INTER_FONT_STACK },
  { label: 'Roboto', value: "'Roboto Flex', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
] as const;

export const BASE_FONT_SIZE_OPTIONS = [
  { label: '12px', value: 12 },
  { label: '14px', value: 14 },
  { label: '16px', value: 16 },
  { label: '18px', value: 18 },
  { label: '28px', value: 28 },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { label: 'DD/MM/YYYY (31/01/2024)', value: 'dd/MM/yyyy' },
  { label: 'MM/DD/YYYY (01/31/2024)', value: 'MM/dd/yyyy' },
  { label: 'YYYY-MM-DD (2024-01-31)', value: 'yyyy-MM-dd' },
  { label: 'DD MMM YYYY (31 Jan 2024)', value: 'dd MMM yyyy' },
] as const;

export const TIME_FORMAT_OPTIONS = [
  { label: '12-hour (01:30 PM)', value: 'hh:mm a' },
  { label: '24-hour (13:30)', value: 'HH:mm' },
] as const;

export const REGION_OPTIONS = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'French (France)', value: 'fr-FR' },
  { label: 'German (Germany)', value: 'de-DE' },
  { label: 'Spanish (Spain)', value: 'es-ES' },
] as const;

export const NUMBER_FORMAT_OPTIONS = [
  { label: '1,234,567.89 (US/UK)', value: 'en-US' },
  { label: '12,34,567.89 (Indian)', value: 'en-IN' },
  { label: '1.234.567,89 (EU)', value: 'de-DE' },
] as const;

export const CURRENCY_FORMAT_OPTIONS = [
  { label: '1,234,567.89 (US/UK)', value: 'US/UK' },
  { label: '12,34,567.89 (Indian)', value: 'INDIAN' },
  { label: '1.234.567,89 (EU)', value: 'EU' },
] as const;

export const COLOR_OPTIONS = [
  { label: 'Maritime Blue', value: BE_COLOR_MAP.MARITIME },
  { label: 'Ocean Blue', value: BE_COLOR_MAP.BLUE },
  { label: 'Sunlit Gold', value: BE_COLOR_MAP.GOLD },
  { label: 'Forest Green', value: BE_COLOR_MAP.GREEN },
  { label: 'Sunset Red', value: BE_COLOR_MAP.RED },
  { label: 'Royal Purple', value: BE_COLOR_MAP.PURPLE },
  { label: 'Crystal Cyan', value: BE_COLOR_MAP.CYAN },
  { label: 'Bright Orange', value: BE_COLOR_MAP.ORANGE },
  { label: 'Neutral Grey', value: BE_COLOR_MAP.GREY },
] as const;

export const CURRENCY_OPTIONS = [
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Euro (EUR)', value: 'EUR' },
  { label: 'British Pound (GBP)', value: 'GBP' },
  { label: 'Indian Rupee (INR)', value: 'INR' },
  { label: 'Australian Dollar (AUD)', value: 'AUD' },
  { label: 'Japanese Yen (JPY)', value: 'JPY' },
] as const;

export const CURRENCY_DISPLAY_OPTIONS = [
  { label: 'Symbol ($)', value: 'symbol' },
  { label: 'Code (USD)', value: 'code' },
  { label: 'Name (Dollar)', value: 'name' },
] as const;

export const PRESET_COLORS: ColorPickerProps['presets'] = [
  {
    label: 'Standard',
    colors: COLOR_OPTIONS.map((c) => c.value),
  },
];

const DEFAULT_DENSITY = DENSITY_LEVEL_OPTIONS[1].value;
const DEFAULT_DENSITY_FIELDS = getDensityThemeFields(DEFAULT_DENSITY);

export const DEFAULT_APP_CONFIG: AppCustomConfig = {
  timezone: 'UTC',
  dateFormat: DATE_FORMAT_OPTIONS[0].value,
  timeFormat: TIME_FORMAT_OPTIONS[1].value, // 24h
  locale: REGION_OPTIONS[0].value,
  formattingRegion: 'en-US',
  currency: CURRENCY_OPTIONS[0].value,
  currencyDisplay: CURRENCY_DISPLAY_OPTIONS[0].value,

  // Theme
  themeMode: THEME_MODE_OPTIONS[0].value,
  density: DEFAULT_DENSITY,
  borderRadius: DEFAULT_DENSITY_FIELDS.borderRadius,

  // Typography
  fontFamily: FONT_FAMILY_OPTIONS[0].value,
  baseFontSize: 28,
  lineHeight: DEFAULT_DENSITY_FIELDS.lineHeight,

  // Colors
  primaryColor: BE_COLOR_MAP.MARITIME,
  successColor: BE_COLOR_MAP.GREEN,
  warningColor: BE_COLOR_MAP.GOLD,
  errorColor: BE_COLOR_MAP.RED,
  infoColor: BE_COLOR_MAP.BLUE,
  secondaryColor: BE_COLOR_MAP.GOLD,
  neutralColor: BE_COLOR_MAP.GREY,
};
