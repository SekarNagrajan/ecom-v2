// Modified by Sekar Nagarajan (2026-10-19 18:20)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function CroModuleStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .cro-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .cro-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.cro-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.cro-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .cro-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .cro-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .cro-search-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .cro-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .cro-search-form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .cro-search-field {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginXS}px;
        flex: 0 1 260px;
        max-width: 280px;
        min-width: 280px;
        width: 100%;
      }
      .cro-search-field > .form-field-label {
        margin-bottom: 0;
      }
      .cro-search-field__control {
        position: relative;
        /* Reserve error-line height so sibling fields stay aligned */
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      .cro-search-form .cro-search-form-item.ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-row {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-label {
        display: none !important;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-control {
        flex: 1 1 auto !important;
        max-width: 100% !important;
        width: 100% !important;
        position: relative;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-control-input {
        min-height: ${token.controlHeightLG}px;
      }
      .cro-search-form .cro-search-form-item .ant-form-item-explain {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + ${token.marginXXS}px);
        min-height: ${token.fontSize * token.lineHeight}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .cro-search-field .ant-picker {
        width: 100%;
        height: ${token.controlHeightLG}px;
      }
      .cro-search-field .ant-picker-input > input {
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }
      .cro-search-actions {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        flex: 0 0 auto;
        gap: ${token.marginXS}px;
      }
      .cro-search-actions__spacer {
        margin-bottom: 0;
        visibility: hidden;
        user-select: none;
      }
      .cro-search-actions .sm-app-button,
      .cro-search-actions .ant-btn {
        height: ${token.controlHeightLG}px;
        min-width: 120px;
      }
      .cro-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide empty DataView search / view-mode / Filters toolbar card */
      .cro-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .cro-grid-wrap > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .cro-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .cro-grid-wrap .cro-data-view {
        min-height: calc(100vh - 320px);
      }
      .cro-grid-wrap .ag-theme-alpine,
      .cro-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .cro-data-view .sm-data-view-toolbar,
      .cro-data-view .data-view-toolbar {
        display: none !important;
      }
      /* Modified by Sekar Nagarajan (2026-10-19 18:20) — view drawer: hero, timeline, stacked cards (DO parity) */
      .cro-status-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .cro-status-tag.ant-tag-success {
        color: ${token.colorSuccess};
        background: ${tokenMix(token.colorSuccess, 8)};
        border-color: ${tokenMix(token.colorSuccess, 28)};
      }
      .cro-status-tag.ant-tag-warning {
        color: ${token.colorWarning};
        background: ${tokenMix(token.colorWarning, 10)};
        border-color: ${tokenMix(token.colorWarning, 35)};
      }
      .cro-status-tag.ant-tag-error {
        color: ${token.colorError};
        background: ${tokenMix(token.colorError, 8)};
        border-color: ${tokenMix(token.colorError, 30)};
      }

      .cro-drawer-title {
        display: flex;
        align-items: center;
        gap: ${token.marginMD}px;
        min-width: 0;
      }
      .cro-drawer-title__icon {
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
      .cro-drawer-title__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
      }
      .cro-drawer-title__eyebrow {
        display: block;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${token.colorTextTertiary};
        line-height: 1.2;
      }
      .cro-drawer-title__text {
        margin: 0 !important;
        line-height: 1.2 !important;
        color: ${token.colorText} !important;
        font-weight: ${token.fontWeightStrong} !important;
        font-size: ${token.fontSizeHeading4}px !important;
      }
      .cro-drawer-title__text .ant-typography-copy {
        color: ${token.colorTextSecondary};
        margin-inline-start: ${token.marginXS}px;
      }
      .cro-drawer-title__text .ant-typography-copy:hover {
        color: ${token.colorPrimary};
      }
      .cro-drawer-title__meta-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .cro-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }
      .cro-drawer-title__bl {
        color: ${token.colorInfo};
        font-weight: ${token.fontWeightStrong};
      }
      .cro-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingLG}px;
        overflow-y: auto;
        background: ${token.colorBgLayout};
      }
      .cro-drawer-footer {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .cro-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        align-items: center;
        justify-content: flex-end;
      }

      .cro-hero {
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
      .cro-hero__route {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(96px, 0.8fr) minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: center;
        min-width: 0;
      }
      .cro-route-port {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .cro-route-port--delivery {
        align-items: flex-end;
        text-align: right;
      }
      .cro-route-port__label {
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
      .cro-route-port--delivery .cro-route-port__label {
        color: ${token.colorSuccess};
      }
      .cro-route-port__code {
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.02em;
        color: ${token.colorText};
        line-height: 1.1;
        word-break: break-word;
      }
      .cro-route-port__name {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.4;
        word-break: break-word;
      }
      .cro-route-connector {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .cro-route-connector__dot {
        flex-shrink: 0;
        width: ${token.marginXS + 2}px;
        height: ${token.marginXS + 2}px;
        border-radius: 50%;
      }
      .cro-route-connector__dot--origin {
        background: ${token.colorPrimary};
      }
      .cro-route-connector__dot--delivery {
        background: ${token.colorSuccess};
      }
      .cro-route-connector__track {
        flex: 1 1 0;
        min-width: ${token.marginSM}px;
        height: 0;
        border-top: ${token.lineWidthBold}px dashed ${tokenMix(token.colorPrimary, 40)};
      }
      .cro-route-connector__ship {
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

      .cro-hero__timeline {
        list-style: none;
        margin: 0;
        padding: ${token.paddingMD}px 0 0;
        display: flex;
        align-items: center;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .cro-timeline__step {
        display: flex;
        align-items: center;
        flex: 1 1 0;
        min-width: 0;
        gap: ${token.marginXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextTertiary};
      }
      .cro-timeline__step:last-child {
        flex: 0 0 auto;
      }
      .cro-timeline__step:not(:last-child)::after {
        content: "";
        flex: 1 1 auto;
        min-width: ${token.marginSM}px;
        height: ${token.lineWidthBold}px;
        margin: 0 ${token.marginXS}px;
        border-radius: ${token.lineWidthBold}px;
        background: ${token.colorBorderSecondary};
      }
      .cro-timeline__step.is-done::after {
        background: ${tokenMix(token.colorSuccess, 45)};
      }
      .cro-timeline__dot {
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
      .cro-timeline__step.is-done .cro-timeline__dot {
        background: ${token.colorSuccess};
        border-color: ${token.colorSuccess};
        color: ${token.colorTextLightSolid};
      }
      .cro-timeline__step.is-current .cro-timeline__dot {
        background: ${token.colorPrimary};
        border-color: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        box-shadow: 0 0 0 ${token.lineWidthBold * 2}px ${tokenMix(token.colorPrimary, 14)};
      }
      .cro-timeline__copy {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.3;
      }
      .cro-timeline__name {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        white-space: nowrap;
      }
      .cro-timeline__step.is-upcoming .cro-timeline__name {
        color: ${token.colorTextSecondary};
      }
      .cro-timeline__date {
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }

      .cro-drawer-alert.ant-alert {
        border-radius: ${token.borderRadiusLG}px;
      }
      .cro-drawer-alert .ant-alert-message {
        color: ${token.colorText};
      }

      .cro-section-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .cro-drawer-section {
        min-width: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .cro-drawer-section__head {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        color: ${token.colorPrimary};
      }
      .cro-drawer-section__title {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        font-size: ${token.fontSizeLG}px !important;
      }
      .cro-drawer-section__count.ant-tag {
        margin-inline-start: auto;
        margin-inline-end: 0;
        border-radius: ${token.borderRadiusLG * 2}px;
        color: ${token.colorTextSecondary};
        background: ${token.colorFillAlter};
        border-color: ${token.colorBorderSecondary};
        font-variant-numeric: tabular-nums;
      }
      .cro-meta-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .cro-meta-item {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .cro-meta-item .form-field-label {
        margin-bottom: 0;
        color: ${token.colorTextSecondary};
      }
      .cro-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .cro-table-wrap {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
      }
      .cro-table {
        width: 100%;
      }
      .cro-table .ant-table-thead > tr > th {
        background: ${token.colorFillAlter};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .cro-table .ant-table-tbody > tr > td {
        vertical-align: middle;
      }
      .cro-table .ant-table-summary > tr > td {
        background: ${token.colorFillAlter};
        border-top: ${token.lineWidthBold}px solid ${token.colorBorderSecondary};
      }
      .cro-table .ant-table-placeholder .ant-table-cell {
        padding: ${token.paddingSM}px;
      }
      .cro-container-no {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorPrimary};
        letter-spacing: 0.02em;
        font-variant-numeric: tabular-nums;
      }
      .cro-drawer-alert__list {
        margin: ${token.marginXXS}px 0 0;
        padding-inline-start: ${token.paddingLG}px;
        color: ${token.colorText};
      }
      .cro-meta-item__inline {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }
      .cro-meta-item__hint {
        font-size: ${token.fontSizeSM}px;
      }
      .cro-qty {
        display: inline-flex;
        align-items: baseline;
        gap: ${token.marginXXS}px;
        font-variant-numeric: tabular-nums;
      }
      .cro-qty__released {
        color: ${token.colorSuccess};
      }
      .cro-qty__of {
        color: ${token.colorTextSecondary};
        font-weight: normal;
        font-size: ${token.fontSizeSM}px;
      }

      @media (max-width: 991px) {
        .cro-meta-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 767px) {
        .cro-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .cro-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .cro-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .cro-search-field {
          flex: 1 1 100%;
          max-width: none;
          min-width: 0;
        }
        .cro-search-actions {
          width: 100%;
        }
        .cro-search-actions .sm-app-button,
        .cro-search-actions .ant-btn {
          width: 100%;
        }
        .cro-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .cro-hero {
          padding: ${token.paddingMD}px;
          gap: ${token.marginMD}px;
        }
        .cro-hero__route {
          grid-template-columns: minmax(0, 1fr);
        }
        .cro-route-port--delivery {
          align-items: flex-start;
          text-align: left;
        }
        .cro-hero__timeline {
          flex-direction: column;
          align-items: stretch;
          gap: ${token.marginXS}px;
        }
        .cro-timeline__step:not(:last-child)::after {
          display: none;
        }
        .cro-timeline__name,
        .cro-timeline__date {
          white-space: normal;
        }
        .cro-meta-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .cro-drawer-section {
          padding: ${token.paddingMD}px;
        }
        .cro-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .cro-drawer-actions {
          width: 100%;
          justify-content: stretch;
        }
        .cro-drawer-actions .sm-app-button,
        .cro-drawer-actions .ant-btn {
          flex: 1;
        }
      }
    `}</style>
  );
}
