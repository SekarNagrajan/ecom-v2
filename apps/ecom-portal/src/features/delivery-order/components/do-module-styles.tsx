// Modified by Sekar Nagarajan (2026-10-19 17:55)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function DoModuleStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .do-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .do-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.do-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.do-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .do-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .do-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .do-search-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .do-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .do-search-form-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .do-search-field {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginXS}px;
        flex: 0 1 260px;
        max-width: 280px;
        min-width: 280px;
        width: 100%;
      }
      .do-search-field > .form-field-label {
        margin-bottom: 0;
      }
      .do-search-field__control {
        position: relative;
        /* Reserve error-line height so sibling fields stay aligned */
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      /* FormDatePicker has no visible label — kill AntD horizontal label column */
      .do-search-form .do-search-form-item.ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .do-search-form .do-search-form-item .ant-form-item-row {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .do-search-form .do-search-form-item .ant-form-item-label {
        display: none !important;
      }
      .do-search-form .do-search-form-item .ant-form-item-control {
        flex: 1 1 auto !important;
        max-width: 100% !important;
        width: 100% !important;
        position: relative;
      }
      .do-search-form .do-search-form-item .ant-form-item-control-input {
        min-height: ${token.controlHeightLG}px;
      }
      .do-search-form .do-search-form-item .ant-form-item-explain {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + ${token.marginXXS}px);
        min-height: ${token.fontSize * token.lineHeight}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .do-search-field .ant-picker {
        width: 100%;
        height: ${token.controlHeightLG}px;
      }
      .do-search-field .ant-picker-input > input {
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }
      .do-search-actions {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        flex: 0 0 auto;
        gap: ${token.marginXS}px;
      }
      .do-search-actions__spacer {
        margin-bottom: 0;
        visibility: hidden;
        user-select: none;
      }
      .do-search-actions .sm-app-button,
      .do-search-actions .ant-btn {
        height: ${token.controlHeightLG}px;
        min-width: 120px;
      }
      .do-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide empty DataView search / view-mode / Filters toolbar card */
      .do-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .do-grid-wrap > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .do-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .do-grid-wrap .do-data-view {
        min-height: calc(100vh - 320px);
      }
      .do-grid-wrap .ag-theme-alpine,
      .do-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      /* Modified by Sekar Nagarajan (2026-10-19 17:45) — DO view drawer: hero, validity, timeline, cards */
      .do-status-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .do-status-tag.ant-tag-success {
        color: ${token.colorSuccess};
        background: ${tokenMix(token.colorSuccess, 8)};
        border-color: ${tokenMix(token.colorSuccess, 28)};
      }
      .do-status-tag.ant-tag-warning {
        color: ${token.colorWarning};
        background: ${tokenMix(token.colorWarning, 10)};
        border-color: ${tokenMix(token.colorWarning, 35)};
      }

      .do-drawer-title {
        display: flex;
        align-items: center;
        gap: ${token.marginMD}px;
        min-width: 0;
      }
      .do-drawer-title__icon {
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
      .do-drawer-title__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
      }
      .do-drawer-title__eyebrow {
        display: block;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${token.colorTextTertiary};
        line-height: 1.2;
      }
      .do-drawer-title__text {
        margin: 0 !important;
        line-height: 1.2 !important;
        color: ${token.colorText} !important;
        font-weight: ${token.fontWeightStrong} !important;
        font-size: ${token.fontSizeHeading4}px !important;
      }
      .do-drawer-title__text .ant-typography-copy {
        color: ${token.colorTextSecondary};
        margin-inline-start: ${token.marginXS}px;
      }
      .do-drawer-title__text .ant-typography-copy:hover {
        color: ${token.colorPrimary};
      }
      .do-drawer-title__meta-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .do-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }
      .do-drawer-title__bl {
        color: ${token.colorInfo};
        font-weight: ${token.fontWeightStrong};
      }
      .do-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingLG}px;
        overflow-y: auto;
        background: ${token.colorBgLayout};
      }
      .do-drawer-footer {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .do-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        align-items: center;
        justify-content: flex-end;
      }
      .do-drawer-actions__group {
        display: inline-flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }

      .do-hero {
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
      .do-hero__route {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(96px, 0.8fr) minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: center;
        min-width: 0;
      }
      .do-route-port {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .do-route-port--delivery {
        align-items: flex-end;
        text-align: right;
      }
      .do-route-port__label {
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
      .do-route-port--delivery .do-route-port__label {
        color: ${token.colorSuccess};
      }
      .do-route-port__code {
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.02em;
        color: ${token.colorText};
        line-height: 1.1;
        word-break: break-word;
      }
      .do-route-port__name {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.4;
        word-break: break-word;
      }
      .do-route-connector {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .do-route-connector__dot {
        flex-shrink: 0;
        width: ${token.marginXS + 2}px;
        height: ${token.marginXS + 2}px;
        border-radius: 50%;
      }
      .do-route-connector__dot--origin {
        background: ${token.colorPrimary};
      }
      .do-route-connector__dot--delivery {
        background: ${token.colorSuccess};
      }
      .do-route-connector__track {
        flex: 1 1 0;
        min-width: ${token.marginSM}px;
        height: 0;
        border-top: ${token.lineWidthBold}px dashed ${tokenMix(token.colorPrimary, 40)};
      }
      .do-route-connector__ship {
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

      .do-hero__timeline {
        list-style: none;
        margin: 0;
        padding: ${token.paddingMD}px 0 0;
        display: flex;
        align-items: center;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .do-timeline__step {
        display: flex;
        align-items: center;
        flex: 1 1 0;
        min-width: 0;
        gap: ${token.marginXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextTertiary};
      }
      .do-timeline__step:last-child {
        flex: 0 0 auto;
      }
      .do-timeline__step:not(:last-child)::after {
        content: "";
        flex: 1 1 auto;
        min-width: ${token.marginSM}px;
        height: ${token.lineWidthBold}px;
        margin: 0 ${token.marginXS}px;
        border-radius: ${token.lineWidthBold}px;
        background: ${token.colorBorderSecondary};
      }
      .do-timeline__step.is-done::after {
        background: ${tokenMix(token.colorSuccess, 45)};
      }
      .do-timeline__dot {
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
      .do-timeline__step.is-done .do-timeline__dot {
        background: ${token.colorSuccess};
        border-color: ${token.colorSuccess};
        color: ${token.colorTextLightSolid};
      }
      .do-timeline__step.is-current .do-timeline__dot {
        background: ${token.colorPrimary};
        border-color: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        box-shadow: 0 0 0 ${token.lineWidthBold * 2}px ${tokenMix(token.colorPrimary, 14)};
      }
      .do-timeline__copy {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.3;
      }
      .do-timeline__name {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        white-space: nowrap;
      }
      .do-timeline__step.is-upcoming .do-timeline__name {
        color: ${token.colorTextSecondary};
      }
      .do-timeline__date {
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }

      .do-drawer-alert.ant-alert {
        border-radius: ${token.borderRadiusLG}px;
      }
      .do-drawer-alert .ant-alert-message {
        color: ${token.colorText};
      }

      .do-section-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .do-drawer-section {
        min-width: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .do-drawer-section__head {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        color: ${token.colorPrimary};
      }
      .do-drawer-section__title {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        font-size: ${token.fontSizeLG}px !important;
      }
      .do-drawer-section__count.ant-tag {
        margin-inline-start: auto;
        margin-inline-end: 0;
        border-radius: ${token.borderRadiusLG * 2}px;
        color: ${token.colorTextSecondary};
        background: ${token.colorFillAlter};
        border-color: ${token.colorBorderSecondary};
        font-variant-numeric: tabular-nums;
      }
      .do-meta-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .do-meta-item {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .do-meta-item .form-field-label {
        margin-bottom: 0;
        color: ${token.colorTextSecondary};
      }
      .do-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .do-meta-item__value--amount {
        font-variant-numeric: tabular-nums;
      }
      .do-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }
      .do-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        color: ${token.colorText};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
      }
      .do-chip--container {
        color: ${token.colorPrimary};
        background: ${tokenMix(token.colorPrimary, 8)};
        border-color: ${token.colorPrimaryBorder};
      }
      .do-empty-note {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
      }
      .do-history {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .do-history__row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        font-size: ${token.fontSizeSM}px;
      }
      .do-history__version.ant-tag {
        margin-inline-end: 0;
        font-variant-numeric: tabular-nums;
      }
      .do-history__by {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${token.colorTextSecondary};
      }
      .do-history__at {
        color: ${token.colorText};
        font-weight: ${token.fontWeightStrong};
        white-space: nowrap;
      }

      @media (max-width: 991px) {
        .do-meta-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 767px) {
        .do-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .do-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .do-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .do-search-field {
          flex: 1 1 100%;
          max-width: none;
          min-width: 0;
        }
        .do-search-actions {
          width: 100%;
        }
        .do-search-actions .sm-app-button,
        .do-search-actions .ant-btn {
          width: 100%;
        }
        .do-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .do-hero {
          padding: ${token.paddingMD}px;
          gap: ${token.marginMD}px;
        }
        .do-hero__route {
          grid-template-columns: minmax(0, 1fr);
        }
        .do-route-port--delivery {
          align-items: flex-start;
          text-align: left;
        }
        .do-hero__timeline {
          flex-direction: column;
          align-items: stretch;
          gap: ${token.marginXS}px;
        }
        .do-timeline__step:not(:last-child)::after {
          display: none;
        }
        .do-timeline__name,
        .do-timeline__date {
          white-space: normal;
        }
        .do-meta-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .do-drawer-section {
          padding: ${token.paddingMD}px;
        }
        .do-history__row {
          grid-template-columns: auto minmax(0, 1fr);
        }
        .do-history__at {
          grid-column: 1 / -1;
          white-space: normal;
        }
        .do-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .do-drawer-actions,
        .do-drawer-actions__group {
          width: 100%;
          justify-content: stretch;
        }
        .do-drawer-actions .sm-app-button,
        .do-drawer-actions .ant-btn {
          flex: 1;
        }
      }
    `}</style>
  );
}
