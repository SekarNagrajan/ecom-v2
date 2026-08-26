// Modified by Sekar Nagarajan (2026-08-25 17:25)

/**
 * BE ↔ UI theme config mapper.
 *
 * Phase 5 (CRM parity — deferred): wire GET/PUT `/api-theme-config` with
 * optimistic Zustand updates + debounced save via React Query. Until the
 * backend endpoint exists, ecom persists themeMode in localStorage only
 * (`ecom-user-theme-config`). This mapper is ready for that future path.
 */
import { type AppCustomConfig } from '@solverminds/shared-ui/providers';

import {
  applyDensityThemeFields,
} from './density-theme-fields';

export interface BackendAppConfig {
  themeMode?: 'LIGHT' | 'DARK' | 'SYSTEM';
  densityLevel?: 'COMPACT' | 'NORMAL' | 'COMFORTABLE';
  lineHeight?: 'COMPACT' | 'NORMAL' | 'RELAXED';
  baseFontSize?: 'SMALL' | 'MEDIUM' | 'LARGE';
  dateFormat?: 'DD_MM_YYYY' | 'MM_DD_YYYY' | 'YYYY_MM_DD' | 'DD_MMM_YYYY';
  timeFormat?: 'HOUR_12' | 'HOUR_24';
  currencyDisplay?: 'SYMBOL' | 'CODE' | 'NAME';
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: 'SHARP' | 'SMALL' | 'MEDIUM' | 'LARGE';
  timezone?: string;
  locale?: string;
  currencyFormat?: string;
  currency?: string;
  fontFamily?: 'INTER' | 'ROBOTO' | 'OPEN_SANS' | 'POPPINS';
}

export const BE_THEME_MODE_MAP = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'auto',
} as const;

export const BE_DENSITY_MAP = {
  COMPACT: 'compact',
  NORMAL: 'normal',
  COMFORTABLE: 'comfortable',
} as const;

export const BE_COLOR_MAP = {
  BLUE: '#1677ff',
  MARITIME: '#1B6DAB',
  GOLD: '#faad14',
  GREEN: '#52c41a',
  RED: '#f5222d',
  PURPLE: '#722ed1',
  CYAN: '#13c2c2',
  ORANGE: '#fa8c16',
  GREY: '#8c8c8c',
} as const;

export const mapBeToUiConfig = (
  beConfig: Partial<BackendAppConfig>
): AppCustomConfig => {
  const result: Omit<
    AppCustomConfig,
    'baseFontSize' | 'lineHeight' | 'borderRadius'
  > = {
    timezone: beConfig.timezone || 'UTC',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    locale: 'en-US',
    formattingRegion: 'en-US',
    currency: beConfig.currency || 'USD',
    currencyDisplay: 'symbol',
    themeMode:
      beConfig.themeMode && beConfig.themeMode in BE_THEME_MODE_MAP
        ? BE_THEME_MODE_MAP[
            beConfig.themeMode as keyof typeof BE_THEME_MODE_MAP
          ]
        : 'light',
    density:
      beConfig.densityLevel && beConfig.densityLevel in BE_DENSITY_MAP
        ? BE_DENSITY_MAP[beConfig.densityLevel as keyof typeof BE_DENSITY_MAP]
        : 'normal',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    primaryColor: beConfig.primaryColor || '#1B6DAB',
    secondaryColor: '#595959',
    successColor: '#52c41a',
    warningColor: '#faad14',
    errorColor: '#ff4d4f',
    infoColor: '#1677ff',
    neutralColor: '#595959',
  };

  return applyDensityThemeFields({
    ...result,
    baseFontSize: 14,
    lineHeight: 'normal',
    borderRadius: 8,
  });
};
