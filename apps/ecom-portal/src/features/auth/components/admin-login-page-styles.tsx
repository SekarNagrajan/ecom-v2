// Modified by Sekar Nagarajan (2026-08-27 12:23)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles — centered login card (no side panel). */
export function AdminLoginPageStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .admin-login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${token.paddingLG}px;
        background:
          radial-gradient(
            ellipse at top,
            ${tokenMix(token.colorPrimary, 12)} 0%,
            transparent 55%
          ),
          ${token.colorBgLayout};
      }

      .admin-login-page__card {
        width: 100%;
        max-width: 440px;
        border: none;
        box-shadow: ${token.boxShadowSecondary};
      }

      .admin-login-page__card .ant-card-body {
        padding: ${token.paddingXL}px;
      }

      .admin-login-page__switcher {
        margin-bottom: ${token.marginLG}px;
      }

      .admin-login-page__switcher-label {
        display: block;
        text-align: center;
        margin-bottom: ${token.marginXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }

      .admin-login-page__header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginLG}px;
      }

      .admin-login-page__icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }

      .admin-login-page__title {
        margin: 0 !important;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: -0.4px;
      }

      .admin-login-page__subtitle {
        margin: 0;
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }

      .admin-login-page__default-customer {
        width: 100%;
        margin-bottom: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorInfoBg};
        border: 1px solid ${token.colorInfoBorder};
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        text-align: left;
      }

      .admin-login-page__default-customer-title {
        display: block;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        font-size: ${token.fontSizeSM}px;
      }

      .admin-login-page__default-customer-value {
        display: block;
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
      }

      .admin-login-page__alert {
        margin-bottom: ${token.marginMD}px;
      }

      .admin-login-page__form {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }

      .admin-login-page__field {
        display: flex;
        flex-direction: column;
      }

      .admin-login-page__actions {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        margin-top: ${token.marginXS}px;
      }

      .admin-login-page__hint {
        text-align: center;
        margin-top: ${token.marginMD}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextTertiary};
      }

      .admin-login-page__home {
        margin-top: ${token.marginLG}px;
        text-align: center;
      }
        .admin-login-page__home .ant-btn:hover{
         background-color: ${token.colorPrimaryBg};
         color: ${token.colorPrimary};
         border-color: ${token.colorPrimary};
         border-radius: ${token.borderRadiusLG}px;
         transition: all 0.3s ease;
        
        }

      .admin-login-page__home .ant-btn {
        color: ${token.colorTextSecondary};
      }

      .admin-login-page input:-webkit-autofill,
      .admin-login-page input:-webkit-autofill:hover,
      .admin-login-page input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
      }
    `}</style>
  );
}
