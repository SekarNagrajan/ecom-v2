// Modified by Sekar Nagarajan (2026-08-26 16:20)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function UserModulesModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .um-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .um-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.um-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.um-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px ${token.paddingLG}px !important;
        min-height: calc(100vh - 160px);
        min-width: 0;
      }

      .um-page-layout {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
        min-width: 0;
      }
      .um-page-layout > .module-screen-header {
        margin-bottom: 0;
        align-items: flex-start;
        width: 100%;
      }
      .um-page-layout > .module-screen-header .module-screen-header__extra {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }

      /* Icon + title + description header (page & drawer) */
      .um-panel-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        width: 100%;
        flex-wrap: wrap;
      }
      .um-panel-header__main {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
        flex: 1;
      }
      .um-panel-header__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .um-panel-header--compact .um-panel-header__icon {
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
      }
      .um-panel-header__copy {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .um-panel-header__title {
        margin: 0 !important;
        line-height: 1.25 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .um-panel-header__description {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .um-panel-header__extra {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-shrink: 0;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }
      .um-panel-header--compact {
        gap: ${token.marginSM}px;
        padding-right: ${token.paddingLG}px;
      }

      .um-kpi-row {
        width: 100%;
      }
      .um-kpi-row > .ant-col {
        min-width: 0;
      }
      .um-kpi-card.ant-card {
        height: 100%;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .um-kpi-card > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .um-kpi-card .ant-statistic-content {
        color: ${token.colorText};
      }
      .um-kpi-card--primary .ant-statistic-content {
        color: ${token.colorPrimary};
      }
      .um-kpi-card--success .ant-statistic-content {
        color: ${token.colorSuccess};
      }

      .um-summary-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .um-summary-chip {
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 120px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .um-summary-chip__label {
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        color: ${token.colorTextSecondary};
      }
      .um-summary-chip__value {
        font-size: ${token.fontSizeHeading4}px;
        line-height: 1.2;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .um-summary-chip--primary .um-summary-chip__value {
        color: ${token.colorPrimary};
      }
      .um-summary-chip--success .um-summary-chip__value {
        color: ${token.colorSuccess};
      }

      .um-grid-wrap {
        width: 100%;
        min-width: 0;
        min-height: 0;
        overflow-x: auto;
      }
      .um-grid-wrap .um-data-view {
        min-height: 320px;
        width: 100%;
      }
      /* Hide empty DataView toolbar Card (search / view-mode / Filters) */
      .um-quotes-grid > .ant-flex > .ant-card:first-child,
      .um-payments-grid > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .um-quotes-grid > .ant-flex,
      .um-payments-grid > .ant-flex {
        gap: 0 !important;
      }
      .um-data-view .sm-data-view-toolbar,
      .um-data-view .data-view-toolbar {
        display: none !important;
      }
      .um-quote-desc.ant-descriptions {
        margin: 0;
      }
      .um-quote-desc.ant-descriptions .ant-descriptions-item-label {
        font-weight: ${token.fontWeightStrong};
        width: 180px;
        background: ${token.colorFillAlter};
      }
      .um-quote-desc.ant-descriptions .ant-descriptions-item-content {
        background: ${token.colorBgContainer};
      }

      .um-verified-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .um-drawer-body .um-verified-tag {
        align-self: flex-start;
      }

      .um-drawer-header-bar.ant-drawer-header {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .um-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        padding: ${token.paddingLG}px ${token.paddingXL}px !important;
        overflow-y: auto;
        min-width: 0;
      }
      .um-drawer-footer-bar.ant-drawer-footer {
        padding: 0 !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .um-drawer-footer.form-step-footer {
        width: 100%;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingXL}px !important;
        border-top: none;
        gap: ${token.marginSM}px;
        background: transparent;
      }
      .um-drawer-footer .sm-app-button.ant-btn,
      .um-drawer-footer .ant-btn {
        height: ${token.controlHeight}px;
        margin: 0;
        padding-inline: ${token.paddingMD}px;
      }

      .um-form-section {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
        min-width: 0;
      }
      .um-form-section > .ant-row {
        width: 100%;
      }
      .um-form-section > .ant-row > .ant-col {
        min-width: 0;
      }
      .um-form-section .ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .um-form-section .ant-form-item-row {
        width: 100%;
      }
      .um-form-section .ant-form-item-control,
      .um-form-section .ant-form-item-control-input,
      .um-form-section .ant-form-item-control-input-content {
        width: 100%;
        min-width: 0;
      }
      .um-form-section .ant-form-item-label {
        padding-bottom: ${token.paddingXXS}px !important;
      }
      .um-form-section .ant-form-item-label > label {
        height: auto !important;
        align-items: flex-start;
      }
      .um-form-section .form-field-label {
        display: inline-block;
      }
      .um-form-section .ant-input-affix-wrapper,
      .um-form-section .ant-input,
      .um-form-section .ant-select,
      .um-form-section .ant-picker,
      .um-form-section .ant-input-textarea textarea {
        width: 100%;
      }

      .um-page-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginXS}px;
        width: 100%;
        flex-wrap: wrap;
        padding-top: ${token.paddingXS}px;
        margin: 0;
      }

      .um-password-strength {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .um-password-strength__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
      }
      .um-password-strength__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin: 0;
      }
      .um-password-strength__level {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        margin: 0;
      }
      .um-password-strength__level--weak {
        color: ${token.colorError};
      }
      .um-password-strength__level--medium {
        color: ${token.colorWarning};
      }
      .um-password-strength__level--strong {
        color: ${token.colorSuccess};
      }
      .um-password-strength__checks .ant-list-item {
        padding: ${token.paddingXXS}px 0 !important;
        border: none !important;
      }
      .um-password-strength__check {
        font-size: ${token.fontSizeSM}px;
      }

      .um-alerts-layout {
        width: 100%;
      }
      .um-alerts-layout > .ant-col {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .um-alerts-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        margin: 0;
        width: 100%;
      }
      .um-alerts-card > .ant-card-head {
        min-height: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .um-alerts-card > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }
      .um-alerts-card .ant-list-item {
        padding-inline: 0;
        align-items: flex-start;
      }
      .um-alerts-card .ant-list-item-meta {
        align-items: flex-start;
      }
      .um-alerts-card .ant-list-item-meta-title {
        margin-bottom: ${token.marginXXS}px !important;
      }
      .um-alerts-card .ant-list-item-action,
      .um-alerts-card .ant-list-item > .ant-list-item-extra {
        margin-inline-start: ${token.marginMD}px;
        align-self: center;
      }
      .um-channel-list {
        width: 100%;
      }
      .um-channel-divider.ant-divider {
        margin: ${token.marginSM}px 0;
      }
      .um-channel-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .um-channel-row > .ant-space {
        align-items: flex-start;
        min-width: 0;
        flex: 1;
      }
      .um-channel-row .ant-switch {
        flex-shrink: 0;
        margin-top: ${token.marginXXS}px;
      }
      .um-channel-row__meta {
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: ${token.marginXXS}px;
      }
      .um-channel-row__hint {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin: 0;
      }
      .um-alerts-log.custom-scroll {
        max-height: 420px;
        overflow-y: auto;
        padding-right: ${token.paddingXXS}px;
      }
      .um-alerts-log__title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
      }
      .um-alerts-log__message {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin: 0;
      }
      .um-alerts-log__meta {
        display: block;
        font-size: ${token.fontSizeSM}px;
        margin-top: ${token.marginXXS}px;
      }

      .um-range-picker.ant-picker {
        width: min(280px, 100%);
      }

      .um-amount-primary {
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }
      .um-amount-success {
        color: ${token.colorSuccess};
        font-weight: ${token.fontWeightStrong};
      }

      .um-header-banner {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
        margin: 0;
      }
      .um-header-banner--success {
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }

      /* mobile < 768 */
      @media (max-width: 767px) {
        .um-summary-strip {
          gap: ${token.marginXS}px;
        }
        .um-summary-chip {
          flex: 1 1 calc(50% - ${token.marginXS}px);
          min-width: 0;
        }
        .feature-page-card.um-page-card > .ant-card-body {
          padding: ${token.paddingSM}px ${token.paddingMD}px ${token.paddingMD}px !important;
        }
        .um-page-layout {
          gap: ${token.marginMD}px;
        }
        .um-page-layout > .module-screen-header {
          flex-direction: column;
          align-items: flex-start;
          gap: ${token.marginSM}px;
        }
        .um-panel-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .um-panel-header__extra {
          width: 100%;
        }
        .um-panel-header__extra .sm-app-button,
        .um-panel-header__extra .ant-btn {
          width: 100%;
        }
        .um-panel-header--compact {
          padding-right: 0;
        }
        .um-page-layout > .module-screen-header .module-screen-header__extra {
          width: 100%;
          justify-content: stretch;
        }
        .um-page-layout > .module-screen-header .module-screen-header__extra .sm-app-button,
        .um-page-layout > .module-screen-header .module-screen-header__extra .ant-btn {
          width: 100%;
        }
        .um-kpi-card > .ant-card-body {
          padding: ${token.paddingSM}px ${token.paddingMD}px !important;
        }
        .um-drawer-header-bar.ant-drawer-header {
          padding: ${token.paddingMD}px !important;
        }
        .um-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px ${token.paddingLG}px !important;
          gap: ${token.marginMD}px;
        }
        .um-drawer-footer.form-step-footer {
          padding: ${token.paddingSM}px ${token.paddingLG}px !important;
        }
        .um-drawer-footer .sm-app-button,
        .um-drawer-footer .ant-btn {
          flex: 1;
        }
        .um-page-actions {
          padding-top: 0;
        }
        .um-page-actions .sm-app-button,
        .um-page-actions .ant-btn {
          width: 100%;
        }
        .um-form-section {
          gap: ${token.marginSM}px;
        }
        .um-channel-row {
          align-items: flex-start;
          gap: ${token.marginSM}px;
        }
        .um-alerts-layout > .ant-col {
          gap: ${token.marginSM}px;
        }
        .um-alerts-card > .ant-card-body {
          padding: ${token.paddingSM}px !important;
        }
        .um-alerts-log.custom-scroll {
          max-height: 280px;
        }
        .um-range-picker.ant-picker {
          width: 100%;
        }
        .um-password-strength {
          padding: ${token.paddingSM}px;
        }
        .um-loading-center {
          min-height: 180px;
          padding: ${token.paddingMD}px;
        }
      }

      /* tablet 768–991 */
      @media (min-width: 768px) and (max-width: 991px) {
        .feature-page-card.um-page-card > .ant-card-body {
          padding: ${token.paddingMD}px !important;
        }
        .um-page-layout {
          gap: ${token.marginMD}px;
        }
        .um-page-layout > .module-screen-header {
          align-items: center;
        }
        .um-drawer-header-bar.ant-drawer-header {
          padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        }
        .um-drawer-body.custom-scroll {
          padding: ${token.paddingLG}px ${token.paddingXL}px !important;
        }
        .um-drawer-footer.form-step-footer {
          padding: ${token.paddingSM}px ${token.paddingXL}px !important;
        }
        .um-kpi-card > .ant-card-body {
          padding: ${token.paddingMD}px !important;
        }
        .um-alerts-log.custom-scroll {
          max-height: 360px;
        }
        .um-range-picker.ant-picker {
          width: min(240px, 100%);
        }
      }

      /* web 992–1599 */
      @media (min-width: 992px) {
        .feature-page-card.um-page-card > .ant-card-body {
          padding: ${token.paddingLG}px ${token.paddingXL}px ${token.paddingLG}px !important;
        }
        .um-page-layout {
          gap: ${token.marginLG}px;
        }
        .um-drawer-header-bar.ant-drawer-header {
          padding: ${token.paddingLG}px ${token.paddingXL}px !important;
        }
        .um-drawer-body.custom-scroll {
          padding: ${token.paddingLG}px ${token.paddingXL}px !important;
          gap: ${token.marginLG}px;
        }
        .um-drawer-footer.form-step-footer {
          padding: ${token.paddingSM}px ${token.paddingXL}px !important;
        }
        .um-form-section {
          gap: ${token.marginLG}px;
        }
        .um-kpi-card > .ant-card-body {
          padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        }
      }

      /* monitor ≥ 1600 */
      @media (min-width: 1600px) {
        .feature-page-card.um-page-card > .ant-card-body {
          padding: ${token.paddingXL}px !important;
        }
        .um-page-layout {
          gap: ${token.marginXL}px;
        }
        .um-drawer-header-bar.ant-drawer-header {
          padding: ${token.paddingLG}px ${token.paddingXL}px !important;
        }
        .um-drawer-body.custom-scroll {
          padding: ${token.paddingXL}px !important;
        }
        .um-drawer-footer.form-step-footer {
          padding: ${token.paddingMD}px ${token.paddingXL}px !important;
        }
        .um-alerts-log.custom-scroll {
          max-height: 520px;
        }
      }
    `}</style>
  );
}
