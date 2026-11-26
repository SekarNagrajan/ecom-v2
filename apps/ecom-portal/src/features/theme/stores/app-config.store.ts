// Modified by Sekar Nagarajan (2026-11-13 01:10)
import { persist } from "zustand/middleware";
import {
  withAccessibilityDefaults,
  type AppCustomConfig,
  type ThemeMode,
} from "@solverminds/shared-ui/providers";
import { create } from "zustand";
import { DEFAULT_APP_CONFIG } from "../constants";

export interface AppConfigState {
  config: AppCustomConfig;
  setConfig: (config: AppCustomConfig) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

/** Legacy Ant Design / interim success greens — migrate persisted configs to current default. */
const LEGACY_SUCCESS_COLORS = new Set(["#52c41a", "#0f766e", "#52C41A", "#0F766E"]);

/** Signal Blue was the persisted default before v5; users who never chose an accent get "inherit". */
const LEGACY_DEFAULT_ACCENT = "#0a91ff";

function applyAccessibilityDefaults(config: AppCustomConfig): AppCustomConfig {
  const a11y = withAccessibilityDefaults(config);
  return {
    ...DEFAULT_APP_CONFIG,
    ...config,
    ...a11y,
  };
}

export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_APP_CONFIG,
      setConfig: (config) => {
        if (get().config === config) return;
        set({ config });
      },
      setThemeMode: (themeMode) => {
        const currentConfig = get().config;
        if (!currentConfig || currentConfig.themeMode === themeMode) {
          return;
        }
        set({
          config: {
            ...currentConfig,
            themeMode,
          },
        });
      },
      toggleThemeMode: () => {
        const currentConfig = get().config;
        if (!currentConfig) return;
        const nextThemeMode = currentConfig.themeMode === "dark" ? "light" : "dark";
        set({
          config: {
            ...currentConfig,
            themeMode: nextThemeMode,
          },
        });
      },
    }),
    {
      name: "ecom-user-theme-config",
      // v4 — readingMask + notifications accessibility preferences
      // v5 — accent "" = inherit the organisation colour; a stored default Signal Blue is cleared
      version: 5,
      migrate: (persistedState, version) => {
        const state = persistedState as AppConfigState | undefined;
        if (!state?.config) {
          return { config: DEFAULT_APP_CONFIG } as AppConfigState;
        }

        const nextSuccess = LEGACY_SUCCESS_COLORS.has(state.config.successColor)
          ? DEFAULT_APP_CONFIG.successColor
          : state.config.successColor;

        // When bumping from v1 → v2, adopt new product defaults if the user was
        // still on the old Maritime / 28px demo defaults.
        const wasDemoPrimary =
          version < 2 &&
          (state.config.primaryColor === "#1B6DAB" || state.config.primaryColor === "#1b6dab");
        const wasDemoFontSize = version < 2 && state.config.baseFontSize === 28;

        const storedDefaultAccent =
          version < 5 &&
          typeof state.config.primaryColor === "string" &&
          state.config.primaryColor.toLowerCase() === LEGACY_DEFAULT_ACCENT;

        const merged = applyAccessibilityDefaults({
          ...state.config,
          successColor: nextSuccess,
          ...(wasDemoPrimary || storedDefaultAccent
            ? { primaryColor: DEFAULT_APP_CONFIG.primaryColor }
            : {}),
          ...(wasDemoFontSize ? { baseFontSize: DEFAULT_APP_CONFIG.baseFontSize } : {}),
          fontFamily: state.config.fontFamily || DEFAULT_APP_CONFIG.fontFamily,
        });

        return {
          ...state,
          config: merged,
        };
      },
    },
  ),
);
