// Modified by Sekar Nagarajan (2026-10-19 18:20)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function ArrivalNoticeModuleStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .arn-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .arn-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.arn-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.arn-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .arn-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .arn-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .arn-search-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .arn-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .arn-search-form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .arn-search-field {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginXS}px;
        flex: 0 1 260px;
        max-width: 280px;
        min-width: 280px;
        width: 100%;
      }
      .arn-search-field > .form-field-label {
        margin-bottom: 0;
      }
      .arn-search-field__control {
        position: relative;
        /* Reserve error-line height so sibling fields stay aligned */
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      .arn-search-form .arn-search-form-item.ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-row {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-label {
        display: none !important;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-control {
        flex: 1 1 auto !important;
        max-width: 100% !important;
        width: 100% !important;
        position: relative;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-control-input {
        min-height: ${token.controlHeightLG}px;
      }
      .arn-search-form .arn-search-form-item .ant-form-item-explain {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + ${token.marginXXS}px);
        min-height: ${token.fontSize * token.lineHeight}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .arn-search-field .ant-picker {
        width: 100%;
        height: ${token.controlHeightLG}px;
      }
      .arn-search-field .ant-picker-input > input {
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }
      .arn-search-actions {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        flex: 0 0 auto;
        gap: ${token.marginXS}px;
      }
      .arn-search-actions__spacer {
        margin-bottom: 0;
        visibility: hidden;
        user-select: none;
      }
      .arn-search-actions .sm-app-button,
      .arn-search-actions .ant-btn {
        height: ${token.controlHeightLG}px;
        min-width: 120px;
      }
      .arn-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide empty DataView search / view-mode / Filters toolbar card */
      .arn-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .arn-grid-wrap > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .arn-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .arn-grid-wrap .arn-data-view {
        min-height: calc(100vh - 320px);
      }
      .arn-grid-wrap .ag-theme-alpine,
      .arn-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .arn-data-view .sm-data-view-toolbar,
      .arn-data-view .data-view-toolbar {
        display: none !important;
      }
      /* Modified by Sekar Nagarajan (2026-10-19 18:20) — view drawer: hero, timeline, stacked cards (DO parity) */
      .arn-status-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .arn-status-tag.ant-tag-success {
        color: ${token.colorSuccess};
        background: ${tokenMix(token.colorSuccess, 8)};
        border-color: ${tokenMix(token.colorSuccess, 28)};
      }
      .arn-status-tag.ant-tag-warning {
        color: ${token.colorWarning};
        background: ${tokenMix(token.colorWarning, 10)};
        border-color: ${tokenMix(token.colorWarning, 35)};
      }
      .arn-status-tag.ant-tag-error {
        color: ${token.colorError};
        background: ${tokenMix(token.colorError, 8)};
        border-color: ${tokenMix(token.colorError, 30)};
      }

      .arn-drawer-title {
        display: flex;
        align-items: center;
        gap: ${token.marginMD}px;
        min-width: 0;
      }
      .arn-drawer-title__icon {
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorPrimaryBg};
        border: 1px solid ${token.colorPrimaryBorder};
        color: ${token.colorPrimary};
      }
      .arn-drawer-title__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
      }
      .arn-drawer-title__eyebrow {
        display: block;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${token.colorTextTertiary};
        line-height: 1.2;
      }
      .arn-drawer-title__text {
        margin: 0 !important;
        line-height: 1.2 !important;
        color: ${token.colorText} !important;
        font-weight: ${token.fontWeightStrong} !important;
        font-size: ${token.fontSizeHeading4}px !important;
      }
      .arn-drawer-title__text .ant-typography-copy {
        color: ${token.colorTextSecondary};
        margin-inline-start: ${token.marginXS}px;
      }
      .arn-drawer-title__text .ant-typography-copy:hover {
        color: ${token.colorPrimary};
      }
      .arn-drawer-title__meta-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .arn-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }
      .arn-drawer-title__bl {
        color: ${token.colorInfo};
        font-weight: ${token.fontWeightStrong};
      }
      .arn-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingLG}px;
        overflow-y: auto;
        background: ${token.colorBgLayout};
      }
      .arn-drawer-footer {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .arn-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        align-items: center;
        justify-content: flex-end;
      }

      .arn-hero {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG + 2}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: linear-gradient(
          180deg,
          ${tokenMix(token.colorPrimary, 8)} 0%,
          ${token.colorBgContainer} 100%
        );
      }
      .arn-hero__route {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(96px, 0.8fr) minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: center;
        min-width: 0;
      }
      .arn-route-port {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .arn-route-port--discharge {
        align-items: flex-end;
        text-align: right;
      }
      .arn-route-port__label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorPrimary};
        line-height: 1.2;
      }
      .arn-route-port--discharge .arn-route-port__label {
        color: ${token.colorSuccess};
      }
      .arn-route-port__code {
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.02em;
        color: ${token.colorText};
        line-height: 1.1;
        word-break: break-word;
      }
      .arn-route-port__name {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.4;
        word-break: break-word;
      }
      .arn-route-connector {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .arn-route-connector__dot {
        flex-shrink: 0;
        width: ${token.marginXS + 2}px;
        height: ${token.marginXS + 2}px;
        border-radius: 50%;
      }
      .arn-route-connector__dot--vessel {
        background: ${token.colorPrimary};
      }
      .arn-route-connector__dot--discharge {
        background: ${token.colorSuccess};
      }
      .arn-route-connector__track {
        flex: 1 1 0;
        min-width: ${token.marginSM}px;
        height: 0;
        border-top: ${token.lineWidthBold}px dashed ${tokenMix(token.colorPrimary, 40)};
      }
      .arn-route-connector__ship {
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

      .arn-hero__timeline {
        list-style: none;
        margin: 0;
        padding: ${token.paddingMD}px 0 0;
        display: flex;
        align-items: center;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .arn-timeline__step {
        display: flex;
        align-items: center;
        flex: 1 1 0;
        min-width: 0;
        gap: ${token.marginXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextTertiary};
      }
      .arn-timeline__step:last-child {
        flex: 0 0 auto;
      }
      .arn-timeline__step:not(:last-child)::after {
        content: "";
        flex: 1 1 auto;
        min-width: ${token.marginSM}px;
        height: ${token.lineWidthBold}px;
        margin: 0 ${token.marginXS}px;
        border-radius: ${token.lineWidthBold}px;
        background: ${token.colorBorderSecondary};
      }
      .arn-timeline__step.is-done::after {
        background: ${tokenMix(token.colorSuccess, 45)};
      }
      .arn-timeline__dot {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: ${token.controlHeightSM - 2}px;
        height: ${token.controlHeightSM - 2}px;
        border-radius: 50%;
        border: ${token.lineWidth}px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        color: ${token.colorTextTertiary};
        font-size: ${token.fontSizeSM - 1}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1;
      }
      .arn-timeline__step.is-done .arn-timeline__dot {
        background: ${token.colorSuccess};
        border-color: ${token.colorSuccess};
        color: ${token.colorTextLightSolid};
      }
      .arn-timeline__step.is-current .arn-timeline__dot {
        background: ${token.colorPrimary};
        border-color: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        box-shadow: 0 0 0 ${token.lineWidthBold * 2}px ${tokenMix(token.colorPrimary, 14)};
      }
      .arn-timeline__copy {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.3;
      }
      .arn-timeline__name {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        white-space: nowrap;
      }
      .arn-timeline__step.is-upcoming .arn-timeline__name {
        color: ${token.colorTextSecondary};
      }
      .arn-timeline__date {
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }

      .arn-drawer-alert.ant-alert {
        border-radius: ${token.borderRadiusLG}px;
      }
      .arn-drawer-alert .ant-alert-message {
        color: ${token.colorText};
      }

      .arn-section-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .arn-drawer-section {
        min-width: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .arn-drawer-section__head {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        color: ${token.colorPrimary};
      }
      .arn-drawer-section__title {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        font-size: ${token.fontSizeLG}px !important;
      }
      .arn-drawer-section__count.ant-tag {
        margin-inline-start: auto;
        margin-inline-end: 0;
        border-radius: ${token.borderRadiusLG * 2}px;
        color: ${token.colorTextSecondary};
        background: ${token.colorFillAlter};
        border-color: ${token.colorBorderSecondary};
        font-variant-numeric: tabular-nums;
      }
      .arn-meta-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .arn-meta-item {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .arn-meta-item .form-field-label {
        margin-bottom: 0;
        color: ${token.colorTextSecondary};
      }
      .arn-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .arn-table-wrap {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
      }
      .arn-table {
        width: 100%;
      }
      .arn-table .ant-table-thead > tr > th {
        background: ${token.colorFillAlter};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .arn-table .ant-table-tbody > tr > td {
        vertical-align: middle;
      }
      .arn-table .ant-table-summary > tr > td {
        background: ${token.colorFillAlter};
        border-top: ${token.lineWidthBold}px solid ${token.colorBorderSecondary};
      }
      .arn-table .ant-table-placeholder .ant-table-cell {
        padding: ${token.paddingSM}px;
      }
      .arn-container-no {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorPrimary};
        letter-spacing: 0.02em;
        font-variant-numeric: tabular-nums;
      }
      .arn-amount {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .arn-amount--due {
        color: ${token.colorWarning};
      }
      .arn-charge-code.ant-tag {
        margin-inline-end: 0;
        font-weight: ${token.fontWeightStrong};
      }

      @media (max-width: 991px) {
        .arn-meta-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 767px) {
        .arn-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .arn-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .arn-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .arn-search-field {
          flex: 1 1 100%;
          max-width: none;
          min-width: 0;
        }
        .arn-search-actions {
          width: 100%;
        }
        .arn-search-actions .sm-app-button,
        .arn-search-actions .ant-btn {
          width: 100%;
        }
        .arn-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .arn-hero {
          padding: ${token.paddingMD}px;
          gap: ${token.marginMD}px;
        }
        .arn-hero__route {
          grid-template-columns: minmax(0, 1fr);
        }
        .arn-route-port--discharge {
          align-items: flex-start;
          text-align: left;
        }
        .arn-hero__timeline {
          flex-direction: column;
          align-items: stretch;
          gap: ${token.marginXS}px;
        }
        .arn-timeline__step:not(:last-child)::after {
          display: none;
        }
        .arn-timeline__name,
        .arn-timeline__date {
          white-space: normal;
        }
        .arn-meta-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .arn-drawer-section {
          padding: ${token.paddingMD}px;
        }
        .arn-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .arn-drawer-actions {
          width: 100%;
          justify-content: stretch;
        }
        .arn-drawer-actions .sm-app-button,
        .arn-drawer-actions .ant-btn {
          flex: 1;
        }
      }
    `}</style>
  );
}
