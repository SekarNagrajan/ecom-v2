// Modified by Sekar Nagarajan (2026-09-01 12:22)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Booking module layout classes (agenct.md). */
export function BookingModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const warningTint8 = tokenMix(token.colorWarning, 8);
  const infoTint8 = tokenMix(token.colorInfo, 8);
  const geekblueTint8 = tokenMix(token.geekblue, 8);
  const cyanTint8 = tokenMix(token.cyan, 8);
  const orangeTint8 = tokenMix(token.orange, 8);
  const errorTint8 = tokenMix(token.colorError, 8);
  const primaryTint14 = tokenMix(token.colorPrimary, 14);
  const successTint14 = tokenMix(token.colorSuccess, 14);
  const warningTint14 = tokenMix(token.colorWarning, 14);
  const infoTint14 = tokenMix(token.colorInfo, 14);
  const geekblueTint14 = tokenMix(token.geekblue, 14);
  const cyanTint14 = tokenMix(token.cyan, 14);
  const orangeTint14 = tokenMix(token.orange, 14);
  const primaryTint28 = tokenMix(token.colorPrimary, 28);
  const successTint28 = tokenMix(token.colorSuccess, 28);
  const errorTint28 = tokenMix(token.colorError, 28);

  return (
    <style>{`
      .booking-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
      }
      /* Modified by Sekar Nagarajan (2026-09-01 12:22) — view drawer section rows */
      .booking-view-sections {
        width: 100%;
      }
      .booking-view-row {
        display: grid;
        gap: ${token.marginMD}px;
        width: 100%;
        align-items: stretch;
      }
      .booking-view-row--2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .booking-view-row--1 {
        grid-template-columns: 1fr;
      }
      .booking-view-row .booking-panel.ant-card {
        height: 100%;
        margin: 0;
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
      /* Modified by Sekar Nagarajan (2026-08-31 14:57) — light status badge backgrounds */
      .booking-drawer-title__tags .ant-tag-success,
      .booking-drawer-title__tags .ant-tag-filled.ant-tag-success {
        color: ${token.colorSuccessText || token.colorSuccess};
        background: ${successTint8};
        border-color: ${successTint28};
      }
      .booking-drawer-title__tags .ant-tag-processing,
      .booking-drawer-title__tags .ant-tag-filled.ant-tag-processing {
        color: ${token.colorPrimary};
        background: ${primaryTint8};
        border-color: ${primaryTint28};
      }
      .booking-drawer-title__tags .ant-tag-error,
      .booking-drawer-title__tags .ant-tag-filled.ant-tag-error {
        color: ${token.colorErrorText || token.colorError};
        background: ${errorTint8};
        border-color: ${errorTint28};
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
      .booking-haulage-grid {
        height: 320px;
        min-height: 240px;
        width: 100%;
        display: flex;
        flex-direction: column;
      }
      .booking-haulage-grid .ag-theme-alpine,
      .booking-haulage-grid > div {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .booking-disclaimer {
        margin-top: ${token.marginSM}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      /* Modified by Sekar Nagarajan (2026-08-31 17:13) — VGM/BL page-card + explicit AG Grid height */
      .feature-page-card.booking-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.booking-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .booking-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .booking-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .booking-grid-wrap {
        flex: 1;
        min-height: calc(100vh - 280px);
        width: 100%;
        padding: ${token.paddingMD}px ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      .booking-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .booking-list-grid {
        width: 100%;
        flex: 1;
        min-height: calc(100vh - 280px);
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .booking-list-grid > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .booking-list-grid .ag-theme-alpine,
      .booking-list-grid .ag-root-wrapper {
        height: 100% !important;
        min-height: calc(100vh - 280px);
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
      /* Modified by Sekar Nagarajan (2026-08-31 16:58) — gap below port/date row before haulage options */
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
        margin-bottom: ${token.marginXL}px;
      }
      .booking-master-options-row {
        margin-top: ${token.marginSM}px;
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
      /* Modified by Sekar Nagarajan (2026-08-31 13:11) — mild success tint (same as grid status tags) */
      .booking-routing-card__deadline-icon--vgm {
        background: ${successTint8};
        color: ${token.colorSuccessText || token.colorSuccess};
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
      /* Modified by Sekar Nagarajan (2026-09-01 11:50) — route/rate single-row layout */
      .booking-selected-summary-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginMD}px;
        margin-top: ${token.marginMD}px;
        margin-bottom: ${token.marginMD}px;
        align-items: stretch;
      }
      .booking-selected-summary-row--paired {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .booking-selected-summary-row--with-table {
        grid-template-columns: 1fr;
      }
      .booking-selected-summary-row__rates {
        margin-top: 0;
      }
      .booking-selected-route {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-top: 0;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .booking-selected-route__content {
        display: flex;
        flex-wrap: nowrap;
        align-items: baseline;
        gap: ${token.marginXS}px;
        min-width: 0;
        flex: 1;
        overflow: hidden;
        cursor: help;
      }
      .booking-selected-route__title {
        display: inline;
        margin-bottom: 0;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .booking-selected-route__meta {
        display: inline;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }
      .booking-selected-route__tooltip {
        display: block;
        white-space: pre-line;
      }
      .booking-selected-route .sm-app-button,
      .booking-selected-route .ant-btn {
        flex-shrink: 0;
      }
      @media (max-width: 991px) {
        .booking-view-row--2 {
          grid-template-columns: 1fr;
        }
        .booking-selected-summary-row--paired {
          grid-template-columns: 1fr;
        }
        .booking-selected-route__content {
          flex-wrap: wrap;
        }
        .booking-selected-route__meta {
          white-space: normal;
          overflow: visible;
          text-overflow: unset;
        }
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

      /* Modified by Sekar Nagarajan (2026-08-28 15:19) — master/detail cargo layout */
      .booking-cargo-split {
        display: grid;
        grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: stretch;
        min-height: 420px;
      }
      .booking-cargo-split__list {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        display: flex;
        flex-direction: column;
        min-height: 0;
        max-height: min(70vh, 720px);
        overflow: hidden;
      }
      .booking-cargo-split__list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        flex-shrink: 0;
      }
      .booking-cargo-split__list-items {
        list-style: none;
        margin: 0;
        padding: ${token.paddingXS}px;
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .booking-cargo-split__item {
        width: 100%;
        text-align: left;
        border: 1px solid transparent;
        border-radius: ${token.borderRadius}px;
        background: transparent;
        padding: ${token.paddingSM}px;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .booking-cargo-split__item:hover {
        background: ${token.colorFillAlter};
      }
      .booking-cargo-split__item--active {
        border-color: ${token.colorPrimary};
        background: ${token.colorPrimaryBg};
      }
      .booking-cargo-split__item--error {
        border-color: ${token.colorError};
      }
      .booking-cargo-split__item-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginXS}px;
      }
      .booking-cargo-split__item-title {
        margin: 0 !important;
      }
      .booking-cargo-split__item-qty {
        font-size: ${token.fontSizeSM}px;
        white-space: nowrap;
      }
      .booking-cargo-split__item-type {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .booking-cargo-split__item-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXS}px;
      }
      .booking-cargo-split__detail {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        min-width: 0;
        max-height: min(70vh, 720px);
        overflow-y: auto;
      }
      /* Modified by Sekar Nagarajan (2026-08-28 15:23) — padding/margin for cargo field layers */
      .booking-cargo-detail__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginLG}px;
        flex-wrap: wrap;
      }
      .booking-cargo-detail__title {
        margin: 0 !important;
      }
      .booking-cargo-detail__section {
        margin-top: ${token.marginLG}px;
        margin-bottom: ${token.marginSM}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .booking-cargo-detail__section-title {
        display: block;
        margin-bottom: ${token.marginMD}px;
      }
      .booking-cargo-toolbar {
        margin-bottom: ${token.marginMD}px;
      }
      .booking-cargo-container-card {
        margin-bottom: ${token.marginLG}px;
        border: 1px solid ${token.colorBorderSecondary} !important;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .booking-cargo-container-card.ant-card {
        box-shadow: none !important;
      }
      .booking-cargo-container-card > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .booking-cargo-container-card__title {
        margin: 0 !important;
      }
      .booking-cargo-commodity-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin: ${token.marginLG}px 0 ${token.marginMD}px;
        flex-wrap: wrap;
      }
      .booking-cargo-commodity-card {
        margin-bottom: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      /* Modified by Sekar Nagarajan (2026-08-31 23:31) — gap between commodity rows and DG section */
      .booking-cargo-commodity-card > .ant-row + .ant-row,
      .booking-cargo-commodity-card > .form-step-section {
        margin-top: ${token.marginLG}px;
        padding-top: ${token.paddingMD}px;
        border-top: 1px dashed ${token.colorBorderSecondary};
      }
      .booking-cargo-commodity-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        flex-wrap: wrap;
      }
      @media (max-width: 991px) {
        .booking-cargo-split {
          grid-template-columns: 1fr;
          min-height: 0;
        }
        .booking-cargo-split__list {
          max-height: none;
        }
        .booking-cargo-split__list-items {
          flex-direction: row;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: ${token.paddingXS}px;
        }
        .booking-cargo-split__list-items > li {
          flex: 0 0 min(240px, 80vw);
        }
        .booking-cargo-split__detail {
          max-height: none;
        }
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
      .booking-cargo-commodity-card .list-actions-row,
      .booking-cargo-detail__header .list-actions-row {
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
      /* Modified by Sekar Nagarajan (2026-08-31 16:41) — Preview summary + section Edit */
      .booking-preview-title {
        text-align: center;
        margin-bottom: ${token.marginXXS}px !important;
      }
      .booking-preview-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXXS}px;
        margin-bottom: ${token.marginLG}px;
        text-align: center;
      }
      .booking-preview-subtitle {
        font-size: ${token.fontSizeSM}px;
        max-width: ${token.controlHeightLG * 18}px;
      }
      .booking-preview-scroll {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .booking-preview-section.ant-card {
        margin-bottom: ${token.marginMD}px;
      }
      .booking-preview-section > .ant-card-head {
        min-height: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .booking-preview-section > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .booking-preview-descriptions {
        width: 100%;
      }
      .booking-preview-descriptions .ant-descriptions-item-label {
        color: ${token.colorTextSecondary};
        font-weight: ${token.fontWeightStrong};
      }
      .booking-preview-list {
        margin: ${token.marginXS}px 0 0;
        padding-left: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .booking-preview-empty {
        display: block;
        padding: ${token.paddingXXS}px 0;
      }
      .booking-party-block {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      /* Modified by Sekar Nagarajan (2026-08-31 23:42) — preview party blocks with role tints */
      .booking-party-block.booking-party-card {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        height: 100%;
      }
      .booking-party-block.booking-party-card--shipper {
        background: ${primaryTint8};
        border-color: ${primaryTint14};
      }
      .booking-party-block.booking-party-card--agreementParty {
        background: ${geekblueTint8};
        border-color: ${geekblueTint14};
      }
      .booking-party-block.booking-party-card--consignee {
        background: ${successTint8};
        border-color: ${successTint14};
      }
      .booking-party-block.booking-party-card--notifyParty {
        background: ${cyanTint8};
        border-color: ${cyanTint14};
      }
      .booking-party-block.booking-party-card--notifyParty2 {
        background: ${infoTint8};
        border-color: ${infoTint14};
      }
      .booking-party-block.booking-party-card--forwarder {
        background: ${warningTint8};
        border-color: ${warningTint14};
      }
      .booking-party-block.booking-party-card--siSubmittingParty {
        background: ${orangeTint8};
        border-color: ${orangeTint14};
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
      .booking-party-grid--other {
        margin-top: ${token.marginLG}px !important;
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
      /* Modified by Sekar Nagarajan (2026-08-31 14:14) — mild per-role card tints */
      .booking-party-card--shipper.ant-card {
        background: ${primaryTint8};
        border-color: ${primaryTint14};
      }
      .booking-party-card--agreementParty.ant-card {
        background: ${geekblueTint8};
        border-color: ${geekblueTint14};
      }
      .booking-party-card--notifyParty.ant-card {
        background: ${cyanTint8};
        border-color: ${cyanTint14};
      }
      .booking-party-card--consignee.ant-card {
        background: ${successTint8};
        border-color: ${successTint14};
      }
      .booking-party-card--notifyParty2.ant-card {
        background: ${infoTint8};
        border-color: ${infoTint14};
      }
      .booking-party-card--forwarder.ant-card {
        background: ${warningTint8};
        border-color: ${warningTint14};
      }
      .booking-party-card--siSubmittingParty.ant-card {
        background: ${orangeTint8};
        border-color: ${orangeTint14};
      }
      .booking-party-card--shipper > .ant-card-head,
      .booking-party-card--agreementParty > .ant-card-head,
      .booking-party-card--notifyParty > .ant-card-head,
      .booking-party-card--consignee > .ant-card-head,
      .booking-party-card--notifyParty2 > .ant-card-head,
      .booking-party-card--forwarder > .ant-card-head,
      .booking-party-card--siSubmittingParty > .ant-card-head {
        background: transparent;
      }
      /* Modified by Sekar Nagarajan (2026-08-31 14:10) — empty default party slot */
      .booking-party-card--empty.ant-card {
        border-style: dashed;
      }
      .booking-party-card__empty-body {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: ${token.marginSM}px;
        min-height: ${token.controlHeightLG * 2}px;
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

      .booking-activity-steps {
        list-style: none;
        margin: 0;
        padding: 0;
        max-height: 360px;
        overflow-y: auto;
      }
      .booking-activity-steps__item {
        display: flex;
        align-items: stretch;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .booking-activity-steps__rail {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        width: 28px;
      }
      .booking-activity-steps__icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .booking-activity-steps__icon--primary {
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .booking-activity-steps__icon--success {
        background: ${successTint8};
        color: ${token.colorSuccess};
      }
      .booking-activity-steps__icon--warning {
        background: ${warningTint8};
        color: ${token.colorWarning};
      }
      .booking-activity-steps__icon--error {
        background: ${errorTint8};
        color: ${token.colorError};
      }
      .booking-activity-steps__icon--info {
        background: ${infoTint8};
        color: ${token.colorInfo};
      }
      .booking-activity-steps__icon--muted {
        background: ${token.colorFillSecondary};
        color: ${token.colorTextSecondary};
      }
      .booking-activity-steps__connector {
        flex: 1;
        width: 2px;
        min-height: ${token.marginMD}px;
        margin-top: ${token.marginXXS}px;
        margin-bottom: ${token.marginXXS}px;
        background: ${token.colorBorderSecondary};
      }
      .booking-activity-steps__body {
        flex: 1;
        min-width: 0;
        padding-bottom: ${token.paddingMD}px;
      }
      .booking-activity-steps__item--last .booking-activity-steps__body {
        padding-bottom: 0;
      }
      .booking-activity-steps__action {
        display: block;
        line-height: 1.3;
      }
      .booking-activity-steps__meta {
        display: block;
        font-size: ${token.fontSizeSM}px;
        margin-top: ${token.marginXXS}px;
      }
      .booking-activity-steps__note {
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
        padding-top: ${token.paddingXXS}px;
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
