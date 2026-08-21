import type { ThemeConfig } from 'antd';
import type { ReactNode } from 'react';

// =============================================================================
// 1. Enums & Unions (Strict Typing for Valid Options)
// =============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';
export type EffectiveThemeMode = 'light' | 'dark';

// Density is resolved through our centralized theme metrics.
// Each level adjusts control sizing, spacing, and component tokens consistently.
export type DensityLevel = 'compact' | 'normal' | 'comfortable';

export type LineHeightLevel = 'tight' | 'normal' | 'relaxed';

export type CurrencyDisplay = 'symbol' | 'code' | 'name';

export type Direction = 'ltr' | 'rtl';

// 1. Configuration specific to OUR application logic
// These values will be accessible via our custom hook
export interface AppCustomConfig {
  timezone: string; // e.g., 'America/New_York', 'UTC', 'Asia/Kolkata'
  dateFormat: string; // e.g., 'dd/MM/yyyy' or  like 'jan 5'
  timeFormat: string; // e.g., 'HH:mm' (24h) or 'hh:mm a' (12h)

  // Separation of Concerns:
  // 'locale' prop (AntD) handles text labels.
  // 'formattingRegion' handles numbers/currency (e.g., 'en-US' -> 1,000.00 | 'de-DE' -> 1.000,00)
  locale: string; // e.g. 'en-US', 'fr-FR'
  formattingRegion: string;
  currency: string; // e.g., 'USD', 'EUR'
  currencyDisplay: CurrencyDisplay;

  // --- Visual: Theme & Layout ---
  themeMode: ThemeMode;
  density: DensityLevel;
  borderRadius: number; // For UI components like buttons, inputs, panels

  // --- Visual: Typography ---
  fontFamily: string;
  baseFontSize: number;
  lineHeight: LineHeightLevel;

  // --- Visual: Color Palette ---
  // Mapped to AntD Tokens
  primaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;

  // Custom: Not in AntD Token by default, accessible via Context/Hooks
  secondaryColor: string;
  neutralColor: string; // Often maps to Text/Border colors
}

export interface AppConfigContextValue extends AppCustomConfig {
  effectiveThemeMode: EffectiveThemeMode;
}

export interface AppConfigProviderProps {
  children: ReactNode;

  /** The merged application config (from mergeAppConfig or API). */
  config: AppCustomConfig;

  /** AntD theme overrides applied on top of the generated theme. */
  theme?: ThemeConfig;

  /** Layout direction. Defaults to 'ltr'. */
  direction?: Direction;
}
