// Modified by Sekar Nagarajan (2026-11-12 18:00)
/**
 * Control Panel stylesheet — one token-backed <style> injector (agenct.md: no inline styles, no
 * hex, tokens for colour / spacing / radius, custom-scroll on scroll surfaces).
 *
 * Layout of this file:
 *   1. Shell & chrome    — page card, module header, tab strip, section header/body/footer
 *   2. Shared primitives — loading, summary chips, tags, drawer body/footer, form footer, stacks
 *   3. Module Mapping    — dual-list board + drag-and-drop
 *   4. Responsive        — token-driven breakpoints (screenXL / screenMDMax / screenSMMax)
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
        z-index: 3;
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
        margin-top: ${token.marginSM}px;
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

      /* Code tags */
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

      /* Global Configuration page: settings column + posture / pending-changes rail */
      .admin-config-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: start;
      }
      .admin-config-main {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        min-width: 0;
        max-width: ${controlLG * 22}px;
      }
      .admin-config-rail {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .admin-posture,
      .admin-pending {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .admin-posture__head,
      .admin-pending__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
      }
      .admin-posture__list,
      .admin-pending__list,
      .admin-confirm-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .admin-confirm-list li::before {
        content: "•";
        margin-right: ${token.marginXS}px;
        color: ${token.colorWarning};
      }
      .admin-posture__item {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .admin-posture__icon {
        flex-shrink: 0;
        display: inline-flex;
        margin-top: ${token.marginXXS / 2}px;
        color: ${token.colorSuccess};
      }
      .admin-posture__icon .app-icon {
        color: inherit;
      }
      .admin-posture__item--off .admin-posture__icon {
        color: ${token.colorTextQuaternary};
      }
      .admin-posture__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
        min-width: 0;
      }
      .admin-posture__label {
        font-weight: ${token.fontWeightStrong};
      }
      .admin-posture__item--off .admin-posture__label {
        color: ${token.colorTextSecondary};
      }
      .admin-posture__detail,
      .admin-posture__note,
      .admin-pending__empty {
        font-size: ${token.fontSizeSM}px;
      }
      .admin-config-warning.ant-alert {
        border-radius: ${token.borderRadiusLG}px;
      }
      .admin-pending__item {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: ${token.marginXXS}px ${token.marginXS}px;
        align-items: center;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        background: ${warningTint8};
      }
      .admin-pending__field {
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
      }
      .admin-pending__diff {
        grid-column: 1;
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .admin-pending__arrow.app-icon {
        color: ${token.colorTextSecondary};
      }
      .admin-pending__item > .ant-btn {
        grid-column: 2;
        grid-row: 1 / span 2;
      }

      /* Lockout rule sentence */
      .admin-rule-sentence {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-rule-sentence__text {
        font-size: ${token.fontSizeLG}px;
        color: ${token.colorText};
      }
      .admin-rule-sentence__number.ant-input-number,
      .admin-rule-sentence__number.ant-input-number-group-wrapper {
        width: ${controlLG * 2.2}px;
      }
      .admin-rule-sentence__number--wide.ant-input-number,
      .admin-rule-sentence__number--wide.ant-input-number-group-wrapper {
        width: ${controlLG * 4.5}px;
      }
      .admin-rule-sentence__meta {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: ${token.marginXS}px ${token.marginMD}px;
        font-size: ${token.fontSizeSM}px;
      }
      .admin-rule-sentence__badges {
        display: inline-flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }
      .admin-rule-sentence__badges .ant-btn {
        height: auto;
        padding: 0 ${token.paddingXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .admin-section__footer .admin-form-footer.form-step-footer {
        margin: 0;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
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
      .admin-setting-row__icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: ${token.borderRadius}px;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .admin-setting-row__icon .app-icon {
        color: inherit;
      }
      .admin-setting-row--stacked .admin-setting-row__icon {
        display: none;
      }
      .admin-setting-row__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
        min-width: 0;
        flex: 1;
      }
      .admin-setting-row__stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        width: 100%;
      }
      .admin-setting-row__title-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }
      .admin-setting-row__title {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .admin-setting-row--modified {
        box-shadow: inset ${token.lineWidthBold}px 0 0 ${token.colorWarning};
        padding-left: ${token.paddingSM}px;
        margin-left: -${token.paddingSM}px;
      }
      .admin-setting-row__revert.ant-btn {
        height: auto;
        padding: 0 ${token.paddingXXS}px;
        font-size: ${token.fontSizeSM}px;
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

      /* Toolbar row: pills left, search right */
      .admin-toolbar {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .admin-toolbar__search {
        flex: 0 1 ${controlLG * 7}px;
        min-width: ${controlLG * 5}px;
      }

      /* Grid cells */
      .admin-switch-cell {
        display: inline-flex;
        align-items: center;
        height: 100%;
      }
      .admin-cell-text {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .admin-dirty-dot {
        display: inline-block;
        width: ${token.sizeXS}px;
        height: ${token.sizeXS}px;
        border-radius: 50%;
        background: ${token.colorWarning};
        flex-shrink: 0;
      }
      .admin-link-cell {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        color: ${token.colorPrimary};
      }
      .admin-link-cell__text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .admin-banner-thumb--form {
        display: block;
        width: 100%;
        max-height: ${controlLG * 4}px;
        object-fit: cover;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
      .admin-drawer-title__pills {
        display: inline-flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .admin-detail-modal__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .admin-detail-modal__message {
        max-height: ${controlLG * 8}px;
        overflow-y: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .admin-descriptions .ant-descriptions-item-label {
        color: ${token.colorTextSecondary};
      }
      .admin-prewrap.ant-typography {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      /* Email Templates */
      .admin-email-layout {
        display: grid;
        grid-template-columns: minmax(${controlLG * 6}px, 1fr) minmax(0, 2.4fr);
        gap: ${token.marginMD}px;
        align-items: start;
      }
      .admin-email-layout--narrow {
        grid-template-columns: minmax(0, 1fr);
      }
      .admin-template-pane {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .admin-template-list {
        list-style: none;
        margin: 0;
        padding: ${token.paddingXXS}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        max-height: calc(100vh - ${controlLG * 9}px);
        min-height: ${controlLG * 5}px;
        overflow-y: auto;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }
      .admin-template-list__item {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
        width: 100%;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid transparent;
        border-radius: ${token.borderRadius}px;
        background: transparent;
        color: ${token.colorText};
        text-align: left;
        cursor: pointer;
        transition: background-color ${token.motionDurationFast} ease,
          border-color ${token.motionDurationFast} ease;
      }
      .admin-template-list__item:hover {
        background: ${token.colorFillTertiary};
      }
      .admin-template-list__item:focus-visible {
        outline: ${token.lineWidthBold}px solid ${token.colorPrimaryBorder};
        outline-offset: -${token.lineWidthBold}px;
      }
      .admin-template-list__item--active {
        background: ${primaryTint8};
        border-color: ${token.colorPrimaryBorder};
      }
      .admin-template-list__title {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-weight: ${token.fontWeightStrong};
      }
      .admin-template-list__item--active .admin-template-list__title {
        color: ${token.colorPrimary};
      }
      .admin-template-list__meta {
        font-size: ${token.fontSizeSM}px;
      }
      .admin-template-list__empty {
        padding: ${token.paddingMD}px;
        text-align: center;
      }
      .admin-email-editor-pane {
        min-width: 0;
      }
      .admin-email-editor-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: ${token.marginMD}px;
      }
      .admin-email-editor-grid__editor,
      .admin-email-editor-grid__preview {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .admin-template-vars {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px dashed ${token.colorBorder};
        background: ${token.colorFillAlter};
      }
      .admin-template-vars__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .admin-template-vars__chips {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }
      .admin-template-vars__chip.ant-btn {
        font-family: ${token.fontFamilyCode};
        font-size: ${token.fontSizeSM}px;
      }
      .admin-template-preview {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px dashed ${token.colorBorder};
        background: ${token.colorBgContainer};
      }
      .admin-template-preview__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .admin-template-preview__content {
        max-height: ${controlLG * 10}px;
        overflow-y: auto;
        min-width: 0;
        word-break: break-word;
      }
      .admin-template-preview__content img {
        max-width: 100%;
      }
      .admin-email-var {
        padding: 0 ${token.paddingXXS}px;
        border-radius: ${token.borderRadiusXS}px;
        background: ${warningTint8};
        color: ${token.colorWarningText};
        font-family: ${token.fontFamilyCode};
        font-size: 0.95em;
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
        gap: ${token.marginXS}px;
        margin-inline-start: auto;
      }
      .admin-mapping-option {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
        min-width: 0;
      }
      .admin-mapping-option__name {
        font-weight: ${token.fontWeightStrong};
      }
      .admin-mapping-option__meta {
        font-size: ${token.fontSizeSM}px;
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
      .admin-mapping-board--single {
        grid-template-columns: minmax(0, 1fr);
      }
      .admin-mapping-board--single .admin-mapping-transfer {
        flex-direction: row;
        justify-content: center;
        order: 2;
      }
      .admin-mapping-column--hidden {
        display: none;
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
      /* ================================================================== */
      /* 4. Responsive                                                       */
      /* ================================================================== */
      @media (min-width: ${token.screenXL}px) {
        .admin-email-editor-grid {
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
        }
        .admin-config-layout {
          grid-template-columns: minmax(0, 1fr) ${controlLG * 8.5}px;
        }
        .admin-config-rail {
          position: sticky;
          top: ${controlLG * 2}px;
          z-index: 1;
        }
      }

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
        .admin-toolbar__search {
          flex-basis: 100%;
          min-width: 0;
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
        .admin-rule-sentence__presets {
          width: 100%;
        }
        .admin-setting-row--modified {
          padding-left: ${token.paddingXS}px;
          margin-left: -${token.paddingXS}px;
        }
        .admin-drawer-body {
          padding: ${token.paddingMD}px;
          gap: ${token.marginSM}px;
        }
        /* legacy */
      }
    `}</style>
  );
}
