// Modified by Sekar Nagarajan (2026-08-26 12:38)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Shipping Instruction module layout classes (agenct.md). */
export function SiModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .si-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
      }
      .si-loading-center--fill {
        min-height: calc(100vh - 220px);
      }

      .si-list-card {
        border: none;
      }
      .si-list-card > .ant-card-body {
        padding: 0 !important;
      }
      .si-list-grid {
        width: 100%;
        height: 500px;
        min-height: 320px;
      }

      .si-field-full {
        width: 100%;
      }

      .si-party-block {
        padding: ${token.paddingSM}px;
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .si-container-block {
        margin-bottom: ${token.marginLG}px;
      }
      .si-container-block:last-child {
        margin-bottom: 0;
      }
      .si-container-block__header {
        margin-bottom: ${token.marginSM}px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }

      .si-cargo-card-toolbar {
        margin-bottom: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        width: 100%;
      }
      .si-cargo-card.ant-card .ant-card-head {
        background: ${token.colorFillAlter};
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }

      .si-charges-freight {
        font-size: ${token.fontSizeHeading3}px;
        color: ${token.colorPrimary};
        margin-top: ${token.marginSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .si-charges-note {
        margin-top: ${token.marginLG}px;
        padding: ${token.paddingMD}px;
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
      }

      .si-preview-title {
        text-align: center;
        margin-bottom: ${token.marginLG}px !important;
      }
      .si-section-title {
        margin: 0 !important;
      }

      .si-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .si-drawer-title__text {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .si-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .si-drawer-title__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .si-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .si-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }

      .si-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .si-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .si-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .si-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .si-route-port__label {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .si-route-port__code {
        margin: 0 !important;
        word-break: break-word;
      }
      .si-route-connector {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 88px;
        padding-top: ${token.paddingLG}px;
      }
      .si-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }
      .si-route-connector__line {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .si-route-connector__track {
        flex: 1;
        height: ${token.lineWidth}px;
        background: ${token.colorBorder};
      }

      .si-summary-chips {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .si-summary-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .si-summary-chip__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .si-summary-chip__value {
        display: block;
        font-weight: ${token.fontWeightStrong};
      }

      .si-panel > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }

      .si-confirmation__ref {
        margin-top: ${token.marginSM}px;
        font-size: ${token.fontSizeLG}px;
      }
      .si-confirmation__ref-value {
        font-size: ${token.fontSizeHeading5}px;
        color: ${token.colorPrimary};
      }

      @media (max-width: 767px) {
        .si-list-grid {
          height: 420px;
        }
        .si-route-strip {
          flex-direction: column;
        }
        .si-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          padding-top: 0;
        }
        .si-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .si-drawer-actions {
          width: 100%;
        }
        .si-drawer-actions .sm-app-button {
          flex: 1;
        }
      }
    `}</style>
  );
}
