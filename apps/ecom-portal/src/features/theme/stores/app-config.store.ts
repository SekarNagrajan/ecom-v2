// Modified by Sekar Nagarajan (2026-08-31 12:55)
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
      // Bump when semantic brand colors change so localStorage picks up new defaults
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as AppConfigState | undefined;
        if (!state?.config) {
          return { config: DEFAULT_APP_CONFIG } as AppConfigState;
        }

        const nextSuccess = LEGACY_SUCCESS_COLORS.has(state.config.successColor)
          ? DEFAULT_APP_CONFIG.successColor
          : state.config.successColor;

        return {
          ...state,
          config: {
            ...DEFAULT_APP_CONFIG,
            ...state.config,
            successColor: nextSuccess,
          },
        };
      },
    }
  )
);
