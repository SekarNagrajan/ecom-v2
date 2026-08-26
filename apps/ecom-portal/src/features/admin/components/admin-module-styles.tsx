// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function AdminModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .admin-layout {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
        min-width: 0;
        min-height: calc(100vh - 160px);
      }

      /* Compact left rail; right module fills remaining width */
      .admin-workspace {
        display: grid;
        grid-template-columns: clamp(200px, 20%, 240px) minmax(0, 1fr);
        gap: ${token.marginMD}px;
        width: 100%;
        min-width: 0;
        flex: 1;
        min-height: 0;
        align-items: stretch;
      }

      .admin-workspace__nav {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        width: 100%;
        min-width: 0;
        min-height: 0;
        max-height: calc(100vh - 220px);
        overflow-y: auto;
        padding: ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .admin-workspace__nav-title {
        margin: 0;
        padding: 0 ${token.paddingXXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .admin-workspace__nav-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .admin-workspace__nav-item {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid transparent;
        border-radius: ${token.borderRadius}px;
        background: transparent;
        color: ${token.colorText};
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
      }
      .admin-workspace__nav-item:hover {
        background: ${token.colorFillTertiary};
        color: ${token.colorPrimary};
      }
      .admin-workspace__nav-item--active {
        background: ${primaryTint8};
        border-color: ${token.colorPrimaryBorder};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }

      .admin-workspace__content {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        max-height: calc(100vh - 220px);
        overflow-y: auto;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .admin-workspace__content > .admin-panel.ant-card {
        border: none;
        background: transparent;
      }
      .admin-workspace__content > .admin-panel > .ant-card-body {
        padding: 0 !important;
      }

      .admin-panel.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-panel > .ant-card-body {
        padding: ${token.paddingLG}px !important;
      }
      .admin-panel__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginMD}px;
        margin-bottom: ${token.marginLG}px;
        flex-wrap: wrap;
      }
      .admin-panel__header-main {
        flex: 1;
        min-width: 0;
      }
      .admin-panel__title-row {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .admin-panel__title {
        margin: 0 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .admin-panel__subtitle {
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .admin-panel-actions {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
      }
      .admin-panel__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .admin-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: ${token.controlHeightLG * 4}px;
      }
      .admin-loading-center--fill {
        min-height: calc(100vh - 320px);
      }
      .admin-config-form {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
        min-width: 0;
      }
      .admin-config-form input:-webkit-autofill,
      .admin-config-form input:-webkit-autofill:hover,
      .admin-config-form input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
      }
      .admin-config-section__title {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-weight: ${token.fontWeightStrong};
      }
      .admin-config-section__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        width: 100%;
        min-width: 0;
      }
      .admin-config-section__body .ant-form-item {
        margin-bottom: 0;
      }
      .admin-config-toggle.ant-form-item {
        width: 100%;
        margin-bottom: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .admin-config-toggle .ant-form-item-row {
        flex-direction: row !important;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .admin-config-toggle .ant-form-item-label {
        padding: 0 !important;
        flex: 1 1 auto;
        min-width: 0;
      }
      .admin-config-toggle .ant-form-item-label > label {
        height: auto !important;
        white-space: normal;
      }
      .admin-config-toggle .ant-form-item-control {
        flex: 0 0 auto;
        width: auto !important;
        max-width: none;
      }
      .admin-config-toggle .ant-form-item-control-input,
      .admin-config-toggle .ant-form-item-control-input-content {
        min-height: 0;
        display: flex;
        justify-content: flex-end;
      }
      .admin-form-footer.form-step-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        width: 100%;
        padding-top: ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .admin-toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .admin-status-tag.ant-tag,
      .admin-code-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .admin-inner-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-vars-box {
        margin-top: ${token.marginLG}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-preview-box {
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px dashed ${token.colorBorder};
      }
      .admin-preview-box__label {
        display: block;
        margin-bottom: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .admin-banner-thumb {
        object-fit: cover;
        border-radius: ${token.borderRadiusSM}px;
      }
      .admin-route-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .admin-route-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-route-card > .ant-card-body {
        padding: ${token.paddingMD}px !important;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .admin-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .admin-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .admin-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .admin-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .admin-route-port__label {
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
      .admin-route-port__code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.15 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .admin-route-port__code--origin {
        color: ${token.colorPrimary} !important;
      }
      .admin-route-port__code--delivery {
        color: ${token.colorSuccess} !important;
      }
      .admin-route-connector {
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
      .admin-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .admin-route-connector__line {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 120px;
        color: ${token.colorPrimary};
      }
      .admin-route-connector__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .admin-route-connector__dot--origin {
        background: ${token.colorPrimary};
      }
      .admin-route-connector__dot--delivery {
        background: ${token.colorSuccess};
      }
      .admin-route-connector__track {
        flex: 1;
        height: 2px;
        margin: 0 ${token.marginXXS}px;
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorSuccess} 100%);
      }
      .admin-route-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginSM}px ${token.marginLG}px;
      }
      .admin-route-meta__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .admin-route-meta__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .admin-drawer-body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .admin-drawer-actions {
        display: inline-flex;
        justify-content: flex-end;
        width: 100%;
      }
      .admin-stack-full {
        width: 100%;
      }
      .admin-mono-textarea.ant-input,
      .admin-mono-textarea textarea {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }

      @media (max-width: 991px) {
        .admin-workspace {
          grid-template-columns: 1fr;
        }
        .admin-workspace__nav,
        .admin-workspace__content {
          max-height: none;
        }
        .admin-workspace__nav-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: ${token.marginXXS}px;
        }
      }

      @media (max-width: 767px) {
        .admin-layout {
          gap: ${token.marginMD}px;
          min-height: 0;
        }
        .admin-panel > .ant-card-body {
          padding: ${token.paddingMD}px !important;
        }
        .admin-panel-actions {
          width: 100%;
        }
        .admin-panel-actions .sm-app-button,
        .admin-panel-actions .ant-btn {
          width: 100%;
        }
        .admin-form-footer.form-step-footer {
          flex-direction: column-reverse;
        }
        .admin-form-footer.form-step-footer .sm-app-button,
        .admin-form-footer.form-step-footer .ant-btn {
          width: 100%;
        }
        .admin-config-toggle .ant-form-item-row {
          flex-wrap: wrap;
        }
        .admin-workspace__nav-list {
          grid-template-columns: 1fr;
        }
        .admin-route-strip {
          flex-direction: column;
        }
        .admin-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          gap: ${token.marginSM}px;
        }
        .admin-route-connector__line {
          max-width: 80px;
        }
        .admin-route-meta {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}
