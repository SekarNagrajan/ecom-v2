// Created by Sekar Nagarajan (2026-09-28 16:17)
import { describe, expect, it } from 'vitest';

import {
  ACCESSIBILITY_DEFAULTS,
  getAccessibilityResetPatch,
  mergeNotificationPreferences,
  mergeReadingMaskPreferences,
  READING_MASK_PRESET_DIMENSIONS,
  resolveReadingMaskDimensions,
  resolveToastDuration,
  validateAccessibilityPreferences,
  withAccessibilityDefaults,
} from './index';

describe('accessibility preference helpers', () => {
  it('resolves preset reading mask dimensions and ignores custom size values', () => {
    const resolved = resolveReadingMaskDimensions({
      enabled: true,
      size: 'large',
      focusHeight: 10,
      focusWidth: 10,
      opacity: 0.4,
    });

    expect(resolved.focusHeight).toBe(
      READING_MASK_PRESET_DIMENSIONS.large.focusHeight
    );
    expect(resolved.focusWidth).toBe(
      READING_MASK_PRESET_DIMENSIONS.large.focusWidth
    );
    expect(resolved.opacity).toBe(0.4);
  });

  it('uses custom height and width when size is custom', () => {
    const resolved = resolveReadingMaskDimensions({
      enabled: true,
      size: 'custom',
      focusHeight: 200,
      focusWidth: 700,
      opacity: 0.5,
    });

    expect(resolved).toEqual({
      focusHeight: 200,
      focusWidth: 700,
      opacity: 0.5,
    });
  });

  it('returns system toast duration when custom timing is disabled', () => {
    expect(
      resolveToastDuration('error', {
        ...ACCESSIBILITY_DEFAULTS.notifications,
        customTimingEnabled: false,
        error: { behavior: 'manual', timeout: 10 },
      })
    ).toBe(3);
  });

  it('returns 0 duration for manual-close notifications', () => {
    expect(
      resolveToastDuration('warning', {
        customTimingEnabled: true,
        success: { behavior: 'auto', timeout: 3 },
        info: { behavior: 'auto', timeout: 3 },
        warning: { behavior: 'manual', timeout: 5 },
        error: { behavior: 'manual', timeout: 5 },
      })
    ).toBe(0);
  });

  it('returns configured timeout for auto-close notifications', () => {
    expect(
      resolveToastDuration('success', {
        customTimingEnabled: true,
        success: { behavior: 'auto', timeout: 8 },
        info: { behavior: 'auto', timeout: 8 },
        warning: { behavior: 'manual', timeout: 5 },
        error: { behavior: 'manual', timeout: 5 },
      })
    ).toBe(8);
  });

  it('deep-merges reading mask and notification patches', () => {
    const readingMask = mergeReadingMaskPreferences(
      ACCESSIBILITY_DEFAULTS.readingMask,
      { enabled: true, size: 'custom', opacity: 0.6 }
    );
    const notifications = mergeNotificationPreferences(
      ACCESSIBILITY_DEFAULTS.notifications,
      {
        customTimingEnabled: true,
        error: { behavior: 'auto' },
      }
    );

    expect(readingMask.enabled).toBe(true);
    expect(readingMask.size).toBe('custom');
    expect(readingMask.focusHeight).toBe(
      ACCESSIBILITY_DEFAULTS.readingMask.focusHeight
    );
    expect(readingMask.opacity).toBe(0.6);
    expect(notifications.customTimingEnabled).toBe(true);
    expect(notifications.error.behavior).toBe('auto');
    expect(notifications.error.timeout).toBe(
      ACCESSIBILITY_DEFAULTS.notifications.error.timeout
    );
  });

  it('fills missing accessibility fields with defaults', () => {
    const merged = withAccessibilityDefaults({});
    expect(merged.readingMask).toEqual(ACCESSIBILITY_DEFAULTS.readingMask);
    expect(merged.notifications.success.timeout).toBe(3);
    expect(merged.pageZoom).toBe(100);
  });

  it('reset patch restores accessibility defaults only', () => {
    const reset = getAccessibilityResetPatch();
    expect(reset.letterSpacing).toBe(ACCESSIBILITY_DEFAULTS.letterSpacing);
    expect(reset.readingMask.enabled).toBe(false);
    expect(reset.notifications.customTimingEnabled).toBe(false);
    expect(reset.contrastEnabled).toBe(false);
  });

  it('rejects invalid preference payloads', () => {
    expect(
      validateAccessibilityPreferences({
        readingMask: { size: 'huge' as 'small' },
      })
    ).toMatch(/size/i);

    expect(
      validateAccessibilityPreferences({
        notifications: {
          success: { timeout: 99 },
        },
      })
    ).toMatch(/timeout/i);

    expect(
      validateAccessibilityPreferences({
        readingMask: { opacity: 0.4 },
        notifications: { customTimingEnabled: true },
      })
    ).toBeNull();
  });
});
