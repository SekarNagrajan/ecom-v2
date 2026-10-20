// Modified by Sekar Nagarajan (2026-09-16 17:38)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for Agency Approvals — VGM/ARN page shell parity. */
export function VendorApprovalsModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);

  return (
    <style>{`
      .feature-page-card.va-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.va-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
        min-width: 0;
      }

      .va-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 100%;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }

      .va-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }

      /* Summary band — same role as VGM/ARN search panel chrome */
      .va-summary-panel {
        flex-shrink: 0;
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .va-summary-strip {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        min-width: 0;
      }
      .va-summary-chip {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .va-summary-chip__label {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }
      .va-summary-chip__value {
        font-size: ${token.fontSizeHeading4}px;
        line-height: 1.1;
        font-weight: ${token.fontWeightStrong};
        font-variant-numeric: tabular-nums;
        color: ${token.colorText};
      }
      .va-summary-chip--warning {
        background: ${token.colorWarningBg};
        border-color: ${token.colorWarningBorder};
      }
      .va-summary-chip--warning .va-summary-chip__value {
        color: ${token.colorWarning};
      }
      .va-summary-chip--success {
        background: ${tokenMix(token.colorSuccess, 8)};
        border-color: ${tokenMix(token.colorSuccess, 10)};
      }
      .va-summary-chip--success .va-summary-chip__value {
        color: ${token.colorSuccess};
      }
      .va-summary-chip--error {
        background: ${token.colorErrorBg};
        border-color: ${token.colorErrorBorder};
      }
      .va-summary-chip--error .va-summary-chip__value {
        color: ${token.colorError};
      }
      .va-summary-chip--neutral {
        background: ${primaryTint8};
        border-color: ${token.colorPrimaryBorder};
      }
      .va-summary-chip--neutral .va-summary-chip__value {
        color: ${token.colorPrimary};
      }

      .va-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      /* Hide empty DataView toolbar Card */
      .va-approvals-grid > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .va-approvals-grid > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
        gap: 0 !important;
      }
      .va-approvals-grid > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .va-grid-wrap .va-data-view {
        width: 100%;
        flex: 1;
        min-height: calc(100vh - 360px);
        display: flex;
        flex-direction: column;
      }
      .va-approvals-grid .ag-theme-alpine,
      .va-approvals-grid .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .va-data-view .sm-data-view-toolbar,
      .va-data-view .data-view-toolbar {
        display: none !important;
      }

      .va-status-done {
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
      }

      @media (max-width: 767px) {
        .va-page-header {
          padding: ${token.paddingSM}px ${token.paddingMD}px 0;
        }
        .va-summary-panel {
          margin: ${token.marginSM}px ${token.paddingMD}px ${token.marginSM}px;
        }
        .va-summary-strip {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          padding: ${token.paddingSM}px ${token.paddingMD}px;
          gap: ${token.marginXS}px;
        }
        .va-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
      }
    `}</style>
  );
}
