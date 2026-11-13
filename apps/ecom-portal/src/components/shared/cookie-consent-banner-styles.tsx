// Modified by Sekar Nagarajan (2026-09-17 11:51)
import { theme } from "antd";

import { tokenMix } from "../../features/theme/utils/token-mix";

/** Token-backed styles for the post-login cookie consent bar. */
export function CookieConsentBannerStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      @keyframes cookie-consent-slide-in {
        from {
          opacity: 0;
          transform: translateY(100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes cookie-consent-slide-out {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(100%);
        }
      }
      .cookie-consent-banner {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1100;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
        pointer-events: none;
        will-change: transform, opacity;
      }
      .cookie-consent-banner--enter {
        animation: cookie-consent-slide-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .cookie-consent-banner--exit {
        animation: cookie-consent-slide-out 0.35s ease-in both;
        pointer-events: none;
      }
      .cookie-consent-banner__panel {
        pointer-events: auto;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        gap: ${token.marginMD}px;
        width: 100%;
        padding: ${token.paddingSM}px ${token.paddingLG}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgElevated};
        box-shadow: ${token.boxShadowSecondary};
      }
      .cookie-consent-banner__icon {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${tokenMix(token.colorPrimary, 10)};
        color: ${token.colorPrimary};
      }
      .cookie-consent-banner__text {
        flex: 0 1 auto;
        min-width: 0;
        max-width: 150ch;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        color: ${token.colorText};
        text-align: left;
        white-space: normal;
      }
      .cookie-consent-banner__accept.ant-btn,
      .cookie-consent-banner__accept.sm-app-button {
        flex-shrink: 0;
        min-width: 96px;
        height: ${token.controlHeightMD}px;
        background: ${token.colorPrimary};
        border-color: ${token.colorPrimary};
      }
      .cookie-consent-banner__accept.ant-btn:hover,
      .cookie-consent-banner__accept.sm-app-button:hover {
        background: ${tokenMix(token.colorPrimary, 85)} !important;
        border-color: ${tokenMix(token.colorPrimary, 85)} !important;
      }
      @media (max-width: 767px) {
        .cookie-consent-banner__panel {
          gap: ${token.marginSM}px;
          padding: ${token.paddingSM}px ${token.paddingMD}px;
        }
        .cookie-consent-banner__text {
          max-width: none;
        }
      }
    `}</style>
  );
}
