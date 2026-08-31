// Modified by Sekar Nagarajan (2026-08-31 14:17)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function BlPartyStyles() {
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

  return (
    <style>{`
      .bl-party-card__flags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginMD}px;
        margin-top: ${token.marginSM}px;
        padding-top: ${token.paddingSM}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .bl-party-card__flag {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        cursor: pointer;
        margin: 0;
      }
      .booking-party-search-input {
        flex: 1;
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
    `}</style>
  );
}
