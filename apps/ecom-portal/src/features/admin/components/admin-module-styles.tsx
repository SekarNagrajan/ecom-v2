// Modified by Sekar Nagarajan (2026-11-12 13:55)
/**
 * Control Panel stylesheet — one token-backed <style> injector (agenct.md: no inline styles, no
 * hex, tokens for colour / spacing / radius, custom-scroll on scroll surfaces).
 *
 * Layout of this file:
 *   1. Shell & chrome    — page card, module header, tab strip, section header/body/footer
 *   2. Shared primitives — loading, summary chips, tags, drawer body/footer, form footer, stacks
 *   3. Module Mapping    — dual-list board + drag-and-drop (kept; redesigned in place)
 *   4. Legacy blocks     — per-view rules the pre-redesign screens still need. Each block is
 *                          deleted when its section is redesigned (Phase 5).
 *   5. Responsive        — two token-driven breakpoints (screenMDMax / screenSMMax)
 */
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function AdminModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const warningTint8 = tokenMix(token.colorWarning, 8);
  const unit = token.sizeUnit; // 4px at normal density
  const controlLG = token.controlHeightLG;

  return (
    <style>{`
      /* ================================================================== */
      /* 1. Shell & chrome                                                   */
      /* ================================================================== */
      .feature-page-card.admin-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.admin-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0;
        min-height: calc(100vh - ${controlLG * 4}px);
      }
      .admin-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }
      .admin-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }

      .admin-page-tabs {
        position: sticky;
        top: 0;
        z-index: 2;
        flex-shrink: 0;
        padding: 0 ${token.paddingLG}px;
        background: ${token.colorBgContainer};
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .admin-page-tabs .ant-tabs-nav {
        margin: 0;
      }
      .admin-page-tabs .ant-tabs-nav::before {
        border-bottom: none;
      }
      .admin-page-tabs .ant-tabs-content-holder {
        display: none;
      }
      .admin-page-tabs .ant-tabs-tab {
        padding-inline: ${token.paddingSM}px;
      }
      .admin-tab-label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        white-space: nowrap;
      }
      .admin-tab-label .app-icon {
        color: inherit;
      }

      .admin-page-body {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingLG}px ${token.paddingXL}px ${token.paddingXL}px;
      }

      .admin-section {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        min-width: 0;
      }
      .admin-section__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: ${token.marginSM}px ${token.marginMD}px;
      }
      .admin-section__heading {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .admin-section__title.ant-typography {
        margin: 0;
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .admin-section__extra {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        margin-left: auto;
      }
      .admin-section__body {
        min-width: 0;
      }
      .admin-section__body--scroll {
        overflow: auto;
      }
      .admin-section__footer {
        position: sticky;
        bottom: 0;
        z-index: 1;
        padding-top: ${token.paddingSM}px;
        background: ${token.colorBgContainer};
      }

      /* ================================================================== */
      /* 2. Shared primitives                                                */
      /* ================================================================== */
      .admin-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: ${controlLG * 4}px;
        padding: ${token.paddingLG}px;
      }
      .admin-empty-inline {
        padding: ${token.paddingSM}px;
      }

      /* Module body stacks */
      .admin-config-form,
      .admin-menu-form,
      .admin-mapping-form,
      .admin-password-form,
      .admin-field-form,
      .admin-route-form,
      .admin-banner-form,
      .admin-advisory-form,
      .admin-cutoff-form,
      .admin-email-form {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
        min-width: 0;
      }

      /* Summary chips (counts above lists) */
      .admin-menu-summary {
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        gap: ${token.marginSM}px;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .admin-menu-summary__chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        color: ${token.colorText};
      }
      .admin-menu-summary__chip--success {
        border-color: ${token.colorSuccessBorder};
        background: ${successTint8};
        color: ${token.colorSuccess};
      }
      .admin-menu-summary__chip--warning {
        border-color: ${token.colorWarningBorder};
        background: ${warningTint8};
        color: ${token.colorWarning};
      }

      /* Tags */
      .admin-status-tag.ant-tag,
      .admin-code-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }

      /* Page-level form footer (singleton / bulk screens) */
      .admin-form-footer.form-step-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        width: 100%;
        margin: ${token.marginLG}px 0 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        border-radius: 0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .admin-form-footer.form-step-footer .sm-app-button,
      .admin-form-footer.form-step-footer .ant-btn {
        margin: 0;
        min-width: ${controlLG * 2}px;
      }
      .admin-form-footer__meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        min-width: 0;
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
      }
      .admin-form-footer__hint {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        color: ${token.colorWarning};
        font-weight: ${token.fontWeightStrong};
      }
      .admin-form-footer__actions {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        margin-left: auto;
      }

      /* Drawer anatomy (AdminDrawer) */
      .admin-drawer-header-bar.ant-drawer-header {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorBgContainer} 100%);
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .admin-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .admin-drawer-title__icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${controlLG}px;
        height: ${controlLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorPrimaryBorder};
        color: ${token.colorPrimary};
      }
      .admin-drawer-title__copy {
        min-width: 0;
        padding-top: ${token.paddingXXS / 2}px;
      }
      .admin-drawer-title__text {
        margin: 0;
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.lineHeightHeading5};
        color: ${token.colorText};
      }
      .admin-drawer-title__meta {
        margin-top: ${token.marginXXS / 2}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        color: ${token.colorTextSecondary};
      }
      .admin-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px ${token.paddingLG}px;
        overflow-y: auto;
        background: ${token.colorFillAlter};
      }
      /* legacy drawer body used by the pre-redesign Banner / Advisory drawers */
      .admin-drawer-body:not(.custom-scroll) {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
      }
      .admin-drawer-footer-bar.ant-drawer-footer {
        padding: 0;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .admin-drawer-actions.form-step-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        width: 100%;
        margin: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-top: none;
        background: transparent;
      }
      .admin-drawer-actions.form-step-footer .sm-app-button,
      .admin-drawer-actions.form-step-footer .ant-btn {
        margin: 0;
        min-width: ${controlLG * 2}px;
      }

      .admin-stack-full {
        width: 100%;
      }
      .admin-mono-textarea.ant-input,
      .admin-mono-textarea textarea {
        font-family: ${token.fontFamilyCode};
      }
      .admin-banner-thumb {
        object-fit: cover;
        border-radius: ${token.borderRadiusSM}px;
      }

      /* Form section card (AdminFormSection) */
      .admin-form-section {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        margin: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }
      .admin-form-section__header {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .admin-form-section__step,
      .admin-form-section__icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: 50%;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .admin-form-section__heading {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
        min-width: 0;
        flex: 1;
      }
      .admin-form-section__title {
        margin: 0;
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.lineHeight};
        color: ${token.colorText};
      }
      .admin-form-section__hint {
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        color: ${token.colorTextSecondary};
      }
      .admin-form-section__extra {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .admin-form-section__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .admin-form-section__body .ant-form-item {
        margin-bottom: 0;
      }

      /* Status pill (AdminStatusPill) */
      .admin-pill {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS + 2}px;
        margin: 0;
        padding: ${token.paddingXXS / 2}px ${token.paddingXS + 2}px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid transparent;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.lineHeight};
        white-space: nowrap;
      }
      .admin-pill__dot {
        width: ${token.sizeXS - 2}px;
        height: ${token.sizeXS - 2}px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
      }
      .admin-pill__icon.app-icon {
        color: inherit;
      }
      .admin-pill--success {
        color: ${token.colorSuccess};
        background: ${successTint8};
        border-color: ${tokenMix(token.colorSuccess, 16)};
      }
      .admin-pill--neutral {
        color: ${token.colorTextSecondary};
        background: ${token.colorFillAlter};
        border-color: ${token.colorBorderSecondary};
      }
      .admin-pill--warning {
        color: ${token.colorWarning};
        background: ${warningTint8};
        border-color: ${tokenMix(token.colorWarning, 16)};
      }
      .admin-pill--error {
        color: ${token.colorError};
        background: ${tokenMix(token.colorError, 8)};
        border-color: ${tokenMix(token.colorError, 16)};
      }
      .admin-pill--info {
        color: ${token.colorInfo};
        background: ${token.colorInfoBg};
        border-color: ${token.colorInfoBorder};
      }
      .admin-pill--processing,
      .admin-pill--primary {
        color: ${token.colorPrimary};
        background: ${primaryTint8};
        border-color: ${token.colorPrimaryBorder};
      }

      /* Filter pills (AdminFilterPills) */
      .admin-filter-pills {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .admin-filter-pills__pill {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin: 0;
        padding: ${token.paddingXXS + 2}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
        cursor: pointer;
        transition: background-color ${token.motionDurationFast} ease,
          border-color ${token.motionDurationFast} ease,
          color ${token.motionDurationFast} ease;
      }
      .admin-filter-pills__pill:hover {
        border-color: ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .admin-filter-pills__pill:focus-visible {
        outline: ${token.lineWidthBold}px solid ${token.colorPrimaryBorder};
        outline-offset: 1px;
      }
      .admin-filter-pills__pill--selected {
        border-color: transparent;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }
      .admin-filter-pills__pill--empty {
        opacity: ${token.opacityLoading};
      }
      .admin-filter-pills__dot {
        width: ${token.sizeXS}px;
        height: ${token.sizeXS}px;
        border-radius: 50%;
        flex-shrink: 0;
        background: ${token.colorPrimary};
      }
      .admin-filter-pills__pill--success .admin-filter-pills__dot {
        background: ${token.colorSuccess};
      }
      .admin-filter-pills__pill--neutral .admin-filter-pills__dot {
        background: ${token.colorTextQuaternary};
      }
      .admin-filter-pills__pill--warning .admin-filter-pills__dot {
        background: ${token.colorWarning};
      }
      .admin-filter-pills__pill--error .admin-filter-pills__dot {
        background: ${token.colorError};
      }
      .admin-filter-pills__pill--info .admin-filter-pills__dot {
        background: ${token.colorInfo};
      }
      .admin-filter-pills__label {
        font-weight: ${token.fontWeightStrong};
      }
      .admin-filter-pills__count {
        color: ${token.colorTextSecondary};
      }
      .admin-filter-pills__pill--selected .admin-filter-pills__count {
        color: inherit;
        opacity: ${token.opacityLoading + 0.1};
      }

      /* Locked identity field (AdminLockedField) */
      .admin-locked-field {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        border: 1px dashed ${token.colorBorder};
        background: ${token.colorFillAlter};
      }
      .admin-locked-field__icon {
        flex-shrink: 0;
        display: inline-flex;
        color: ${token.colorTextSecondary};
      }
      .admin-locked-field__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
        min-width: 0;
        flex: 1;
      }
      .admin-locked-field__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .admin-locked-field__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .admin-locked-field__hint {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextTertiary};
      }
      .admin-locked-field__badge {
        flex-shrink: 0;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorFillSecondary};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      /* Settings rows (AdminSettingRow) */
      .admin-setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        padding: ${token.paddingSM}px 0;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .admin-setting-row:first-child {
        border-top: none;
        padding-top: 0;
      }
      .admin-setting-row--stacked {
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginXS}px;
      }
      .admin-setting-row__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
        min-width: 0;
        flex: 1;
      }
      .admin-setting-row__title {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .admin-setting-row__description {
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .admin-setting-row__control {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-width: 0;
      }
      .admin-setting-row--stacked .admin-setting-row__control {
        justify-content: stretch;
        width: 100%;
      }
      .admin-setting-row--stacked .admin-setting-row__control > * {
        width: 100%;
      }
      .admin-setting-row__item.ant-form-item {
        margin-bottom: 0;
      }
      .admin-setting-row__item.ant-form-item .ant-form-item-label {
        display: none;
      }
      .admin-setting-row__number.ant-input-number-group-wrapper,
      .admin-setting-row__number.ant-input-number {
        width: ${controlLG * 4.5}px;
      }
      .admin-field-hint {
        display: block;
        margin-top: calc(-1 * ${token.marginXS}px);
        font-size: ${token.fontSizeSM}px;
      }
      .admin-mono-input input {
        font-family: ${token.fontFamilyCode};
      }

      /* Result receipt (Password Reset) */
      .admin-receipt {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        margin-top: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${tokenMix(token.colorSuccess, 24)};
        background: ${successTint8};
      }
      .admin-receipt__icon {
        flex-shrink: 0;
        display: inline-flex;
        color: ${token.colorSuccess};
      }
      .admin-receipt__icon .app-icon {
        color: inherit;
      }
      .admin-receipt__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        flex: 1;
      }
      .admin-receipt__meta {
        font-size: ${token.fontSizeSM}px;
      }
      .admin-receipt__message {
        word-break: break-word;
      }

      /* Grids */
      .admin-grid-wrap {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
      }
      .admin-grid-wrap .admin-data-view {
        width: 100%;
      }
      /* DataView always renders its toolbar card; with renderToolbar={() => null} it is empty. */
      .admin-grid-wrap .admin-data-view > .ant-card:first-child:has(> .ant-card-body:empty) {
        display: none;
      }
      .admin-lane {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .admin-lane__arrow.app-icon {
        color: ${token.colorTextSecondary};
      }

      /* ================================================================== */
      /* 3. Module Mapping — dual-list board + drag-and-drop                 */
      /* ================================================================== */
      .admin-mapping-customer {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        width: 100%;
      }
      .admin-mapping-customer__row {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
        flex-wrap: wrap;
      }
      .admin-mapping-customer__row .ant-input-affix-wrapper,
      .admin-mapping-customer__row > .ant-input {
        flex: 1 1 ${controlLG * 6}px;
        min-width: 0;
      }
      .admin-mapping-customer__meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .admin-mapping-summary {
        display: inline-flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-inline-start: auto;
      }
      .admin-mapping-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: ${controlLG * 6}px;
        padding: ${token.paddingLG}px;
      }

      .admin-mapping-board {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: stretch;
        width: 100%;
        min-width: 0;
      }
      .admin-mapping-board--busy {
        opacity: ${token.opacityLoading};
        pointer-events: none;
      }
      .admin-mapping-column {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
        min-height: ${controlLG * 10}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        transition: border-color ${token.motionDurationMid} ease,
          box-shadow ${token.motionDurationMid} ease,
          background-color ${token.motionDurationMid} ease;
      }
      .admin-mapping-column--over {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
        box-shadow: 0 0 0 1px ${token.colorPrimaryBorder};
      }
      .admin-mapping-column__head {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .admin-mapping-column__title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
      }
      .admin-mapping-column__title {
        margin: 0;
      }
      .admin-mapping-column__hint {
        display: block;
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }
      .admin-mapping-column__list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        flex: 1;
        min-height: ${controlLG * 7}px;
        max-height: ${controlLG * 12}px;
        overflow-y: auto;
        padding: ${token.paddingXXS}px;
      }
      .admin-mapping-transfer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px 0;
      }
      .admin-mapping-transfer__hint {
        font-size: ${token.fontSizeSM}px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .admin-mapping-card {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        transition: border-color ${token.motionDurationMid} ease,
          background-color ${token.motionDurationMid} ease,
          box-shadow ${token.motionDurationMid} ease;
      }
      .admin-mapping-card:hover {
        border-color: ${token.colorPrimaryBorder};
      }
      .admin-mapping-card--selected,
      .admin-mapping-card--drop-target {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
      }
      .admin-mapping-card--locked {
        background: ${token.colorFillAlter};
      }
      .admin-mapping-card--dragging {
        opacity: ${token.opacityLoading};
      }
      .admin-mapping-card--overlay {
        box-shadow: ${token.boxShadowSecondary};
        border-color: ${token.colorPrimary};
        background: ${token.colorBgElevated};
        cursor: grabbing;
      }
      .admin-mapping-card__handle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin: 0;
        padding: ${token.paddingXXS}px;
        border: none;
        border-radius: ${token.borderRadiusSM}px;
        background: transparent;
        color: ${token.colorTextSecondary};
        cursor: grab;
      }
      .admin-mapping-card__handle:hover {
        background: ${token.colorFillSecondary};
        color: ${token.colorPrimary};
      }
      .admin-mapping-card__handle--locked {
        cursor: default;
        color: ${token.colorTextQuaternary};
      }
      .admin-mapping-card__body {
        display: flex;
        flex: 1;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .admin-mapping-card__name {
        margin: 0;
        font-weight: ${token.fontWeightStrong};
      }
      .admin-mapping-search-input {
        margin-bottom: ${token.marginMD}px;
      }
      .admin-mapping-search-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        max-height: ${controlLG * 9}px;
        overflow-y: auto;
      }
      .admin-mapping-search-item {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginMD}px;
        width: 100%;
        margin: 0;
        padding: ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        text-align: left;
        cursor: pointer;
        transition: border-color ${token.motionDurationMid} ease,
          background-color ${token.motionDurationMid} ease;
      }
      .admin-mapping-search-item:hover {
        border-color: ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .admin-mapping-search-item__title.ant-typography {
        margin: 0 0 ${token.marginXXS}px;
      }

      /* ================================================================== */
      /* 4. Legacy per-view blocks — removed as each tab is redesigned       */
      /* ================================================================== */

      /* legacy: Module Creation (MenuManagementView) */
      .admin-menu-create.ant-collapse {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .admin-menu-create.ant-collapse .ant-collapse-header {
        align-items: center;
        font-weight: ${token.fontWeightStrong};
      }
      .admin-menu-create__form {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .admin-menu-create__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .admin-menu-create__grid .admin-login-page__field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .admin-menu-create .admin-form-footer.form-step-footer {
        margin-top: ${token.marginSM}px;
      }
      .admin-menu-action {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-width: 0;
        margin: 0;
        padding: ${token.paddingXXS}px 0;
      }

      /* legacy: Field Configuration (FieldConfigView) */
      .admin-field-actions {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
        margin: 0;
        padding: ${token.paddingXS}px 0;
      }
      .admin-field-actions__item {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        width: 100%;
        margin: 0;
        padding: ${token.paddingXXS}px 0;
      }
      .admin-field-actions__label {
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }

      /* legacy: antd Table cells (Menu / Field / Banner / Advisory views) */
      .admin-section .responsive-table-wrap .ant-table-thead > tr > th,
      .admin-section .responsive-table-wrap .ant-table-tbody > tr > td {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        vertical-align: middle;
      }

      /* legacy: Cutoff Configuration inline form + grid (CutoffConfigView) */
      .admin-cutoff-create {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .admin-cutoff-create__row {
        display: grid;
        gap: ${token.marginMD}px;
        width: 100%;
        align-items: end; /* one baseline when labels wrap */
      }
      .admin-cutoff-create__row--5 {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
      .admin-cutoff-create__row--2 {
        grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
      }
      .admin-cutoff-create__row .ant-form-item {
        margin-bottom: 0;
        min-width: 0;
        position: relative;
      }
      .admin-cutoff-create__row .ant-form-item .ant-form-item-label {
        padding: 0 0 ${token.paddingXXS}px;
      }
      /* validation text must not grow the item, or align-items:end shifts siblings */
      .admin-cutoff-create__row .ant-form-item-explain,
      .admin-cutoff-create__row .ant-form-item-additional {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        z-index: 1;
      }
      .admin-cutoff-weekend {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        justify-content: flex-end;
        min-width: 0;
        padding: ${token.paddingSM}px 0;
      }
      .admin-cutoff-create__actions.form-step-footer {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        min-width: 0;
        width: auto;
        margin: 0;
        padding: ${token.paddingSM}px 0;
        border: none;
      }
      .admin-cutoff-grid-wrap {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        min-height: ${controlLG * 9}px;
      }
      .admin-cutoff-grid-wrap > * {
        flex: 1;
        min-height: 0;
      }

      /* legacy: Email Templates (EmailTemplateEditorView) */
      .admin-email-sidebar,
      .admin-email-editor {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
        min-width: 0;
      }
      .admin-email-editor .ant-form-item {
        margin-bottom: 0;
      }
      .admin-vars-box {
        margin-top: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .admin-vars-box__hint {
        display: block;
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }
      .admin-vars-box__tags {
        width: 100%;
        margin: 0;
      }
      .admin-vars-tag.ant-tag {
        cursor: pointer;
        margin-inline-end: ${token.marginXXS}px;
        margin-bottom: ${token.marginXXS}px;
      }
      .admin-preview-box {
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px dashed ${token.colorBorder};
      }
      .admin-preview-box__label {
        display: block;
        margin-bottom: ${token.marginSM}px;
        font-size: ${token.fontSizeSM}px;
      }
      .admin-preview-box__content {
        max-height: ${controlLG * 6}px;
        overflow-y: auto;
        min-width: 0;
        padding: ${token.paddingXS}px 0;
      }

      /* ================================================================== */
      /* 5. Responsive                                                       */
      /* ================================================================== */
      @media (max-width: ${token.screenMDMax}px) {
        .admin-page-body {
          padding: ${token.paddingLG}px;
        }
        .admin-mapping-board {
          grid-template-columns: 1fr;
        }
        .admin-mapping-transfer {
          flex-direction: row;
          justify-content: center;
        }
        /* legacy */
        .admin-menu-create__grid {
          grid-template-columns: 1fr;
        }
        .admin-cutoff-create__row--5,
        .admin-cutoff-create__row--2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .admin-cutoff-create__actions.form-step-footer {
          grid-column: 1 / -1;
          justify-content: flex-end;
        }
      }

      @media (max-width: ${token.screenSMMax}px) {
        .admin-page-header {
          padding: ${token.paddingSM}px ${token.paddingMD}px 0;
        }
        .admin-page-tabs {
          padding: 0 ${token.paddingMD}px;
        }
        .admin-tab-label__text {
          display: none;
        }
        .admin-page-body {
          padding: ${token.paddingMD}px;
        }
        .admin-section__extra {
          width: 100%;
          margin-left: 0;
        }
        .admin-form-footer.form-step-footer,
        .admin-drawer-actions.form-step-footer {
          flex-direction: column-reverse;
          gap: ${token.marginSM}px;
          padding: ${token.paddingMD}px;
        }
        .admin-form-footer.form-step-footer .sm-app-button,
        .admin-form-footer.form-step-footer .ant-btn,
        .admin-drawer-actions.form-step-footer .sm-app-button,
        .admin-drawer-actions.form-step-footer .ant-btn {
          width: 100%;
          min-width: 0;
        }
        .admin-form-footer__meta,
        .admin-form-footer__actions {
          width: 100%;
          margin-left: 0;
        }
        .admin-form-footer__actions {
          flex-direction: column-reverse;
        }
        .admin-filter-pills {
          padding: ${token.paddingXS}px;
        }
        .admin-setting-row {
          flex-direction: column;
          align-items: stretch;
          gap: ${token.marginXS}px;
        }
        .admin-setting-row__control {
          justify-content: flex-start;
        }
        .admin-setting-row__number.ant-input-number-group-wrapper,
        .admin-setting-row__number.ant-input-number {
          width: 100%;
        }
        .admin-drawer-body {
          padding: ${token.paddingMD}px;
          gap: ${token.marginSM}px;
        }
        .admin-menu-summary {
          gap: ${token.marginXS}px;
        }
        .admin-mapping-customer__row {
          flex-direction: column;
          align-items: stretch;
        }
        .admin-mapping-customer__row .sm-app-button,
        .admin-mapping-customer__row .ant-btn {
          width: 100%;
        }
        /* legacy */
        .admin-cutoff-create__row--5,
        .admin-cutoff-create__row--2 {
          grid-template-columns: 1fr;
        }
        .admin-cutoff-create__actions.form-step-footer {
          grid-column: auto;
          width: 100%;
          justify-content: stretch;
        }
        .admin-cutoff-create__actions .sm-app-button,
        .admin-cutoff-create__actions .ant-btn {
          flex: 1 1 auto;
        }
      }
    `}</style>
  );
}
