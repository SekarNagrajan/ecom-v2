// Modified by Sekar Nagarajan (2026-09-18 12:26)

/**
 * BE ↔ UI theme config mapper.
 *
 * Phase 5 (CRM parity — deferred): wire GET/PUT `/api-theme-config` with
 * optimistic Zustand updates + debounced save via React Query. Until the
 * backend endpoint exists, ecom persists themeMode in localStorage only
 * (`ecom-user-theme-config`). This mapper is ready for that future path.
 */
import {
  ACCESSIBILITY_DEFAULTS,
  type AppCustomConfig,
} from "@solverminds/shared-ui/providers";

import { applyDensityThemeFields } from "./density-theme-fields";

export interface BackendAppConfig {
  themeMode?: "LIGHT" | "DARK" | "SYSTEM";
  densityLevel?: "COMPACT" | "NORMAL" | "COMFORTABLE";
  lineHeight?: "COMPACT" | "NORMAL" | "RELAXED";
  baseFontSize?: "SMALL" | "MEDIUM" | "LARGE";
  dateFormat?: "DD_MM_YYYY" | "MM_DD_YYYY" | "YYYY_MM_DD" | "DD_MMM_YYYY";
  timeFormat?: "HOUR_12" | "HOUR_24";
  currencyDisplay?: "SYMBOL" | "CODE" | "NAME";
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: "SHARP" | "SMALL" | "MEDIUM" | "LARGE";
  timezone?: string;
  locale?: string;
  currencyFormat?: string;
  currency?: string;
  fontFamily?: "INTER" | "ROBOTO" | "OPEN_SANS" | "POPPINS";
}

export const BE_THEME_MODE_MAP = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "auto",
} as const;

export const BE_DENSITY_MAP = {
  COMPACT: "compact",
  NORMAL: "normal",
  COMFORTABLE: "comfortable",
} as const;

export const BE_COLOR_MAP = {
  BLUE: "#1677ff",
  MARITIME: "#1B6DAB",
  /** Brighter maritime variant — Appearance / header primary swatches only */
  HARBOR: "#3B7DDD",
  // Modified by Sekar Nagarajan (2026-09-08 15:45) — signal/action primary swatch
  SIGNAL: "#0a91ff",
  GOLD: "#faad14",
  // Modified by Sekar Nagarajan (2026-08-31 12:52) — success emerald #047857
  GREEN: "#047857",
  RED: "#f5222d",
  PURPLE: "#722ed1",
  CYAN: "#13c2c2",
  ORANGE: "#fa8c16",
  GREY: "#8c8c8c",
  // Modified by Sekar Nagarajan (2026-09-10 21:49) — warm earth palette for style actions
  CHARCOAL_BLUE: "#264653",
  VERDIGRIS: "#2a9d8f",
  TUSCAN_SUN: "#e9c46a",
  SANDY_BROWN: "#f4a261",
  BURNT_PEACH: "#e76f51",
  // Modified by Sekar Nagarajan (2026-09-17 18:32) — In Transit KPI accent
  TERRA_COTTA: "#d66853",
} as const;

export const mapBeToUiConfig = (
  beConfig: Partial<BackendAppConfig>,
): AppCustomConfig => {
  const result: Omit<
    AppCustomConfig,
    "baseFontSize" | "lineHeight" | "borderRadius"
  > = {
    timezone: beConfig.timezone || "UTC",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "HH:mm",
    locale: "en-US",
    formattingRegion: "en-US",
    currency: beConfig.currency || "USD",
    currencyDisplay: "symbol",
    themeMode:
      beConfig.themeMode && beConfig.themeMode in BE_THEME_MODE_MAP
        ? BE_THEME_MODE_MAP[
            beConfig.themeMode as keyof typeof BE_THEME_MODE_MAP
          ]
        : "light",
    density:
      beConfig.densityLevel && beConfig.densityLevel in BE_DENSITY_MAP
        ? BE_DENSITY_MAP[beConfig.densityLevel as keyof typeof BE_DENSITY_MAP]
        : "normal",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    primaryColor: beConfig.primaryColor || BE_COLOR_MAP.SIGNAL,
    secondaryColor: "#595959",
    // Modified by Sekar Nagarajan (2026-08-31 12:52) — success emerald #047857
    successColor: "#047857",
    warningColor: "#faad14",
    errorColor: "#ff4d4f",
    infoColor: "#1677ff",
    neutralColor: "#595959",
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

  return applyDensityThemeFields({
    ...result,
    baseFontSize: 14,
    lineHeight: "normal",
    borderRadius: 8,
  });
};
