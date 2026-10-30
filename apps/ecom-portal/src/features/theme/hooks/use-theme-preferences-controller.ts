// Modified by Sekar Nagarajan (2026-09-28 16:17)
import { useAuthStore } from "@solverminds/auth";
import {
  extractAccessibilityPreferences,
  getAccessibilityResetPatch,
  mergeNotificationPreferences,
  mergeNotificationTimingPreference,
  mergeReadingMaskPreferences,
  withAccessibilityDefaults,
  type AppCustomConfig,
  type NotificationPreferences,
  type NotificationTimingPreference,
  type ReadingMaskPreferences,
} from "@solverminds/shared-ui/providers";
import { useEffect, useRef, useState } from "react";
import {
  fetchAccessibilityPreferences,
  patchAccessibilityPreferences,
} from "../api/accessibility.api";
import { useAppConfigStore } from "../stores/app-config.store";
import { applyDensityThemeFields } from "../utils/density-theme-fields";

export type ThemePreferencesSaveStatus =
  | "saved"
  | "dirty"
  | "saving"
  | "error";

function areNotificationPrefsEqual(
  left: NotificationPreferences,
  right: NotificationPreferences,
): boolean {
  const types = ["success", "info", "warning", "error"] as const;
  if (left.customTimingEnabled !== right.customTimingEnabled) return false;
  return types.every(
    (type) =>
      left[type].behavior === right[type].behavior &&
      left[type].timeout === right[type].timeout,
  );
}

function areReadingMaskEqual(
  left: ReadingMaskPreferences,
  right: ReadingMaskPreferences,
): boolean {
  return (
    left.enabled === right.enabled &&
    left.size === right.size &&
    left.focusHeight === right.focusHeight &&
    left.focusWidth === right.focusWidth &&
    left.opacity === right.opacity
  );
}

function areConfigsEqual(
  left: AppCustomConfig | null | undefined,
  right: AppCustomConfig | null | undefined,
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
    left.primaryColor === right.primaryColor &&
    left.letterSpacing === right.letterSpacing &&
    left.contrastEnabled === right.contrastEnabled &&
    left.contrastMode === right.contrastMode &&
    left.pageZoom === right.pageZoom &&
    areReadingMaskEqual(left.readingMask, right.readingMask) &&
    areNotificationPrefsEqual(left.notifications, right.notifications)
  );
}

