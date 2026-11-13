// Modified by Sekar Nagarajan (2026-09-28 16:17)
import { theme } from "antd";

import { tokenMix } from "../utils/token-mix";

/** Token-backed styles for Accessibility Controls drawer. */
export function AccessibilityPreferencesStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);

  return (
    <style>{`
      .a11y-prefs {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        min-width: 0;
      }

      /* Scope reset confirm to the Accessibility drawer and center it in-module */
      .ant-drawer-content:has(.a11y-prefs) {
        position: relative;
      }
      .ant-drawer-content:has(.a11y-prefs) .ant-modal-root .ant-modal-mask,
      .ant-drawer-content:has(.a11y-prefs) .ant-modal-root .ant-modal-wrap {
        position: absolute;
        inset: 0;
      }
      .a11y-prefs-confirm-modal.ant-modal {
        top: 0;
        padding-bottom: 0;
      }

      .a11y-category-label {
        display: block;
        margin: ${token.marginXS}px 0 0 !important;
        font-size: ${token.fontSizeSM}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorTextSecondary} !important;
      }

      .a11y-section-card {
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
      }
      .a11y-section-card__row {
        padding: ${token.paddingMD}px;
      }
      .a11y-section-card__row + .a11y-section-card__row {
        border-top: 1px solid ${token.colorBorderSecondary};
      }

      .a11y-field-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        margin-bottom: ${token.marginSM}px;
        min-width: 0;
      }
      .a11y-field-header--with-action {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
      }
      .a11y-field-header__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        flex: 1;
      }
      .a11y-field-header__title-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .a11y-field-header__title {
        margin: 0 !important;
        font-size: ${token.fontSize}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        line-height: 1.35 !important;
        color: ${token.colorText};
      }
      .a11y-reset-link {
        margin: 0;
        padding: 0;
        border: none;
        background: none;
        color: ${token.colorPrimary};
        font: inherit;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        cursor: pointer;
        text-decoration: none;
      }
      .a11y-reset-link:hover {
        text-decoration: underline;
      }
      .a11y-reset-link:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
        border-radius: 2px;
      }
      .a11y-field-header__description {
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        color: ${token.colorTextSecondary};
      }

      .a11y-tile-row {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: stretch;
      }

      .a11y-tile {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        min-height: ${token.controlHeightLG}px;
        border: 1px solid ${token.colorBorder};
        border-radius: ${token.borderRadius}px;
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        cursor: pointer;
        transition: border-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
        font: inherit;
        text-align: center;
      }
      .a11y-tile:hover {
        border-color: ${token.colorPrimary};
      }
      .a11y-tile--selected {
        border-color: ${token.colorPrimary};
        box-shadow: 0 0 0 1px ${token.colorPrimary};
        color: ${token.colorPrimary};
        background: ${primaryTint8};
      }
      .a11y-tile__check {
        position: absolute;
        top: -6px;
        right: -6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        box-shadow: 0 0 0 2px ${token.colorBgContainer};
      }

      .a11y-tile--font {
        min-width: 96px;
        flex: 1 1 96px;
        max-width: 140px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .a11y-tile--size {
        width: ${token.controlHeightLG + 8}px;
        min-width: ${token.controlHeightLG + 8}px;
        flex: 0 0 auto;
        padding-inline: ${token.paddingXXS}px;
      }
      .a11y-tile--spacing {
        min-width: 52px;
        flex: 1 1 52px;
        max-width: 72px;
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
      }
      .a11y-tile--contrast {
        flex: 1 1 140px;
        min-height: ${token.controlHeightLG + 8}px;
        font-weight: ${token.fontWeightStrong};
      }
      .a11y-tile--mask-size {
        flex: 1 1 72px;
        min-width: 72px;
        font-weight: ${token.fontWeightStrong};
      }

      .a11y-slider-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        margin-top: ${token.marginSM}px;
      }
      .a11y-slider-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .a11y-slider-field__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }

      .a11y-toast-prefs {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        margin-top: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .a11y-toast-prefs__heading {
        margin: 0 !important;
        font-size: ${token.fontSize}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        color: ${token.colorText} !important;
      }
      .a11y-toast-prefs__grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 120px;
        gap: ${token.marginMD}px;
        align-items: start;
      }
      .a11y-toast-prefs__controls {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .a11y-toast-prefs__field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .a11y-toast-prefs__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .a11y-toast-prefs__previews {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .a11y-toast-preview {
        border: 1px solid ${token.colorBorder};
        border-radius: ${token.borderRadius}px;
        background: ${token.colorBgContainer};
        overflow: hidden;
        box-shadow: ${token.boxShadowTertiary};
      }
      .a11y-toast-preview__chrome {
        height: 10px;
        background: ${token.colorFillSecondary};
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .a11y-toast-preview__body {
        position: relative;
        height: 48px;
        background: linear-gradient(
          180deg,
          ${token.colorFillAlter} 0%,
          ${token.colorBgContainer} 100%
        );
      }
      .a11y-toast-preview__toast {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 72%;
        height: 10px;
        border-radius: 3px;
      }
      .a11y-toast-preview__toast--success {
        background: ${token.colorSuccess};
      }
      .a11y-toast-preview__toast--warning {
        background: ${token.colorWarning};
      }

      .a11y-reset-card {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
      }
      .a11y-reset-card__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        flex: 1;
      }

      .a11y-mode-row {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginSM}px;
      }
      .a11y-mode-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXS}px;
        margin: 0;
        padding: ${token.paddingSM}px;
        border: 1px solid ${token.colorBorder};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        cursor: pointer;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        font: inherit;
        color: ${token.colorText};
      }
      .a11y-mode-card:hover {
        border-color: ${token.colorPrimary};
      }
      .a11y-mode-card--selected {
        border-color: ${token.colorPrimary};
        box-shadow: 0 0 0 1px ${token.colorPrimary};
        color: ${token.colorPrimary};
      }
      .a11y-mode-card__preview {
        width: 100%;
        aspect-ratio: 4 / 3;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        overflow: hidden;
        background: ${token.colorFillAlter};
      }
      .a11y-mode-card__preview--light {
        background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 55%);
      }
      .a11y-mode-card__preview--dark {
        background: linear-gradient(180deg, #1f1f1f 0%, #141414 55%);
      }
      .a11y-mode-card__preview--auto {
        background: linear-gradient(90deg, #f5f7fa 50%, #1f1f1f 50%);
      }
      .a11y-mode-card__preview-bars {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px;
        height: 100%;
        box-sizing: border-box;
      }
      .a11y-mode-card__preview-bars span {
        display: block;
        height: 6px;
        border-radius: 3px;
        background: ${tokenMix(token.colorText, 18)};
      }
      .a11y-mode-card__preview--dark .a11y-mode-card__preview-bars span {
        background: rgba(255, 255, 255, 0.28);
      }
      .a11y-mode-card__preview--auto .a11y-mode-card__preview-bars {
        background: transparent;
      }
      .a11y-mode-card__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
      }
      .a11y-mode-card--selected .a11y-mode-card__label {
        color: ${token.colorPrimary};
      }
      .a11y-mode-card .a11y-tile__check {
        top: -6px;
        right: -6px;
      }

      .a11y-swatch-row {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        align-items: center;
      }
      .a11y-swatch {
        position: relative;
        width: 36px;
        height: 36px;
        margin: 0;
        padding: 0;
        border: 2px solid transparent;
        border-radius: ${token.borderRadius}px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: inset 0 0 0 1px ${tokenMix("#000", 12)};
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .a11y-swatch:hover {
        transform: scale(1.06);
      }
      .a11y-swatch--selected {
        box-shadow:
          0 0 0 2px ${token.colorBgContainer},
          0 0 0 4px ${token.colorPrimary};
      }

      .a11y-zoom {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .a11y-zoom__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .a11y-zoom__slider.ant-slider {
        margin: ${token.marginXS}px 0 0;
      }

      .a11y-prefs-drawer-body.ant-drawer-body {
        background: ${token.colorBgLayout};
        padding: ${token.paddingMD}px !important;
      }
      .a11y-prefs-drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        width: 100%;
        padding-right: ${token.paddingLG}px;
        min-width: 0;
      }
      .a11y-prefs-drawer-header__title {
        margin: 0 !important;
        font-weight: 700 !important;
        font-size: ${token.fontSizeLG}px !important;
        line-height: 1.3 !important;
      }
      .a11y-prefs-drawer-header__actions {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        flex-shrink: 0;
      }

      @media (max-width: 575px) {
        .a11y-mode-row {
          grid-template-columns: 1fr;
        }
        .a11y-toast-prefs__grid {
          grid-template-columns: 1fr;
        }
        .a11y-toast-prefs__previews {
          flex-direction: row;
        }
        .a11y-toast-preview {
          flex: 1;
        }
      }
    `}</style>
  );
}
