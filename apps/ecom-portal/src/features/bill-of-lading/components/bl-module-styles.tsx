// Modified by Sekar Nagarajan (2026-08-26 14:17)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function BlModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .bl-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
      }
      .bl-loading-center--fill {
        min-height: calc(100vh - 220px);
      }

      .feature-page-card.bl-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.bl-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .bl-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .bl-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .bl-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingLG}px ${token.marginMD}px;
      }
      .bl-route-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${primaryTint8};
      }
      .bl-route-strip__arrow {
        color: ${token.colorTextSecondary};
      }
      .bl-grid-wrap {
        flex: 1;
        min-height: calc(100vh - 280px);
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide DataView search / view-mode / Filters & Sort toolbar card */
      .bl-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none;
      }
      .bl-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .bl-grid-wrap .bl-data-view {
        min-height: calc(100vh - 280px);
      }
      .bl-grid-wrap .ag-theme-alpine,
      .bl-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: calc(100vh - 280px);
      }
      .bl-batch-page-body {
        flex: 1;
        min-height: 0;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
      }
      .bl-charges-panel {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .bl-terms-body {
        max-height: 240px;
        overflow-y: auto;
      }
      .bl-batch-print-intro {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
      }
      .bl-batch-print-table {
        min-height: 240px;
      }
      .bl-drawer-body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        max-height: calc(100vh - 180px);
        overflow-y: auto;
        padding-right: ${token.paddingXXS}px;
      }
      .bl-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px;
      }
      .bl-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .bl-drawer-title__text {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .bl-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .bl-drawer-title__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .bl-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .bl-view-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .bl-view-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-view-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .bl-view-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .bl-view-route-port__label {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .bl-view-route-port__code {
        margin: 0 !important;
        word-break: break-word;
      }
      .bl-view-route-connector {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 88px;
        padding-top: ${token.paddingLG}px;
      }
      .bl-view-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }
      .bl-view-route-connector__line {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .bl-view-route-connector__track {
        flex: 1;
        height: ${token.lineWidth}px;
        background: ${token.colorBorder};
      }
      .bl-summary-chips {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .bl-summary-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-summary-chip__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .bl-summary-chip__value {
        display: block;
        font-weight: ${token.fontWeightStrong};
      }
      .bl-section-title {
        margin: 0 !important;
      }
      .bl-panel > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }
      .bl-drawer-loading-placeholder {
        min-height: 160px;
      }
      .bl-manifest-drawer-title {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .bl-manifest-drawer-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .bl-drawer-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .bl-manifest-empty {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .bl-manifest-route {
        display: flex;
        align-items: stretch;
        margin-bottom: ${token.marginMD}px;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .bl-manifest-route__port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-manifest-route__port--load {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .bl-manifest-route__port--discharge {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .bl-manifest-route__label {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: ${token.marginXXS}px;
      }
      .bl-manifest-route__code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.15 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .bl-manifest-route__code--load {
        color: ${token.colorPrimary} !important;
      }
      .bl-manifest-route__code--discharge {
        color: ${token.colorSuccess} !important;
      }
      .bl-manifest-route__name {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .bl-manifest-route__connector {
        flex: 0 0 auto;
        min-width: 96px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        text-align: center;
        padding: ${token.paddingXS}px 0;
      }
      .bl-manifest-route__connector-label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .bl-manifest-route__line {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 120px;
        color: ${token.colorPrimary};
      }
      .bl-manifest-route__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .bl-manifest-route__dot--load {
        background: ${token.colorPrimary};
      }
      .bl-manifest-route__dot--discharge {
        background: ${token.colorSuccess};
      }
      .bl-manifest-route__track {
        flex: 1;
        height: 2px;
        margin: 0 ${token.marginXXS}px;
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorSuccess} 100%);
      }
      .bl-manifest-status {
        display: flex;
        align-items: center;
        margin-bottom: ${token.marginMD}px;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .bl-manifest-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px;
      }
      .bl-manifest-meta__item {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .bl-manifest-meta__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadius}px;
        background: ${primaryTint8};
        flex-shrink: 0;
      }
      .bl-manifest-meta__content {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .bl-manifest-meta__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .bl-manifest-meta__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .bl-manifest-remarks {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .bl-manifest-remarks__header {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .bl-status-tag.ant-tag {
        border-radius: ${token.borderRadiusSM}px;
      }
      .bl-view-timeline {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px 0;
      }
      .bl-view-timeline__step {
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        font-size: ${token.fontSizeSM}px;
      }
      .bl-view-timeline__step.is-done {
        border-color: ${token.colorSuccess};
        background: ${successTint8};
        color: ${token.colorSuccess};
      }
      .bl-view-timeline__step.is-current {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .bl-party-block {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .bl-container-block {
        margin-bottom: ${token.marginMD}px;
      }
      .bl-container-block__header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: ${token.marginXS}px;
        margin-bottom: ${token.marginSM}px;
      }
      .bl-charges-total-row {
        font-weight: 600;
        background: ${token.colorFillAlter};
      }
      .bl-wizard-loading-placeholder {
        min-height: 280px;
      }
      .bl-wizard-spin-wrap,
      .bl-wizard-spin-wrap > .ant-spin-container {
        height: 100%;
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .wizard-step-content .form-step-layout {
        flex: 1;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }
      @media (max-width: 767px) {
        .bl-toolbar {
          flex-direction: column;
          align-items: stretch;
        }
        .bl-route-strip {
          margin-left: ${token.paddingSM}px;
          margin-right: ${token.paddingSM}px;
        }
        .bl-view-route-strip {
          flex-direction: column;
        }
        .bl-view-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          padding-top: 0;
        }
        .bl-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .bl-drawer-actions {
          width: 100%;
        }
        .bl-drawer-actions .sm-app-button {
          flex: 1;
        }
        .bl-grid-wrap,
        .bl-batch-page-body {
          padding-left: ${token.paddingSM}px;
          padding-right: ${token.paddingSM}px;
        }
        .bl-page-header {
          padding-left: ${token.paddingSM}px;
          padding-right: ${token.paddingSM}px;
        }
        .bl-drawer-route {
          flex-direction: column;
          align-items: stretch;
        }
        .bl-manifest-route {
          flex-direction: column;
          align-items: stretch;
        }
        .bl-manifest-meta {
          grid-template-columns: 1fr;
        }
        .bl-manifest-drawer-footer {
          flex-wrap: wrap;
        }
      }
    `}</style>
  );
}
