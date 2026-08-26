// Modified by Sekar Nagarajan (2026-08-25 13:10)
import { theme } from 'antd';

import { tokenMix } from '../../theme/utils/token-mix';

export function CarbonCalculatorModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .feature-page-card.co2-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.co2-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .co2-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .co2-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .co2-form {
        flex-shrink: 0;
      }
      .co2-criteria-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: visible;
      }
      .co2-criteria-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .co2-criteria-row {
        width: 100%;
      }
      .co2-search-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .co2-search-field .ant-select,
      .co2-search-field .ant-input-number {
        width: 100%;
      }
      .co2-search-actions-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .co2-search-actions-field__spacer {
        min-height: ${token.fontSizeSM * token.lineHeight + token.marginXXS}px;
        visibility: hidden;
      }
      .co2-search-actions {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        width: 100%;
        min-height: ${token.controlHeightLG}px;
      }
      .co2-search-actions .sm-app-button,
      .co2-search-actions .ant-btn {
        min-height: ${token.controlHeightLG}px;
        flex: 1 1 0;
      }
      .co2-search-actions .ant-btn-primary {
        flex: 1.4 1 0;
      }
      .co2-search-actions .ant-btn.ant-btn-loading,
      .co2-search-actions .ant-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .co2-criteria-error {
        margin: 0 ${token.paddingLG}px ${token.marginSM}px;
        color: ${token.colorError};
        font-size: ${token.fontSizeSM}px;
      }
      .co2-result-wrap {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        overflow: auto;
      }
      .co2-result-idle {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 160px;
        padding: ${token.paddingXL}px;
        text-align: center;
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSize}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px dashed ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .co2-result-panel {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        min-height: 160px;
      }
      .co2-result-error {
        display: block;
      }
      .co2-result-spin-placeholder {
        min-height: 160px;
      }
      .co2-result-toolbar {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        flex-wrap: wrap;
      }
      .co2-result-toolbar__meta {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .co2-result-toolbar__lane {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        font-size: ${token.fontSizeLG}px;
      }
      .co2-result-toolbar__sub {
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
      }
      .co2-summary-cards {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginMD}px;
      }
      @media (min-width: 768px) {
        .co2-summary-cards {
          grid-template-columns: 1.4fr 1fr 1fr;
        }
      }
      .co2-summary-card {
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .co2-summary-card--total {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .co2-summary-card__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .co2-summary-card__value {
        font-variant-numeric: tabular-nums;
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        margin: 0;
        line-height: 1.25;
      }
      .co2-summary-card__value--sm {
        font-size: ${token.fontSizeLG}px;
      }
      .co2-intensity {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginMD}px ${token.marginLG}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        background: ${successTint8};
        border: 1px solid ${token.colorBorderSecondary};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .co2-intensity strong {
        color: ${token.colorText};
      }
      .co2-legs-title {
        display: block;
        margin-bottom: ${token.marginSM}px;
      }
      .co2-legs-table .ant-table {
        font-variant-numeric: tabular-nums;
      }
      .co2-info-strip {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        background: ${primaryTint8};
        border: 1px solid ${token.colorBorderSecondary};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: ${token.lineHeight};
      }
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
      }
    `}</style>
  );
}
