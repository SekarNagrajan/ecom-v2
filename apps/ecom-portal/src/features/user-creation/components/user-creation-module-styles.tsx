// Modified by Sekar Nagarajan (2026-08-26 15:55)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function UserCreationModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const primaryTint12 = tokenMix(token.colorPrimary, 12);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const successTint12 = tokenMix(token.colorSuccess, 12);

  return (
    <style>{`
      .usc-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .usc-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.usc-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.usc-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .usc-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        gap: ${token.marginMD}px;
      }
      .usc-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .usc-limit-card.ant-card {
        margin: 0 ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .usc-limit-card > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .usc-limit-card__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .usc-limit-card__count {
        margin: 0;
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.lineHeightHeading3};
      }
      .usc-limit-card__status {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        min-height: ${token.controlHeightLG}px;
      }
      .usc-alert {
        margin: 0 ${token.paddingLG}px;
      }
      .usc-search-panel {
        margin: 0 ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .usc-search-panel__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .usc-search-panel .ant-input-affix-wrapper,
      .usc-search-panel .ant-input {
        width: 100%;
      }
      .usc-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide empty DataView search / view-mode / Filters toolbar card */
      .usc-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .usc-grid-wrap > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .usc-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .usc-grid-wrap .usc-data-view {
        min-height: calc(100vh - 420px);
      }
      .usc-grid-wrap .ag-theme-alpine,
      .usc-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .usc-data-view .sm-data-view-toolbar,
      .usc-data-view .data-view-toolbar {
        display: none !important;
      }
      .usc-status-tag.ant-tag,
      .usc-module-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .usc-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .usc-drawer-title__text {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .usc-drawer-title__meta {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .usc-drawer-title__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .usc-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        overflow-y: auto;
      }
      /* Compact pinned drawer footer (agenct Cancel + Save) */
      .usc-drawer-footer-bar.ant-drawer-footer {
        padding: 0 !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .usc-drawer-footer.form-step-footer {
        width: 100%;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-top: none;
        gap: ${token.marginXS}px;
        background: transparent;
      }
      .usc-drawer-footer .sm-app-button.ant-btn,
      .usc-drawer-footer .ant-btn {
        height: ${token.controlHeight}px;
        margin: 0;
        padding-inline: ${token.paddingMD}px;
      }
      .usc-flow-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .usc-flow-step {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .usc-flow-step--credentials {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .usc-flow-step--profile {
        border-left: 4px solid ${token.colorInfo};
        background: linear-gradient(180deg, ${token.colorInfoBg} 0%, ${token.colorFillAlter} 100%);
      }
      .usc-flow-step--access {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .usc-flow-step__label {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: ${token.marginXXS}px;
      }
      .usc-flow-step__title {
        margin: 0 !important;
        font-size: ${token.fontSize}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        color: ${token.colorText} !important;
      }
      .usc-flow-connector {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${token.colorPrimary};
        padding: 0 ${token.marginXXS}px;
      }
      .usc-form-section {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .usc-form-section--credentials {
       
      }
      .usc-form-section--profile {
      
      }
      .usc-form-section--access {
     
      }
      .usc-form-section__header {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .usc-form-section__title {
        margin: 0 !important;
        font-size: ${token.fontSizeLG}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        line-height: 1.3 !important;
      }
      .usc-form-section__hint {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .usc-form-section .ant-form-item {
        margin-bottom: 0;
      }
      .usc-form-section .ant-form-item-label {
        padding-bottom: ${token.paddingXXS}px !important;
      }
      .usc-form-section .ant-form-item-label > label {
        height: auto !important;
      }
      .usc-form-section .form-field-label {
        display: inline-block;
      }
      .usc-modules-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .usc-module-card {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: auto auto;
        gap: ${token.marginXXS}px ${token.marginXS}px;
        align-items: start;
        width: 100%;
        text-align: left;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        color: ${token.colorText};
        cursor: pointer;
        transition:
          border-color 0.2s ease,
          background-color 0.2s ease,
          box-shadow 0.2s ease;
      }
      .usc-module-card:hover {
        border-color: ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .usc-module-card--selected {
        border-color: ${token.colorSuccess};
        background: ${successTint8};
        box-shadow: inset 0 0 0 1px ${token.colorSuccessBorder};
      }
      .usc-module-card--selected:hover {
        background: ${successTint12};
      }
      .usc-module-card__code {
        grid-column: 1;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorPrimary};
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .usc-module-card--selected .usc-module-card__code {
        color: ${token.colorSuccess};
      }
      .usc-module-card__label {
        grid-column: 1;
        font-size: ${token.fontSize}px;
        color: ${token.colorText};
        line-height: ${token.lineHeight};
      }
      .usc-module-card__check {
        grid-column: 2;
        grid-row: 1 / span 2;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: ${token.controlHeightSM}px;
        min-height: ${token.controlHeightSM}px;
        color: ${token.colorSuccess};
      }
      .usc-module-card:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
        background: ${primaryTint12};
      }

      @media (max-width: 767px) {
        .usc-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .usc-limit-card.ant-card,
        .usc-alert,
        .usc-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .usc-limit-card__status {
          justify-content: flex-start;
        }
        .usc-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .usc-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .usc-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .usc-flow-strip {
          flex-direction: column;
        }
        .usc-flow-connector {
          transform: rotate(90deg);
          padding: ${token.marginXXS}px 0;
        }
        .usc-modules-grid {
          grid-template-columns: 1fr;
        }
        .usc-drawer-footer.form-step-footer {
          padding: ${token.paddingXS}px ${token.paddingMD}px;
        }
        .usc-drawer-footer .sm-app-button,
        .usc-drawer-footer .ant-btn {
          flex: 1;
        }
        .module-screen-header__extra .sm-app-button,
        .module-screen-header__extra .ant-btn {
          width: 100%;
        }
      }
    `}</style>
  );
}
