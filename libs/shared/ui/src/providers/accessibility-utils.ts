// Created by Sekar Nagarajan (2026-09-28 16:17)
import { ACCESSIBILITY_DEFAULTS, DEFAULT_NOTIFICATION_PREFERENCES } from './defaults';
import type {
  AppCustomConfig,
  NotificationPreferences,
  NotificationTimingPreference,
  ReadingMaskPreferences,
  ReadingMaskSize,
  ToastNotificationType,
} from './types';

export const READING_MASK_PRESET_DIMENSIONS: Record<
  Exclude<ReadingMaskSize, 'custom'>,
  { focusHeight: number; focusWidth: number }
> = {
  small: { focusHeight: 80, focusWidth: 400 },
  medium: { focusHeight: 120, focusWidth: 600 },
  large: { focusHeight: 180, focusWidth: 800 },
};

export const READING_MASK_FOCUS_HEIGHT_MIN = 40;
export const READING_MASK_FOCUS_HEIGHT_MAX = 400;
export const READING_MASK_FOCUS_WIDTH_MIN = 200;
export const READING_MASK_FOCUS_WIDTH_MAX = 1200;
export const READING_MASK_OPACITY_MIN = 0.1;
export const READING_MASK_OPACITY_MAX = 0.85;
export const NOTIFICATION_TIMEOUT_MIN = 3;
export const NOTIFICATION_TIMEOUT_MAX = 15;
export const NOTIFICATION_TIMEOUT_OPTIONS = [3, 5, 8, 10, 15] as const;

/** Framework toast defaults when custom timing is disabled. */
export const SYSTEM_TOAST_DURATION_SECONDS = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function mergeReadingMaskPreferences(
  base: ReadingMaskPreferences,
  patch?: Partial<ReadingMaskPreferences> | null,
): ReadingMaskPreferences {
  if (!patch) return { ...base };
  return {
    enabled: patch.enabled ?? base.enabled,
    size: patch.size ?? base.size,
    focusHeight: patch.focusHeight ?? base.focusHeight,
    focusWidth: patch.focusWidth ?? base.focusWidth,
    opacity: patch.opacity ?? base.opacity,
  };
}

export function mergeNotificationTimingPreference(
  base: NotificationTimingPreference,
  patch?: Partial<NotificationTimingPreference> | null,
): NotificationTimingPreference {
  if (!patch) return { ...base };
  return {
    behavior: patch.behavior ?? base.behavior,
    timeout: patch.timeout ?? base.timeout,
  };
}

export function mergeNotificationPreferences(
  base: NotificationPreferences,
  patch?: Partial<NotificationPreferences> | null,
): NotificationPreferences {
  if (!patch) {
    return {
      customTimingEnabled: base.customTimingEnabled,
      success: { ...base.success },
      info: { ...base.info },
      warning: { ...base.warning },
      error: { ...base.error },
    };
  }

  return {
    customTimingEnabled:
      patch.customTimingEnabled ?? base.customTimingEnabled,
    success: mergeNotificationTimingPreference(base.success, patch.success),
    info: mergeNotificationTimingPreference(base.info, patch.info),
    warning: mergeNotificationTimingPreference(base.warning, patch.warning),
    error: mergeNotificationTimingPreference(base.error, patch.error),
  };
}

export function withAccessibilityDefaults(
  config: Partial<AppCustomConfig>,
): Pick<
  AppCustomConfig,
  | 'letterSpacing'
  | 'contrastEnabled'
  | 'contrastMode'
  | 'pageZoom'
  | 'readingMask'
  | 'notifications'
> {
  return {
    letterSpacing:
      config.letterSpacing ?? ACCESSIBILITY_DEFAULTS.letterSpacing,
    contrastEnabled:
      config.contrastEnabled ?? ACCESSIBILITY_DEFAULTS.contrastEnabled,
    contrastMode: config.contrastMode ?? ACCESSIBILITY_DEFAULTS.contrastMode,
    pageZoom: config.pageZoom ?? ACCESSIBILITY_DEFAULTS.pageZoom,
    readingMask: mergeReadingMaskPreferences(
      ACCESSIBILITY_DEFAULTS.readingMask,
      config.readingMask,
    ),
    notifications: mergeNotificationPreferences(
      ACCESSIBILITY_DEFAULTS.notifications,
      config.notifications,
    ),
  };
}

export function resolveReadingMaskDimensions(
  prefs: ReadingMaskPreferences,
): { focusHeight: number; focusWidth: number; opacity: number } {
  const opacity = clamp(
    prefs.opacity,
    READING_MASK_OPACITY_MIN,
    READING_MASK_OPACITY_MAX,
  );

  if (prefs.size === 'custom') {
    return {
      focusHeight: clamp(
        prefs.focusHeight,
        READING_MASK_FOCUS_HEIGHT_MIN,
        READING_MASK_FOCUS_HEIGHT_MAX,
      ),
      focusWidth: clamp(
        prefs.focusWidth,
        READING_MASK_FOCUS_WIDTH_MIN,
        READING_MASK_FOCUS_WIDTH_MAX,
      ),
      opacity,
    };
  }

  const preset = READING_MASK_PRESET_DIMENSIONS[prefs.size];
  return {
    focusHeight: preset.focusHeight,
    focusWidth: preset.focusWidth,
    opacity,
  };
}

