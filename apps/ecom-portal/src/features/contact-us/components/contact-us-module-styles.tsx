// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for the Contact Us module (page + drawer). */
export function ContactUsModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);

  return (
    <style>{`
      .contact-page {
        max-width: 860px;
        margin: 0 auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        
      }
      .contact-page__toolbar {
        flex-shrink: 0;
        margin-bottom: ${token.marginMD}px;
        display: flex;
        justify-content: flex-end;
      }
      .contact-page-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        box-shadow: ${token.boxShadowTertiary};
        border: 1px solid ${token.colorPrimary};
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .contact-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        padding: ${token.paddingLG}px ${token.paddingXL}px !important;
        gap: ${token.marginLG}px;
      }
      .contact-page__body {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }

      .contact-panel-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        width: 100%;
        flex-wrap: wrap;
        flex-shrink: 0;
      }
      .contact-panel-header__main {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
        flex: 1;
      }
      .contact-panel-header__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .contact-panel-header--compact .contact-panel-header__icon {
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
      }
      .contact-panel-header__copy {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .contact-panel-header__title {
        margin: 0 !important;
        line-height: 1.25 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .contact-panel-header__description {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .contact-panel-header--compact {
        padding-right: ${token.paddingLG}px;
      }

      .contact-form {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
      }
      .contact-form__scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: ${token.paddingXXS}px;
      }
      .contact-page .form-step-footer {
        flex-shrink: 0;
        margin: 0;
        padding: ${token.paddingSM}px 0 0;
      }
      .contact-form-body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
        min-width: 0;
        padding: 0;
      }
      .contact-form-body > .ant-row {
        width: 100%;
      }
      .contact-form-body > .ant-row > .ant-col {
        min-width: 0;
      }
      .contact-form-body .ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .contact-form-body .ant-form-item-label {
        padding-bottom: ${token.paddingXXS}px !important;
      }
      .contact-form-body .ant-form-item-label > label {
        height: auto !important;
      }
      .contact-form-body .form-field-label {
        display: inline-block;
      }
      .contact-form-body .ant-input-affix-wrapper,
      .contact-form-body .ant-input,
      .contact-form-body .ant-select,
      .contact-form-body .ant-input-textarea textarea {
        width: 100%;
      }
      .contact-field-full,
      .contact-field-full.ant-select {
        width: 100%;
      }
      .contact-success {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
        overflow: auto;
        padding: ${token.paddingLG}px;
      }
      .contact-profile-desc.ant-descriptions {
        margin: 0;
      }
      .contact-profile-desc.ant-descriptions .ant-descriptions-item-label {
        font-weight: ${token.fontWeightStrong};
        width: 160px;
        background: ${token.colorFillAlter};
      }
      .contact-profile-desc.ant-descriptions .ant-descriptions-item-content {
        background: ${token.colorBgContainer};
      }

      .contact-drawer-header-bar.ant-drawer-header {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .contact-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        padding: ${token.paddingLG}px ${token.paddingXL}px !important;
        overflow-y: auto;
        min-width: 0;
      }
      .contact-drawer-footer-bar.ant-drawer-footer {
        padding: 0 !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .contact-drawer-footer.form-step-footer {
        width: 100%;
        margin: 0;
        padding: ${token.paddingSM}px ${token.paddingXL}px !important;
        border-top: none;
        gap: ${token.marginSM}px;
        background: transparent;
      }
      .contact-drawer-footer .sm-app-button.ant-btn,
      .contact-drawer-footer .ant-btn {
        height: ${token.controlHeight}px;
        margin: 0;
        padding-inline: ${token.paddingMD}px;
      }

      .contact-page input:-webkit-autofill,
      .contact-page input:-webkit-autofill:hover,
      .contact-page input:-webkit-autofill:focus,
      .contact-page input:-webkit-autofill:active,
      .contact-page textarea:-webkit-autofill,
      .contact-page textarea:-webkit-autofill:hover,
      .contact-page textarea:-webkit-autofill:focus,
      .contact-page textarea:-webkit-autofill:active,
      .contact-drawer-body input:-webkit-autofill,
      .contact-drawer-body textarea:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
        -webkit-text-fill-color: ${token.colorText} !important;
      }

      @media (max-width: 767px) {
        .contact-page-card > .ant-card-body {
          padding: ${token.paddingMD}px !important;
          gap: ${token.marginMD}px;
        }
        .contact-page__body {
          gap: ${token.marginMD}px;
        }
        .contact-form-body {
          gap: ${token.marginMD}px;
        }
        .contact-panel-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .contact-panel-header--compact {
          padding-right: 0;
        }
        .contact-drawer-header-bar.ant-drawer-header {
          padding: ${token.paddingMD}px !important;
        }
        .contact-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px ${token.paddingLG}px !important;
          gap: ${token.marginMD}px;
        }
        .contact-drawer-footer.form-step-footer {
          padding: ${token.paddingSM}px ${token.paddingLG}px !important;
        }
        .contact-drawer-footer .sm-app-button,
        .contact-drawer-footer .ant-btn {
          flex: 1;
        }
        .contact-page .form-step-footer .sm-app-button,
        .contact-page .form-step-footer .ant-btn {
          flex: 1;
        }
      }

      @media (min-width: 992px) {
        .contact-drawer-header-bar.ant-drawer-header {
          padding: ${token.paddingLG}px ${token.paddingXL}px !important;
        }
        .contact-drawer-body.custom-scroll {
          padding: ${token.paddingLG}px ${token.paddingXL}px !important;
        }
      }
    `}</style>
  );
}
