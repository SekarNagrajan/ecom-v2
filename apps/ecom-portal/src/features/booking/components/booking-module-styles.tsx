// Modified by Sekar Nagarajan (2026-08-26 11:51)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Booking module layout classes (agenct.md). */
export function BookingModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .booking-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
      }

      .booking-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .booking-drawer-title__text {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .booking-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: 2px;
      }
      .booking-drawer-title__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .booking-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .booking-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }

      .booking-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .booking-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .booking-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .booking-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .booking-route-port__label {
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
      .booking-route-port__code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.15 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .booking-route-port__code--origin {
        color: ${token.colorPrimary} !important;
      }
      .booking-route-port__code--delivery {
        color: ${token.colorSuccess} !important;
      }
      .booking-route-connector {
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
      .booking-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .booking-route-connector__line {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 120px;
        color: ${token.colorPrimary};
      }
      .booking-route-connector__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .booking-route-connector__dot--origin {
        background: ${token.colorPrimary};
      }
      .booking-route-connector__dot--delivery {
        background: ${token.colorSuccess};
      }
      .booking-route-connector__track {
        flex: 1;
        height: 2px;
        margin: 0 ${token.marginXXS}px;
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${token.colorSuccess} 100%);
      }

      .booking-summary-chips {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .booking-summary-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        font-size: ${token.fontSizeSM}px;
      }
      .booking-summary-chip__icon {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .booking-summary-chip__icon--ref {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .booking-summary-chip__icon--date {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .booking-summary-chip__icon--teu {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .booking-summary-chip__icon--dg {
        background: ${token.colorErrorBg};
        color: ${token.colorError};
      }
      .booking-summary-chip__label {
        display: block;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .booking-summary-chip__value {
        display: block;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.2;
      }

      .booking-panel.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
      }
      .booking-panel > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .booking-panel__title {
        margin: 0 !important;
        font-size: ${token.fontSizeLG}px !important;
      }
      .booking-section-title {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .booking-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .booking-meta-grid--3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .booking-meta-item__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .booking-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .booking-grid-wrap {
        height: 280px;
        min-height: 220px;
      }
      .booking-disclaimer {
        margin-top: ${token.marginSM}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .booking-list-grid {
        height: 500px;
        min-height: 320px;
      }
      .booking-list-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
      }
      .booking-list-card > .ant-card-body {
        padding: 0 !important;
      }

      /* Origin / Delivery / Date + swap — CSS grid keeps inputs + swap on one row */
      .booking-port-field {
        width: 100%;
      }
      .booking-port-field.ant-select,
      .booking-port-field.ant-auto-complete,
      .booking-port-field.ant-picker {
        width: 100%;
      }
      .booking-port-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) ${token.controlHeightLG}px minmax(0, 1fr) minmax(0, 1fr);
        grid-template-areas:
          "origin-label . delivery-label date-label"
          "origin-field swap delivery-field date-field"
          "origin-error . delivery-error date-error";
        column-gap: ${token.marginMD}px;
        row-gap: 0;
        align-items: center;
        margin-bottom: ${token.marginLG}px;
      }
      .booking-port-row__origin-label { grid-area: origin-label; margin-bottom: ${token.marginSM}px; }
      .booking-port-row__origin-field { grid-area: origin-field; }
      .booking-port-row__origin-error { grid-area: origin-error; min-height: ${token.fontSizeSM * token.lineHeight}px; }
      .booking-port-row__delivery-label { grid-area: delivery-label; margin-bottom: ${token.marginSM}px; }
      .booking-port-row__delivery-field { grid-area: delivery-field; }
      .booking-port-row__delivery-error { grid-area: delivery-error; min-height: ${token.fontSizeSM * token.lineHeight}px; }
      .booking-port-row__date-label { grid-area: date-label; margin-bottom: ${token.marginSM}px; }
      .booking-port-row__date-field { grid-area: date-field; }
      .booking-port-row__date-error { grid-area: date-error; min-height: ${token.fontSizeSM * token.lineHeight}px; }
      .booking-port-row__swap {
        grid-area: swap;
        display: flex;
        align-items: center;
        justify-content: center;
        height: ${token.controlHeightLG}px;
        width: ${token.controlHeightLG}px;
        justify-self: center;
      }
      .booking-port-row__swap .ant-btn {
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        min-width: ${token.controlHeightLG}px;
      }
      .booking-template-select-btn.ant-btn-primary {
        background: ${token.colorWarning};
        border-color: ${token.colorWarning};
      }
      .booking-template-select-btn.ant-btn-primary:hover {
        opacity: 0.9;
      }

      @media (max-width: 991px) {
        .booking-meta-grid--3 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 767px) {
        .booking-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .booking-panel > .ant-card-body {
          padding: ${token.paddingMD}px !important;
        }
        .booking-route-strip {
          flex-direction: column;
        }
        .booking-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          gap: ${token.marginSM}px;
        }
        .booking-route-connector__line {
          max-width: 80px;
        }
        .booking-meta-grid,
        .booking-meta-grid--3 {
          grid-template-columns: 1fr;
        }
        .booking-drawer-actions {
          width: 100%;
        }
        .booking-drawer-actions .sm-app-button {
          flex: 1;
        }
        .booking-port-row {
          grid-template-columns: 1fr;
          grid-template-areas:
            "origin-label"
            "origin-field"
            "origin-error"
            "swap"
            "delivery-label"
            "delivery-field"
            "delivery-error"
            "date-label"
            "date-field"
            "date-error";
          row-gap: ${token.marginXXS}px;
        }
        .booking-port-row__swap {
          margin: ${token.marginXS}px 0;
        }
      }
    `}</style>
  );
}
