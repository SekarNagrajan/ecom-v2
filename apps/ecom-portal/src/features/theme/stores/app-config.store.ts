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
    }
  )
);
