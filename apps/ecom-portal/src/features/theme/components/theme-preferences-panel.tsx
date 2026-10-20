// Modified by Sekar Nagarajan (2026-09-28 16:17)
import { AppButton } from "@solverminds/shared-ui";
import type {
  ContrastMode,
  LetterSpacingLevel,
  ThemeMode,
} from "@solverminds/shared-ui/providers";
import { Alert, Modal, Select, Slider, Space, Switch, Typography } from "antd";
import { useRef } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import {
  BASE_FONT_SIZE_OPTIONS,
  COLOR_OPTIONS,
  CONTRAST_MODE_OPTIONS,
  FONT_FAMILY_OPTIONS,
  LETTER_SPACING_EM,
  LETTER_SPACING_OPTIONS,
  NOTIFICATION_BEHAVIOR_OPTIONS,
  PAGE_ZOOM_MAX,
  PAGE_ZOOM_MIN,
  PAGE_ZOOM_STEP,
  READING_MASK_FOCUS_HEIGHT_MAX,
  READING_MASK_FOCUS_HEIGHT_MIN,
  READING_MASK_FOCUS_WIDTH_MAX,
  READING_MASK_FOCUS_WIDTH_MIN,
  READING_MASK_OPACITY_MAX,
  READING_MASK_OPACITY_MIN,
  READING_MASK_SIZE_OPTIONS,
  THEME_MODE_OPTIONS,
  TOAST_TIMEOUT_SELECT_OPTIONS,
} from "../constants";
import { type useThemePreferencesController } from "../hooks/use-theme-preferences-controller";
import {
  AccentSwatch,
  PreferenceCategoryLabel,
  PreferenceFieldHeader,
  PreferenceSectionCard,
  PreferenceSectionRow,
  SelectableTile,
  ThemeModePreview,
} from "./accessibility-preference-primitives";
import { AccessibilityPreferencesStyles } from "./accessibility-preferences-styles";

const { Text } = Typography;

const MODE_LABELS: Record<ThemeMode, string> = {
  light: "Light Mode",
  dark: "Dark Mode",
  auto: "Auto",
};

