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

      /* Summary panel — donut + KPI cards (mockup parity) */
      .va-summary-panel {
        flex-shrink: 0;
        margin: ${token.marginMD}px ${token.paddingLG}px;
      }
      .va-summary-panel__inner {
        display: flex;
        align-items: center;
        gap: ${token.marginMD}px;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: 14px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }
      .va-summary-chart {
        position: relative;
        flex: 0 0 112px;
        width: 112px;
        height: 112px;
      }
      .va-summary-chart__canvas {
        width: 100%;
        height: 100%;
      }
      .va-summary-chart__center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }
      .va-summary-chart__total {
        font-size: 22px;
        line-height: 1.1;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: ${token.colorTextHeading};
        letter-spacing: -0.02em;
      }
      .va-summary-chart__total-label {
        margin-top: 2px;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 500;
        color: ${token.colorTextSecondary};
      }
      .va-summary-divider {
        flex: 0 0 1px;
        align-self: stretch;
        width: 1px;
        margin: ${token.marginXXS}px 0;
        background: ${token.colorBorderSecondary};
      }
      .va-summary-cards {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: ${token.marginSM + 4}px;
        min-width: 0;
      }
      .va-summary-card {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
        min-height: 72px;
        padding: ${token.paddingSM + 2}px ${token.paddingSM + 4}px;
        border: 1px solid transparent;
        border-radius: 12px;
        text-align: left;
        cursor: pointer;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease,
          transform 0.15s ease;
      }
      .va-summary-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
      }
      .va-summary-card:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
      }
      .va-summary-card--active {
        box-shadow: 0 0 0 1px currentColor inset;
      }
      .va-summary-card__icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        background: ${token.colorBgContainer};
        color: inherit;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04);
      }
      .va-summary-card__content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .va-summary-card__label {
        font-size: 13px;
        line-height: 1.2;
        font-weight: 600;
        color: ${token.colorTextHeading};
        white-space: nowrap;
      }
      .va-summary-card__value {
        font-size: 24px;
        line-height: 1.1;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.02em;
        color: inherit;
      }
      .va-summary-card__chevron {
        flex-shrink: 0;
        display: inline-flex;
        color: inherit;
        opacity: 0.7;
      }
      .va-summary-card--pending {
        color: ${token.colorWarning};
        background: ${token.colorWarningBg};
        border-color: ${token.colorWarningBorder};
      }
      .va-summary-card--approved {
        color: ${token.colorSuccess};
        background: ${tokenMix(token.colorSuccess, 8)};
        border-color: ${tokenMix(token.colorSuccess, 16)};
      }
      .va-summary-card--rejected {
        color: ${token.colorError};
        background: ${token.colorErrorBg};
        border-color: ${token.colorErrorBorder};
      }
      .va-summary-card--total {
        color: ${token.colorPrimary};
        background: ${primaryTint8};
        border-color: ${token.colorPrimaryBorder};
      }

      .va-bulk-bar {
        flex-shrink: 0;
        position: sticky;
        top: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        flex-wrap: wrap;
        margin: 0 ${token.paddingLG}px ${token.marginSM}px;
        padding: ${token.paddingSM + 2}px ${token.paddingMD}px;
        border-radius: 12px;
        border: 1px solid ${token.colorPrimaryBorder};
        background: ${token.colorBgContainer};
        box-shadow:
          0 1px 2px rgba(15, 23, 42, 0.04),
          0 0 0 3px ${primaryTint8};
        animation: va-bulk-bar-in 0.18s ease-out;
      }
      @keyframes va-bulk-bar-in {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .va-bulk-bar__info {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .va-bulk-bar__badge {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 8px;
        border-radius: 999px;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        font-size: 13px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        line-height: 1;
      }
      .va-bulk-bar__copy {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      .va-bulk-bar__title {
        font-size: 13px;
        line-height: 1.3;
        color: ${token.colorTextHeading};
      }
      .va-bulk-bar__subtitle {
        font-size: 12px;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .va-bulk-bar__actions {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
        margin-left: auto;
      }
      .va-bulk-bar__dismiss.ant-btn {
        color: ${token.colorTextSecondary};
      }
      .va-bulk-bar__dismiss.ant-btn:hover,
      .va-bulk-bar__dismiss.ant-btn:focus-visible {
        color: ${token.colorText} !important;
        background: ${token.colorFillSecondary} !important;
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

      .va-reject-modal {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .va-reject-modal__intro {
        display: block;
        color: ${token.colorTextSecondary};
        line-height: 1.45;
      }
      .va-reject-modal__field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        padding-bottom: ${token.paddingSM}px;
      }
      .va-reject-modal__label {
        font-size: 13px;
        font-weight: 600;
        color: ${token.colorTextHeading};
      }
      .va-reject-modal__required {
        color: ${token.colorError};
      }
      .va-reject-modal__error {
        font-size: 12px;
        line-height: 1.3;
      }
      .va-reject-modal-dialog__body {
        padding-bottom: ${token.paddingMD}px !important;
      }
      .va-reject-modal-dialog__footer-wrap {
        margin-top: 0;
        padding-top: ${token.paddingMD}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .va-reject-modal__footer {
        display: flex;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        width: 100%;
      }

      @media (max-width: 767px) {
        .va-page-header {
          padding: ${token.paddingSM}px ${token.paddingMD}px 0;
        }
        .va-summary-panel {
          margin: ${token.marginSM}px ${token.paddingMD}px;
        }
        .va-bulk-bar {
          margin: 0 ${token.paddingMD}px ${token.marginSM}px;
          padding: ${token.paddingSM}px;
          align-items: stretch;
        }
        .va-bulk-bar__actions {
          width: 100%;
          margin-left: 0;
        }
        .va-bulk-bar__subtitle {
          white-space: normal;
        }
        .va-summary-panel__inner {
          flex-direction: column;
          align-items: stretch;
          gap: ${token.marginSM}px;
          padding: ${token.paddingSM + 2}px;
        }
        .va-summary-chart {
          align-self: center;
        }
        .va-summary-divider {
          width: 100%;
          height: 1px;
          margin: 0;
        }
        .va-summary-cards {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: ${token.marginSM}px;
        }
        .va-summary-card {
          min-height: 64px;
        }
        .va-summary-card__value {
          font-size: 20px;
        }
        .va-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
      }
    `}</style>
  );
}
