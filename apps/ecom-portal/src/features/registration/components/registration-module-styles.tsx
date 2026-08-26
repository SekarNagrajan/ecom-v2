// Modified by Sekar Nagarajan (2026-08-25 16:20)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for the public registration wizard. */
export function RegistrationModuleStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .reg-page {
        max-width: 1000px;
        margin: 0 auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      .reg-page__toolbar {
        flex-shrink: 0;
        margin-bottom: ${token.marginMD}px;
      }
      .reg-page-card.ant-card {
        border-radius: ${token.borderRadiusLG * 2}px;
        box-shadow: ${token.boxShadowTertiary};
        border: none;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .reg-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        padding: ${token.paddingLG}px ${token.paddingXL + 8}px;
      }
      .reg-page__title {
        margin: 0;
        font-weight: ${token.fontWeightStrong};
      }
      .reg-page__body {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .reg-page__header {
        flex-shrink: 0;
      }
      .reg-page__subtitle {
        font-size: ${token.fontSizeLG}px;
      }
      .reg-page .pipeline-steps {
        flex-shrink: 0;
      }
      .reg-form {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
      }
      .reg-form__scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        background: ${token.colorBgContainer};
        border-radius: ${token.borderRadiusLG}px;
        padding-right: ${token.paddingSM}px;
      }
      .reg-page .form-step-footer {
        flex-shrink: 0;
      }
      .reg-step-body {
        padding: ${token.paddingLG}px 0;
      }
      .reg-field-full,
      .reg-field-full.ant-select,
      .reg-field-full.ant-auto-complete {
        width: 100%;
      }
      .reg-phone-code {
        width: 80px;
        flex-shrink: 0;
      }
      .reg-phone-number {
        flex: 1;
        min-width: 0;
      }
      .reg-success {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
        overflow: auto;
      }
      .reg-terms-box {
        background: ${token.colorFillAlter};
        padding: ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        max-height: 300px;
        overflow-y: auto;
      }
      .reg-terms-box__para {
        display: block;
        margin-bottom: ${token.marginSM}px;
      }
      .reg-upload-dragger.ant-upload-wrapper .ant-upload-drag {
        padding: ${token.paddingXL}px 0;
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
      }
      .reg-upload-hint {
        color: ${token.colorTextSecondary};
      }

      .pipeline-steps .ant-steps-item-title {
        font-size: ${token.fontSizeSM}px !important;
        margin-top: ${token.marginXS}px !important;
      }
      .pipeline-steps .ant-steps-item-tail {
        top: 22px !important;
        padding: 0 ${token.paddingMD}px !important;
      }
      .pipeline-steps .ant-steps-item-tail::after {
        height: 3px !important;
        background-color: ${token.colorBorderSecondary} !important;
        border-radius: ${token.borderRadiusSM}px;
      }
      .pipeline-steps .ant-steps-item-finish .ant-steps-item-tail::after {
        background-color: ${token.colorSuccess} !important;
      }
      .reg-pipeline-title {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
      }
      .reg-pipeline-title--active {
        color: ${token.colorText};
      }
      .reg-pipeline-icon {
        width: 46px;
        height: 46px;
        min-width: 46px;
        min-height: 46px;
        border-radius: 50%;
        background: ${token.colorFillAlter};
        color: ${token.colorTextTertiary};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 2px solid ${token.colorBorderSecondary};
        margin: 0 auto;
        transition: all 0.3s ease-in-out;
        cursor: pointer;
      }
      .reg-pipeline-icon--current {
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        border: 4px solid ${tokenMix(token.colorPrimary, 25)};
        box-shadow: 0 4px 12px ${tokenMix(token.colorPrimary, 20)};
      }
      .reg-pipeline-icon--done {
        background: ${token.colorSuccess};
        color: ${token.colorTextLightSolid};
        border: none;
      }

      @keyframes pipeline-stage-current-pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 ${tokenMix(token.colorPrimary, 45)};
        }
        50% {
          box-shadow: 0 0 0 6px ${tokenMix(token.colorPrimary, 0)};
        }
      }
      .pipeline-stage-current-badge {
        animation: pipeline-stage-current-pulse 1.5s ease-in-out infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .pipeline-stage-current-badge {
          animation: none;
        }
      }

      /* House custom-scroll — 6px thin thumb (agenct.md) */
      .reg-form__scroll.custom-scroll {
        scrollbar-width: thin;
        scrollbar-color: ${token.colorTextQuaternary} transparent;
      }
      .reg-form__scroll.custom-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .reg-form__scroll.custom-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .reg-form__scroll.custom-scroll::-webkit-scrollbar-thumb {
        background-color: ${token.colorTextQuaternary};
        border-radius: 20px;
      }
      .reg-form__scroll.custom-scroll::-webkit-scrollbar-thumb:hover {
        background-color: ${token.colorTextTertiary};
      }
      .reg-terms-box.custom-scroll {
        scrollbar-width: thin;
        scrollbar-color: ${token.colorTextQuaternary} transparent;
      }
      .reg-terms-box.custom-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .reg-terms-box.custom-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .reg-terms-box.custom-scroll::-webkit-scrollbar-thumb {
        background-color: ${token.colorTextQuaternary};
        border-radius: 20px;
      }
      .reg-terms-box.custom-scroll::-webkit-scrollbar-thumb:hover {
        background-color: ${token.colorTextTertiary};
      }

      .reg-page input:-webkit-autofill,
      .reg-page input:-webkit-autofill:hover,
      .reg-page input:-webkit-autofill:focus,
      .reg-page input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
        -webkit-text-fill-color: ${token.colorText} !important;
      }

      @media (max-width: 767px) {
        .reg-page-card > .ant-card-body {
          padding: ${token.paddingMD}px;
        }
      }
    `}</style>
  );
}