export function ThemePreferencesPanel({
  controller,
}: {
  controller: ReturnType<typeof useThemePreferencesController>;
}) {
  const { currentConfig, saveError } = controller;
  const panelRef = useRef<HTMLDivElement>(null);

  if (!currentConfig) {
    return null;
  }

  const { readingMask, notifications } = currentConfig;
  const successInfo = notifications.success;
  const warningError = notifications.warning;

  const confirmResetAll = () => {
    const moduleRoot =
      panelRef.current?.closest<HTMLElement>(".ant-drawer-content") ??
      panelRef.current ??
      document.body;

    Modal.confirm({
      title: "Reset Accessibility Settings?",
      content:
        "This restores reading mask, toast timing, contrast, spacing, and zoom to application defaults. Theme colors and locale are not changed.",
      okText: "Reset",
      cancelText: "Cancel",
      centered: true,
      getContainer: () => moduleRoot,
      className: "a11y-prefs-confirm-modal",
      onOk: () => {
        controller.resetAccessibilityPreferences();
      },
    });
  };

  return (
    <>
      <AccessibilityPreferencesStyles />
      <div className="a11y-prefs" ref={panelRef}>
        {saveError ? (
          <Alert
            type="error"
            showIcon
            title="Changes not saved"
            description={
              <Space wrap>
                <Text>{saveError}</Text>
                <AppButton
                  size="small"
                  onClick={() => void controller.flushPendingChanges()}
                >
                  Retry
                </AppButton>
                <AppButton
                  size="small"
                  onClick={controller.discardChanges}
                  type="default"
                >
                  Revert
                </AppButton>
              </Space>
            }
          />
        ) : null}

        <PreferenceCategoryLabel>Vision &amp; Reading</PreferenceCategoryLabel>

        <PreferenceSectionCard>
          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="Font"
              description="Select your preferred font for the application."
            />
            <div className="a11y-tile-row">
              {FONT_FAMILY_OPTIONS.map((option) => (
                <SelectableTile
                  key={option.value}
                  className="a11y-tile--font"
                  ariaLabel={option.label}
                  selected={currentConfig.fontFamily === option.value}
                  onClick={() =>
                    controller.updatePreference("fontFamily", option.value)
                  }
                  style={{ fontFamily: option.value }}
                >
                  {option.label}
                </SelectableTile>
              ))}
            </div>
          </PreferenceSectionRow>

          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="Text Size"
              description="Adjust text size for better readability and comfortable viewing."
            />
            <div className="a11y-tile-row">
              {BASE_FONT_SIZE_OPTIONS.map((option) => {
                const scale = option.value / 14;
                return (
                  <SelectableTile
                    key={option.value}
                    className="a11y-tile--size"
                    ariaLabel={`Text size ${option.label}`}
                    selected={currentConfig.baseFontSize === option.value}
                    onClick={() =>
                      controller.updatePreference("baseFontSize", option.value)
                    }
                    style={{ fontSize: `${Math.max(11, 12 * scale)}px` }}
                  >
                    Aa
                  </SelectableTile>
                );
              })}
            </div>
          </PreferenceSectionRow>

          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="Text Spacing"
              description="Customize the text spacing for improved readability and visual clarity."
            />
            <div className="a11y-tile-row">
              {LETTER_SPACING_OPTIONS.map((option) => (
                <SelectableTile
                  key={option.value}
                  className="a11y-tile--spacing"
                  ariaLabel={`Text spacing level ${option.value}`}
                  selected={currentConfig.letterSpacing === option.value}
                  onClick={() =>
                    controller.updatePreference(
                      "letterSpacing",
                      option.value as LetterSpacingLevel,
                    )
                  }
                  style={{
                    letterSpacing: `${LETTER_SPACING_EM[option.value]}em`,
                  }}
                >
                  ABCD
                </SelectableTile>
              ))}
            </div>
          </PreferenceSectionRow>
        </PreferenceSectionCard>

        <PreferenceSectionCard>
          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="User Interface Mode"
              description="Choose from a preferred light or dark mode, or let the system decide based on time."
            />
            <div className="a11y-mode-row">
              {THEME_MODE_OPTIONS.map((option) => {
                const selected = currentConfig.themeMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      "a11y-mode-card",
                      selected ? "a11y-mode-card--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selected}
                    aria-label={MODE_LABELS[option.value]}
                    onClick={() =>
                      controller.updatePreference("themeMode", option.value)
                    }
                  >
                    <ThemeModePreview mode={option.value} />
                    <span className="a11y-mode-card__label">
                      {MODE_LABELS[option.value]}
                    </span>
                    {selected ? (
                      <span className="a11y-tile__check" aria-hidden>
                        <AppIcon icon={Icons.check} size={11} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </PreferenceSectionRow>

          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="Accent Color"
              description="Select a desired accent color to use in the application."
            />
            <div className="a11y-swatch-row">
              {COLOR_OPTIONS.map((option) => (
                <AccentSwatch
                  key={option.value}
                  color={option.value}
                  label={option.label}
                  selected={currentConfig.primaryColor === option.value}
                  onClick={() =>
                    controller.updatePreference("primaryColor", option.value)
                  }
                />
              ))}
            </div>
          </PreferenceSectionRow>
        </PreferenceSectionCard>

        <PreferenceSectionCard>
          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="Contrast Level"
              description="Enhance the contrast for clearer text and more defined elements."
              action={
                <Switch
                  checked={currentConfig.contrastEnabled}
                  onChange={(checked) =>
                    controller.updatePreference("contrastEnabled", checked)
                  }
                  aria-label="Enable contrast level"
                />
              }
            />
            {currentConfig.contrastEnabled ? (
              <div className="a11y-tile-row">
                {CONTRAST_MODE_OPTIONS.map((option) => (
                  <SelectableTile
                    key={option.value}
                    className="a11y-tile--contrast"
                    ariaLabel={option.label}
                    selected={currentConfig.contrastMode === option.value}
                    onClick={() =>
                      controller.updatePreference(
                        "contrastMode",
                        option.value as ContrastMode,
                      )
                    }
                  >
                    {option.label}
                  </SelectableTile>
                ))}
              </div>
            ) : null}
          </PreferenceSectionRow>
        </PreferenceSectionCard>

        <PreferenceSectionCard>
          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="Page Zoom"
              description="Adjust the size of page elements for your viewing comfort."
            />
            <div className="a11y-zoom">
              <Text className="a11y-zoom__label">
                Zoom Level · {currentConfig.pageZoom}%
              </Text>
              <Slider
                className="a11y-zoom__slider"
                min={PAGE_ZOOM_MIN}
                max={PAGE_ZOOM_MAX}
                step={PAGE_ZOOM_STEP}
                value={currentConfig.pageZoom}
                onChange={(value) =>
                  controller.updatePreference(
                    "pageZoom",
                    Array.isArray(value) ? value[0] : value,
                  )
                }
                tooltip={{ formatter: (v) => `${v}%` }}
              />
            </div>
          </PreferenceSectionRow>
        </PreferenceSectionCard>

        <PreferenceSectionCard>
          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="Reading Mask"
              description="Highlight a specific area of the screen based on the movement of your pointer."
              titleExtra={
                <button
                  type="button"
                  className="a11y-reset-link"
                  onClick={() => controller.resetReadingMask()}
                >
                  Reset
                </button>
              }
              action={
                <Switch
                  checked={readingMask.enabled}
                  onChange={(checked) =>
                    controller.updateReadingMask({ enabled: checked })
                  }
                  aria-label="Enable reading mask"
                />
              }
            />
            {readingMask.enabled ? (
              <>
                <div
                  className="a11y-tile-row"
                  role="group"
                  aria-label="Reading mask size"
                >
                  {READING_MASK_SIZE_OPTIONS.map((option) => (
                    <SelectableTile
                      key={option.value}
                      className="a11y-tile--mask-size"
                      ariaLabel={option.label}
                      selected={readingMask.size === option.value}
                      onClick={() =>
                        controller.updateReadingMask({ size: option.value })
                      }
                    >
                      {option.label}
                    </SelectableTile>
                  ))}
                </div>
                {readingMask.size === "custom" ? (
                  <div className="a11y-slider-stack">
                    <div className="a11y-slider-field">
                      <Text
                        id="reading-mask-height-label"
                        className="a11y-slider-field__label"
                      >
                        Focus Height
                      </Text>
                      <Slider
                        aria-labelledby="reading-mask-height-label"
                        min={READING_MASK_FOCUS_HEIGHT_MIN}
                        max={READING_MASK_FOCUS_HEIGHT_MAX}
                        step={10}
                        value={readingMask.focusHeight}
                        onChange={(value) =>
                          controller.updateReadingMask({
                            focusHeight: Array.isArray(value)
                              ? value[0]
                              : value,
                          })
                        }
                        tooltip={{ formatter: (v) => `${v}px` }}
                      />
                    </div>
                    <div className="a11y-slider-field">
                      <Text
                        id="reading-mask-width-label"
                        className="a11y-slider-field__label"
                      >
                        Focus Width
                      </Text>
                      <Slider
                        aria-labelledby="reading-mask-width-label"
                        min={READING_MASK_FOCUS_WIDTH_MIN}
                        max={READING_MASK_FOCUS_WIDTH_MAX}
                        step={20}
                        value={readingMask.focusWidth}
                        onChange={(value) =>
                          controller.updateReadingMask({
                            focusWidth: Array.isArray(value) ? value[0] : value,
                          })
                        }
                        tooltip={{ formatter: (v) => `${v}px` }}
                      />
                    </div>
                    <div className="a11y-slider-field">
                      <Text
                        id="reading-mask-opacity-label"
                        className="a11y-slider-field__label"
                      >
                        Mask Opacity
                      </Text>
                      <Slider
                        aria-labelledby="reading-mask-opacity-label"
                        min={READING_MASK_OPACITY_MIN}
                        max={READING_MASK_OPACITY_MAX}
                        step={0.05}
                        value={readingMask.opacity}
                        onChange={(value) =>
                          controller.updateReadingMask({
                            opacity: Array.isArray(value) ? value[0] : value,
                          })
                        }
                        tooltip={{
                          formatter: (v) => `${Math.round((v ?? 0) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="a11y-slider-stack">
                    <div className="a11y-slider-field">
                      <Text
                        id="reading-mask-opacity-preset-label"
                        className="a11y-slider-field__label"
                      >
                        Mask Opacity
                      </Text>
                      <Slider
                        aria-labelledby="reading-mask-opacity-preset-label"
                        min={READING_MASK_OPACITY_MIN}
                        max={READING_MASK_OPACITY_MAX}
                        step={0.05}
                        value={readingMask.opacity}
                        onChange={(value) =>
                          controller.updateReadingMask({
                            opacity: Array.isArray(value) ? value[0] : value,
                          })
                        }
                        tooltip={{
                          formatter: (v) => `${Math.round((v ?? 0) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </PreferenceSectionRow>
        </PreferenceSectionCard>

        <PreferenceCategoryLabel>Notifications</PreferenceCategoryLabel>

        <PreferenceSectionCard>
          <PreferenceSectionRow>
            <PreferenceFieldHeader
              title="Toast Notification Timing Control"
              description="Customize the duration of toast notifications to ensure sufficient comprehension time. Opt for Manual Close if notifications must stay until you dismiss them."
              action={
                <Switch
                  checked={notifications.customTimingEnabled}
                  onChange={(checked) =>
                    controller.updateNotifications({
                      customTimingEnabled: checked,
                    })
                  }
                  aria-label="Enable toast notification timing control"
                />
              }
            />
            {notifications.customTimingEnabled ? (
              <div className="a11y-toast-prefs">
                <Text className="a11y-toast-prefs__heading">
                  Set your timing preferences
                </Text>
                <div className="a11y-toast-prefs__grid">
                  <div className="a11y-toast-prefs__controls">
                    <div className="a11y-toast-prefs__field">
                      <Text
                        id="toast-success-behavior-label"
                        className="a11y-toast-prefs__label"
                      >
                        Success and info notifications behavior
                      </Text>
                      <Select
                        aria-labelledby="toast-success-behavior-label"
                        value={successInfo.behavior}
                        options={[...NOTIFICATION_BEHAVIOR_OPTIONS]}
                        onChange={(value) =>
                          controller.updateNotificationGroup("successInfo", {
                            behavior: value,
                          })
                        }
                      />
                    </div>
                    {successInfo.behavior === "auto" ? (
                      <div className="a11y-toast-prefs__field">
                        <Text
                          id="toast-success-timeout-label"
                          className="a11y-toast-prefs__label"
                        >
                          Automatic timeout duration
                        </Text>
                        <Select
                          aria-labelledby="toast-success-timeout-label"
                          value={successInfo.timeout}
                          options={[...TOAST_TIMEOUT_SELECT_OPTIONS]}
                          onChange={(value) =>
                            controller.updateNotificationGroup("successInfo", {
                              timeout: value,
                            })
                          }
                        />
                      </div>
                    ) : null}
                    <div className="a11y-toast-prefs__field">
                      <Text
                        id="toast-warning-behavior-label"
                        className="a11y-toast-prefs__label"
                      >
                        Warning and error notifications behavior
                      </Text>
                      <Select
                        aria-labelledby="toast-warning-behavior-label"
                        value={warningError.behavior}
                        options={[...NOTIFICATION_BEHAVIOR_OPTIONS]}
                        onChange={(value) =>
                          controller.updateNotificationGroup("warningError", {
                            behavior: value,
                          })
                        }
                      />
                    </div>
                    {warningError.behavior === "auto" ? (
                      <div className="a11y-toast-prefs__field">
                        <Text
                          id="toast-warning-timeout-label"
                          className="a11y-toast-prefs__label"
                        >
                          Automatic timeout duration
                        </Text>
                        <Select
                          aria-labelledby="toast-warning-timeout-label"
                          value={warningError.timeout}
                          options={[...TOAST_TIMEOUT_SELECT_OPTIONS]}
                          onChange={(value) =>
                            controller.updateNotificationGroup("warningError", {
                              timeout: value,
                            })
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="a11y-toast-prefs__previews" aria-hidden>
                    <div className="a11y-toast-preview">
                      <div className="a11y-toast-preview__chrome" />
                      <div className="a11y-toast-preview__body">
                        <span className="a11y-toast-preview__toast a11y-toast-preview__toast--success" />
                      </div>
                    </div>
                    <div className="a11y-toast-preview">
                      <div className="a11y-toast-preview__chrome" />
                      <div className="a11y-toast-preview__body">
                        <span className="a11y-toast-preview__toast a11y-toast-preview__toast--warning" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </PreferenceSectionRow>
        </PreferenceSectionCard>

        <PreferenceCategoryLabel>Reset</PreferenceCategoryLabel>

        <PreferenceSectionCard>
          <PreferenceSectionRow>
            <div className="a11y-reset-card">
              <div className="a11y-reset-card__copy">
                <Text className="a11y-field-header__title">
                  Reset Accessibility Settings
                </Text>
                <Text className="a11y-field-header__description">
                  Restore reading mask, toast timing, contrast, spacing, and
                  zoom to application defaults. Branding and locale are not
                  affected.
                </Text>
              </div>
              <AppButton type="primary" onClick={confirmResetAll}>
                Reset
              </AppButton>
            </div>
          </PreferenceSectionRow>
        </PreferenceSectionCard>
      </div>
    </>
  );
}
