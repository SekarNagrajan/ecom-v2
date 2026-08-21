import { type AppCustomConfig } from '@solverminds/shared-ui/providers';
import { useEffect, useRef, useState } from 'react';
import { useAppConfigStore } from '../stores/app-config.store';
import { applyDensityThemeFields } from '../utils/density-theme-fields';

export type ThemePreferencesSaveStatus = 'saved' | 'dirty' | 'saving' | 'error';

function areConfigsEqual(
  left: AppCustomConfig | null | undefined,
  right: AppCustomConfig | null | undefined
) {
  if (!left || !right) return left === right;

  return (
    left.timezone === right.timezone &&
    left.dateFormat === right.dateFormat &&
    left.timeFormat === right.timeFormat &&
    left.locale === right.locale &&
    left.formattingRegion === right.formattingRegion &&
    left.currency === right.currency &&
    left.currencyDisplay === right.currencyDisplay &&
    left.themeMode === right.themeMode &&
    left.density === right.density &&
    left.borderRadius === right.borderRadius &&
    left.fontFamily === right.fontFamily &&
    left.baseFontSize === right.baseFontSize &&
    left.lineHeight === right.lineHeight &&
    left.primaryColor === right.primaryColor
  );
}

export function useThemePreferencesController() {
  const currentConfig = useAppConfigStore((state) => state.config);
  const [saveStatus, setSaveStatus] = useState<ThemePreferencesSaveStatus>('saved');
  const [saveError, setSaveError] = useState<string | null>(null);
  const syncedConfigRef = useRef<AppCustomConfig | null>(currentConfig);

  const applyConfig = (nextConfig: AppCustomConfig) => {
    useAppConfigStore.getState().setConfig(nextConfig);
    setSaveStatus('dirty');
    setSaveError(null);
  };

  const updatePreference = <Key extends keyof AppCustomConfig>(
    key: Key,
    value: AppCustomConfig[Key]
  ) => {
    const activeConfig = useAppConfigStore.getState().config;
    if (!activeConfig || activeConfig[key] === value) return;

    const nextConfig =
      key === 'density'
        ? applyDensityThemeFields({ ...activeConfig, [key]: value })
        : { ...activeConfig, [key]: value };

    applyConfig(nextConfig);
  };

  const discardChanges = () => {
    const syncedConfig = syncedConfigRef.current;
    if (!syncedConfig) return;
    useAppConfigStore.getState().setConfig(syncedConfig);
    setSaveStatus('saved');
    setSaveError(null);
  };

  const flushPendingChanges = async () => {
    const activeConfig = useAppConfigStore.getState().config;
    syncedConfigRef.current = activeConfig;
    setSaveStatus('saved');
    return true;
  };

  const markSessionBaseline = () => {
    const activeConfig = useAppConfigStore.getState().config;
    syncedConfigRef.current = activeConfig;
    setSaveStatus('saved');
    setSaveError(null);
  };

  useEffect(() => {
    if (!syncedConfigRef.current && currentConfig) {
      syncedConfigRef.current = currentConfig;
    }
  }, [currentConfig]);

  const baselineConfig = syncedConfigRef.current ?? currentConfig;
  const hasPendingChanges =
    !!currentConfig &&
    !!baselineConfig &&
    !areConfigsEqual(currentConfig, baselineConfig);

  return {
    currentConfig,
    saveError,
    saveStatus,
    updatePreference,
    discardChanges,
    flushPendingChanges,
    markSessionBaseline,
    hasPendingChanges,
    isSaving: saveStatus === 'saving',
  };
}
