// Modified by Sekar Nagarajan (2026-09-07 12:17)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function ArrivalNoticeModuleStyles() {
  const { token } = theme.useToken();
  const infoTint8 = tokenMix(token.colorInfo, 8);

  return (
    <style>{`
      .arn-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .arn-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.arn-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.arn-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .arn-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .arn-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .arn-search-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .arn-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .arn-search-form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .arn-search-field {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginXS}px;
        flex: 0 1 260px;
        max-width: 280px;
        min-width: 280px;
        width: 100%;
      }
      .arn-search-field > .form-field-label {
        margin-bottom: 0;
      }
      .arn-search-field__control {
        position: relative;
        /* Reserve error-line height so sibling fields stay aligned */
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      .arn-search-form .arn-search-form-item.ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-row {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-label {
        display: none !important;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-control {
        flex: 1 1 auto !important;
        max-width: 100% !important;
        width: 100% !important;
        position: relative;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-control-input {
        min-height: ${token.controlHeightLG}px;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-explain {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + ${token.marginXXS}px);
        min-height: ${token.fontSize * token.lineHeight}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .arn-search-field .ant-picker {
        width: 100%;
        height: ${token.controlHeightLG}px;
      }
      .arn-search-field .ant-picker-input > input {
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }
      .arn-search-actions {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        flex: 0 0 auto;
        gap: ${token.marginXS}px;
      }
      .arn-search-actions__spacer {
        margin-bottom: 0;
        visibility: hidden;
        user-select: none;
      }
      .arn-search-actions .sm-app-button,
      .arn-search-actions .ant-btn {
        height: ${token.controlHeightLG}px;
        min-width: 120px;
      }
      .arn-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide empty DataView search / view-mode / Filters toolbar card */
      .arn-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .arn-grid-wrap > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .arn-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .arn-grid-wrap .arn-data-view {
        min-height: calc(100vh - 320px);
      }
      .arn-grid-wrap .ag-theme-alpine,
      .arn-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .arn-data-view .sm-data-view-toolbar,
      .arn-data-view .data-view-toolbar {
        display: none !important;
      }
      .arn-status-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }

      /* —— AN view drawer (parity with DO airy redesign) —— */
      .arn-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginMD}px;
      }
      .arn-drawer-title__icon {
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .arn-drawer-title__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .arn-drawer-title__eyebrow {
        display: block;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .arn-drawer-title__text {
        margin: 0 !important;
        line-height: 1.2 !important;
        color: ${token.colorText} !important;
        font-weight: ${token.fontWeightStrong} !important;
        font-size: ${token.fontSizeHeading4}px !important;
      }
      .arn-drawer-title__text .ant-typography-copy {
        color: ${token.colorTextSecondary};
        margin-inline-start: ${token.marginXS}px;
      }
      .arn-drawer-title__text .ant-typography-copy:hover {
        color: ${token.colorPrimary};
      }
      .arn-drawer-title__meta-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .arn-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }
      .arn-drawer-title__bl {
        color: ${token.colorInfo};
        font-weight: ${token.fontWeightStrong};
      }
      .arn-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingLG}px;
        overflow-y: auto;
        background: ${token.colorBgLayout};
      }
      .arn-drawer-footer {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .arn-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        align-items: center;
        justify-content: flex-end;
      }
      .arn-route-strip {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        width: 100%;
        padding: ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG + 2}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        border-left: 4px solid ${token.colorPrimary};
        border-right: 4px solid ${token.colorSuccess};
        box-shadow: ${token.boxShadowTertiary};
      }
      .arn-route-strip__eyebrow {
        display: block;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${token.colorTextTertiary};
        line-height: 1.2;
      }
      .arn-route-strip__body {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        column-gap: ${token.marginLG}px;
        width: 100%;
      }
      .arn-route-port {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .arn-route-port--discharge {
        align-items: flex-end;
        text-align: right;
      }
      .arn-route-port__label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextTertiary};
        text-transform: uppercase;
        letter-spacing: 0.06em;
        line-height: 1.2;
      }
      .arn-route-port__pin {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .arn-route-port__pin--vessel {
        color: ${token.colorPrimary};
      }
      .arn-route-port__pin--discharge {
        color: ${token.colorSuccess};
      }
      .arn-route-port__code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading3}px !important;
        line-height: 1.1 !important;
        font-weight: ${token.fontWeightStrong} !important;
        letter-spacing: 0.01em;
        word-break: break-word;
      }
      .arn-route-port__code--vessel {
        color: ${token.colorPrimary} !important;
      }
      .arn-route-port__code--discharge {
        color: ${token.colorSuccess} !important;
      }
      .arn-route-port__name {
        display: block;
        margin: 0;
        font-size: ${token.fontSize}px;
        line-height: 1.35;
        color: ${token.colorText};
      }
      .arn-route-connector {
        flex: 0 0 auto;
        width: 176px;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXS}px;
        text-align: center;
        padding: ${token.paddingXXS}px 0;
      }
      .arn-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.01em;
        padding: 2px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        background: ${token.colorFillTertiary};
        color: ${token.colorTextSecondary};
        white-space: nowrap;
        line-height: 1.5;
      }
      .arn-route-connector__line {
        display: flex;
        align-items: center;
        width: 100%;
        color: ${token.colorPrimary};
      }
      .arn-route-connector__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .arn-route-connector__dot--vessel {
        background: ${token.colorPrimary};
      }
      .arn-route-connector__dot--discharge {
        background: ${token.colorSuccess};
      }
      .arn-route-connector__track {
        flex: 1;
        height: 2px;
        min-width: ${token.marginSM}px;
      }
      .arn-route-connector__track--vessel {
        background: ${token.colorPrimary};
        margin-right: ${token.marginXXS}px;
      }
      .arn-route-connector__track--discharge {
        background: ${token.colorSuccess};
        margin-left: ${token.marginXXS}px;
      }
      .arn-route-connector__ship {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: ${token.colorPrimary};
        flex-shrink: 0;
        line-height: 0;
      }
      .arn-drawer-section {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .arn-drawer-section__head {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        color: ${token.colorPrimary};
      }
      .arn-drawer-section__title {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        font-size: ${token.fontSizeLG}px !important;
      }
      .arn-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .arn-meta-grid--free-time {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .arn-meta-item {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .arn-meta-item .form-field-label {
        margin-bottom: 0;
        color: ${token.colorTextSecondary};
      }
      .arn-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .arn-drawer-alert.ant-alert {
        border-radius: ${token.borderRadiusLG}px;
        border-color: ${tokenMix(token.colorInfo, 28)};
        background: ${infoTint8};
      }
      .arn-drawer-alert .ant-alert-message {
        color: ${token.colorText};
      }
      .arn-containers-table,
      .arn-charges-table {
        width: 100%;
      }

      @media (max-width: 767px) {
        .arn-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .arn-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .arn-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .arn-search-field {
          flex: 1 1 100%;
          max-width: none;
          min-width: 0;
        }
        .arn-search-actions {
          width: 100%;
        }
        .arn-search-actions .sm-app-button,
        .arn-search-actions .ant-btn {
          width: 100%;
        }
        .arn-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .arn-route-strip__body {
          grid-template-columns: 1fr;
          row-gap: ${token.marginMD}px;
        }
        .arn-route-port--discharge {
          align-items: flex-start;
          text-align: left;
        }
        .arn-route-connector {
          width: 100%;
          flex-direction: row;
          justify-content: center;
          gap: ${token.marginSM}px;
        }
        .arn-route-connector__line {
          max-width: 180px;
        }
        .arn-meta-grid,
        .arn-meta-grid--free-time {
          grid-template-columns: 1fr;
        }
        .arn-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .arn-drawer-actions {
          width: 100%;
          justify-content: stretch;
        }
        .arn-drawer-actions .sm-app-button,
        .arn-drawer-actions .ant-btn {
          flex: 1;
        }
      }
    `}</style>
  );
}
