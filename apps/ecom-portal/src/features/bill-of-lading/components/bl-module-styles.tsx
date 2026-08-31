// Modified by Sekar Nagarajan (2026-08-31 17:25)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function BlModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const primaryTint14 = tokenMix(token.colorPrimary, 14);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const successTint14 = tokenMix(token.colorSuccess, 14);
  const successTint28 = tokenMix(token.colorSuccess, 28);
  // Modified by Sekar Nagarajan (2026-08-31 23:43) — role-tinted preview party blocks
  const geekblueTint8 = tokenMix(token.geekblue, 8);
  const geekblueTint14 = tokenMix(token.geekblue, 14);
  const cyanTint8 = tokenMix(token.cyan, 8);
  const cyanTint14 = tokenMix(token.cyan, 14);
  const warningTint8 = tokenMix(token.colorWarning, 8);
  const warningTint14 = tokenMix(token.colorWarning, 14);
  const infoTint8 = tokenMix(token.colorInfo, 8);
  const infoTint14 = tokenMix(token.colorInfo, 14);
  const orangeTint8 = tokenMix(token.orange, 8);
  const orangeTint14 = tokenMix(token.orange, 14);
  const purpleTint8 = tokenMix(token.purple, 8);
  const purpleTint14 = tokenMix(token.purple, 14);

  return (
    <style>{`
      .bl-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
      }
      .bl-loading-center--fill {
        min-height: calc(100vh - 220px);
      }

      .feature-page-card.bl-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.bl-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .bl-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .bl-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .bl-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingLG}px ${token.marginMD}px;
      }
      .bl-route-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${primaryTint8};
      }
      .bl-route-strip__arrow {
        color: ${token.colorTextSecondary};
      }
      .bl-grid-wrap {
        flex: 1;
        min-height: calc(100vh - 280px);
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide DataView search / view-mode / Filters & Sort toolbar card */
      .bl-grid-wrap > .ant-flex > .ant-card:first-child {
        display: none;
      }
      .bl-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .bl-grid-wrap .bl-data-view {
        min-height: calc(100vh - 280px);
      }
      .bl-grid-wrap .ag-theme-alpine,
      .bl-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: calc(100vh - 280px);
      }
      .bl-batch-page-body {
        flex: 1;
        min-height: 0;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
      }
      .bl-charges-panel {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .bl-terms-body {
        max-height: 240px;
        overflow-y: auto;
      }
      .bl-batch-print-intro {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
      }
      .bl-batch-print-table {
        min-height: 240px;
      }
      .bl-drawer-body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        max-height: calc(100vh - 180px);
        overflow-y: auto;
        padding-right: ${token.paddingXXS}px;
      }
      .bl-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px;
      }
      .bl-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .bl-drawer-title__text {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .bl-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .bl-drawer-title__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXXS}px;
      }
      /* Modified by Sekar Nagarajan (2026-08-31 17:25) — light Confirmed / success badge */
      .bl-drawer-title__tags .ant-tag-success,
      .bl-drawer-title__tags .ant-tag-filled.ant-tag-success,
      .bl-status-tag.ant-tag-success,
      .bl-status-tag.ant-tag-filled.ant-tag-success {
        color: ${token.colorSuccessText || token.colorSuccess};
        background: ${successTint8};
        border-color: ${successTint28};
      }
      .bl-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .bl-view-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .bl-view-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-view-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .bl-view-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .bl-view-route-port__label {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .bl-view-route-port__code {
        margin: 0 !important;
        word-break: break-word;
      }
      .bl-view-route-connector {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 88px;
        padding-top: ${token.paddingLG}px;
      }
      .bl-view-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }
      .bl-view-route-connector__line {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .bl-view-route-connector__track {
        flex: 1;
        height: ${token.lineWidth}px;
        background: ${token.colorBorder};
      }
      .bl-summary-chips {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .bl-summary-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-summary-chip__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .bl-summary-chip__value {
        display: block;
        font-weight: ${token.fontWeightStrong};
      }
      .bl-section-title {
        margin: 0 !important;
      }
      .bl-panel > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }
      .bl-drawer-loading-placeholder {
        min-height: 160px;
      }
      .bl-manifest-drawer-title {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .bl-manifest-drawer-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .bl-drawer-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .bl-manifest-empty {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .bl-manifest-route {
        display: flex;
        align-items: stretch;
        margin-bottom: ${token.marginMD}px;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .bl-manifest-route__port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-manifest-route__port--load {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .bl-manifest-route__port--discharge {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .bl-manifest-route__label {
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
      .bl-manifest-route__code {
        margin: 0 !important;
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.15 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .bl-manifest-route__code--load {
        color: ${token.colorPrimary} !important;
      }
      .bl-manifest-route__code--discharge {
        color: ${token.colorSuccess} !important;
      }
      .bl-manifest-route__name {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .bl-manifest-route__connector {
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
      .bl-manifest-route__connector-label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .bl-manifest-route__line {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 120px;
        color: ${token.colorPrimary};
      }
      .bl-manifest-route__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .bl-manifest-route__dot--load {
        background: ${token.colorPrimary};
      }
      .bl-manifest-route__dot--discharge {
        background: ${tokenMix(token.colorSuccess, 10)};
      }
      .bl-manifest-route__track {
        flex: 1;
        height: 2px;
        margin: 0 ${token.marginXXS}px;
        background: linear-gradient(90deg, ${token.colorPrimary} 0%, ${
      token.colorSuccess
    } 100%);
      }
      .bl-manifest-status {
        display: flex;
        align-items: center;
        margin-bottom: ${token.marginMD}px;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .bl-manifest-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px;
      }
      .bl-manifest-meta__item {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .bl-manifest-meta__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadius}px;
        background: ${primaryTint8};
        flex-shrink: 0;
      }
      .bl-manifest-meta__content {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .bl-manifest-meta__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .bl-manifest-meta__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .bl-manifest-remarks {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .bl-manifest-remarks__header {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .bl-status-tag.ant-tag {
        border-radius: ${token.borderRadiusSM}px;
      }
      .bl-view-timeline {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px 0;
      }
      .bl-view-timeline__step {
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        font-size: ${token.fontSizeSM}px;
      }
      .bl-view-timeline__step.is-done {
        border-color: ${token.colorSuccess};
        background: ${successTint8};
        color: ${token.colorSuccess};
      }
      .bl-view-timeline__step.is-current {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .bl-party-block {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        height: 100%;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      /* Modified by Sekar Nagarajan (2026-08-31 23:43) — role-tinted preview party blocks */
      .bl-party-block.booking-party-card--shipper {
        background: ${primaryTint8};
        border-color: ${primaryTint14};
      }
      .bl-party-block.booking-party-card--agreementParty {
        background: ${geekblueTint8};
        border-color: ${geekblueTint14};
      }
      .bl-party-block.booking-party-card--consignee {
        background: ${successTint8};
        border-color: ${successTint14};
      }
      .bl-party-block.booking-party-card--notify {
        background: ${cyanTint8};
        border-color: ${cyanTint14};
      }
      .bl-party-block.booking-party-card--notify2 {
        background: ${infoTint8};
        border-color: ${infoTint14};
      }
      .bl-party-block.booking-party-card--notify3 {
        background: ${orangeTint8};
        border-color: ${orangeTint14};
      }
      .bl-party-block.booking-party-card--forwarder {
        background: ${warningTint8};
        border-color: ${warningTint14};
      }
      .bl-party-block.booking-party-card--warehouse {
        background: ${purpleTint8};
        border-color: ${purpleTint14};
      }
      .bl-container-block {
        margin-bottom: ${token.marginMD}px;
      }
      .bl-container-block__header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: ${token.marginXS}px;
        margin-bottom: ${token.marginSM}px;
      }
      .bl-charges-total-row {
        font-weight: 600;
        background: ${token.colorFillAlter};
      }
      .bl-wizard-loading-placeholder {
        min-height: 280px;
      }
      .bl-wizard-spin-wrap,
      .bl-wizard-spin-wrap > .ant-spin-container {
        height: 100%;
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .wizard-step-content .form-step-layout {
        flex: 1;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }
      @media (max-width: 767px) {
        .bl-toolbar {
          flex-direction: column;
          align-items: stretch;
        }
        .bl-route-strip {
          margin-left: ${token.paddingSM}px;
          margin-right: ${token.paddingSM}px;
        }
        .bl-view-route-strip {
          flex-direction: column;
        }
        .bl-view-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          padding-top: 0;
        }
        .bl-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .bl-drawer-actions {
          width: 100%;
        }
        .bl-drawer-actions .sm-app-button {
          flex: 1;
        }
        .bl-grid-wrap,
        .bl-batch-page-body {
          padding-left: ${token.paddingSM}px;
          padding-right: ${token.paddingSM}px;
        }
        .bl-page-header {
          padding-left: ${token.paddingSM}px;
          padding-right: ${token.paddingSM}px;
        }
        .bl-drawer-route {
          flex-direction: column;
          align-items: stretch;
        }
        .bl-manifest-route {
          flex-direction: column;
          align-items: stretch;
        }
        .bl-manifest-meta {
          grid-template-columns: 1fr;
        }
        .bl-manifest-drawer-footer {
          flex-wrap: wrap;
        }
      }

      .booking-cargo-commodity-toolbar {
        margin: ${token.marginMD}px 0 ${token.marginSM}px;
      }
      .booking-cargo-commodity-card {
        margin-bottom: ${token.marginMD}px;
      }
      .booking-cargo-commodity-card .list-actions-row {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      /* Modified by Sekar Nagarajan (2026-08-28 12:22) */
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
        border-left-width: 0;
        border-right-width: 0;
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
      .booking-cargo-commodity-card__hazardous-check {
        min-height: ${token.controlHeightLG}px;
        display: inline-flex;
        align-items: center;
      }

      .bl-master-segmented.ant-segmented {
        width: 100%;
      }

      /* Modified by Sekar Nagarajan (2026-08-31 12:32) — Radio card tiles */
      .bl-radio-card-group {
        display: flex;
        gap: ${token.marginXS}px;
        width: 100%;
      }
      .bl-radio-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingSM}px ${token.paddingXS}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1.5px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        min-width: 0;
      }
      .bl-radio-card:hover {
        border-color: ${tokenMix(token.colorPrimary, 45)};
        background: ${tokenMix(token.colorPrimary, 4)};
      }
      .bl-radio-card--active {
        border-color: ${token.colorPrimary};
        background: ${tokenMix(token.colorPrimary, 8)};
        box-shadow: 0 0 0 2px ${tokenMix(token.colorPrimary, 15)};
      }
      .bl-radio-card--active:hover {
        border-color: ${token.colorPrimary};
        background: ${tokenMix(token.colorPrimary, 12)};
      }
      .bl-radio-card__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillAlter};
        color: ${token.colorTextSecondary};
        transition: background 0.2s, color 0.2s;
      }
      .bl-radio-card--active .bl-radio-card__icon {
        background: ${tokenMix(token.colorPrimary, 15)};
        color: ${token.colorPrimary};
      }
      .bl-radio-card__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-align: center;
        line-height: 1.25;
        transition: color 0.2s;
      }
      .bl-radio-card--active .bl-radio-card__label {
        color: ${token.colorPrimary};
      }
      .bl-master-step-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .bl-master-step-row {
        width: 100%;
      }
      .bl-master-step-row > .ant-col {
        display: flex;
      }
      .bl-master-sections-row > .ant-col {
        display: flex;
      }
      .bl-master-sections-row .bl-master-step-card.ant-card {
        height: 100%;
      }
      .bl-master-step-card.ant-card {
        flex: 1;
        width: 100%;
      }
      .bl-master-step-card > .ant-card-body {
        height: 100%;
        padding: ${token.paddingLG}px !important;
      }
      .bl-master-step-card > .ant-card-head {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .bl-master-card-title-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      /* Modified by Sekar Nagarajan (2026-08-31 16:31) — SI-parity vessel route card */
      .bl-master-step-card--route > .ant-card-body {
        padding: ${token.paddingMD}px !important;
        background: linear-gradient(
          180deg,
          ${tokenMix(token.colorPrimary, 4)} 0%,
          ${token.colorBgContainer} 48%
        );
      }
      .bl-master-detail-grid {
        display: grid;
        width: 100%;
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .bl-master-detail-grid--4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      /* Modified by Sekar Nagarajan (2026-09-01 00:06) — single-row Vessels grid */
      .bl-master-detail-grid--5 {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
      .bl-master-detail-grid--refs {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .bl-container-block__title.ant-typography {
        display: inline-flex;
        align-items: center;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorWarningBg};
        border: 1px solid ${token.colorWarning};
        color: ${token.colorText};
      }

      /* Modified by Sekar Nagarajan (2026-09-01 00:28) — ENS switch (icon colors + alignment) */
      .bl-ens-switch-control {
        display: flex;
        align-items: center;
        min-height: ${token.controlHeight}px;
      }
      .bl-ens-switch .app-icon {
        color: ${token.colorPrimary};
        display: inline-flex;
      }
      .bl-ens-switch.ant-switch-checked .app-icon {
        color: ${token.colorTextLightSolid};
      }
      .bl-master-readonly-field {
        min-width: 0;
      }
      .bl-master-readonly-value.ant-typography,
      .bl-master-readonly-value {
        display: block;
        width: 100%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: ${token.marginXXS}px;
      }
      .bl-master-detail-grid .form-step-readonly-value--emphasis {
        font-size: ${token.fontSizeLG}px;
        line-height: ${token.lineHeight};
        margin-top: ${token.marginXXS}px;
      }
      .bl-master-step-card .form-field-cell {
        padding: ${token.paddingXS}px 0;
      }
      .bl-master-options-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .bl-master-compliance-grid--1 {
        grid-template-columns: minmax(0, 1fr);
      }
      .bl-master-compliance-grid--2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .bl-master-compliance-grid--3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .bl-master-compliance-grid--4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .bl-master-options-grid .form-step-hint,
      .bl-master-compliance-grid .form-step-hint {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeightSM};
      }
      @media (max-width: 1199px) {
        .bl-master-detail-grid--5,
        .bl-master-detail-grid--refs {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .bl-master-options-grid,
        .bl-master-compliance-grid--3,
        .bl-master-compliance-grid--4 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 991px) {
        .bl-master-detail-grid--4,
        .bl-master-detail-grid--5,
        .bl-master-detail-grid--refs,
        .bl-master-options-grid,
        .bl-master-compliance-grid--2,
        .bl-master-compliance-grid--3,
        .bl-master-compliance-grid--4 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 575px) {
        .bl-master-detail-grid--4,
        .bl-master-detail-grid--5,
        .bl-master-detail-grid--refs,
        .bl-master-options-grid,
        .bl-master-compliance-grid--1,
        .bl-master-compliance-grid--2,
        .bl-master-compliance-grid--3,
        .bl-master-compliance-grid--4 {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .bl-routing-form-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
      .bl-routing-booking-hint {
        display: block;
        margin-bottom: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeightSM};
        min-width: 0;
      }
      .bl-routing-booking-hint--placeholder {
        visibility: hidden;
      }
      .bl-routing-leg {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingSM}px 0;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .bl-routing-leg:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      @media (max-width: 1199px) {
        .bl-routing-form-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 991px) {
        .bl-routing-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 575px) {
        .bl-routing-form-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .bl-cargo-protect-step {
        padding-bottom: ${token.paddingXS}px;
      }
      .bl-cargo-protect-card > .ant-card-head {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .bl-cargo-protect-card > .ant-card-body {
        padding: ${token.paddingLG}px !important;
      }
      .bl-cargo-protect-empty {
        display: block;
        padding: ${token.paddingMD}px 0;
      }
      .bl-cargo-protect-lines {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .bl-cargo-protect-line-card.ant-card {
        margin: 0;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-cargo-protect-line-card > .ant-card-head {
        padding: ${token.paddingSM}px ${token.paddingMD}px !important;
        min-height: auto;
      }
      .bl-cargo-protect-line-card > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }
      .bl-cargo-protect-form-grid {
        grid-template-columns:
          minmax(0, 1.1fr) minmax(0, 2.4fr) minmax(0, 1fr) minmax(0, 0.9fr);
      }
      .bl-cargo-protect-form-grid .form-field-cell {
        padding: ${token.paddingXS}px 0;
        min-width: 0;
      }
      @media (max-width: 991px) {
        .bl-cargo-protect-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 575px) {
        .bl-cargo-protect-form-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .bl-charge-tab-step {
        padding-bottom: ${token.paddingXS}px;
      }
      .bl-charge-tab-card > .ant-card-head {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .bl-charge-tab-card > .ant-card-body {
        padding: ${token.paddingLG}px !important;
      }
      .bl-charge-tab-empty {
        display: block;
        padding: ${token.paddingMD}px 0;
      }
      .bl-charge-tab-lines {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .bl-charge-tab-line-card.ant-card {
        margin: 0;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-charge-tab-line-card > .ant-card-head {
        padding: ${token.paddingSM}px ${token.paddingMD}px !important;
        min-height: auto;
      }
      .bl-charge-tab-line-card > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }
      .bl-charge-tab-form-grid {
        grid-template-columns:
          minmax(0, 0.9fr) minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 0.9fr)
          minmax(0, 1fr);
      }
      .bl-charge-tab-form-grid .form-field-cell {
        padding: ${token.paddingXS}px 0;
        min-width: 0;
      }
      .bl-charge-tab-form-grid .form-step-readonly-value--emphasis {
        font-size: ${token.fontSizeLG}px;
        line-height: ${token.lineHeight};
        margin-top: ${token.marginXXS}px;
      }
      @media (max-width: 1199px) {
        .bl-charge-tab-form-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 991px) {
        .bl-charge-tab-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 575px) {
        .bl-charge-tab-form-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .bl-charges-step {
        padding-bottom: ${token.paddingXS}px;
      }
      .bl-charges-card > .ant-card-head {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .bl-charges-card > .ant-card-body {
        padding: ${token.paddingLG}px !important;
      }
      .bl-charges-form-error {
        display: block;
        margin-bottom: ${token.marginMD}px;
      }
      .bl-charges-lines {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .bl-charges-line-card.ant-card {
        margin: 0;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .bl-charges-line-card > .ant-card-head {
        padding: ${token.paddingSM}px ${token.paddingMD}px !important;
        min-height: auto;
      }
      .bl-charges-line-card > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }
      .bl-charges-form-grid {
        grid-template-columns:
          minmax(0, 0.8fr) minmax(0, 2fr) minmax(0, 0.9fr) minmax(0, 0.8fr)
          minmax(0, 1fr) minmax(0, 1fr);
      }
      .bl-charges-form-grid .form-field-cell {
        padding: ${token.paddingXS}px 0;
        min-width: 0;
      }
      @media (max-width: 1199px) {
        .bl-charges-form-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 991px) {
        .bl-charges-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 575px) {
        .bl-charges-form-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      /* Modified by Sekar Nagarajan (2026-08-31 16:36) — Preview summary + section Edit */
      .bl-preview-title {
        text-align: center;
        margin-bottom: ${token.marginXXS}px !important;
      }
      .bl-preview-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXXS}px;
        margin-bottom: ${token.marginLG}px;
        text-align: center;
      }
      .bl-preview-subtitle {
        font-size: ${token.fontSizeSM}px;
        max-width: ${token.controlHeightLG * 18}px;
      }
      .bl-preview-scroll {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .bl-preview-section.ant-card {
        margin-bottom: ${token.marginMD}px;
      }
      .bl-preview-section > .ant-card-head {
        min-height: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .bl-preview-section > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .bl-preview-descriptions {
        width: 100%;
      }
      .bl-preview-descriptions .ant-descriptions-item-label {
        color: ${token.colorTextSecondary};
        font-weight: ${token.fontWeightStrong};
      }
      .bl-preview-list {
        margin: 0;
        padding-left: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .bl-preview-empty {
        display: block;
        padding: ${token.paddingXXS}px 0;
      }
      .bl-preview-fields-card > .ant-card-head {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .bl-preview-fields-card > .ant-card-body {
        padding: ${token.paddingLG}px !important;
      }
      .bl-preview-fields-grid .form-field-cell {
        padding: ${token.paddingXS}px 0;
        min-width: 0;
      }
      .bl-preview-fields-grid--2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .bl-preview-fields-grid--4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .bl-preview-fields-grid--6 {
        grid-template-columns:
          minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1.1fr)
          minmax(0, 1fr) minmax(0, 0.9fr);
      }
      .bl-preview-radio-group.ant-radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px ${token.marginSM}px;
        min-height: ${token.controlHeightLG}px;
        align-items: center;
      }
      @media (max-width: 1199px) {
        .bl-preview-fields-grid--4,
        .bl-preview-fields-grid--6 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 991px) {
        .bl-preview-fields-grid--2,
        .bl-preview-fields-grid--4,
        .bl-preview-fields-grid--6 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 575px) {
        .bl-preview-fields-grid--2,
        .bl-preview-fields-grid--4,
        .bl-preview-fields-grid--6 {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `}</style>
  );
}
