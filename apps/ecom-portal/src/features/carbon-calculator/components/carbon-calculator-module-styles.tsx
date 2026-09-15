// Modified by Sekar Nagarajan (2026-09-15 12:23)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function CarbonCalculatorModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);

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
      .co2-result-content {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .co2-result-error {
        display: block;
      }
      .co2-result-loading.module-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 220px;
      }
      .co2-result-empty {
        padding: ${token.paddingMD}px;
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
      .co2-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: ${token.marginSM}px;
      }
      .co2-kpi-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .co2-kpi-card--total {
        min-width: 200px;
        border-color: ${token.colorPrimaryBorder};
        background: linear-gradient(
          180deg,
          ${primaryTint8} 0%,
          ${token.colorBgContainer} 100%
        );
      }
      .co2-kpi-card__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: ${token.lineHeightSM};
      }
      .co2-kpi-card__value {
        font-variant-numeric: tabular-nums;
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        margin: 0;
        line-height: 1.25;
        word-break: break-word;
      }
      .co2-kpi-card__value--sm {
        font-size: ${token.fontSizeLG}px;
      }
      .co2-charts {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginMD}px;
      }
      @media (min-width: 992px) {
        .co2-charts {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      .co2-chart-card {
        display: flex;
        flex-direction: column;
        min-width: 0;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        overflow: hidden;
      }
      .co2-chart-card__header {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingMD}px ${token.paddingMD}px 0;
      }
      .co2-chart-card__title {
        margin: 0;
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: ${token.lineHeight};
      }
      .co2-chart-card__hint {
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: ${token.lineHeightSM};
      }
      .co2-chart-card__canvas {
        width: 100%;
      }
      .co2-legs-block {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .co2-legs-block__header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .co2-legs-title {
        margin: 0;
      }
      .co2-legs-block__count {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .co2-legs-table {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        overflow: auto;
      }
      .co2-legs-table .ant-table {
        font-variant-numeric: tabular-nums;
      }
      .co2-legs-table .ant-table-wrapper .ant-table {
        border-radius: ${token.borderRadiusLG}px;
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
