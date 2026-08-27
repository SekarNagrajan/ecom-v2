// Modified by Sekar Nagarajan (2026-08-27 15:00)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function AdminModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const warningTint8 = tokenMix(token.colorWarning, 8);

  return (
    <style>{`
      .admin-layout {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
        min-width: 0;
      }

      /* Compact left rail; right module fills remaining width */
      .admin-workspace {
        display: grid;
        grid-template-columns: clamp(200px, 20%, 240px) minmax(0, 1fr);
        gap: ${token.marginLG}px;
        width: 100%;
        min-width: 0;
        align-items: start;
      }

      /* Content-only — modules live in the app sidebar */
      .admin-workspace.admin-workspace--content-only {
        display: block;
        grid-template-columns: none;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .admin-workspace.admin-workspace--content-only .admin-workspace__content {
        width: 100%;
        margin: ${token.marginXXS}px ${token.marginXXS}px ${
      token.marginXXS
    }px ${token.marginXXS}px ${token.marginXXS}px;
    }px ${token.marginXXS}px;
        padding: ${token.paddingLG}px ${token.paddingXL}px ${token.paddingXL}px;
        border: none;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        box-sizing: border-box;
        max-width: calc(100% - ${token.marginLG * 2}px);
      }

      .admin-workspace__nav {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        width: 100%;
        min-width: 0;
        position: sticky;
        top: ${token.marginLG}px;
        align-self: start;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .admin-workspace__nav-title {
        margin: 0 0 ${token.marginXXS}px;
        padding: 0 ${token.paddingXXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .admin-workspace__nav-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        width: 100%;
      }
      .admin-workspace__nav-item {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid transparent;
        border-radius: ${token.borderRadius}px;
        background: transparent;
        color: ${token.colorText};
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
      }
      .admin-workspace__nav-item:hover {
        background: ${token.colorFillTertiary};
        color: ${token.colorPrimary};
      }
      .admin-workspace__nav-item--active {
        background: ${primaryTint8};
        border-color: ${token.colorPrimaryBorder};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }

      .admin-workspace__content {
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding: ${token.paddingLG}px ${token.paddingXL}px;
        border-radius: ${token.borderRadiusLG}px;
        border: none;
        background: ${token.colorBgContainer};
      }
      .admin-workspace__content > .admin-panel.ant-card {
        border: none;
        background: transparent;
        box-shadow: none;
      }
      .admin-workspace__content > .admin-panel > .ant-card-body {
        padding: 0 !important;
      }

      .admin-panel.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        box-shadow: none;
      }
      .admin-panel > .ant-card-body {
        padding: ${token.paddingMD}px 0 !important;
      }
      .admin-panel__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginMD}px;
        margin-bottom: ${token.marginLG}px;
        flex-wrap: wrap;
      }
      .admin-panel__header-main {
        flex: 1;
        min-width: 0;
      }
      .admin-panel__title-row {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .admin-panel__title {
        margin: 0 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .admin-panel__subtitle {
        display: block;
        margin-top: ${token.marginXS}px;
      }
      .admin-panel-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        margin: 0;
        padding: 0;
      }
      .admin-panel-actions .sm-app-button,
      .admin-panel-actions .ant-btn {
        margin: 0;
      }
      .admin-panel__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .admin-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: ${token.controlHeightLG * 4}px;
        padding: ${token.paddingLG}px;
      }
      .admin-loading-center--fill {
        min-height: calc(100vh - 320px);
      }

      /* Shared module body stacks */
      .admin-config-form,
      .admin-menu-form,
      .admin-mapping-form,
      .admin-priv-form,
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

      .admin-config-form input:-webkit-autofill,
      .admin-config-form input:-webkit-autofill:hover,
      .admin-config-form input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px ${
          token.colorBgContainer
        } inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
      }
      .admin-config-section__title {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .admin-config-section__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        width: 100%;
        min-width: 0;
        padding: 0;
      }
      .admin-config-section__body .ant-form-item {
        margin-bottom: 0;
      }
      .admin-config-section__body .ant-form-item-label {
        padding: 0 0 ${token.paddingXXS}px !important;
      }
      .admin-config-section__body .ant-form-item-control,
      .admin-config-section__body .ant-form-item-control-input,
      .admin-config-section__body .ant-form-item-control-input-content {
        min-width: 0;
        width: 100%;
      }
      .admin-config-toggle.ant-form-item {
        width: 100%;
        margin-bottom: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .admin-config-toggle .ant-form-item-row {
        flex-direction: row !important;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .admin-config-toggle .ant-form-item-label {
        padding: 0 !important;
        flex: 1 1 auto;
        min-width: 0;
      }
      .admin-config-toggle .ant-form-item-label > label {
        height: auto !important;
        white-space: normal;
      }
      .admin-config-toggle .ant-form-item-control {
        flex: 0 0 auto;
        width: auto !important;
        max-width: none;
      }
      .admin-config-toggle .ant-form-item-control-input,
      .admin-config-toggle .ant-form-item-control-input-content {
        min-height: 0;
        display: flex;
        justify-content: flex-end;
      }

      /* Footer / primary actions */
      .admin-form-footer.form-step-footer {
        display: flex;
        justify-content: flex-end;
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
        min-width: ${token.controlHeightLG * 2}px;
      }

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

      /* Module Creation — RegisterMenu form */
      .admin-menu-create.ant-collapse {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .admin-menu-create .ant-collapse-header {
        align-items: center !important;
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

      /* Module Mapping — dual-list board + drag-drop */
      .admin-mapping-alert,
      .admin-mapping-hint {
        margin: 0;
      }
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
        flex: 1 1 240px;
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
        min-height: ${token.controlHeightLG * 6}px;
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
        opacity: 0.72;
        pointer-events: none;
      }

      .admin-mapping-column {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
        min-height: 420px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        transition: border-color 0.2s ease, box-shadow 0.2s ease,
          background-color 0.2s ease;
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
        min-height: 280px;
        max-height: 480px;
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
        transition: border-color 0.2s ease, background-color 0.2s ease,
          box-shadow 0.2s ease;
      }
      .admin-mapping-card:hover {
        border-color: ${token.colorPrimaryBorder};
      }
      .admin-mapping-card--selected {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
      }
      .admin-mapping-card--locked {
        background: ${token.colorFillAlter};
      }
      .admin-mapping-card--dragging {
        opacity: 0.35;
      }
      .admin-mapping-card--drop-target {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
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
        max-height: 360px;
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
        transition: border-color 0.2s ease, background-color 0.2s ease;
      }
      .admin-mapping-search-item:hover {
        border-color: ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .admin-mapping-search-item__title {
        margin: 0 0 ${token.marginXXS}px !important;
      }

      /* Table / row action cells */
      .admin-menu-action,
      .admin-field-actions,
      .admin-priv-actions,
      .admin-cutoff-actions {
        display: flex;
        min-width: 0;
        margin: 0;
        padding: ${token.paddingXXS}px 0;
      }
      .admin-menu-action {
        align-items: center;
        justify-content: flex-start;
      }
      .admin-field-actions {
        flex-direction: column;
        gap: ${token.marginSM}px;
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
      .admin-priv-actions {
        align-items: center;
        gap: ${token.marginMD}px;
        flex-wrap: nowrap;
        max-width: 100%;
        overflow-x: auto;
        padding: ${token.paddingXS}px ${token.paddingXXS}px ${
      token.paddingSM
    }px 0;
      }
      .admin-priv-actions__item {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        margin: 0;
        padding: 0;
      }
      .admin-priv-actions__item .ant-checkbox-wrapper {
        margin-inline-end: 0;
        white-space: nowrap;
      }
      .admin-cutoff-actions {
        align-items: flex-end;
        gap: ${token.marginMD}px;
        flex-wrap: wrap;
        padding: ${token.paddingXS}px 0;
      }
      .admin-cutoff-actions__field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        min-width: 96px;
        margin: 0;
      }
      .admin-cutoff-actions__label {
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }
      .admin-cutoff-input.ant-input-number {
        width: 100%;
      }
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
        /* Align controls to one baseline when labels wrap to 2 lines */
        align-items: end;
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
      .admin-cutoff-create__row .ant-form-item-label {
        padding: 0 0 ${token.paddingXXS}px !important;
      }
      /*
       * Validation text must not grow the Form.Item height — otherwise
       * align-items:end pushes sibling inputs (e.g. Port) downward.
       */
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
      .admin-cutoff-create__actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        min-width: 0;
        padding: ${token.paddingSM}px 0;
      }
      .admin-cutoff-create__actions.form-step-footer {
        margin: 0;
        padding: ${token.paddingSM}px 0;
        border: none;
        width: auto;
      }
      .admin-cutoff-grid-wrap {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        /* Fill remaining viewport under the create/edit form */
        height: calc(100vh - 420px);
        min-height: ${token.controlHeightLG * 5}px;
        max-height: calc(100vh - 300px);
      }
      /* Hide empty DataView search / view-mode / Filters toolbar card */
      .admin-cutoff-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .admin-cutoff-grid-wrap > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .admin-cutoff-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .admin-cutoff-grid-wrap .admin-cutoff-data-view {
        height: 100%;
        min-height: 0;
      }
      .admin-cutoff-grid-wrap .ag-theme-alpine,
      .admin-cutoff-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 0 !important;
      }
      .admin-cutoff-data-view .sm-data-view-toolbar,
      .admin-cutoff-data-view .data-view-toolbar {
        display: none !important;
      }

      .responsive-table-wrap {
        width: 100%;
        min-width: 0;
        margin: 0;
      }
      .responsive-table-wrap .ant-table-thead > tr > th,
      .responsive-table-wrap .ant-table-tbody > tr > td {
        padding: ${token.paddingSM}px ${token.paddingMD}px !important;
        vertical-align: middle;
      }
      .responsive-table-wrap .ant-table-tbody > tr > td:first-child {
        padding-inline-start: ${token.paddingMD}px !important;
      }

      .admin-password-alert {
        margin-top: ${token.marginMD}px;
      }
      .admin-route-card__actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginSM}px;
        margin: 0 0 ${token.marginMD}px;
        padding: 0;
      }
      .admin-drawer-footer-bar.ant-drawer-footer {
        padding: 0 !important;
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
        min-width: ${token.controlHeightLG * 2}px;
      }
      .admin-toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .admin-status-tag.ant-tag,
      .admin-code-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .admin-inner-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-inner-card > .ant-card-head {
        padding: ${token.paddingSM}px ${token.paddingSM}px;
        min-height: 0;
      }
      .admin-inner-card > .ant-card-body {
        padding: ${token.paddingSM}px !important;
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
        max-height: 240px;
        overflow-y: auto;
        min-width: 0;
        padding: ${token.paddingXS}px 0;
      }
      .admin-banner-thumb {
        object-fit: cover;
        border-radius: ${token.borderRadiusSM}px;
      }
      .admin-route-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .admin-route-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-route-card > .ant-card-body {
        padding: ${token.paddingMD}px !important;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .admin-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .admin-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .admin-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .admin-route-port__label {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: ${token.marginXS}px;
      }
      .admin-route-port__code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.15 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .admin-route-port__code--origin {
        color: ${token.colorPrimary} !important;
      }
      .admin-route-port__code--delivery {
        color: ${token.colorSuccess} !important;
      }
      .admin-route-connector {
        flex: 0 0 auto;
        min-width: 96px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXS}px;
        text-align: center;
        padding: ${token.paddingSM}px 0;
      }
      .admin-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .admin-route-connector__line {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 120px;
        color: ${token.colorPrimary};
      }
      .admin-route-connector__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .admin-route-connector__dot--origin {
        background: ${token.colorPrimary};
      }
      .admin-route-connector__dot--delivery {
        background: ${token.colorSuccess};
      }
      .admin-route-connector__track {
        flex: 1;
        height: 2px;
        margin: 0 ${token.marginXXS}px;
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${
      token.colorSuccess
    } 100%);
      }
      .admin-route-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
        margin-top: ${token.marginXS}px;
      }
      .admin-route-meta__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .admin-route-meta__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .admin-drawer-body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
      }
      .admin-drawer-actions {
        display: inline-flex;
        justify-content: flex-end;
        width: 100%;
      }
      .admin-stack-full {
        width: 100%;
      }
      .admin-mono-textarea.ant-input,
      .admin-mono-textarea textarea {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }

      @media (max-width: 991px) {
        .admin-workspace {
          grid-template-columns: 1fr;
          gap: ${token.marginLG}px;
        }
        .admin-workspace__nav {
          position: static;
          padding: ${token.paddingMD}px;
        }
        .admin-workspace__content {
          padding: ${token.paddingLG}px;
        }
        .admin-workspace.admin-workspace--content-only .admin-workspace__content {
          margin: ${token.marginSM}px ${token.marginMD}px ${token.marginMD}px;
          padding: ${token.paddingLG}px ${token.paddingLG}px ${
      token.paddingXL
    }px;
          max-width: calc(100% - ${token.marginMD * 2}px);
          border: none;
        }
        .admin-workspace__nav-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: ${token.marginXS}px;
        }
        .admin-mapping-panels,
        .admin-menu-create__grid {
          grid-template-columns: 1fr;
        }
        .admin-mapping-board {
          grid-template-columns: 1fr;
        }
        .admin-mapping-transfer {
          flex-direction: row;
          justify-content: center;
        }
        .admin-cutoff-create__row--5,
        .admin-cutoff-create__row--2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .admin-cutoff-create__actions {
          grid-column: 1 / -1;
          justify-content: flex-end;
        }
      }

      @media (max-width: 767px) {
        .admin-layout {
          gap: ${token.marginMD}px;
          min-height: 0;
        }
        .admin-workspace__nav,
        .admin-workspace__content {
          padding: ${token.paddingMD}px;
        }
        .admin-workspace.admin-workspace--content-only .admin-workspace__content {
          margin: ${token.marginXS}px ${token.marginSM}px ${token.marginMD}px;
          padding: ${token.paddingMD}px ${token.paddingMD}px ${
      token.paddingLG
    }px;
          max-width: calc(100% - ${token.marginSM * 2}px);
          border: none;
        }
        .admin-panel > .ant-card-body {
          padding: 0 !important;
        }
        .admin-panel__header {
          margin-bottom: ${token.marginMD}px;
          gap: ${token.marginSM}px;
        }
        .admin-panel-actions {
          width: 100%;
          gap: ${token.marginSM}px;
        }
        .admin-panel-actions .sm-app-button,
        .admin-panel-actions .ant-btn {
          width: 100%;
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
        .admin-config-toggle .ant-form-item-row {
          flex-wrap: wrap;
        }
        .admin-workspace__nav-list {
          grid-template-columns: 1fr;
        }
        .admin-menu-summary {
          gap: ${token.marginXS}px;
        }
        .admin-field-actions,
        .admin-cutoff-actions,
        .admin-priv-actions {
          gap: ${token.marginSM}px;
        }
        .admin-cutoff-create__row--5,
        .admin-cutoff-create__row--2 {
          grid-template-columns: 1fr;
        }
        .admin-cutoff-create__actions {
          grid-column: auto;
          width: 100%;
          justify-content: stretch;
        }
        .admin-cutoff-create__actions .sm-app-button,
        .admin-cutoff-create__actions .ant-btn {
          flex: 1 1 auto;
        }
        .admin-route-card > .ant-card-body {
          padding: ${token.paddingMD}px !important;
        }
        .admin-drawer-body {
          padding: ${token.paddingMD}px;
          gap: ${token.marginSM}px;
        }
        .admin-drawer-actions.form-step-footer {
          padding: ${token.paddingSM}px ${token.paddingMD}px;
        }
        .admin-route-strip {
          flex-direction: column;
        }
        .admin-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          gap: ${token.marginSM}px;
        }
        .admin-route-connector__line {
          max-width: 80px;
        }
        .admin-route-meta {
          grid-template-columns: 1fr;
          gap: ${token.marginSM}px;
        }
        .admin-mapping-customer__row {
          flex-direction: column;
          align-items: stretch;
        }
        .admin-mapping-customer__row .sm-app-button,
        .admin-mapping-customer__row .ant-btn {
          width: 100%;
        }
      }
    `}</style>
  );
}