/**
 * Returns Ant Design notification duration in seconds.
 * `0` means manual close (never auto-dismiss).
 */
export function resolveToastDuration(
  type: ToastNotificationType,
  notifications?: NotificationPreferences | null,
): number {
  if (!notifications?.customTimingEnabled) {
    return SYSTEM_TOAST_DURATION_SECONDS;
  }

  const preference =
    notifications[type] ?? DEFAULT_NOTIFICATION_PREFERENCES[type];

  if (preference.behavior === 'manual') {
    return 0;
  }

  return clamp(
    preference.timeout,
    NOTIFICATION_TIMEOUT_MIN,
    NOTIFICATION_TIMEOUT_MAX,
  );
}

export function validateReadingMaskPreferences(
  prefs: Partial<ReadingMaskPreferences>,
): string | null {
  if (
    prefs.size !== undefined &&
    !['small', 'medium', 'large', 'custom'].includes(prefs.size)
  ) {
    return 'Invalid reading mask size';
  }
  if (
    prefs.focusHeight !== undefined &&
    (typeof prefs.focusHeight !== 'number' ||
      prefs.focusHeight < READING_MASK_FOCUS_HEIGHT_MIN ||
      prefs.focusHeight > READING_MASK_FOCUS_HEIGHT_MAX)
  ) {
    return 'Invalid reading mask focus height';
  }
  if (
    prefs.focusWidth !== undefined &&
    (typeof prefs.focusWidth !== 'number' ||
      prefs.focusWidth < READING_MASK_FOCUS_WIDTH_MIN ||
      prefs.focusWidth > READING_MASK_FOCUS_WIDTH_MAX)
  ) {
    return 'Invalid reading mask focus width';
  }
  if (
    prefs.opacity !== undefined &&
    (typeof prefs.opacity !== 'number' ||
      prefs.opacity < READING_MASK_OPACITY_MIN ||
      prefs.opacity > READING_MASK_OPACITY_MAX)
  ) {
    return 'Invalid reading mask opacity';
  }
  return null;
}

export function validateNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): string | null {
  const types: ToastNotificationType[] = [
    'success',
    'info',
    'warning',
    'error',
  ];

  for (const type of types) {
    const entry = prefs[type];
    if (!entry) continue;
    if (
      entry.behavior !== undefined &&
      entry.behavior !== 'auto' &&
      entry.behavior !== 'manual'
    ) {
      return `Invalid ${type} notification behavior`;
    }
    if (
      entry.timeout !== undefined &&
      (typeof entry.timeout !== 'number' ||
        entry.timeout < NOTIFICATION_TIMEOUT_MIN ||
        entry.timeout > NOTIFICATION_TIMEOUT_MAX)
    ) {
      return `Invalid ${type} notification timeout`;
    }
  }

  return null;
}

export function validateAccessibilityPreferences(payload: {
  readingMask?: Partial<ReadingMaskPreferences>;
  notifications?: Partial<NotificationPreferences>;
  letterSpacing?: unknown;
  contrastEnabled?: unknown;
  contrastMode?: unknown;
  pageZoom?: unknown;
}): string | null {
  if (payload.readingMask) {
    const error = validateReadingMaskPreferences(payload.readingMask);
    if (error) return error;
  }
  if (payload.notifications) {
    const error = validateNotificationPreferences(payload.notifications);
    if (error) return error;
  }
  return null;
}

/** Accessibility-only fields restored by Reset Accessibility Settings. */
export function getAccessibilityResetPatch(): Pick<
  AppCustomConfig,
  | 'letterSpacing'
  | 'contrastEnabled'
  | 'contrastMode'
  | 'pageZoom'
  | 'readingMask'
  | 'notifications'
> {
  return {
    letterSpacing: ACCESSIBILITY_DEFAULTS.letterSpacing,
    contrastEnabled: ACCESSIBILITY_DEFAULTS.contrastEnabled,
    contrastMode: ACCESSIBILITY_DEFAULTS.contrastMode,
    pageZoom: ACCESSIBILITY_DEFAULTS.pageZoom,
    readingMask: { ...ACCESSIBILITY_DEFAULTS.readingMask },
    notifications: mergeNotificationPreferences(
      ACCESSIBILITY_DEFAULTS.notifications,
    ),
  };
}

export function extractAccessibilityPreferences(config: AppCustomConfig): {
  letterSpacing: AppCustomConfig['letterSpacing'];
  contrastEnabled: boolean;
  contrastMode: AppCustomConfig['contrastMode'];
  pageZoom: number;
  readingMask: ReadingMaskPreferences;
  notifications: NotificationPreferences;
} {
  const a11y = withAccessibilityDefaults(config);
  return {
    letterSpacing: a11y.letterSpacing,
    contrastEnabled: a11y.contrastEnabled,
    contrastMode: a11y.contrastMode,
    pageZoom: a11y.pageZoom,
    readingMask: a11y.readingMask,
    notifications: a11y.notifications,
  };
}