export function useThemePreferencesController() {
  const currentConfig = useAppConfigStore((state) => state.config);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [saveStatus, setSaveStatus] =
    useState<ThemePreferencesSaveStatus>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const syncedConfigRef = useRef<AppCustomConfig | null>(currentConfig);
  const remoteHydratedRef = useRef(false);

  const applyConfig = (nextConfig: AppCustomConfig) => {
    useAppConfigStore.getState().setConfig(nextConfig);
    setSaveStatus("dirty");
    setSaveError(null);
  };

  const updatePreference = <Key extends keyof AppCustomConfig>(
    key: Key,
    value: AppCustomConfig[Key],
  ) => {
    const activeConfig = useAppConfigStore.getState().config;
    if (!activeConfig || activeConfig[key] === value) return;

    const nextConfig =
      key === "density"
        ? applyDensityThemeFields({ ...activeConfig, [key]: value })
        : { ...activeConfig, [key]: value };

    applyConfig(nextConfig);
  };

  const updateReadingMask = (patch: Partial<ReadingMaskPreferences>) => {
    const activeConfig = useAppConfigStore.getState().config;
    if (!activeConfig) return;
    const nextReadingMask = mergeReadingMaskPreferences(
      activeConfig.readingMask,
      patch,
    );
    if (areReadingMaskEqual(activeConfig.readingMask, nextReadingMask)) {
      return;
    }
    applyConfig({ ...activeConfig, readingMask: nextReadingMask });
  };

  const updateNotifications = (patch: Partial<NotificationPreferences>) => {
    const activeConfig = useAppConfigStore.getState().config;
    if (!activeConfig) return;
    const nextNotifications = mergeNotificationPreferences(
      activeConfig.notifications,
      patch,
    );
    if (
      areNotificationPrefsEqual(
        activeConfig.notifications,
        nextNotifications,
      )
    ) {
      return;
    }
    applyConfig({ ...activeConfig, notifications: nextNotifications });
  };

  /** Zoho-style grouped control: writes the same timing to both types. */
  const updateNotificationGroup = (
    group: "successInfo" | "warningError",
    patch: Partial<NotificationTimingPreference>,
  ) => {
    const activeConfig = useAppConfigStore.getState().config;
    if (!activeConfig) return;

    if (group === "successInfo") {
      updateNotifications({
        success: mergeNotificationTimingPreference(
          activeConfig.notifications.success,
          patch,
        ),
        info: mergeNotificationTimingPreference(
          activeConfig.notifications.info,
          patch,
        ),
      });
      return;
    }

    updateNotifications({
      warning: mergeNotificationTimingPreference(
        activeConfig.notifications.warning,
        patch,
      ),
      error: mergeNotificationTimingPreference(
        activeConfig.notifications.error,
        patch,
      ),
    });
  };

  const resetReadingMask = () => {
    const defaults = getAccessibilityResetPatch();
    updateReadingMask(defaults.readingMask);
  };

  const resetAccessibilityPreferences = () => {
    const activeConfig = useAppConfigStore.getState().config;
    if (!activeConfig) return;
    applyConfig({
      ...activeConfig,
      ...getAccessibilityResetPatch(),
    });
  };

  const discardChanges = () => {
    const syncedConfig = syncedConfigRef.current;
    if (!syncedConfig) return;
    useAppConfigStore.getState().setConfig(syncedConfig);
    setSaveStatus("saved");
    setSaveError(null);
  };

  const flushPendingChanges = async () => {
    const activeConfig = useAppConfigStore.getState().config;
    if (!activeConfig) return false;

    const previousConfig = syncedConfigRef.current;
    setSaveStatus("saving");
    setSaveError(null);

    try {
      if (isAuthenticated) {
        const accessibility = extractAccessibilityPreferences(activeConfig);
        await patchAccessibilityPreferences(accessibility);
      }
      syncedConfigRef.current = activeConfig;
      setSaveStatus("saved");
      return true;
    } catch (error) {
      console.error("[accessibility] Failed to persist preferences", error);
      if (previousConfig) {
        useAppConfigStore.getState().setConfig(previousConfig);
      }
      setSaveStatus("error");
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save accessibility preferences",
      );
      return false;
    }
  };

  const markSessionBaseline = () => {
    const activeConfig = useAppConfigStore.getState().config;
    syncedConfigRef.current = activeConfig;
    setSaveStatus("saved");
    setSaveError(null);
  };

  const getAccessibilitySlice = () => {
    const activeConfig = useAppConfigStore.getState().config;
    return activeConfig
      ? extractAccessibilityPreferences(activeConfig)
      : null;
  };

  useEffect(() => {
    if (!syncedConfigRef.current && currentConfig) {
      syncedConfigRef.current = currentConfig;
    }
  }, [currentConfig]);

  useEffect(() => {
    if (!isAuthenticated) {
      remoteHydratedRef.current = false;
      return;
    }
    if (remoteHydratedRef.current) return;

    let cancelled = false;

    void (async () => {
      try {
        const remote = await fetchAccessibilityPreferences();
        if (cancelled) return;

        const activeConfig = useAppConfigStore.getState().config;
        const remoteA11y = withAccessibilityDefaults(remote);
        const localA11y = extractAccessibilityPreferences(activeConfig);
        const defaultA11y = getAccessibilityResetPatch();

        const remoteIsDefault =
          JSON.stringify(remoteA11y) === JSON.stringify(defaultA11y);
        const localDiffersFromRemote =
          JSON.stringify(localA11y) !== JSON.stringify(remoteA11y);

        // Hybrid bootstrap: if the account store is still defaults but this
        // device already has customized local prefs, keep local and push up.
        if (remoteIsDefault && localDiffersFromRemote) {
          try {
            await patchAccessibilityPreferences(localA11y);
          } catch (syncError) {
            console.error(
              "[accessibility] Failed to seed remote from local cache",
              syncError,
            );
          }
          syncedConfigRef.current = activeConfig;
        } else {
          const nextConfig: AppCustomConfig = {
            ...activeConfig,
            ...remoteA11y,
          };
          useAppConfigStore.getState().setConfig(nextConfig);
          syncedConfigRef.current = nextConfig;
        }

        remoteHydratedRef.current = true;
        setSaveStatus("saved");
        setSaveError(null);
      } catch (error) {
        // Accessibility must never block the core app — keep localStorage cache.
        console.error(
          "[accessibility] Failed to load remote preferences; using local cache",
          error,
        );
        remoteHydratedRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const baselineConfig = syncedConfigRef.current ?? currentConfig;
  const hasPendingChanges =
    !!currentConfig &&
    !!baselineConfig &&
    !areConfigsEqual(currentConfig, baselineConfig);

  return {
    currentConfig,
    saveError,
    saveStatus,
    setSaveStatus,
    setSaveError,
    syncedConfigRef,
    updatePreference,
    updateReadingMask,
    updateNotifications,
    updateNotificationGroup,
    resetReadingMask,
    resetAccessibilityPreferences,
    discardChanges,
    flushPendingChanges,
    markSessionBaseline,
    getAccessibilitySlice,
    hasPendingChanges,
    isSaving: saveStatus === "saving",
  };
}
