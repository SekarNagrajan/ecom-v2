// Modified by Sekar Nagarajan (2026-11-26 18:37)
import { theme } from "antd";

/** Compact token-backed styles for the session-expiry warning modal. */
export function SessionExpiryModalStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .session-expiry-modal.ant-modal {
        max-width: calc(100vw - 32px);
      }
      .session-expiry-modal.ant-modal .ant-modal-content {
        overflow: hidden;
        border-radius: ${token.borderRadiusLG}px;
      }
      .session-expiry-modal.ant-modal .ant-modal-header {
        display: none;
      }
      .session-expiry-modal.ant-modal .ant-modal-body {
        padding: ${token.paddingMD}px ${token.paddingMD}px 0;
      }
      .session-expiry-modal.ant-modal .ant-modal-footer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: ${token.marginSM}px;
        margin: 0;
        padding: ${token.marginMD}px ${token.paddingMD}px ${token.paddingMD}px;
        border-top: none;
      }
      .session-expiry-modal.ant-modal .ant-modal-footer .ant-btn {
        width: 100%;
        min-width: 0;
        margin: 0 !important;
      }
      .session-expiry-modal.ant-modal .ant-modal-footer .ant-btn + .ant-btn {
        margin-inline-start: 0 !important;
      }
      .session-expiry-modal__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .session-expiry-modal__header {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .session-expiry-modal__icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .session-expiry-modal__icon .app-icon {
        color: ${token.colorWarning};
      }
      .session-expiry-modal__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .session-expiry-modal__title {
        margin: 0 !important;
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
        color: ${token.colorText};
      }
      .session-expiry-modal__desc {
        margin: 0 !important;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.4;
        color: ${token.colorTextSecondary};
      }
      .session-expiry-modal__countdown {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        min-height: 40px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorWarningBorder};
        background: ${token.colorWarningBg};
      }
      .session-expiry-modal__countdown-label {
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
      }
      .session-expiry-modal__countdown-value {
        margin: 0;
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.04em;
        line-height: 1.2;
        color: ${token.colorWarning};
      }
    `}</style>
  );
}
