// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for Agency Approvals (page + grid). */
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
        gap: ${token.marginLG}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px ${token.paddingLG}px !important;
        min-height: calc(100vh - 160px);
        min-width: 0;
      }

      .va-page-layout {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
        min-width: 0;
      }

      .va-panel-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        width: 100%;
        flex-wrap: wrap;
      }
      .va-panel-header__main {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
        flex: 1;
      }
      .va-panel-header__icon {
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
      .va-panel-header__copy {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .va-panel-header__title {
        margin: 0 !important;
        line-height: 1.25 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .va-panel-header__description {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }

      .va-summary-strip {
        display: flex;
        flex-wrap: nowrap;
        align-items: stretch;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .va-summary-chip {
        display: flex;
        flex: 1 1 0;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorPrimaryBorder};
        background: ${token.colorBgContainerDisabled};
      }
      .va-summary-chip__label {
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        color: ${token.colorTextSecondary};
      }
      .va-summary-chip__value {
        font-size: ${token.fontSizeHeading4}px;
        line-height: 1.2;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .va-summary-chip--primary .va-summary-chip__value {
        color: ${token.colorPrimary};
      }
      .va-summary-chip--success .va-summary-chip__value {
        color: ${token.colorSuccess};
      }
      .va-summary-chip--warning .va-summary-chip__value {
        color: ${token.colorWarning};
      }

      .va-grid-wrap {
        width: 100%;
        min-width: 0;
        min-height: 0;
        overflow-x: auto;
      }
      .va-grid-wrap .va-data-view {
        min-height: 320px;
        width: 100%;
      }
      /* Hide empty DataView toolbar Card */
      .va-approvals-grid > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .va-approvals-grid > .ant-flex {
        gap: 0 !important;
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
        .feature-page-card.va-page-card > .ant-card-body {
          padding: ${token.paddingSM}px ${token.paddingMD}px ${token.paddingMD}px !important;
          gap: ${token.marginMD}px;
        }
        .va-page-layout {
          gap: ${token.marginMD}px;
        }
        .va-summary-strip {
          flex-wrap: wrap;
          gap: ${token.marginXS}px;
        }
        .va-summary-chip {
          flex: 1 1 calc(50% - ${token.marginXS}px);
          min-width: 0;
        }
        .va-summary-chip:last-child {
          flex: 1 1 100%;
        }
      }
    `}</style>
  );
}
