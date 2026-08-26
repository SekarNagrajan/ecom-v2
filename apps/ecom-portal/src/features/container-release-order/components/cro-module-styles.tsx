// Modified by Sekar Nagarajan (2026-08-25 12:10)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function CroModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
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
      .cro-search-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .cro-search-field .ant-picker {
        width: 100%;
      }
      .cro-search-actions-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .cro-search-actions-field__spacer {
        min-height: ${token.fontSizeSM * token.lineHeight + token.marginXXS}px;
        visibility: hidden;
      }
      .cro-search-actions {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-height: ${token.controlHeightLG}px;
        width: 100%;
      }
      .cro-search-actions .sm-app-button,
      .cro-search-actions .ant-btn {
        min-height: ${token.controlHeightLG}px;
      }
      .cro-search-actions .ant-btn-primary {
        flex: 1;
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
      .cro-grid-wrap .ag-theme-alpine,
      .cro-grid-wrap .ag-root-wrapper {
        height: 100%;
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
      .cro-drawer-body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        padding: ${token.paddingMD}px;
      }
      .cro-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .cro-meta-item__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
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
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .cro-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${
      token.colorFillAlter
    } 100%);
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
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${
      token.colorSuccess
    } 100%);
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
        .cro-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .cro-search-actions {
          flex-direction: column;
        }
        .cro-search-actions .sm-app-button,
        .cro-search-actions .ant-btn {
          width: 100%;
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
        .cro-drawer-body {
          padding: ${token.paddingSM}px;
        }
      }
    `}</style>
  );
}
