// Modified by Sekar Nagarajan (2026-08-26 14:57)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function CroModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .cro-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .cro-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.cro-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.cro-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .cro-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .cro-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .cro-search-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .cro-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .cro-search-form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .cro-search-field {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginXS}px;
        flex: 0 1 260px;
        max-width: 280px;
        min-width: 280px;
        width: 100%;
      }
      .cro-search-field > .form-field-label {
        margin-bottom: 0;
      }
      .cro-search-field__control {
        position: relative;
        /* Reserve error-line height so sibling fields stay aligned */
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      .cro-search-form .cro-search-form-item.ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-row {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-label {
        display: none !important;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-control {
        flex: 1 1 auto !important;
        max-width: 100% !important;
        width: 100% !important;
        position: relative;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-control-input {
        min-height: ${token.controlHeightLG}px;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-explain {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + ${token.marginXXS}px);
        min-height: ${token.fontSize * token.lineHeight}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .cro-search-field .ant-picker {
        width: 100%;
        height: ${token.controlHeightLG}px;
      }
      .cro-search-field .ant-picker-input > input {
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }
      .cro-search-actions {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        flex: 0 0 auto;
        gap: ${token.marginXS}px;
      }
      .cro-search-actions__spacer {
        margin-bottom: 0;
        visibility: hidden;
        user-select: none;
      }
      .cro-search-actions .sm-app-button,
      .cro-search-actions .ant-btn {
        height: ${token.controlHeightLG}px;
        min-width: 120px;
      }
      .cro-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide empty DataView search / view-mode / Filters toolbar card */
      .cro-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .cro-grid-wrap > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .cro-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .cro-grid-wrap .cro-data-view {
        min-height: calc(100vh - 320px);
      }
      .cro-grid-wrap .ag-theme-alpine,
      .cro-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .cro-data-view .sm-data-view-toolbar,
      .cro-data-view .data-view-toolbar {
        display: none !important;
      }
      .cro-status-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .cro-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .cro-drawer-title__text {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .cro-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .cro-drawer-title__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .cro-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .cro-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        padding: ${token.paddingLG}px;
        overflow-y: auto;
        max-height: calc(100vh - 105px);
      }
      .cro-eligibility-reasons {
        margin: 0;
        padding-left: ${token.paddingLG}px;
      }
      .cro-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .cro-meta-item {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .cro-meta-item .form-field-label {
        margin-bottom: 0;
      }
      .cro-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .cro-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .cro-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .cro-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .cro-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .cro-route-port__label {
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
      .cro-route-port__code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.15 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .cro-route-port__code--origin {
        color: ${token.colorPrimary} !important;
      }
      .cro-route-port__code--delivery {
        color: ${token.colorSuccess} !important;
      }
      .cro-route-port__name {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .cro-route-connector {
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
      .cro-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .cro-route-connector__line {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 120px;
        color: ${token.colorPrimary};
      }
      .cro-route-connector__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cro-route-connector__dot--origin {
        background: ${token.colorPrimary};
      }
      .cro-route-connector__dot--delivery {
        background: ${token.colorSuccess};
      }
      .cro-route-connector__track {
        flex: 1;
        height: 2px;
        margin: 0 ${token.marginXXS}px;
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorSuccess} 100%);
      }
      .cro-containers-table {
        width: 100%;
      }

      @media (max-width: 767px) {
        .cro-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .cro-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .cro-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .cro-search-field {
          flex: 1 1 100%;
          max-width: none;
          min-width: 0;
        }
        .cro-search-actions {
          width: 100%;
        }
        .cro-search-actions .sm-app-button,
        .cro-search-actions .ant-btn {
          width: 100%;
        }
        .cro-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .cro-route-strip {
          flex-direction: column;
        }
        .cro-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          gap: ${token.marginSM}px;
        }
        .cro-route-connector__line {
          max-width: 80px;
        }
        .cro-meta-grid {
          grid-template-columns: 1fr;
        }
        .cro-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .cro-drawer-actions {
          width: 100%;
        }
        .cro-drawer-actions .sm-app-button {
          flex: 1;
        }
      }
    `}</style>
  );
}
