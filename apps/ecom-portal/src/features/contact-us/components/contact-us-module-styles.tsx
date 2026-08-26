// Modified by Sekar Nagarajan (2026-08-25 16:25)
import { theme } from "antd";

/** Token-backed styles for the Contact Us module. */
export function ContactUsModuleStyles() {
  const { token } = theme.useToken();

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
      }
      .contact-page-card.ant-card {
        border-radius: ${token.borderRadiusLG * 2}px;
        box-shadow: ${token.boxShadowTertiary};
        border: none;
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
        padding: ${token.paddingXL}px ${token.paddingXL + 8}px;
      }
      .contact-page__body {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .contact-page__header {
        flex-shrink: 0;
      }
      .contact-page__title {
        margin: 0;
        font-weight: ${token.fontWeightStrong};
      }
      .contact-page__subtitle {
        font-size: ${token.fontSize}px;
      }
      .contact-page__icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
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
        padding-right: ${token.paddingSM}px;
      }
      .contact-page .form-step-footer {
        flex-shrink: 0;
      }
      .contact-form-body {
        padding: ${token.paddingXS}px 0 ${token.paddingMD}px;
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
      }
      .contact-profile-desc.ant-descriptions .ant-descriptions-item-label {
        font-weight: ${token.fontWeightStrong};
        width: 160px;
        background: ${token.colorBgLayout};
      }
      .contact-profile-desc.ant-descriptions .ant-descriptions-item-content {
        background: ${token.colorBgContainer};
      }

      .contact-form__scroll.custom-scroll {
        scrollbar-width: thin;
        scrollbar-color: ${token.colorTextQuaternary} transparent;
      }
      .contact-form__scroll.custom-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .contact-form__scroll.custom-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .contact-form__scroll.custom-scroll::-webkit-scrollbar-thumb {
        background-color: ${token.colorTextQuaternary};
        border-radius: 20px;
      }
      .contact-form__scroll.custom-scroll::-webkit-scrollbar-thumb:hover {
        background-color: ${token.colorTextTertiary};
      }

      .contact-page input:-webkit-autofill,
      .contact-page input:-webkit-autofill:hover,
      .contact-page input:-webkit-autofill:focus,
      .contact-page input:-webkit-autofill:active,
      .contact-page textarea:-webkit-autofill,
      .contact-page textarea:-webkit-autofill:hover,
      .contact-page textarea:-webkit-autofill:focus,
      .contact-page textarea:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
        -webkit-text-fill-color: ${token.colorText} !important;
      }

      @media (max-width: 767px) {
        .contact-page-card > .ant-card-body {
          padding: ${token.paddingMD}px;
        }
      }
    `}</style>
  );
}
