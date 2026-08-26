// Modified by Sekar Nagarajan (2026-08-26 14:46)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function DoModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .do-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .do-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.do-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.do-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .do-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .do-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .do-search-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .do-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .do-search-form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .do-search-field {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginXS}px;
        flex: 0 1 260px;
        max-width: 280px;
        min-width: 280px;
        width: 100%;
      }
      .do-search-field > .form-field-label {
        margin-bottom: 0;
      }
      .do-search-field__control {
        position: relative;
        /* Reserve error-line height so sibling fields stay aligned */
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      /* FormDatePicker has no visible label — kill AntD horizontal label column */
      .do-search-form .do-search-form-item.ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .do-search-form .do-search-form-item .ant-form-item-row {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .do-search-form .do-search-form-item .ant-form-item-label {
        display: none !important;
      }
      .do-search-form .do-search-form-item .ant-form-item-control {
        flex: 1 1 auto !important;
        max-width: 100% !important;
        width: 100% !important;
        position: relative;
      }
      .do-search-form .do-search-form-item .ant-form-item-control-input {
        min-height: ${token.controlHeightLG}px;
      }
      .do-search-form .do-search-form-item .ant-form-item-explain {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + ${token.marginXXS}px);
        min-height: ${token.fontSize * token.lineHeight}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .do-search-field .ant-picker {
        width: 100%;
        height: ${token.controlHeightLG}px;
      }
      .do-search-field .ant-picker-input > input {
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }
      .do-search-actions {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        flex: 0 0 auto;
        gap: ${token.marginXS}px;
      }
      .do-search-actions__spacer {
        margin-bottom: 0;
        visibility: hidden;
        user-select: none;
      }
      .do-search-actions .sm-app-button,
      .do-search-actions .ant-btn {
        height: ${token.controlHeightLG}px;
        min-width: 120px;
      }
      .do-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide empty DataView search / view-mode / Filters toolbar card */
      .do-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .do-grid-wrap > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .do-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .do-grid-wrap .do-data-view {
        min-height: calc(100vh - 320px);
      }
      .do-grid-wrap .ag-theme-alpine,
      .do-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .do-status-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .do-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .do-drawer-title__text {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .do-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .do-drawer-title__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .do-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .do-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        padding: ${token.paddingLG}px;
        overflow-y: auto;
        max-height: calc(100vh - 105px);
      }
      .do-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .do-meta-item {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .do-meta-item .form-field-label {
        margin-bottom: 0;
      }
      .do-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .do-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .do-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .do-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .do-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .do-route-port__label {
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
      .do-route-port__code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.15 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .do-route-port__code--origin {
        color: ${token.colorPrimary} !important;
      }
      .do-route-port__code--delivery {
        color: ${token.colorSuccess} !important;
      }
      .do-route-port__name {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .do-route-connector {
        flex: 0 0 auto;
        min-width: 96px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        text-align: center;
        padding: ${token.paddingXS}px 0;
      }
      .do-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .do-route-connector__line {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 120px;
        color: ${token.colorPrimary};
      }
      .do-route-connector__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .do-route-connector__dot--origin {
        background: ${token.colorPrimary};
      }
      .do-route-connector__dot--delivery {
        background: ${token.colorSuccess};
      }
      .do-route-connector__track {
        flex: 1;
        height: 2px;
        margin: 0 ${token.marginXXS}px;
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${
      token.colorSuccess
    } 100%);
      }

      @media (max-width: 767px) {
        .do-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .do-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .do-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .do-search-field {
          flex: 1 1 100%;
          max-width: none;
          min-width: 0;
        }
        .do-search-actions {
          width: 100%;
        }
        .do-search-actions .sm-app-button,
        .do-search-actions .ant-btn {
          width: 100%;
        }
        .do-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .do-route-strip {
          flex-direction: column;
        }
        .do-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          gap: ${token.marginSM}px;
        }
        .do-route-connector__line {
          max-width: 80px;
        }
        .do-meta-grid {
          grid-template-columns: 1fr;
        }
        .do-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .do-drawer-actions {
          width: 100%;
        }
        .do-drawer-actions .sm-app-button {
          flex: 1;
        }
      }
    `}</style>
  );
}
