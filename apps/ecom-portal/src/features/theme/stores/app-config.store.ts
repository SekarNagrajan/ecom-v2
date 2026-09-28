// Modified by Sekar Nagarajan (2026-09-18 12:26)
import { persist } from 'zustand/middleware';
import type {
  AppCustomConfig,
  ThemeMode,
} from '@solverminds/shared-ui/providers';
import { create } from 'zustand';
import { DEFAULT_APP_CONFIG } from '../constants';

export interface AppConfigState {
  config: AppCustomConfig;
  setConfig: (config: AppCustomConfig) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

/** Legacy Ant Design / interim success greens — migrate persisted configs to current default. */
const LEGACY_SUCCESS_COLORS = new Set(['#52c41a', '#0f766e', '#52C41A', '#0F766E']);

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
        const nextThemeMode = currentConfig.themeMode === 'dark' ? 'light' : 'dark';
        set({
          config: {
            ...currentConfig,
            themeMode: nextThemeMode,
          },
        });
      },
    }),
    {
      name: 'ecom-user-theme-config',
      // v2 — default primary Signal Blue + baseFontSize 14 + Inter
      version: 2,
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
          (state.config.primaryColor === '#1B6DAB' ||
            state.config.primaryColor === '#1b6dab');
        const wasDemoFontSize =
          version < 2 && state.config.baseFontSize === 28;

        return {
          ...state,
          config: {
            ...DEFAULT_APP_CONFIG,
            ...state.config,
            successColor: nextSuccess,
            ...(wasDemoPrimary
              ? { primaryColor: DEFAULT_APP_CONFIG.primaryColor }
              : {}),
            ...(wasDemoFontSize
              ? { baseFontSize: DEFAULT_APP_CONFIG.baseFontSize }
              : {}),
            fontFamily: state.config.fontFamily || DEFAULT_APP_CONFIG.fontFamily,
          },
        };
      },
    }
  )
);
