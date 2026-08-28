// Modified by Sekar Nagarajan (2026-08-28 12:58)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Shipping Instruction module layout classes (agenct.md). */
export function SiModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .si-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
      }
      .si-loading-center--fill {
        min-height: calc(100vh - 220px);
      }

      .si-list-card {
        border: none;
      }
      .si-list-card > .ant-card-body {
        padding: 0 !important;
      }
      .si-list-grid {
        width: 100%;
        height: 500px;
        min-height: 320px;
      }

      .si-field-full {
        width: 100%;
      }

      .si-party-block {
        padding: ${token.paddingSM}px;
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .si-container-block {
        margin-bottom: ${token.marginLG}px;
      }
      .si-container-block:last-child {
        margin-bottom: 0;
      }
      .si-container-block__header {
        margin-bottom: ${token.marginSM}px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }

      .si-cargo-card-toolbar {
        margin-bottom: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        width: 100%;
      }
      .si-cargo-card.ant-card .ant-card-head {
        background: ${token.colorFillAlter};
        border-bottom: 1px solid ${token.colorBorderSecondary};
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

      .si-party-card__flags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginMD}px;
        margin-top: ${token.marginSM}px;
        padding-top: ${token.paddingSM}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .si-party-card__flag {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        cursor: pointer;
        margin: 0;
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

      .si-charges-freight {
        font-size: ${token.fontSizeHeading3}px;
        color: ${token.colorPrimary};
        margin-top: ${token.marginSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .si-charges-note {
        margin-top: ${token.marginLG}px;
        padding: ${token.paddingMD}px;
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
      }

      .si-preview-title {
        text-align: center;
        margin-bottom: ${token.marginLG}px !important;
      }
      .si-section-title {
        margin: 0 !important;
      }

      .si-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .si-drawer-title__text {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .si-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .si-drawer-title__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .si-drawer-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      .si-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }

      .si-route-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .si-route-port {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .si-route-port--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .si-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .si-route-port__label {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .si-route-port__code {
        margin: 0 !important;
        word-break: break-word;
      }
      .si-route-connector {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 88px;
        padding-top: ${token.paddingLG}px;
      }
      .si-route-connector__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
      }
      .si-route-connector__line {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        width: 100%;
      }
      .si-route-connector__track {
        flex: 1;
        height: ${token.lineWidth}px;
        background: ${token.colorBorder};
      }

      .si-summary-chips {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .si-summary-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .si-summary-chip__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .si-summary-chip__value {
        display: block;
        font-weight: ${token.fontWeightStrong};
      }

      .si-panel > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }

      .si-confirmation__ref {
        margin-top: ${token.marginSM}px;
        font-size: ${token.fontSizeLG}px;
      }
      .si-confirmation__ref-value {
        font-size: ${token.fontSizeHeading5}px;
        color: ${token.colorPrimary};
      }

      /* Modified by Sekar Nagarajan (2026-08-28 12:48) — Master Details 1+2 column layout */
      .si-master-step-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .si-master-step-row {
        width: 100%;
      }
      .si-master-step-row > .ant-col {
        display: flex;
      }
      .si-master-step-card.ant-card {
        flex: 1;
        width: 100%;
      }
      .si-master-step-card > .ant-card-body {
        height: 100%;
        padding: ${token.paddingLG}px !important;
      }
      .si-master-step-card > .ant-card-head {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .si-master-segmented.ant-segmented {
        width: 100%;
      }
      .si-master-refs-grid {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .si-master-options-grid {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .si-master-compliance-grid {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
        align-items: end;
      }
      .si-master-compliance-check {
        min-height: ${token.controlHeightLG}px;
        display: inline-flex;
        align-items: center;
      }

      /* Modified by Sekar Nagarajan (2026-08-28 12:50) — Routing print fields single row */
      .si-routing-form-grid {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .si-routing-booking-hint {
        display: block;
        margin-bottom: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeightSM};
        min-height: calc(${token.fontSizeSM}px * ${token.lineHeightSM});
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .si-routing-booking-hint--placeholder {
        visibility: hidden;
      }
      .si-routing-legs {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }

      /* Modified by Sekar Nagarajan (2026-08-28 12:57) — Cargo Protect single row */
      .si-cargo-protect-lines {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .si-cargo-protect-form-grid {
        display: grid;
        width: 100%;
        grid-template-columns:
          minmax(0, 0.9fr) minmax(0, 2fr) minmax(0, 0.8fr) minmax(0, 0.7fr);
        gap: ${token.marginMD}px ${token.marginLG}px;
      }

      /* Modified by Sekar Nagarajan (2026-08-28 12:58) — Charges / ENS / Charge Tab single row */
      .si-charges-lines {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .si-charges-form-grid {
        display: grid;
        width: 100%;
        grid-template-columns:
          minmax(0, 0.8fr) minmax(0, 2fr) minmax(0, 0.9fr) minmax(0, 0.8fr)
          minmax(0, 1fr) minmax(0, 1fr);
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .si-charge-tab-form-grid {
        display: grid;
        width: 100%;
        grid-template-columns:
          minmax(0, 0.8fr) minmax(0, 2fr) minmax(0, 1fr) minmax(0, 0.9fr)
          minmax(0, 1fr);
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .si-ens-required-row {
        display: grid;
        width: 100%;
        max-width: 280px;
        margin-bottom: ${token.marginLG}px;
      }
      .si-ens-form-grid {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }

      @media (max-width: 1199px) {
        .si-master-options-grid,
        .si-master-compliance-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .si-routing-form-grid,
        .si-ens-form-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .si-cargo-protect-form-grid,
        .si-charges-form-grid,
        .si-charge-tab-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 991px) {
        .si-master-refs-grid,
        .si-master-options-grid,
        .si-master-compliance-grid,
        .si-routing-form-grid,
        .si-cargo-protect-form-grid,
        .si-charges-form-grid,
        .si-charge-tab-form-grid,
        .si-ens-form-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      @media (max-width: 767px) {
        .si-list-grid {
          height: 420px;
        }
        .si-route-strip {
          flex-direction: column;
        }
        .si-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          padding-top: 0;
        }
        .si-drawer-body.custom-scroll {
          padding: ${token.paddingMD}px;
        }
        .si-drawer-actions {
          width: 100%;
        }
        .si-drawer-actions .sm-app-button {
          flex: 1;
        }
      }
    `}</style>
  );
}
