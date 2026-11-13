// Modified by Sekar Nagarajan (2026-10-27 12:10) — actions column right padding
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
      .rates-search-mode-tabs.ant-tabs {
        margin-bottom: 0;
        min-width: max-content;
      }
      .rates-search-mode-tabs .ant-tabs-nav {
        margin-bottom: 0;
      }
      .rates-search-mode-tabs .ant-tabs-nav::before {
        border-bottom-color: ${token.colorBorderSecondary};
      }
      .rates-search-mode-tabs .ant-tabs-tab {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        font-size: ${token.fontSize}px;
      }
      .rates-search-mode-tabs .ant-tabs-tab-btn {
        color: ${token.colorTextSecondary};
      }
      .rates-search-mode-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }
      .rates-search-mode-tabs .ant-tabs-ink-bar {
        background: ${token.colorPrimary};
      }
      .rates-search-mode-tabs .ant-tabs-content-holder {
        display: none;
      }
      .rates-search-fields-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: ${token.marginSM}px;
        width: 100%;
        min-width: 0;
        overflow-x: hidden;
      }
      .rates-search-field {
        flex: 1 1 148px;
        min-width: 0;
        max-width: 100%;
      }
      .rates-search-field--port {
        flex: 1.2 1 168px;
        min-width: 0;
      }
      .rates-search-field--swap {
        flex: 0 0 ${token.controlHeightLG}px;
        width: ${token.controlHeightLG}px;
        min-width: ${token.controlHeightLG}px;
        max-width: ${token.controlHeightLG}px;
        align-self: flex-end;
        padding-bottom: 0;
      }
      .rates-search-field--eqp,
      .rates-search-field--commodity {
        flex: 1 1 148px;
        min-width: 0;
      }
      .rates-search-field--date {
        flex: 1 1 140px;
        min-width: 0;
      }
      .rates-search-field--actions {
        flex: 1 1 auto;
        min-width: 0;
        align-self: flex-end;
        margin-left: auto;
      }
      .rates-search-fields-row .ant-form-item {
        margin-bottom: 0 !important;
        width: 100%;
      }
      .rates-search-fields-row .ant-form-item-label {
        padding: 0 !important;
        margin-bottom: ${token.marginXS}px !important;
        line-height: ${token.lineHeight};
        height: auto !important;
        overflow: visible !important;
      }
      .rates-search-fields-row .ant-form-item-label > label {
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: ${token.lineHeight} !important;
        font-size: ${token.fontSizeSM}px;
        white-space: nowrap;
      }
      .rates-search-fields-row .form-field-label {
        margin-bottom: 0 !important;
        display: inline-flex;
        line-height: inherit;
      }
      .rates-search-fields-row .ant-form-item-control-input {
        min-height: ${token.controlHeightLG}px;
      }
      .rates-search-fields-row .ant-select,
      .rates-search-fields-row .ant-picker,
      .rates-search-fields-row .rates-date-range {
        width: 100%;
      }
      .rates-port-label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .rates-port-option {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .rates-port-option__code {
        display: inline-flex;
        align-items: center;
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        padding: 2px ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorFillSecondary};
        color: ${token.colorText};
      }
      .rates-search-swap-field .ant-form-item-label > label,
      .rates-search-actions-field .ant-form-item-label > label {
        visibility: hidden;
      }
      .rates-search-swap-field .ant-form-item-label,
      .rates-search-actions-field .ant-form-item-label {
        margin-bottom: ${token.marginXS}px !important;
        min-height: calc(${token.fontSizeSM}px * ${token.lineHeight});
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
      .rates-search-actions-field,
      .rates-search-swap-field {
        margin-bottom: 0 !important;
      }
      .rates-search-actions {
        display: flex;
        gap: ${token.marginSM}px;
        width: 100%;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        min-height: ${token.controlHeightLG}px;
      }
      .rates-search-actions .sm-app-button,
      .rates-search-actions .ant-btn {
        min-height: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        white-space: nowrap;
      }
      .rates-search-actions .sm-app-button.ant-btn-primary,
      .rates-search-actions .ant-btn-primary {
        flex: 0 0 auto;
        min-width: 0;
      }
      .rates-date-range {
        width: 100%;
      }
      .rates-search-panel__body .ant-form-item {
        margin-bottom: 0;
      }

      .rates-results-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        min-height: ${token.controlHeightLG}px;
      }
      .rates-results-bar__lead {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        min-width: 0;
        flex: 1 1 auto;
      }
      .rates-results-bar__count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorError};
        color: ${token.colorTextLightSolid};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .rates-results-bar__title {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
      }

      /* List/card toggle — inactive primary icons; active white on primary */
      .rates-results-bar .module-view-mode-tabs.ant-segmented {
        background: ${token.colorBgContainer};
        border-color: ${token.colorBorder};
        flex-shrink: 0;
      }
      .rates-results-bar .module-view-mode-tabs.ant-segmented
        .ant-segmented-item {
        color: ${token.colorPrimary};
      }
      .rates-results-bar .module-view-mode-tabs.ant-segmented
        .ant-segmented-item:not(.ant-segmented-item-selected) .app-icon {
        color: ${token.colorPrimary} !important;
      }
      .rates-results-bar .module-view-mode-tabs.ant-segmented
        .ant-segmented-thumb {
        background: ${token.colorPrimary} !important;
      }
      .rates-results-bar .module-view-mode-tabs.ant-segmented
        .ant-segmented-item-selected {
        background: ${token.colorPrimary} !important;
        color: ${token.colorTextLightSolid} !important;
      }
      .rates-results-bar .module-view-mode-tabs.ant-segmented
        .ant-segmented-item-selected .app-icon {
        color: ${token.colorTextLightSolid} !important;
      }

      .rates-card-view-panel.module-card-view-panel--active {
        margin-bottom: ${token.marginMD}px;
      }
      .rates-grid-wrap {
        width: 100%;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .rates-grid-wrap--no-toolbar .rates-data-view > .ant-card:first-child {
        display: none;
      }
      .rates-list-grid {
        width: 100%;
        flex: 1;
        min-height: min(480px, calc(100vh - 420px));
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .rates-list-grid > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .rates-list-grid .rates-data-view {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: min(480px, calc(100vh - 420px));
        height: 100%;
      }
      .rates-list-grid .rates-data-view .ant-card {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .rates-list-grid .rates-data-view .ant-card > .ant-card-body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      .rates-list-grid .ag-theme-alpine,
      .rates-list-grid .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .rates-list-grid .ag-row.rates-list-row--recommended,
      .rates-list-grid .ag-row.rates-list-row--recommended .ag-cell {
        background: ${tokenMix(token.colorWarning, 10)} !important;
      }
      .rates-list-grid .ag-row.rates-list-row--recommended:hover,
      .rates-list-grid .ag-row.rates-list-row--recommended:hover .ag-cell {
        background: ${tokenMix(token.colorWarning, 16)} !important;
      }
      .rates-list-legend {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin-top: ${token.marginSM}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: ${token.lineHeightSM};
      }
      .rates-list-legend__swatch {
        flex: 0 0 auto;
        width: ${token.fontSizeLG}px;
        height: ${token.fontSizeLG}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${tokenMix(token.colorWarning, 10)};
        border: 1px solid ${tokenMix(token.colorWarning, 40)};
      }
      .rates-list-cell__title {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: ${token.lineHeightSM};
      }
      .rates-list-cell__sub {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: ${token.lineHeightSM};
        margin-top: ${token.marginXXS}px;
      }

      .rates-card-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .rates-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        overflow: hidden;
        box-shadow: none !important;
        transition: border-color 0.25s ease;
      }
      .rates-card:hover {
        border-color: ${tokenMix(token.colorPrimary, 30)};
        box-shadow: none !important;
      }
      .rates-card--recommended,
      .rates-card--expanded {
        border-color: ${tokenMix(token.colorPrimary, 45)};
      }
      .rates-card--recommended.rates-card--expanded {
        border-color: ${tokenMix(token.colorWarning, 55)};
      }

      /* —— Expand / collapse panels —— */
      .rates-card__panel {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
          grid-template-rows 0.32s ease,
          opacity 0.24s ease;
      }
      .rates-card__panel--open {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .rates-card__panel--closed {
        grid-template-rows: 0fr;
        opacity: 0;
        pointer-events: none;
      }
      .rates-card__panel-inner {
        overflow: hidden;
        min-height: 0;
      }
      @media (prefers-reduced-motion: reduce) {
        .rates-card__panel {
          transition: none;
        }
      }

      /* —— Collapsed summary row —— */
      .rates-card__summary {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginXS}px;
        align-items: center;
        padding: ${token.paddingXS}px ${token.paddingMD}px;
        min-width: 0;
      }
      .rates-card__summary-route {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        column-gap: ${token.marginSM}px;
        min-width: 0;
        width: 100%;
      }
      .rates-card__summary-port {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .rates-card__summary-icon {
        width: 24px;
        height: 24px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .rates-card__summary-port-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        line-height: 1.2;
      }
      .rates-card__summary-place {
        display: block;
        font-size: ${token.fontSizeSM}px;
        max-width: 100%;
      }
      .rates-card__summary-code {
        font-size: ${token.fontSize}px;
        color: ${token.colorText};
        letter-spacing: 0.02em;
      }
      .rates-card__summary-arrow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        justify-self: center;
        align-self: center;
        flex-shrink: 0;
        color: ${token.colorTextSecondary};
        line-height: 1;
      }
      .rates-card__summary-price {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .rates-card__summary-tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        align-items: center;
        min-width: 0;
      }
      .rates-card__summary-valid {
        font-size: ${token.fontSizeSM}px;
        white-space: nowrap;
      }
      .rates-card__summary-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginXS}px;
      }

      /* —— Expanded card —— */
      .rates-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .rates-card__meta {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        align-items: center;
        row-gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .rates-card__meta .ant-tag {
        margin-inline-end: 0;
        line-height: 1.35;
      }
      .rates-card__top-end {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-shrink: 0;
      }
      .rates-card__ref {
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
        line-height: 1.35;
      }
      .rates-card__expand-toggle.sm-app-button,
      .rates-card__expand-toggle.ant-btn {
        width: 28px;
        height: 28px;
        min-width: 28px;
        padding: 0;
        color: ${token.colorPrimary};
        background: ${token.colorPrimaryBg};
        border-radius: ${token.borderRadiusSM}px;
        transition: transform 0.28s ease, background 0.2s ease;
      }
      .rates-card__expand-toggle--open.sm-app-button,
      .rates-card__expand-toggle--open.ant-btn {
        background: transparent;
      }

      .rates-card__body {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        align-items: center;
      }
      .rates-card__route-panel {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        column-gap: ${token.marginSM}px;
        min-width: 0;
        width: 100%;
      }
      .rates-card__endpoint {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .rates-card__endpoint-icon {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .rates-card__endpoint-icon--pol {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .rates-card__endpoint-icon--pod {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .rates-card__endpoint-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .rates-card__place {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
        max-width: 100%;
      }
      .rates-card__port-code {
        display: block;
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        letter-spacing: 0.02em;
        line-height: 1.15;
      }
      .rates-card__country {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
      }
      .rates-card__route-arrow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        justify-self: center;
        align-self: center;
        flex-shrink: 0;
        color: ${token.colorTextSecondary};
        line-height: 1;
      }

      .rates-card__price-panel {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        justify-content: center;
      }
      .rates-card__price-label {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
      }
      .rates-card__price-value {
        color: ${token.colorSuccess};
        font-size: ${token.fontSizeLG}px;
        line-height: 1.15;
        font-variant-numeric: tabular-nums;
      }
      .rates-card__price-value--lg {
        font-size: ${token.fontSizeHeading4}px;
      }
      .rates-card__price-breakdown {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.25;
      }
      .rates-card__price-ofr {
        color: ${token.colorPrimary};
      }
      .rates-card__price-surcharge {
        color: ${token.colorWarning};
      }

      .rates-card__facts-panel {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        gap: ${token.marginXS}px ${token.marginSM}px;
        min-width: 0;
        align-content: center;
      }
      .rates-card__fact {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .rates-card__fact-icon {
        width: 22px;
        height: 22px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorFillAlter};
        color: ${token.colorTextSecondary};
      }
      .rates-card__fact-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .rates-card__fact-label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.15;
      }
      .rates-card__fact-value {
        display: block;
        font-size: ${token.fontSize}px;
        line-height: 1.2;
        max-width: 100%;
      }

      .rates-card__actions {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        gap: ${token.marginXS}px;
        min-width: 0;
        margin-inline-start: auto;
        padding-block: ${token.paddingXXS}px;
        padding-inline: ${token.paddingSM}px;
        box-sizing: border-box;
      }
      .rates-card__actions .sm-app-button,
      .rates-card__actions .ant-btn {
        width: 100%;
        margin: 0;
      }
      .rates-card__actions .rates-card__actions-button--surcharge.sm-app-button,
      .rates-card__actions .rates-card__actions-button--surcharge.ant-btn {
        color: ${token.colorWhite} !important;
        border-color: ${token.colorWarningBorder} !important;
        background: ${token.colorWarning} !important;
        box-shadow: none !important;
      }
      .rates-card__actions .rates-card__actions-button--surcharge.sm-app-button:hover,
      .rates-card__actions .rates-card__actions-button--surcharge.ant-btn:hover,
      .rates-card__actions .rates-card__actions-button--surcharge.sm-app-button:focus-visible,
      .rates-card__actions .rates-card__actions-button--surcharge.ant-btn:focus-visible {
        color: ${token.colorWhite} !important;
        border-color: ${token.colorWarning} !important;
        background: ${token.colorWarning} !important;
      }
      .rates-card__actions .rates-card__actions-button--surcharge.sm-app-button:active,
      .rates-card__actions .rates-card__actions-button--surcharge.ant-btn:active {
        color: ${token.colorWhite} !important;
        border-color: ${token.colorWarning} !important;
        background: ${token.colorWarning} !important;
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
        min-height: calc(100vh - 480px);
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .rates-grid > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .rates-grid .ag-theme-alpine,
      .rates-grid .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
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
        max-height: calc(100vh - 100px);
        padding: ${token.paddingLG}px;
      }
      /* Modified by Sekar Nagarajan (2026-09-07 18:56) — quote request footer actions */
      .rates-drawer-footer {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .rates-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        align-items: center;
        justify-content: flex-end;
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
      /* Modified by Sekar Nagarajan (2026-09-07 18:59) — two-column quote form rows */
      .rates-drawer-form-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginXS}px ${token.marginMD}px;
        width: 100%;
      }
      .rates-drawer-form-row .ant-form-item {
        min-width: 0;
        margin-bottom: ${token.marginMD}px;
      }
      /* Modified by Sekar Nagarajan (2026-09-11 16:25) — share via mail drawer */
      .rates-share-mail-form {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .rates-share-mail-form > .ant-form-item {
        margin-bottom: 0;
      }
      .rates-share-mail-summary {
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .rates-share-mail-summary__title {
        margin: 0;
        color: ${token.colorText};
      }
      .rates-share-mail-summary__list {
        margin: 0;
        padding-left: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .rates-share-mail-editor {
        width: 100%;
        min-width: 0;
        --rte-content-padding-block: ${token.paddingMD}px;
        --rte-content-padding-inline: ${token.paddingLG}px;
      }
      .rates-share-mail-editor .ant-form-item {
        margin-bottom: 0;
      }
      .rates-share-mail-editor .ProseMirror {
        font-family: ${token.fontFamily};
        line-height: 1.55;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        margin: 0;
        min-height: ${token.controlHeightLG * 6}px;
        box-sizing: border-box;
      }
      .rates-share-mail-editor .ProseMirror > * + * {
        margin-top: ${token.marginSM}px;
      }
      .rates-share-mail-editor .ProseMirror p,
      .rates-share-mail-editor .ProseMirror ul,
      .rates-share-mail-editor .ProseMirror ol {
        margin-block: ${token.marginXS}px;
      }
      .rates-share-mail-editor .ProseMirror ul,
      .rates-share-mail-editor .ProseMirror ol {
        padding-inline-start: ${token.paddingLG}px;
      }

      @media (min-width: 768px) {
        .rates-card__summary {
          grid-template-columns:
            minmax(200px, 1.4fr)
            minmax(110px, 0.7fr)
            minmax(140px, 1fr)
            auto
            auto;
          gap: ${token.marginSM}px;
        }
        .rates-card__body {
          grid-template-columns:
            minmax(0, 1.45fr)
            minmax(140px, 0.85fr)
            minmax(180px, 1fr)
            minmax(140px, 0.7fr);
          gap: 0;
          align-items: center;
        }
        .rates-card__route-panel,
        .rates-card__price-panel,
        .rates-card__facts-panel {
          padding-inline: ${token.paddingSM}px;
        }
        .rates-card__route-panel {
          padding-inline-start: 0;
        }
        .rates-card__price-panel,
        .rates-card__facts-panel,
        .rates-card__actions {
          border-inline-start: 1px solid ${token.colorBorderSecondary};
          padding-inline: ${token.paddingSM}px;
        }
        .rates-card__actions {
          margin-inline-start: 0;
          padding-inline: ${token.paddingMD}px ${token.paddingSM}px;
          justify-content: center;
          align-self: stretch;
        }
      }

      @media (min-width: 992px) {
        .rates-search-actions {
          flex-wrap: nowrap;
        }
        .rates-search-field--actions {
          flex: 0 0 auto;
        }
      }

      @media (max-width: 1199px) {
        .rates-search-field--actions {
          flex: 1 1 100%;
          margin-left: 0;
          display: flex;
          justify-content: flex-end;
        }
      }

      @media (max-width: 767px) {
        .rates-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .rates-search-fields-row {
          flex-wrap: wrap;
          overflow-x: hidden;
        }
        .rates-search-field {
          flex: 1 1 calc((100% - ${token.marginSM}px) / 2);
          min-width: calc((100% - ${token.marginSM}px) / 2);
          max-width: none;
        }
        .rates-search-field--swap {
          flex: 0 0 100%;
          width: 100%;
          min-width: 100%;
          max-width: none;
          display: flex;
          justify-content: center;
        }
        .rates-search-field--actions {
          flex: 1 1 100%;
          min-width: 100%;
          margin-left: 0;
        }
        .rates-search-actions {
          flex-wrap: wrap;
          justify-content: stretch;
        }
        .rates-search-actions .sm-app-button,
        .rates-search-actions .ant-btn {
          flex: 1 1 auto;
        }
        .rates-drawer-actions {
          width: 100%;
          justify-content: stretch;
        }
        .rates-drawer-actions .sm-app-button,
        .rates-drawer-actions .ant-btn {
          flex: 1;
        }
        .rates-drawer-form-row {
          grid-template-columns: 1fr;
          gap: 0;
        }
        .rates-card__summary,
        .rates-card__body {
          padding: ${token.paddingMD}px;
        }
        .rates-card__top {
          padding: ${token.paddingMD}px ${token.paddingMD}px ${token.paddingSM}px;
        }
        .rates-card__summary-valid {
          white-space: normal;
        }
        .rates-filter-select.ant-select {
          width: 100%;
        }
      }

      /* Modified by Sekar Nagarajan (2026-10-19 14:45) — contract surcharge drawer */
      .rates-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .rates-drawer-title__copy {
        min-width: 0;
        flex: 1;
      }
      .rates-drawer-title__text.ant-typography {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .rates-drawer-title__meta {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .rates-surcharge-drawer {
        gap: ${token.marginLG}px;
      }
      .rates-surcharge-summary {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG + 2}px;
        background: linear-gradient(
          180deg,
          ${tokenMix(token.colorPrimary, 8)} 0%,
          ${token.colorBgContainer} 100%
        );
      }
      .rates-surcharge-route {
        display: flex;
        align-items: center;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .rates-surcharge-route__stop {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        flex: 1 1 0;
        min-width: 0;
      }
      .rates-surcharge-route__stop--dest {
        align-items: flex-end;
        text-align: right;
      }
      .rates-surcharge-route__eyebrow {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorTextTertiary};
        line-height: 1.2;
      }
      .rates-surcharge-route__code {
        font-size: ${token.fontSizeHeading4}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.2;
        word-break: break-word;
      }
      .rates-surcharge-route__name {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.4;
        word-break: break-word;
      }
      .rates-surcharge-route__connector {
        display: flex;
        align-items: center;
        flex: 0 1 140px;
        min-width: 72px;
        max-width: 180px;
        gap: ${token.marginXS}px;
      }
      .rates-surcharge-route__track {
        flex: 1 1 auto;
        height: 0;
        border-top: ${token.lineWidthBold}px dashed ${tokenMix(token.colorPrimary, 40)};
      }
      .rates-surcharge-route__ship {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: 50%;
        border: ${token.lineWidth}px solid ${token.colorPrimaryBorder};
        background: ${token.colorBgContainer};
        color: ${token.colorPrimary};
      }
      .rates-surcharge-facts {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: ${token.marginSM}px ${token.marginMD}px;
        margin: 0;
        padding-top: ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .rates-surcharge-fact {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .rates-surcharge-fact__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .rates-surcharge-fact__value {
        margin: 0;
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.4;
        word-break: break-word;
      }
      .rates-surcharge-tiles {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginSM}px;
      }
      .rates-surcharge-tile {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .rates-surcharge-tile--freight {
        border-color: ${tokenMix(token.colorSuccess, 35)};
        background: ${tokenMix(token.colorSuccess, 8)};
      }
      .rates-surcharge-tile--charges {
        border-color: ${tokenMix(token.colorWarning, 40)};
        background: ${tokenMix(token.colorWarning, 10)};
      }
      .rates-surcharge-tile__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .rates-surcharge-tile__amount {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
        font-variant-numeric: tabular-nums;
      }
      .rates-surcharge-amount {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .rates-surcharge-amount--primary.ant-typography {
        color: ${token.colorPrimary};
      }
      .rates-surcharge-amount__currency {
        margin-right: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        opacity: 0.85;
      }
      .rates-surcharge-section {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .rates-surcharge-section__head {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .rates-surcharge-section__title.ant-typography {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
      }
      .rates-surcharge-section__count.ant-tag {
        margin-inline-end: 0;
        border-radius: ${token.borderRadiusLG * 2}px;
        color: ${token.colorTextSecondary};
        background: ${token.colorFillAlter};
        border-color: ${token.colorBorderSecondary};
      }
      .rates-surcharge-table-wrap {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
      }
      .rates-surcharge-table .ant-table-thead > tr > th {
        background: ${token.colorFillAlter};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .rates-surcharge-table .ant-table-tbody > tr > td {
        vertical-align: middle;
      }
      .rates-surcharge-table .ant-table-summary > tr > td {
        background: ${token.colorFillAlter};
        border-top: ${token.lineWidthBold}px solid ${token.colorBorderSecondary};
      }
      .rates-surcharge-line {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .rates-surcharge-line__code.ant-tag {
        margin-inline-end: 0;
        font-weight: ${token.fontWeightStrong};
        font-variant-numeric: tabular-nums;
      }
      .rates-surcharge-line__name {
        color: ${token.colorText};
        word-break: break-word;
      }
      .rates-surcharge-eqp {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
      }
      .rates-surcharge-nor.ant-tag {
        margin-inline-end: 0;
        font-size: ${token.fontSizeSM - 1}px;
        line-height: 1.4;
      }
      .rates-surcharge-validity {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: normal;
        line-height: 1.35;
      }
      .rates-surcharge-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXXS}px;
        border: 1px dashed ${token.colorBorderSecondary};
      }
      @media (max-width: 767px) {
        .rates-surcharge-summary {
          padding: ${token.paddingMD}px;
        }
        .rates-surcharge-route {
          flex-direction: column;
          align-items: stretch;
          gap: ${token.marginSM}px;
        }
        .rates-surcharge-route__stop--dest {
          align-items: flex-start;
          text-align: left;
        }
        .rates-surcharge-route__connector {
          min-width: 0;
          width: 100%;
        }
        .rates-surcharge-facts {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 575px) {
        .rates-surcharge-facts,
        .rates-surcharge-tiles {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `}</style>
  );
}
