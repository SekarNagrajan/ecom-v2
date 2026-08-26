// Modified by Sekar Nagarajan (2026-08-25 16:42)
import { theme } from "antd";

/** Token-backed styles for the forgot-password panel (inside login drawer). */
export function ForgotPasswordPanelStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .forgot-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }
      .forgot-panel__back {
        margin-bottom: ${token.marginLG}px;
        flex-shrink: 0;
      }
      .forgot-panel__back .ant-btn {
        color: ${token.colorTextSecondary};
        padding: 0;
      }
      .forgot-panel__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        gap: ${token.marginLG}px;
      }
      .forgot-panel__header {
        flex-shrink: 0;
      }
      .forgot-panel__title {
        margin: 0;
        font-weight: ${token.fontWeightStrong};
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .forgot-panel__icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .forgot-panel__subtitle {
        display: block;
        margin-top: ${token.marginXS}px;
        font-size: ${token.fontSize}px;
      }
      .forgot-panel__form {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      .forgot-panel__field {
        margin-bottom: ${token.marginLG}px;
        display: flex;
        flex-direction: column;
      }
      .forgot-panel__field--captcha {
        margin-bottom: ${token.marginLG}px;
      }
      .forgot-panel__submit {
        width: 100%;
      }
      .forgot-panel__success {
        height: 100%;
        justify-content: center;
      }
      .forgot-panel__success-actions {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .forgot-panel__success-actions > .ant-btn.sm-app-button {
        width: 100%;
      }

      .forgot-panel input:-webkit-autofill,
      .forgot-panel input:-webkit-autofill:hover,
      .forgot-panel input:-webkit-autofill:focus,
      .forgot-panel input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
        -webkit-text-fill-color: ${token.colorText} !important;
        caret-color: ${token.colorText} !important;
      }
    `}</style>
  );
}
