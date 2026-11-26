// Modified by Sekar Nagarajan (2026-09-11 15:56)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for the login OTP verification step. */
export function LoginOtpPanelStyles() {
  const { token } = theme.useToken();
  const cellFill = tokenMix(token.colorPrimary, 8);
  const motionSlow = "300ms";
  const motionFast = "150ms";

  return (
    <style>{`
      .pub-login-otp {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        width: 100%;
      }
      .pub-login-otp__back {
        flex-shrink: 0;
        margin-bottom: ${token.marginMD}px;
      }
      .pub-login-otp__back .ant-btn {
        color: ${token.colorTextSecondary};
        padding-inline: 0;
      }
      .pub-login-otp__back .ant-btn:hover {
        color: ${token.colorPrimary};
      }
      .pub-login-otp__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow-y: auto;
        gap: ${token.marginLG}px;
        padding-right: ${token.paddingXXS}px;
      }

      .pub-login-otp__header {
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .pub-login-otp__icon {
        width: 44px;
        height: 44px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .pub-login-otp__title {
        margin: 0 !important;
        width: 100%;
        font-weight: ${token.fontWeightStrong} !important;
        letter-spacing: -0.3px;
        line-height: 1.25 !important;
        color: ${token.colorText} !important;
      }
      .pub-login-otp__subtitle {
        margin: 0;
        width: 100%;
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSize}px;
        line-height: 1.55;
      }
      .pub-login-otp__email {
        color: ${token.colorText};
        font-weight: ${token.fontWeightStrong};
        word-break: break-all;
      }

      .pub-login-otp__status-row {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .pub-login-otp__timer {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.4;
      }
      .pub-login-otp__timer strong {
        color: ${token.colorText};
        font-variant-numeric: tabular-nums;
        font-weight: ${token.fontWeightStrong};
      }
      .pub-login-otp__timer--expired {
        color: ${token.colorError};
        background: ${token.colorErrorBg};
        border-color: ${token.colorErrorBorder};
      }
      .pub-login-otp__timer--expired strong {
        color: ${token.colorError};
      }

      .pub-login-otp__otp-wrap {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .pub-login-otp__field-label {
        margin-bottom: 0;
      }
      .pub-login-otp__otp-cells {
        width: 100%;
        display: flex;
        justify-content: center;
      }
      .pub-login-otp__otp-wrap--shake .ant-otp {
        animation: pub-login-otp-shake ${motionFast} ease-in-out;
      }
      .pub-login-otp__otp-wrap--error .ant-otp .ant-input {
        border-color: ${token.colorError};
        background: ${token.colorErrorBg};
      }
      .pub-login-otp .ant-otp {
        width: 100%;
        max-width: 360px;
        display: flex !important;
        justify-content: space-between;
        gap: ${token.marginXS}px;
      }
      .pub-login-otp .ant-otp .ant-otp-input-wrapper,
      .pub-login-otp .ant-otp > * {
        flex: 1 1 0;
        min-width: 0;
      }
      .pub-login-otp .ant-otp .ant-input {
        width: 100% !important;
        max-width: none;
        aspect-ratio: 1 / 1;
        height: auto !important;
        min-height: 48px;
        font-size: ${token.fontSizeHeading4}px;
        font-weight: ${token.fontWeightStrong};
        border-radius: ${token.borderRadiusSM}px;
        text-align: center;
        padding: 0;
      }
      .pub-login-otp .ant-otp .ant-input:focus,
      .pub-login-otp .ant-otp .ant-input-focused {
        border-color: ${token.colorPrimary};
        box-shadow: 0 0 0 3px ${tokenMix(token.colorPrimary, 18)};
      }
      .pub-login-otp .ant-otp .ant-input:not(:placeholder-shown) {
        background: ${cellFill};
      }
      .pub-login-otp__error {
        margin: 0;
        text-align: left;
      }
      .pub-login-otp__hint {
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.4;
      }

      .pub-login-otp__actions {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .pub-login-otp__verify.ant-btn {
        width: 100%;
      }
      .pub-login-otp__resend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px ${token.marginXS}px;
        text-align: center;
        width: 100%;
      }
      .pub-login-otp__resend-label {
        margin: 0;
      }
      .pub-login-otp__resend-btn.ant-btn {
        padding-inline: 0;
        height: auto;
        font-weight: ${token.fontWeightStrong};
      }

      .pub-login-otp__demo {
        margin-top: auto;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px dashed ${token.colorWarningBorder};
        background: ${token.colorWarningBg};
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        width: 100%;
      }
      .pub-login-otp__demo-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
      }
      .pub-login-otp__demo-label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorWarning};
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .pub-login-otp__demo-code {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.18em;
        color: ${token.colorText};
        font-variant-numeric: tabular-nums;
      }
      .pub-login-otp__demo-hint {
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.45;
      }

      @keyframes pub-login-otp-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .pub-login-otp__otp-wrap--shake .ant-otp {
          animation: none;
        }
        .pub-login-otp {
          transition: none;
        }
      }

      @media (max-width: 480px) {
        .pub-login-otp .ant-otp {
          max-width: 100%;
          gap: ${token.marginXXS}px;
        }
        .pub-login-otp .ant-otp .ant-input {
          min-height: 42px;
          font-size: ${token.fontSizeHeading5}px;
        }
        .pub-login-otp__demo-top {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .pub-login-otp {
        transition: opacity ${motionSlow} ease-in-out;
      }
    `}</style>
  );
}
