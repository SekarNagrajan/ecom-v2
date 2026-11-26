// Modified by Sekar Nagarajan (2026-11-26 18:37)
import { theme } from "antd";

/** Token-backed styles for the public login drawer panel. */
export function PublicLoginPanelStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .pub-login-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .pub-login-panel__close.ant-btn {
        position: absolute;
        top: ${token.marginLG}px;
        right: ${token.marginLG}px;
        color: ${token.colorError};
        border: none !important;
        z-index: 1;
      }
      .pub-login-panel__close.ant-btn .app-icon {
        color: ${token.colorError};
      }
      .pub-login-panel__header {
        margin-top: ${token.marginMD}px;
        margin-bottom: ${token.marginLG}px;
      }
      .pub-login-panel__title {
        margin: 0;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: -0.5px;
      }
      .pub-login-panel__subtitle {
        margin-top: ${token.marginXS}px;
        font-size: ${token.fontSize}px;
      }
      .pub-login-panel__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .pub-login-panel__form {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .pub-login-panel__field {
        margin-bottom: ${token.marginLG}px;
        display: flex;
        flex-direction: column;
      }
      .pub-login-panel__field--password {
        margin-bottom: ${token.marginMD}px;
      }
      .pub-login-panel__meta {
        margin-bottom: ${token.marginXL}px;
      }
      .pub-login-panel__forgot {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorPrimary};
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
      }
      .pub-login-panel__forgot:hover {
        color: ${token.colorPrimaryHover};
      }
      .pub-login-panel__alert {
        margin-bottom: ${token.marginLG}px;
      }
      .pub-login-panel__session-expired {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginLG}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorWarningBorder};
        background: ${token.colorWarningBg};
        animation: pub-login-session-in ${token.motionDurationMid} ${token.motionEaseOut};
      }
      .pub-login-panel__session-expired-icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${token.colorBgContainer};
        color: ${token.colorWarning};
      }
      .pub-login-panel__session-expired-icon .app-icon {
        color: ${token.colorWarning};
      }
      .pub-login-panel__session-expired-copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .pub-login-panel__session-expired-title {
        display: block;
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
        color: ${token.colorText};
      }
      .pub-login-panel__session-expired-desc {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        color: ${token.colorTextSecondary};
      }
      @keyframes pub-login-session-in {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .pub-login-panel__session-expired {
          animation: none;
        }
      }
      .pub-login-panel__captcha {
        margin-bottom: ${token.marginLG}px;
        display: flex;
        flex-direction: column;
      }
      .pub-login-panel__captcha-box {
        padding: ${token.padding}px;
        border: 1px dashed ${token.colorBorder};
        border-radius: ${token.borderRadius}px;
        background: ${token.colorBgLayout};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .pub-login-panel__actions {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginSM}px;
      }
      @media (min-width: 992px) {
        .pub-login-panel__actions {
          grid-template-columns: 7fr 3fr;
        }
      }
      .pub-login-panel__actions > .ant-btn.sm-app-button {
        width: 100%;
      }
      .pub-login-panel__register-hint {
        margin-top: ${token.marginSM}px;
        text-align: center;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .pub-login-panel__forgot-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-top: ${token.marginMD}px;
        min-height: 0;
      }

      .pub-login-panel input:-webkit-autofill,
      .pub-login-panel input:-webkit-autofill:hover,
      .pub-login-panel input:-webkit-autofill:focus,
      .pub-login-panel input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
        transition: background-color 50000s ease-in-out 0s !important;
        -webkit-text-fill-color: ${token.colorText} !important;
        caret-color: ${token.colorText} !important;
      }
    `}</style>
  );
}
