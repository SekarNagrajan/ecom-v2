// Modified by Sekar Nagarajan (2026-08-26 10:55)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Rates module layout classes (agenct.md). */
export function RatesModuleStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .rates-search-panel {
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginLG}px;
        overflow: hidden;
        box-shadow: none !important;
      }
      .rates-search-mode-field {
        margin: 0 !important;
      }
      .rates-search-panel__body {
        padding: ${token.paddingLG}px;
        background: ${token.colorFillAlter};
      }
      .rates-search-mode-wrap {
        margin-bottom: ${token.marginMD}px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .rates-search-mode-wrap .ant-segmented {
        min-width: max-content;
      }
      .rates-port-label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      /* Align swap control with Select height (not label row) */
      .rates-port-swap-col {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        /* Match sibling Form.Item margin-bottom so button sits with the input */
        padding-bottom: ${token.marginSM}px;
      }
      .rates-port-swap {
        display: flex;
        align-items: center;
        justify-content: center;
        height: ${token.controlHeightLG}px;
        width: 100%;
      }
      .rates-port-swap .ant-btn {
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        min-width: ${token.controlHeightLG}px;
      }
      .rates-search-actions-field {
        margin-bottom: 0 !important;
      }
      .rates-search-actions-field .ant-form-item-label {
        min-height: ${token.fontSizeSM * token.lineHeight + token.marginSM}px;
      }
      .rates-search-actions-field .ant-form-item-label > label {
        visibility: hidden;
      }
      .rates-search-actions {
        display: flex;
        gap: ${token.marginXS}px;
        width: 100%;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        min-height: ${token.controlHeightLG}px;
      }
      .rates-search-actions .sm-app-button,
      .rates-search-actions .ant-btn {
        min-height: ${token.controlHeightLG}px;
      }
      .rates-search-actions .sm-app-button.ant-btn-primary,
      .rates-search-actions .ant-btn-primary {
        flex: 1;
        min-width: 140px;
      }
      .rates-date-range {
        width: 100%;
      }
      .rates-search-panel__body .ant-form-item {
        margin-bottom: ${token.marginSM}px;
      }
      .rates-search-panel__body .ant-row:last-child .ant-form-item {
        margin-bottom: 0;
      }

      .rates-results-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginMD}px;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .rates-results-toolbar__title {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
      }

      .rates-card-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .rates-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        overflow: hidden;
        box-shadow: none !important;
        transition: border-color 0.2s ease;
      }
      .rates-card:hover {
        border-color: ${tokenMix(token.colorPrimary, 30)};
        box-shadow: none !important;
      }
      .rates-card--recommended {
        border-color: ${tokenMix(token.colorWarning, 40)};
        box-shadow: none !important;
      }
      .rates-card__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .rates-card__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        flex-wrap: wrap;
      }
      .rates-card__meta {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .rates-card__ref {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }

      /* Voyage: origin port —— pricing lane —— delivery port */
      .rates-card__voyage {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginMD}px;
        align-items: stretch;
      }
      .rates-card__port {
        display: flex;
        gap: ${token.marginSM}px;
        align-items: flex-start;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
        min-width: 0;
      }
      .rates-card__port--origin {
        border-color: ${tokenMix(token.colorPrimary, 35)};
      }
      .rates-card__port--delivery {
        border-color: ${tokenMix(token.colorSuccess, 35)};
      }
      .rates-card__port-badge {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .rates-card__port-badge--origin {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .rates-card__port-badge--delivery {
        background: ${token.colorSuccessBg};
        color: ${token.colorSuccess};
        transform: scaleX(-1);
      }
      .rates-card__port-body {
        flex: 1;
        min-width: 0;
      }
      .rates-card__port-label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: ${token.marginXXS}px;
      }
      .rates-card__port-code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.1 !important;
      }
      .rates-card__port-code--origin {
        color: ${token.colorPrimary} !important;
      }
      .rates-card__port-code--delivery {
        color: ${token.colorSuccess} !important;
      }
      .rates-card__port-name {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .rates-card__port-tags {
        margin-top: ${token.marginXS}px;
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
      }
      .rates-card__port-detail {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        display: block;
        margin-top: ${token.marginXXS}px;
      }

      .rates-card__pricing-lane {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingSM}px ${token.paddingXS}px;
        min-width: 0;
      }
      .rates-card__pricing-lane-label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        text-align: center;
      }
      .rates-card__pricing-lane-total {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorSuccess};
        font-size: ${token.fontSizeLG}px;
        text-align: center;
        line-height: 1.2;
      }
      .rates-card__pricing-lane-track {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 200px;
        margin: ${token.marginXXS}px 0;
      }
      .rates-card__pricing-lane-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .rates-card__pricing-lane-dot--origin {
        background: ${token.colorPrimary};
      }
      .rates-card__pricing-lane-dot--delivery {
        background: ${token.colorSuccess};
      }
      .rates-card__pricing-lane-line {
        flex: 1;
        height: 2px;
        background: ${token.colorPrimary};
      }
      .rates-card__pricing-lane-line--delivery {
        background: ${token.colorSuccess};
      }
      .rates-card__pricing-lane-mid {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${token.colorWarningBg};
        border: 1px solid ${token.colorWarningBorder};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: ${token.colorWarning};
        flex-shrink: 0;
        margin: 0 ${token.marginXXS}px;
      }
      .rates-card__pricing-lane-hint {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        text-align: center;
      }

      .rates-card__actions {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .rates-card__actions-secondary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: ${token.marginXS}px;
      }
      .rates-card__footer {
        padding: ${token.paddingSM}px ${token.paddingLG}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .rates-card__validity {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .rates-card__validity-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorText};
      }
      .rates-card__validity-icon {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .rates-card__validity-icon--from {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .rates-card__validity-icon--to {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .rates-card__validity-icon--contract {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .rates-card__validity-icon--tariff {
        background: ${token.colorSuccessBg};
        color: ${token.colorSuccess};
      }
      .rates-card__validity-label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .rates-card__validity-value {
        display: block;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.2;
      }
      .rates-card__surcharges {
        margin-top: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .rates-card__surcharge-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXS}px 0;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .rates-card__surcharge-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .rates-empty {
        text-align: center;
        padding: ${token.paddingXL}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px dashed ${token.colorBorder};
        background: ${token.colorFillAlter};
      }
      .rates-empty__text {
        display: block;
        margin-top: ${token.marginSM}px;
      }

      .rates-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
      }
      .rates-filter-card.ant-card,
      .rates-grid-panel.ant-card,
      .rates-dataview-shell.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
      }
      .rates-filter-card > .ant-card-body,
      .rates-grid-panel > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .rates-filter-select.ant-select {
        width: 200px;
        max-width: 100%;
      }
      .rates-grid {
        height: 480px;
        min-height: 320px;
      }
      .rates-cell-stack {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        gap: 2px;
      }
      .rates-cell-title {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.2;
      }
      .rates-cell-title--primary {
        color: ${token.colorPrimary};
      }
      .rates-cell-sub {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .rates-cell-body {
        font-size: ${token.fontSize}px;
        color: ${token.colorText};
      }
      .rates-amount {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
      }
      .rates-toolbar-copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .rates-toolbar-copy__title {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
      }
      .rates-toolbar-copy__sub {
        font-size: ${token.fontSizeSM}px;
      }
      .rates-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px;
      }
      .rates-drawer-meta {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        margin-bottom: ${token.marginMD}px;
      }
      .rates-input-full.ant-input-number {
        width: 100%;
      }

      @media (min-width: 768px) {
        .rates-card__voyage {
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }
        .rates-card__actions {
          grid-column: 1 / -1;
          flex-direction: row;
          flex-wrap: wrap;
        }
        .rates-card__actions .sm-app-button:first-child {
          flex: 1;
          min-width: 160px;
        }
        .rates-card__surcharge-row {
          grid-template-columns: 1fr auto;
          align-items: center;
        }
        .rates-card__pricing-lane {
          min-width: 140px;
        }
      }

      @media (min-width: 992px) {
        .rates-card__voyage {
          grid-template-columns: 1.15fr 0.85fr 1.15fr 1fr;
          align-items: center;
        }
        .rates-card__actions {
          grid-column: auto;
          flex-direction: column;
        }
        .rates-card__actions .sm-app-button:first-child {
          flex: unset;
          width: 100%;
        }
      }

      @media (max-width: 767px) {
        .rates-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .rates-port-swap-col {
          align-items: center;
          padding-bottom: ${token.paddingXS}px;
          padding-top: ${token.paddingXXS}px;
        }
        .rates-search-actions {
          flex-direction: column;
        }
        .rates-search-actions .sm-app-button,
        .rates-search-actions .ant-btn {
          width: 100%;
        }
        .rates-results-toolbar .ant-segmented {
          width: 100%;
        }
        .rates-card__body {
          padding: ${token.paddingMD}px;
        }
        .rates-card__footer {
          flex-direction: column;
          align-items: flex-start;
        }
        .rates-filter-select.ant-select {
          width: 100%;
        }
      }
    `}</style>
  );
}
