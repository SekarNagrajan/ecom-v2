// Modified by Sekar Nagarajan (2026-08-26 18:52)
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
      /* Modified by Sekar Nagarajan (2026-08-26 18:41) — collapse empty error row so Master Details has no dead gap */
      .booking-port-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) ${token.controlHeightLG}px minmax(0, 1fr) minmax(0, 1fr);
        grid-template-areas:
          "origin-label . delivery-label date-label"
          "origin-field swap delivery-field date-field"
          "origin-error . delivery-error date-error";
        column-gap: ${token.marginMD}px;
        row-gap: 0;
        align-items: end;
        margin-bottom: ${token.marginMD}px;
      }
      .booking-port-row__origin-label { grid-area: origin-label; align-self: start; margin-bottom: ${token.marginSM}px; }
      .booking-port-row__origin-field { grid-area: origin-field; }
      .booking-port-row__origin-error { grid-area: origin-error; margin-top: ${token.marginXXS}px; }
      .booking-port-row__delivery-label { grid-area: delivery-label; align-self: start; margin-bottom: ${token.marginSM}px; }
      .booking-port-row__delivery-field { grid-area: delivery-field; }
      .booking-port-row__delivery-error { grid-area: delivery-error; margin-top: ${token.marginXXS}px; }
      .booking-port-row__date-label { grid-area: date-label; align-self: start; margin-bottom: ${token.marginSM}px; }
      .booking-port-row__date-field { grid-area: date-field; }
      .booking-port-row__date-error { grid-area: date-error; margin-top: ${token.marginXXS}px; }
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

      /* Select Vessel/Route popup (ebookRoutingDetails parity) */
      .booking-routing-modal {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        max-height: min(70vh, 640px);
        overflow-y: auto;
        padding-right: ${token.paddingXXS}px;
      }
      .booking-routing-modal__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: ${token.controlHeightLG * 4}px;
        width: 100%;
      }
      .booking-routing-card {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .booking-routing-card--default {
        border-color: ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .booking-routing-card__service {
        font-size: ${token.fontSizeLG}px;
      }
      .booking-routing-card__vessel {
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .booking-routing-card__meta {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: start;
      }
      .booking-routing-card__meta-item {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .booking-routing-card__meta-item--center {
        align-items: center;
        text-align: center;
        padding-top: ${token.paddingXS}px;
      }
      .booking-routing-card__meta-label {
        font-size: ${token.fontSizeSM}px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .booking-routing-card__cutoffs {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px ${token.marginMD}px;
        padding-top: ${token.paddingSM}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        font-size: ${token.fontSizeSM}px;
      }
      /* Modified by Sekar Nagarajan (2026-08-26 18:48) — pipeline module details */
      .booking-routing-card__shipment {
        display: flex;
        justify-content: flex-end;
      }
      .booking-routing-card__shipment-toggle {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSize}px;
        cursor: pointer;
      }
      .booking-routing-card__shipment-toggle:hover {
        opacity: 0.85;
      }
      .booking-routing-card__shipment-static {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-weight: ${token.fontWeightStrong};
      }
      .booking-routing-card__shipment-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      /* Modified by Sekar Nagarajan (2026-08-26 18:52) — wider pipeline strip, no connector overlap */
      .booking-routing-pipeline {
        display: flex;
        align-items: stretch;
        gap: ${token.marginSM}px;
        width: 100%;
        overflow-x: auto;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .booking-routing-pipeline__segment {
        display: flex;
        align-items: stretch;
        flex: 0 0 auto;
        min-width: max-content;
      }
      .booking-routing-pipeline__port {
        flex: 0 0 auto;
        width: 132px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .booking-routing-pipeline__port--origin {
        border-color: ${token.colorPrimaryBorder};
        box-shadow: inset 3px 0 0 ${token.colorPrimary};
      }
      .booking-routing-pipeline__port--hub {
        border-color: ${token.colorWarningBorder};
        box-shadow: inset 3px 0 0 ${token.colorWarning};
      }
      .booking-routing-pipeline__port--delivery {
        border-color: ${token.colorSuccessBorder};
        box-shadow: inset 3px 0 0 ${token.colorSuccess};
      }
      .booking-routing-pipeline__port-icon {
        display: inline-flex;
        color: ${token.colorPrimary};
      }
      .booking-routing-pipeline__port--hub .booking-routing-pipeline__port-icon {
        color: ${token.colorWarning};
      }
      .booking-routing-pipeline__port--delivery .booking-routing-pipeline__port-icon {
        color: ${token.colorSuccess};
      }
      .booking-routing-pipeline__port-code {
        font-size: ${token.fontSizeLG}px;
        line-height: 1.2;
      }
      .booking-routing-pipeline__port-name {
        display: block;
        font-size: ${token.fontSizeSM}px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .booking-routing-pipeline__port-time {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
      }
      .booking-routing-pipeline__move {
        flex: 0 0 auto;
        width: 148px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        text-align: center;
      }
      .booking-routing-pipeline__rail {
        display: flex;
        align-items: center;
        width: 100%;
      }
      .booking-routing-pipeline__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        background: ${token.colorPrimary};
      }
      .booking-routing-pipeline__dot--end {
        background: ${token.colorSuccess};
      }
      .booking-routing-pipeline__track {
        flex: 1;
        height: 2px;
        margin: 0 ${token.marginXXS}px;
        background: linear-gradient(
          90deg,
          ${token.colorPrimary} 0%,
          ${token.colorSuccess} 100%
        );
      }
      .booking-routing-pipeline__move--inland .booking-routing-pipeline__track {
        background: linear-gradient(
          90deg,
          ${token.colorWarning} 0%,
          ${token.colorPrimary} 100%
        );
      }
      .booking-routing-pipeline__move--inland .booking-routing-pipeline__dot {
        background: ${token.colorWarning};
      }
      .booking-routing-pipeline__move-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: 50%;
        flex-shrink: 0;
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
        border: 1px solid ${token.colorInfoBorder};
      }
      .booking-routing-pipeline__move--inland .booking-routing-pipeline__move-icon {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
        border-color: ${token.colorWarningBorder};
      }
      .booking-routing-pipeline__move-tag {
        margin-inline-end: 0 !important;
      }
      .booking-routing-pipeline__move-vessel {
        display: block;
        font-size: ${token.fontSizeSM}px;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .booking-routing-pipeline__move-meta {
        display: block;
        font-size: ${token.fontSizeSM}px;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      @media (max-width: 767px) {
        .booking-routing-pipeline {
          flex-direction: column;
          overflow-x: visible;
          gap: ${token.marginXS}px;
        }
        .booking-routing-pipeline__segment {
          flex-direction: column;
          width: 100%;
          min-width: 0;
        }
        .booking-routing-pipeline__port {
          width: 100%;
        }
        .booking-routing-pipeline__move {
          width: 100%;
          padding: ${token.paddingSM}px 0;
        }
        .booking-routing-pipeline__rail {
          flex-direction: column;
          height: ${token.controlHeightLG * 2}px;
          width: auto;
        }
        .booking-routing-pipeline__track {
          width: 2px;
          height: auto;
          flex: 1;
          margin: ${token.marginXXS}px 0;
          background: linear-gradient(
            180deg,
            ${token.colorPrimary} 0%,
            ${token.colorSuccess} 100%
          );
        }
        .booking-routing-pipeline__move--inland .booking-routing-pipeline__track {
          background: linear-gradient(
            180deg,
            ${token.colorWarning} 0%,
            ${token.colorPrimary} 100%
          );
        }
      }
      .booking-selected-route {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-top: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .booking-selected-route__title {
        display: block;
        margin-bottom: ${token.marginXXS}px;
      }
      .booking-selected-route__meta {
        display: block;
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
        .booking-routing-card__meta {
          grid-template-columns: 1fr;
        }
        .booking-routing-card__meta-item--center {
          align-items: flex-start;
          text-align: left;
        }
      }
    `}</style>
  );
}
