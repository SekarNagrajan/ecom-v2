// Modified by Sekar Nagarajan (2026-08-25 13:00)
import { theme } from 'antd';

import { tokenMix } from '../../theme/utils/token-mix';

export function CustomerStatementModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const warningTint8 = tokenMix(token.colorWarning, 8);

  return (
    <style>{`
      .feature-page-card.stmt-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.stmt-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .stmt-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .stmt-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .stmt-search-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .stmt-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .stmt-criteria-row {
        width: 100%;
      }
      .stmt-search-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .stmt-search-field .ant-picker,
      .stmt-search-field .ant-select {
        width: 100%;
      }
      .stmt-search-actions-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .stmt-search-actions-field__spacer {
        min-height: ${token.fontSizeSM * token.lineHeight + token.marginXXS}px;
        visibility: hidden;
      }
      .stmt-search-actions {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: ${token.controlHeightLG}px;
      }
      .stmt-search-actions .sm-app-button,
      .stmt-search-actions .ant-btn {
        min-height: ${token.controlHeightLG}px;
        width: 100%;
      }
      .stmt-criteria-error {
        margin: 0 ${token.paddingLG}px ${token.marginSM}px;
        color: ${token.colorError};
        font-size: ${token.fontSizeSM}px;
      }
      .stmt-result-wrap {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        overflow: hidden;
      }
      .stmt-summary-header {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        margin-bottom: ${token.marginMD}px;
        flex-shrink: 0;
      }
      .stmt-summary-header__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        flex-wrap: wrap;
      }
      .stmt-summary-header__meta {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .stmt-summary-header__account {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        font-size: ${token.fontSizeLG}px;
      }
      .stmt-summary-header__period {
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
      }
      .stmt-summary-header__actions {
        display: flex;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
      }
      .stmt-summary-cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px;
      }
      .stmt-summary-card {
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .stmt-summary-card--opening {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .stmt-summary-card--closing {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .stmt-summary-card--net {
        border-left: 4px solid ${token.colorWarning};
        background: linear-gradient(180deg, ${warningTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .stmt-summary-card__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .stmt-summary-card__value {
        display: block;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .stmt-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
      }
      .stmt-grid-wrap .ag-theme-alpine,
      .stmt-grid-wrap .ag-root-wrapper {
        height: 100%;
        min-height: 280px;
      }
      .stmt-data-view .sm-data-view-toolbar,
      .stmt-data-view .data-view-toolbar {
        display: none !important;
      }
      .stmt-money-cell {
        display: block;
        text-align: right;
        font-variant-numeric: tabular-nums;
        width: 100%;
      }
      .stmt-totals-strip {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px;
        margin-top: ${token.marginMD}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        flex-shrink: 0;
      }
      .stmt-totals-strip__item {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .stmt-totals-strip__label {
        flex-shrink: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        text-align: left;
      }
      .stmt-totals-strip__value {
        flex: 1;
        min-width: 0;
        font-weight: ${token.fontWeightStrong};
        text-align: right;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .stmt-empty-hint {
        padding: ${token.paddingLG}px;
        text-align: center;
        color: ${token.colorTextSecondary};
      }

      @media (max-width: 767px) {
        .stmt-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .stmt-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .stmt-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .stmt-criteria-error,
        .stmt-result-wrap {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .stmt-summary-cards,
        .stmt-totals-strip {
          grid-template-columns: 1fr;
        }
        .stmt-totals-strip__item {
          width: 100%;
        }
        .stmt-summary-header__actions {
          width: 100%;
        }
        .stmt-summary-header__actions .sm-app-button,
        .stmt-summary-header__actions .ant-btn {
          flex: 1;
        }
      }
    `}</style>
  );
}
