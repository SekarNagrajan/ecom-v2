// Modified by Sekar Nagarajan (2026-08-28 14:20)
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
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .booking-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${
      token.colorFillAlter
    } 100%);
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
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${
      token.colorSuccess
    } 100%);
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
        grid-template-columns: minmax(0, 1fr) ${
          token.controlHeightLG
        }px minmax(0, 1fr) minmax(0, 1fr);
        grid-template-areas:
          "origin-label . delivery-label date-label"
          "origin-field swap delivery-field date-field"
          "origin-error . delivery-error date-error";
        column-gap: ${token.marginMD}px;
        row-gap: 0;
        align-items: end;
        margin-bottom: ${token.marginMD}px;
      }
      .booking-port-row__origin-label { grid-area: origin-label; align-self: start; margin-bottom: ${
        token.marginSM
      }px; }
      .booking-port-row__origin-field { grid-area: origin-field; }
      .booking-port-row__origin-error { grid-area: origin-error; margin-top: ${
        token.marginXXS
      }px; }
      .booking-port-row__delivery-label { grid-area: delivery-label; align-self: start; margin-bottom: ${
        token.marginSM
      }px; }
      .booking-port-row__delivery-field { grid-area: delivery-field; }
      .booking-port-row__delivery-error { grid-area: delivery-error; margin-top: ${
        token.marginXXS
      }px; }
      .booking-port-row__date-label { grid-area: date-label; align-self: start; margin-bottom: ${
        token.marginSM
      }px; }
      .booking-port-row__date-field { grid-area: date-field; }
      .booking-port-row__date-error { grid-area: date-error; margin-top: ${
        token.marginXXS
      }px; }
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

      /* Modified by Sekar Nagarajan (2026-08-27 23:34) — fix card overlap */
      .booking-routing-modal {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        max-height: min(70vh, 720px);
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
        flex-shrink: 0;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        overflow: visible;
      }
      .booking-routing-card--default {
        border-color: ${tokenMix(token.colorWarning, 40)};
      }
      .booking-routing-card__main {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingLG}px;
        padding-bottom: ${token.paddingMD}px;
        align-items: stretch;
      }
      .booking-routing-card__content {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .booking-routing-card__meta {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .booking-routing-card__route {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginMD}px;
        align-items: start;
        width: 100%;
      }
      .booking-routing-card__endpoint {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .booking-routing-card__endpoint--dest {
        text-align: left;
        align-items: flex-start;
      }
      .booking-routing-card__date {
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.2;
        letter-spacing: -0.02em;
      }
      .booking-routing-card__place {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.4;
        word-break: break-word;
      }
      .booking-routing-card__port-code {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .booking-routing-card__etime {
        margin-top: ${token.marginXXS}px;
      }
      .booking-routing-card__terminal {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.4;
        word-break: break-word;
        overflow-wrap: anywhere;
      }
      .booking-routing-card__connector {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        align-self: center;
        width: 100%;
      }
      .booking-routing-card__connector-line {
        display: flex;
        align-items: center;
        width: 100%;
        gap: ${token.marginXXS}px;
      }
      .booking-routing-card__connector-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        flex-shrink: 0;
      }
      .booking-routing-card__connector-rail {
        flex: 1 1 0;
        min-width: ${token.marginSM}px;
        height: 0;
        border-top: 2px dashed ${tokenMix(token.colorPrimary, 55)};
      }
      .booking-routing-card__connector-pill {
        flex-shrink: 0;
        padding: ${token.paddingXXS}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        border: 1px solid ${tokenMix(token.colorPrimary, 35)};
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        white-space: nowrap;
      }
      .booking-routing-card__connector-type {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .booking-routing-card__transport-wrap {
        padding: 0 ${token.paddingLG}px ${token.paddingMD}px;
        min-width: 0;
      }
      .booking-routing-card__transport {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: nowrap;
        overflow-x: auto;
        width: 100%;
        min-height: ${token.controlHeightSM}px;
        padding-bottom: ${token.paddingXXS}px;
      }
      .booking-routing-card__transport-rail {
        flex: 0 0 auto;
        width: ${token.controlHeightSM}px;
        min-width: ${token.marginLG}px;
        height: 0;
        border-top: 2px dashed ${token.colorBorder};
      }
      .booking-routing-card__transport-mode,
      .booking-routing-card__transport-vessel {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        flex-shrink: 0;
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        white-space: nowrap;
      }
      .booking-routing-card__transport-vessel {
        color: ${token.colorText};
        font-weight: ${token.fontWeightStrong};
      }
      .booking-routing-card__transport-hub {
        flex-shrink: 0;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        background: ${token.colorWarning};
        color: ${token.colorText};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.2;
        white-space: nowrap;
      }
      .booking-routing-card__actions {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        flex-shrink: 0;
        min-width: 0;
        width: 100%;
        padding-top: ${token.paddingSM}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .booking-routing-card__actions .sm-app-button {
        width: 100%;
      }
      .booking-routing-card__footer {
        padding: ${token.paddingSM}px ${token.paddingLG}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        flex-shrink: 0;
      }
      .booking-routing-card__deadlines {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .booking-routing-card__deadline {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorText};
      }
      .booking-routing-card__deadline-icon {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .booking-routing-card__deadline-icon--gate {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .booking-routing-card__deadline-icon--si {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .booking-routing-card__deadline-icon--vgm {
        background: ${token.colorSuccessBg};
        color: ${token.colorSuccess};
      }
      .booking-routing-card__deadline-label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .booking-routing-card__deadline-value {
        display: block;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.2;
      }

      .booking-route-details {
        margin: 0 ${token.marginLG}px ${token.marginMD}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }
      .booking-route-details__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        flex-wrap: wrap;
      }
      .booking-route-details__title {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .booking-route-timeline {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .booking-route-stop {
        display: grid;
        grid-template-columns: 32px minmax(0, 1fr);
        gap: ${token.marginSM}px;
        align-items: stretch;
      }
      .booking-route-stop__rail {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .booking-route-stop__node {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 1;
      }
      .booking-route-stop__line {
        flex: 1;
        width: 0;
        min-height: ${token.controlHeightLG}px;
        margin: ${token.marginXXS}px 0;
        border-left: 2px dashed ${tokenMix(token.colorPrimary, 45)};
      }
      .booking-route-stop__body {
        min-width: 0;
        padding-bottom: ${token.paddingLG}px;
      }
      .booking-route-stop:last-child .booking-route-stop__body {
        padding-bottom: 0;
      }
      .booking-route-stop__main {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        align-items: stretch;
      }
      .booking-route-stop__location {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .booking-route-stop__place {
        display: block;
        font-size: ${token.fontSize}px;
        color: ${token.colorText};
        line-height: 1.35;
      }
      .booking-route-stop__code {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .booking-route-stop__terminal {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
      }
      .booking-route-stop__badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .booking-route-stop__badge {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.2;
        white-space: nowrap;
      }
      .booking-route-stop__badge--road {
        border: 1px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        color: ${token.colorTextSecondary};
      }
      .booking-route-stop__badge--hub {
        border: none;
        background: ${token.colorWarning};
        color: ${token.colorText};
      }
      .booking-route-stop__badge--vessel {
        border: 1px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        color: ${token.colorText};
      }
      .booking-route-stop__times {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        align-items: flex-start;
      }
      .booking-route-stop__time {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
        white-space: nowrap;
      }
      .booking-route-stop__time-date {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }

      @media (min-width: 768px) {
        .booking-routing-card__route {
          grid-template-columns: minmax(0, 1fr) minmax(160px, 1.15fr) minmax(0, 1fr);
          gap: ${token.marginMD}px;
          align-items: start;
        }
        .booking-routing-card__endpoint--dest {
          text-align: right;
          align-items: flex-end;
        }
        .booking-routing-card__connector {
          align-self: center;
          padding-top: ${token.paddingLG}px;
        }
        .booking-route-stop__main {
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: ${token.marginLG}px;
        }
        .booking-route-stop__times {
          align-items: flex-end;
          text-align: right;
          flex-shrink: 0;
        }
      }

      @media (min-width: 992px) {
        .booking-routing-card__main {
          flex-direction: row;
          align-items: flex-start;
          gap: ${token.marginLG}px;
        }
        .booking-routing-card__actions {
          width: 160px;
          border-top: none;
          border-left: 1px solid ${token.colorBorderSecondary};
          padding-top: 0;
          padding-left: ${token.paddingMD}px;
          justify-content: flex-start;
        }
      }

      @media (max-width: 767px) {
        .booking-routing-card__main {
          padding: ${token.paddingMD}px;
        }
        .booking-routing-card__date {
          font-size: ${token.fontSizeHeading4}px;
        }
        .booking-route-details {
          margin-left: ${token.marginMD}px;
          margin-right: ${token.marginMD}px;
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
      }

      .booking-cargo-toolbar {
        margin-bottom: ${token.marginMD}px;
      }
      .booking-cargo-container-card {
        margin-bottom: ${token.marginLG}px;
      }
      .booking-cargo-container-card__title {
        margin: 0 !important;
      }
      .booking-cargo-commodity-toolbar {
        margin: ${token.marginMD}px 0 ${token.marginSM}px;
      }
      .booking-cargo-commodity-card {
        margin-bottom: ${token.marginMD}px;
      }
      .form-field-full-width.ant-input-number,
      .form-field-full-width.ant-input-number-group-wrapper {
        width: 100%;
      }
      /* Modified by Sekar Nagarajan (2026-08-28 12:09) */
      .booking-qty-stepper {
        width: 100%;
      }
      .booking-qty-stepper .booking-qty-stepper__input {
        flex: 1 1 auto;
        min-width: 0;
        width: 100%;
      }
      .booking-qty-stepper .booking-qty-stepper__input.ant-input-number {
        width: 100%;
        border-radius: 0;
      }
      .booking-qty-stepper .ant-input-number-input {
        text-align: center;
      }
      .booking-qty-stepper .booking-qty-stepper__btn-wrap {
        display: inline-flex;
        flex: 0 0 auto;
      }
      .booking-qty-stepper .booking-qty-stepper__btn-wrap .ant-btn {
        height: 100%;
      }
      .booking-qty-stepper .booking-qty-stepper__btn--minus {
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
      }
      .booking-qty-stepper .booking-qty-stepper__btn--plus {
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
      }
      .booking-qty-stepper .booking-qty-stepper__input.ant-input-number {
        border-left-width: 0;
        border-right-width: 0;
      }
      .booking-cargo-container-card .list-actions-row,
      .booking-cargo-commodity-card .list-actions-row {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .booking-cargo-commodity-card__checkbox-col {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .booking-cargo-commodity-card__checkbox-col .ant-checkbox-wrapper,
      .booking-cargo-commodity-card__hazardous-check {
        min-height: ${token.controlHeightLG}px;
        display: inline-flex;
        align-items: center;
      }
      .booking-upload-type {
        margin-bottom: ${token.marginMD}px;
        max-width: 320px;
      }
      .booking-upload-list {
        margin: ${token.marginMD}px 0 0;
        padding-inline-start: ${token.paddingLG}px;
      }
      .booking-preview-card__title {
        margin: 0 !important;
      }
      .booking-preview-container {
        margin-bottom: ${token.marginMD}px;
      }

      .booking-rates-table {
        width: 100%;
        overflow-x: auto;
      }

      .booking-party-search-input {
        flex: 1;
        min-width: 220px;
        width: 100%;
      }
      .booking-party-search-hint {
        display: block;
        margin-top: ${token.marginSM}px;
      }
      .booking-party-suggest-option {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        padding-block: ${token.paddingXXS}px;
      }
      .booking-party-suggest-option__meta {
        font-size: ${token.fontSizeSM}px;
      }
      .booking-party-selected-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-top: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .booking-party-selected-row__info {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .booking-party-section > .ant-card-head .ant-card-head-title {
        width: 100%;
      }
      .booking-party-section__title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .booking-party-section__count {
        flex-shrink: 0;
        font-weight: ${token.fontWeightStrong};
      }
      .booking-party-grid {
        margin: 0 !important;
      }
      .booking-party-grid__col {
        display: flex;
      }
      .booking-party-card.ant-card {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        border-radius: ${token.borderRadiusLG}px;
      }
      .booking-party-card > .ant-card-head {
        min-height: ${token.controlHeightLG}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .booking-party-card > .ant-card-head .ant-card-head-wrapper {
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .booking-party-card > .ant-card-head .ant-card-head-title {
        padding: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .booking-party-card > .ant-card-head .ant-card-extra {
        margin-inline-start: 0;
        padding: 0;
        flex-shrink: 0;
      }
      .booking-party-card > .ant-card-body {
        flex: 1;
        padding: ${token.paddingMD}px !important;
      }
      .booking-party-card__title {
        margin: 0 !important;
        font-size: ${token.fontSizeLG}px !important;
        line-height: ${token.lineHeight} !important;
      }
      .booking-party-card__body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .booking-party-card__company {
        display: block;
        line-height: ${token.lineHeight};
        word-break: break-word;
      }
      .booking-party-card__meta {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        word-break: break-word;
      }
      /* Inline Assign Roles panel (no popup) */
      .booking-party-role-panel {
        margin-top: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .booking-party-role-panel__header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
      }
      .booking-party-role-panel__customer {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .booking-party-role-panel__customer-icon {
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadiusLG}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .booking-party-role-panel__customer-info {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .booking-party-role-panel__meta {
        display: block;
        font-size: ${token.fontSizeSM}px;
      }
      .booking-party-role-panel__hint {
        display: block;
        font-size: ${token.fontSizeSM}px;
      }
      .booking-party-role-chips {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .booking-party-role-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-height: ${token.controlHeight}px;
        padding: ${token.paddingXXS}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        border: 1px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        font-size: ${token.fontSize}px;
        cursor: pointer;
        transition:
          border-color 0.2s ease,
          background-color 0.2s ease,
          color 0.2s ease;
      }
      .booking-party-role-chip:hover:not(:disabled) {
        border-color: ${tokenMix(token.colorPrimary, 45)};
        color: ${token.colorPrimary};
      }
      .booking-party-role-chip--selected {
        border-color: ${token.colorPrimary};
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }
      .booking-party-role-chip--assigned {
        opacity: 0.65;
        cursor: default;
      }
      .booking-party-role-chip__tag {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .booking-party-role-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        padding-top: ${token.paddingXS}px;
      }
      .booking-party-drawer-footer {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        justify-content: flex-end;
      }
      .booking-party-drawer-search {
        margin-bottom: ${token.marginMD}px;
      }

      .booking-activity-list {
        list-style: none;
        margin: 0;
        padding: 0;
        max-height: 320px;
        overflow-y: auto;
      }
      .booking-activity-list__item {
        padding: ${token.paddingSM}px 0;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .booking-activity-list__item:last-child {
        border-bottom: none;
      }
      .booking-activity-list__action {
        display: block;
      }
      .booking-activity-list__meta {
        display: block;
        font-size: ${token.fontSizeSM}px;
      }
      .booking-activity-list__note {
        display: block;
        margin-top: ${token.marginXXS}px;
        color: ${token.colorTextSecondary};
      }

      /* Modified by Sekar Nagarajan (2026-08-28 14:20) — OOG Details single row */
      .booking-oog-form-grid {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      @media (max-width: 1199px) {
        .booking-oog-form-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 991px) {
        .booking-oog-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 767px) {
        .booking-oog-form-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `}</style>
  );
}
