// Modified by Sekar Nagarajan (2026-09-01 16:40)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Shipping Instruction module layout classes (agenct.md). */
export function SiModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const warningTint8 = tokenMix(token.colorWarning, 8);
  const infoTint8 = tokenMix(token.colorInfo, 8);
  const geekblueTint8 = tokenMix(token.geekblue, 8);
  const cyanTint8 = tokenMix(token.cyan, 8);
  const orangeTint8 = tokenMix(token.orange, 8);
  const purpleTint8 = tokenMix(token.purple, 8);
  const primaryTint14 = tokenMix(token.colorPrimary, 14);
  const successTint14 = tokenMix(token.colorSuccess, 14);
  const warningTint14 = tokenMix(token.colorWarning, 14);
  const infoTint14 = tokenMix(token.colorInfo, 14);
  const geekblueTint14 = tokenMix(token.geekblue, 14);
  const cyanTint14 = tokenMix(token.cyan, 14);
  const orangeTint14 = tokenMix(token.orange, 14);
  const purpleTint14 = tokenMix(token.purple, 14);
  const errorTint8 = tokenMix(token.colorError, 8);

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

      /* Modified by Sekar Nagarajan (2026-08-31 17:13) — VGM/BL page-card + explicit AG Grid height */
      .feature-page-card.si-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.si-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .si-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .si-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .si-grid-wrap {
        flex: 1;
        min-height: calc(100vh - 280px);
        width: 100%;
        padding: ${token.paddingMD}px ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      .si-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .si-list-grid {
        width: 100%;
        flex: 1;
        min-height: calc(100vh - 280px);
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .si-list-grid > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .si-list-grid .ag-theme-alpine,
      .si-list-grid .ag-root-wrapper {
        height: 100% !important;
        min-height: calc(100vh - 280px);
      }

      .si-field-full {
        width: 100%;
      }

      .si-party-block {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      /* Modified by Sekar Nagarajan (2026-08-31 23:43) — role-tinted preview party blocks */
      .si-party-block.booking-party-card--shipper {
        background: ${primaryTint8};
        border-color: ${primaryTint14};
      }
      .si-party-block.booking-party-card--agreementParty {
        background: ${geekblueTint8};
        border-color: ${geekblueTint14};
      }
      .si-party-block.booking-party-card--consignee {
        background: ${successTint8};
        border-color: ${successTint14};
      }
      .si-party-block.booking-party-card--notify {
        background: ${cyanTint8};
        border-color: ${cyanTint14};
      }
      .si-party-block.booking-party-card--notify2 {
        background: ${infoTint8};
        border-color: ${infoTint14};
      }
      .si-party-block.booking-party-card--notify3 {
        background: ${orangeTint8};
        border-color: ${orangeTint14};
      }
      .si-party-block.booking-party-card--forwarder {
        background: ${warningTint8};
        border-color: ${warningTint14};
      }
      .si-party-block.booking-party-card--warehouse {
        background: ${purpleTint8};
        border-color: ${purpleTint14};
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
      /* Modified by Sekar Nagarajan (2026-09-01 00:32) — highlight container no + size */
      .si-container-block__title.ant-typography {
        display: inline-flex;
        align-items: center;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorWarningBg};
        border: 1px solid ${token.colorWarning};
        color: ${token.colorText};
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
      /* Modified by Sekar Nagarajan (2026-08-31 14:17) — mild per-role card tints */
      .booking-party-card--shipper.ant-card {
        background: ${primaryTint8};
        border-color: ${primaryTint14};
      }
      .booking-party-card--agreementParty.ant-card {
        background: ${geekblueTint8};
        border-color: ${geekblueTint14};
      }
      .booking-party-card--notify.ant-card {
        background: ${cyanTint8};
        border-color: ${cyanTint14};
      }
      .booking-party-card--consignee.ant-card {
        background: ${successTint8};
        border-color: ${successTint14};
      }
      .booking-party-card--notify2.ant-card {
        background: ${infoTint8};
        border-color: ${infoTint14};
      }
      .booking-party-card--notify3.ant-card {
        background: ${orangeTint8};
        border-color: ${orangeTint14};
      }
      .booking-party-card--forwarder.ant-card {
        background: ${warningTint8};
        border-color: ${warningTint14};
      }
      .booking-party-card--warehouse.ant-card {
        background: ${purpleTint8};
        border-color: ${purpleTint14};
      }
      .booking-party-card--shipper > .ant-card-head,
      .booking-party-card--agreementParty > .ant-card-head,
      .booking-party-card--notify > .ant-card-head,
      .booking-party-card--consignee > .ant-card-head,
      .booking-party-card--notify2 > .ant-card-head,
      .booking-party-card--notify3 > .ant-card-head,
      .booking-party-card--forwarder > .ant-card-head,
      .booking-party-card--warehouse > .ant-card-head {
        background: transparent;
      }
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
        margin-bottom: ${token.marginXXS}px !important;
      }
      /* Modified by Sekar Nagarajan (2026-08-31 16:27) — Preview summary + section Edit */
      .si-preview-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXXS}px;
        margin-bottom: ${token.marginLG}px;
        text-align: center;
      }
      .si-preview-subtitle {
        font-size: ${token.fontSizeSM}px;
        max-width: ${token.controlHeightLG * 18}px;
      }
      .si-preview-scroll {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .si-preview-section.ant-card {
        margin-bottom: ${token.marginMD}px;
      }
      .si-preview-section > .ant-card-head {
        min-height: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .si-preview-section > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .si-preview-descriptions {
        width: 100%;
      }
      .si-preview-descriptions .ant-descriptions-item-label {
        color: ${token.colorTextSecondary};
        font-weight: ${token.fontWeightStrong};
      }
      .si-preview-list {
        margin: 0;
        padding-left: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .si-preview-empty {
        display: block;
        padding: ${token.paddingXXS}px 0;
      }
      .si-section-title {
        margin: 0 !important;
      }
      .si-section-title-row {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }

      /* Modified by Sekar Nagarajan (2026-09-01 12:29) — SI view drawer section rows */
      .si-view-sections {
        width: 100%;
      }
      .si-view-row {
        display: grid;
        gap: ${token.marginMD}px;
        width: 100%;
        align-items: stretch;
      }
      .si-view-row--2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .si-view-row--1 {
        grid-template-columns: 1fr;
      }
      .si-view-row .si-panel.ant-card {
        height: 100%;
        margin: 0;
      }
      .si-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .si-meta-item__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .si-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        word-break: break-word;
      }
      .si-party-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginSM}px;
      }
      .si-cargo-grid,
      .si-charges-grid {
        height: 280px;
        min-height: 220px;
        width: 100%;
        display: flex;
        flex-direction: column;
      }
      .si-cargo-grid .ag-theme-alpine,
      .si-cargo-grid > div,
      .si-charges-grid .ag-theme-alpine,
      .si-charges-grid > div {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .si-activity-steps {
        list-style: none;
        margin: 0;
        padding: 0;
        max-height: 360px;
        overflow-y: auto;
      }
      .si-activity-steps__item {
        display: flex;
        align-items: stretch;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .si-activity-steps__rail {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        width: 28px;
      }
      .si-activity-steps__icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .si-activity-steps__icon--primary {
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .si-activity-steps__icon--success {
        background: ${successTint8};
        color: ${token.colorSuccess};
      }
      .si-activity-steps__icon--warning {
        background: ${warningTint8};
        color: ${token.colorWarning};
      }
      .si-activity-steps__icon--error {
        background: ${errorTint8};
        color: ${token.colorError};
      }
      .si-activity-steps__icon--info {
        background: ${infoTint8};
        color: ${token.colorInfo};
      }
      .si-activity-steps__icon--muted {
        background: ${token.colorFillSecondary};
        color: ${token.colorTextSecondary};
      }
      .si-activity-steps__connector {
        flex: 1;
        width: 2px;
        min-height: ${token.marginMD}px;
        margin-top: ${token.marginXXS}px;
        margin-bottom: ${token.marginXXS}px;
        background: ${token.colorBorderSecondary};
      }
      .si-activity-steps__body {
        flex: 1;
        min-width: 0;
        padding-bottom: ${token.paddingMD}px;
      }
      .si-activity-steps__item--last .si-activity-steps__body {
        padding-bottom: 0;
      }
      .si-activity-steps__action {
        display: block;
        line-height: 1.3;
      }
      .si-activity-steps__meta {
        display: block;
        font-size: ${token.fontSizeSM}px;
        margin-top: ${token.marginXXS}px;
      }
      .si-activity-steps__note {
        display: block;
        margin-top: ${token.marginXXS}px;
        color: ${token.colorTextSecondary};
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
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${
      token.colorFillAlter
    } 100%);
      }
      .si-route-port--delivery {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${
      token.colorFillAlter
    } 100%);
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

      /* Modified by Sekar Nagarajan (2026-08-31 16:08) — full-width vessel schedule showcase */
      .si-master-step-card--route > .ant-card-body {
        padding: ${token.paddingMD}px !important;
        background: linear-gradient(
          180deg,
          ${tokenMix(token.colorPrimary, 4)} 0%,
          ${token.colorBgContainer} 48%
        );
      }
      .si-vessel-schedule-card.schedule-card {
        width: 100%;
      }
      .si-vessel-schedule-card .schedule-card__main {
        grid-template-columns: minmax(0, 1fr) !important;
        width: 100%;
        padding: ${token.paddingLG}px ${token.paddingXL}px;
      }
      .si-vessel-schedule-card .schedule-card__content {
        width: 100%;
      }
      .si-vessel-schedule-card .schedule-card__meta {
        width: 100%;
      }
      .si-vessel-schedule-card .schedule-card__distance {
        margin-left: auto;
      }
      .si-vessel-schedule-card .schedule-card__route {
        width: 100%;
        gap: ${token.marginLG}px;
      }
      .si-vessel-schedule-card .schedule-card__endpoint {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        min-height: ${token.controlHeightLG * 3}px;
        justify-content: center;
      }
      .si-vessel-schedule-card .schedule-card__endpoint--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(
          180deg,
          ${primaryTint8} 0%,
          ${token.colorFillAlter} 100%
        );
      }
      .si-vessel-schedule-card .schedule-card__endpoint--dest {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(
          180deg,
          ${successTint8} 0%,
          ${token.colorFillAlter} 100%
        );
      }
      .si-vessel-schedule-card .schedule-card__place {
        font-size: ${token.fontSizeHeading5}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.3;
      }
      .si-vessel-schedule-card .schedule-card__connector {
        min-width: 0;
        width: 100%;
        padding-top: ${token.paddingMD}px;
      }
      .si-vessel-schedule-card .schedule-card__connector-pill {
        padding: ${token.paddingXXS}px ${token.paddingMD}px;
        font-size: ${token.fontSize}px;
      }
      .si-vessel-schedule-card .schedule-card__transport {
        width: 100%;
      }
      .si-vessel-schedule-card .schedule-card__footer {
        width: 100%;
      }
      @media (min-width: 768px) {
        .si-vessel-schedule-card .schedule-card__route {
          grid-template-columns: minmax(0, 1.2fr) minmax(180px, 1fr) minmax(0, 1.2fr);
          align-items: stretch;
        }
        .si-vessel-schedule-card .schedule-card__endpoint--dest {
          text-align: right;
          align-items: flex-end;
          border-left: 1px solid ${token.colorBorderSecondary};
          border-right: 4px solid ${token.colorSuccess};
        }
        .si-vessel-schedule-card .schedule-card__connector {
          align-self: center;
        }
      }
      .si-radio-card-group {
        display: flex;
        gap: ${token.marginXS}px;
        width: 100%;
      }
      .si-radio-card {
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
      .si-radio-card:hover {
        border-color: ${tokenMix(token.colorPrimary, 45)};
        background: ${tokenMix(token.colorPrimary, 4)};
      }
      .si-radio-card--active {
        border-color: ${token.colorPrimary};
        background: ${tokenMix(token.colorPrimary, 8)};
        box-shadow: 0 0 0 2px ${tokenMix(token.colorPrimary, 15)};
      }
      .si-radio-card--active:hover {
        border-color: ${token.colorPrimary};
        background: ${tokenMix(token.colorPrimary, 12)};
      }
      .si-radio-card__icon {
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
      .si-radio-card--active .si-radio-card__icon {
        background: ${tokenMix(token.colorPrimary, 15)};
        color: ${token.colorPrimary};
      }
      .si-radio-card__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-align: center;
        line-height: 1.25;
        transition: color 0.2s;
      }
      .si-radio-card--active .si-radio-card__label {
        color: ${token.colorPrimary};
      }
      .si-master-step-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .si-master-step-row {
        width: 100%;
      }
      .si-master-sections-row > .ant-col {
        display: flex;
      }
      .si-master-sections-row .si-master-step-card.ant-card {
        height: 100%;
      }
      .si-master-sections-row .si-master-vessel-row {
        grid-template-columns: minmax(220px, 0.9fr) minmax(0, 1.3fr);
      }
      .si-master-combined-panel {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .si-master-subsection-label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginSM}px;
      }
      .si-master-sections-row .si-master-detail-grid--3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .si-master-sections-row .si-master-options-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .si-master-options-grid--stack {
        grid-template-columns: minmax(0, 1fr);
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
      .si-master-card-title-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        width: 100%;
        flex-wrap: wrap;
      }
      .si-master-card-title-hint {
        font-size: ${token.fontSizeSM}px;
      }
      .si-master-detail-grid {
        display: grid;
        width: 100%;
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .si-master-detail-grid--3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .si-master-detail-grid--4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      /* Modified by Sekar Nagarajan (2026-09-01 00:02) — single-row Vessels grid */
      .si-master-detail-grid--5 {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
      .si-master-readonly-field {
        min-width: 0;
      }
      .si-master-readonly-value.ant-typography,
      .si-master-readonly-value {
        display: block;
        width: 100%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: ${token.marginXXS}px;
      }
      .si-master-detail-grid .form-step-readonly-value--emphasis {
        font-size: ${token.fontSizeLG}px;
        line-height: ${token.lineHeight};
        margin-top: ${token.marginXXS}px;
      }
      .si-master-step-card .form-field-cell {
        padding: ${token.paddingXS}px 0;
      }
      .si-master-options-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      /* Modified by Sekar Nagarajan (2026-09-01 16:45) — master Segmented uses global .form-segmented */
      .si-master-compliance-grid {
        display: grid;
        width: 100%;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
        align-items: start;
      }
      .si-master-vessel-panel {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${tokenMix(token.colorInfo, 22)};
        background: linear-gradient(
          135deg,
          ${tokenMix(token.colorInfo, 6)} 0%,
          ${token.colorBgContainer} 48%,
          ${tokenMix(token.colorPrimary, 5)} 100%
        );
      }
      .si-master-vessel-panel__head {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .si-master-vessel-panel__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: ${token.borderRadius}px;
        background: ${tokenMix(token.colorInfo, 14)};
        color: ${token.colorInfo};
        flex-shrink: 0;
      }
      .si-master-vessel-panel__title {
        margin-bottom: 0;
        color: ${token.colorText};
      }
      .si-master-vessel-panel__tag {
        margin-inline-end: 0;
        margin-left: auto;
      }
      .si-master-vessel-row {
        display: grid;
        grid-template-columns: minmax(200px, 0.85fr) minmax(0, 1.4fr);
        gap: ${token.marginMD}px;
        align-items: stretch;
      }
      .si-master-vessel-hero {
        display: flex;
        align-items: center;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${tokenMix(token.colorPrimary, 10)};
        border: 1px solid ${tokenMix(token.colorPrimary, 28)};
        box-shadow: inset 3px 0 0 ${token.colorPrimary};
        margin-bottom: 0;
      }
      .si-master-vessel-hero__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        flex-shrink: 0;
      }
      .si-master-vessel-hero__body {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .si-master-vessel-hero__label {
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeightSM};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }
      .si-master-vessel-hero__value {
        font-size: ${token.fontSizeLG}px;
        line-height: ${token.lineHeight};
        color: ${token.colorText};
      }
      .si-master-vessel-hero__hint {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .si-master-vessel-legs {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        min-width: 0;
        max-height: none;
        overflow-y: visible;
      }
      .si-master-vessel-leg {
        flex: 1 1 280px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: inset 0 0 0 1px ${tokenMix(token.colorSuccess, 6)};
      }
      .si-master-vessel-leg__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .si-master-vessel-leg__index {
        margin-inline-end: 0;
      }
      .si-master-vessel-leg__vessel {
        font-size: ${token.fontSizeSM}px;
      }
      .si-master-vessel-leg__route {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .si-master-vessel-leg__port {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .si-master-vessel-leg__port--pod {
        text-align: right;
        align-items: flex-end;
      }
      .si-master-vessel-leg__port-label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
      }
      .si-master-vessel-leg__port--pol .si-master-vessel-leg__port-label {
        color: ${token.colorPrimary};
      }
      .si-master-vessel-leg__port--pod .si-master-vessel-leg__port-label {
        color: ${token.colorSuccess};
        flex-direction: row-reverse;
      }
      .si-master-vessel-leg__port-name {
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }
      .si-master-vessel-leg__connector {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        min-width: 72px;
      }
      .si-master-vessel-leg__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .si-master-vessel-leg__dot--pol {
        background: ${token.colorPrimary};
      }
      .si-master-vessel-leg__dot--pod {
        background: ${token.colorSuccess};
      }
      .si-master-vessel-leg__rail {
        flex: 1;
        height: 2px;
        background: linear-gradient(
          90deg,
          ${token.colorPrimary} 0%,
          ${token.colorSuccess} 100%
        );
      }
      .si-master-vessel-leg__ship {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: 50%;
        background: ${tokenMix(token.colorInfo, 12)};
        color: ${token.colorInfo};
        flex-shrink: 0;
      }
      .si-master-vessel-leg__meta {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }
      .si-master-vessel-leg__etime {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .si-master-vessel-empty {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px dashed ${token.colorBorder};
        background: ${token.colorFillAlter};
        font-size: ${token.fontSizeSM}px;
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
        max-width: ${token.controlHeightLG * 7}px;
        margin-bottom: ${token.marginLG}px;
        gap: ${token.marginSM}px;
      }
      /* Modified by Sekar Nagarajan (2026-09-01 00:21) — ENS toggle + options single row */
      .si-ens-top-row {
        max-width: 100%;
        grid-template-columns: minmax(0, 0.5fr) repeat(4, minmax(0, 1fr));
        align-items: start;
        column-gap: ${token.marginLG}px;
        row-gap: ${token.marginMD}px;
      }
      /* Modified by Sekar Nagarajan (2026-09-01 00:17) — ENS switch icon colors (off = blue, on = white) */
      .si-ens-switch-control {
        display: flex;
        align-items: center;
        min-height: ${token.controlHeight}px;
      }
      .si-ens-switch.ant-switch {
        width: auto;
        min-width: ${token.controlHeightLG * 1}px;
        align-self: flex-start;
        justify-self: start;
      }
      /* Modified by Sekar Nagarajan (2026-08-31 16:19) — ENS field padding/margin (token-only) */
      .si-ens-sections {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
        width: 100%;
        margin-top: ${token.marginXS}px;
      }
      .si-ens-options-grid,
      .si-ens-party-grid,
      .si-ens-form-grid {
        display: grid;
        width: 100%;
        align-items: start;
        column-gap: ${token.marginLG}px;
        row-gap: ${token.marginMD}px;
      }
      .si-ens-options-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        padding-bottom: ${token.paddingXS}px;
      }
      .si-ens-party-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .si-ens-form-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
      .si-ens-options-grid .form-field-cell,
      .si-ens-party-grid .form-field-cell,
      .si-ens-form-grid .form-field-cell,
      .si-ens-required-row .form-field-cell {
        min-width: 0;
        padding: ${token.paddingXS}px 0;
        gap: ${token.marginXS}px;
      }
      .si-ens-options-grid .form-field-label,
      .si-ens-party-grid .form-field-label,
      .si-ens-form-grid .form-field-label,
      .si-ens-required-row .form-field-label {
        margin-bottom: 0;
      }
      .si-ens-options-grid .form-field-error,
      .si-ens-party-grid .form-field-error,
      .si-ens-form-grid .form-field-error {
        margin-top: 0;
      }
      .si-ens-options-grid .ant-input,
      .si-ens-options-grid .ant-select,
      .si-ens-party-grid .ant-input,
      .si-ens-party-grid .ant-select,
      .si-ens-form-grid .ant-input,
      .si-ens-form-grid .ant-select,
      .si-ens-required-row .ant-segmented {
        width: 100%;
      }
      .si-ens-subcard.ant-card {
        width: 100%;
        margin: 0;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .si-ens-subcard > .ant-card-head {
        min-height: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px !important;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .si-ens-subcard > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .si-ens-subcard .form-step-card-title {
        margin: 0 !important;
      }
      .si-ens-notes.ant-alert {
        width: 100%;
        margin: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .si-ens-notes .ant-alert-message {
        margin-bottom: ${token.marginXS}px;
      }
      .si-ens-notes .ant-alert-description {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }

      @media (max-width: 1199px) {
        .si-master-detail-grid--4,
        .si-master-detail-grid--5 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .si-master-sections-row .si-master-detail-grid--3,
        .si-master-sections-row .si-master-vessel-row,
        .si-master-options-grid:not(.si-master-options-grid--stack),
        .si-master-compliance-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .si-routing-form-grid,
        .si-ens-form-grid,
        .si-ens-options-grid,
        .si-ens-top-row,
        .si-ens-party-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .si-cargo-protect-form-grid,
        .si-charges-form-grid,
        .si-charge-tab-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 991px) {
        .si-master-vessel-row {
          grid-template-columns: minmax(0, 1fr);
        }
        .si-master-detail-grid--3,
        .si-master-detail-grid--4,
        .si-master-detail-grid--5,
        .si-master-options-grid,
        .si-master-compliance-grid,
        .si-routing-form-grid,
        .si-cargo-protect-form-grid,
        .si-charges-form-grid,
        .si-charge-tab-form-grid,
        .si-ens-form-grid,
        .si-ens-options-grid,
        .si-ens-top-row,
        .si-ens-party-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      @media (max-width: 767px) {
        .si-master-vessel-leg__route {
          grid-template-columns: minmax(0, 1fr);
          gap: ${token.marginXS}px;
        }
        .si-master-vessel-leg__port--pod {
          text-align: left;
          align-items: flex-start;
        }
        .si-master-vessel-leg__port--pod .si-master-vessel-leg__port-label {
          flex-direction: row;
        }
        .si-master-vessel-leg__connector {
          min-width: 0;
          width: 100%;
          justify-content: center;
          padding: ${token.paddingXXS}px 0;
        }
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
        .si-view-row--2 {
          grid-template-columns: 1fr;
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
