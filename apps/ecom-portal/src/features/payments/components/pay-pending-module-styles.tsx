// Modified by Sekar Nagarajan (2026-11-25 15:30)
import { theme } from "antd";

import { BE_COLOR_MAP } from "../../theme/utils/config-mapper";
import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for Pay Pending drawer — mockup parity. */
export function PayPendingModuleStyles() {
  const { token } = theme.useToken();
  const verdigris = BE_COLOR_MAP.VERDIGRIS;
  const verdigrisBg = tokenMix(verdigris, 12);
  const verdigrisBorder = tokenMix(verdigris, 28);
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const primaryTint12 = tokenMix(token.colorPrimary, 12);
  const primaryTint20 = tokenMix(token.colorPrimary, 20);
  const successTint10 = tokenMix(token.colorSuccess, 10);
  const successTint16 = tokenMix(token.colorSuccess, 16);
  const errorTint10 = tokenMix(token.colorError, 10);
  const radius = Math.max(token.borderRadiusLG, 12);

  return (
    <style>{`
      .pay-pending-drawer__header-wrap .ant-drawer-header-title {
        align-items: flex-start;
      }
      .pay-pending-drawer__header {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginMD}px;
        padding-inline-end: ${token.paddingLG}px;
      }
      .pay-pending-drawer__icon {
        width: 44px;
        height: 44px;
        border-radius: ${token.borderRadiusLG}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${primaryTint12};
        color: ${token.colorPrimary};
        flex-shrink: 0;
        margin-top: 2px;
      }
      .pay-pending-drawer__brand-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .pay-pending-drawer__eyebrow {
        display: block;
        font-size: ${token.fontSizeSM}px !important;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${token.colorPrimary} !important;
        font-weight: 600 !important;
        line-height: 1.2 !important;
      }
      .pay-pending-drawer__heading {
        margin: 0 !important;
        line-height: 1.25 !important;
        color: ${token.colorTextHeading} !important;
      }
      .pay-pending-drawer__subtitle {
        display: block;
        font-size: ${token.fontSizeSM}px !important;
        line-height: 1.4 !important;
      }
      .pay-pending-drawer {
        padding-block: ${token.paddingSM}px !important;
      }
      .pay-pending-drawer__content {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }

      /* Summary KPI cards */
      .pay-pending-summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginSM}px;
      }
      .pay-pending-summary__card {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${radius}px;
        border: 1px solid transparent;
      }
      .pay-pending-summary__card--items,
      .pay-pending-summary__card--selected {
        background: ${primaryTint8};
        border-color: ${primaryTint20};
        color: ${token.colorPrimary};
      }
      .pay-pending-summary__card--due {
        background: ${successTint10};
        border-color: ${successTint16};
        color: ${token.colorSuccess};
      }
      .pay-pending-summary__icon {
        width: 36px;
        height: 36px;
        border-radius: ${token.borderRadius}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorBgContainer};
      }
      .pay-pending-summary__card--items .pay-pending-summary__icon,
      .pay-pending-summary__card--selected .pay-pending-summary__icon {
        color: ${token.colorPrimary};
      }
      .pay-pending-summary__card--due .pay-pending-summary__icon {
        color: ${token.colorSuccess};
      }
      .pay-pending-summary__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .pay-pending-summary__label {
        display: block;
        font-size: ${token.fontSizeSM}px !important;
        color: ${token.colorTextSecondary} !important;
        line-height: 1.2 !important;
      }
      .pay-pending-summary__value {
        display: block;
        font-size: ${token.fontSizeLG}px !important;
        line-height: 1.25 !important;
        color: ${token.colorTextHeading} !important;
        font-variant-numeric: tabular-nums;
      }
      .pay-pending-summary__value--due {
        color: ${token.colorSuccess} !important;
      }

      /* Toolbar */
      .pay-pending-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        min-height: ${token.controlHeight}px;
      }
      .pay-pending-toolbar__clear.ant-btn {
        padding-inline: 0;
      }

      /* Agency accordion */
      .pay-pending-groups {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .pay-pending-group {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${radius}px;
        overflow: hidden;
        background: ${token.colorBgContainer};
      }
      .pay-pending-group__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        background: ${primaryTint8};
        border-bottom: 1px solid transparent;
        transition: border-color ${token.motionDurationMid} ease;
      }
      .pay-pending-group--expanded .pay-pending-group__head {
        border-bottom-color: ${token.colorBorderSecondary};
      }
      .pay-pending-group__panel {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.32s ease;
      }
      .pay-pending-group--expanded .pay-pending-group__panel {
        grid-template-rows: 1fr;
      }
      .pay-pending-group__panel-inner {
        min-height: 0;
        overflow: hidden;
      }
      @media (prefers-reduced-motion: reduce) {
        .pay-pending-group__panel {
          transition: none;
        }
        .pay-pending-group__chevron .app-icon {
          transition: none;
        }
      }
      .pay-pending-group__head-start {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
        flex: 1 1 auto;
      }
      .pay-pending-group__toggle {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        font: inherit;
        text-align: left;
        color: inherit;
      }
      .pay-pending-group__building {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadius}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${token.colorBgContainer};
        color: ${token.colorPrimary};
        flex-shrink: 0;
      }
      .pay-pending-group__name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pay-pending-group__badge {
        display: inline-flex;
        align-items: center;
        padding: 0 8px;
        min-height: 22px;
        border-radius: 999px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        line-height: 1;
        flex-shrink: 0;
      }
      .pay-pending-group__head-end {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-shrink: 0;
      }
      .pay-pending-group__total {
        font-variant-numeric: tabular-nums;
        color: ${token.colorTextHeading} !important;
      }
      .pay-pending-group__chevron.ant-btn {
        color: ${token.colorTextSecondary};
      }
      .pay-pending-group__chevron .app-icon {
        display: inline-flex;
        transition: transform ${token.motionDurationMid} ease;
        transform: rotate(0deg);
      }
      .pay-pending-group--expanded .pay-pending-group__chevron .app-icon {
        transform: rotate(180deg);
      }

      /* Invoice rows */
      .pay-pending-list {
        list-style: none;
        margin: 0;
        padding: ${token.paddingSM}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        background: ${token.colorFillAlter};
      }
      .pay-pending-row {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr);
        gap: ${token.marginSM}px;
        align-items: start;
      }
      .pay-pending-row__select {
        padding-top: ${token.paddingMD}px;
        display: flex;
        justify-content: center;
      }
      .pay-pending-row__card {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${radius}px;
        background: ${token.colorBgContainer};
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .pay-pending-row--selected .pay-pending-row__card {
        border-color: ${primaryTint20};
        box-shadow: 0 0 0 1px ${primaryTint12};
      }
      .pay-pending-row__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
      }
      .pay-pending-row__identity {
        min-width: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px ${token.marginSM}px;
      }
      .pay-pending-row__doc-icon {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadius}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${primaryTint12};
        color: ${token.colorPrimary};
        flex-shrink: 0;
      }
      .pay-pending-row__booking {
        font-size: ${token.fontSizeLG}px !important;
        line-height: 1.25 !important;
      }
      .pay-pending-row__type.ant-tag {
        margin: 0;
        border-radius: 999px;
        border-color: ${verdigrisBorder};
        background: ${verdigrisBg};
        color: ${verdigris};
        line-height: 1.4;
        padding-inline: 10px;
      }
      .pay-pending-row__amount {
        flex-shrink: 0;
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        min-width: 7.5rem;
      }
      .pay-pending-row__amount-label {
        font-size: ${token.fontSizeSM}px !important;
        color: ${token.colorTextSecondary} !important;
        line-height: 1.2 !important;
      }
      .pay-pending-row__amount-value {
        font-variant-numeric: tabular-nums;
        font-size: ${token.fontSizeLG}px !important;
        line-height: 1.2 !important;
        color: ${token.colorError} !important;
        background: ${errorTint10};
        padding: 4px 10px;
        border-radius: ${token.borderRadiusSM}px;
      }
      .pay-pending-row__meta {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.35fr);
        gap: ${token.marginSM}px ${token.marginMD}px;
        padding-top: ${token.paddingXS}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .pay-pending-row__field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .pay-pending-row__field-label {
        font-size: ${token.fontSizeSM}px !important;
        color: ${token.colorTextSecondary} !important;
        line-height: 1.2 !important;
      }
      .pay-pending-row__field-line {
        display: flex;
        align-items: center;
        gap: 2px;
        min-width: 0;
      }
      .pay-pending-row__field-value {
        line-height: 1.3 !important;
        word-break: break-word;
      }
      .pay-pending-row__copy.ant-btn {
        flex-shrink: 0;
        color: ${token.colorTextSecondary};
      }
      .pay-pending-row__copy--done.ant-btn {
        color: ${token.colorSuccess};
      }
      .pay-pending-row__route {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .pay-pending-row__leg {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .pay-pending-row__port-code {
        font-weight: 600 !important;
        line-height: 1.25 !important;
      }
      .pay-pending-row__port-name {
        font-size: ${token.fontSizeSM}px !important;
        line-height: 1.2 !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 10rem;
      }
      .pay-pending-row__arrow {
        color: ${token.colorTextSecondary};
        padding-top: 1px;
        flex-shrink: 0;
      }

      /* Footer */
      .pay-pending-drawer__footer-wrap {
        padding: ${token.paddingMD}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .pay-pending-bar {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        flex-wrap: wrap;
      }
      .pay-pending-bar__summary {
        min-width: 0;
        flex: 1 1 12rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .pay-pending-bar__count {
        font-weight: 600 !important;
        line-height: 1.3 !important;
      }
      .pay-pending-bar__agency,
      .pay-pending-bar__warning {
        font-size: ${token.fontSizeSM}px !important;
        line-height: 1.3 !important;
      }
      .pay-pending-bar__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        flex-shrink: 0;
        margin-inline-start: auto;
      }

      .feature-page-shell:has(.pay-checkout-return-page) {
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 180px);
      }
      .pay-checkout-return-page {
        flex: 1 1 auto;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        background: ${token.colorBgLayout};
      }
      .pay-checkout-return-card {
        width: min(100%, 560px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginSM}px;
        text-align: center;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${Math.max(token.borderRadiusLG, 16)}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        box-shadow: ${token.boxShadowSecondary};
      }
      .pay-checkout-return-card__busy {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px 0;
      }
      .pay-checkout-return-card__intro {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 100%;
      }
      .pay-checkout-return-hero {
        position: relative;
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pay-checkout-return-hero__doc {
        width: 48px;
        height: 48px;
        border-radius: ${token.borderRadiusLG}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${tokenMix(token.colorSuccess, 12)};
        color: ${token.colorSuccess};
      }
      .pay-checkout-return-hero--cancel .pay-checkout-return-hero__doc,
      .pay-checkout-return-hero--error .pay-checkout-return-hero__doc {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .pay-checkout-return-hero__badge {
        position: absolute;
        right: 2px;
        bottom: 2px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${token.colorSuccess};
        color: ${token.colorTextLightSolid};
        border: 2px solid ${token.colorBgContainer};
        box-shadow: ${token.boxShadowTertiary};
      }
      .pay-checkout-return-hero--cancel .pay-checkout-return-hero__badge,
      .pay-checkout-return-hero--error .pay-checkout-return-hero__badge {
        background: ${token.colorError};
      }
      .pay-checkout-return-hero__spark {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 2px;
        transform: rotate(45deg);
      }
      .pay-checkout-return-hero__spark--tl {
        top: 4px;
        left: 6px;
        background: ${token.colorWarning};
      }
      .pay-checkout-return-hero__spark--tr {
        top: 10px;
        right: 2px;
        background: ${token.colorInfo};
      }
      .pay-checkout-return-card__title {
        margin: 0 !important;
        line-height: 1.2 !important;
        font-size: ${token.fontSizeHeading4}px !important;
      }
      .pay-checkout-return-card__message {
        display: block;
        max-width: 56ch;
        line-height: 1.4 !important;
        font-size: ${token.fontSizeSM}px !important;
      }

      /* Amount paid banner — light success tint */
      .pay-checkout-return-amount-banner {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 10px ${token.paddingMD}px;
        border-radius: ${Math.max(token.borderRadiusLG, 12)}px;
        background: ${tokenMix(token.colorSuccess, 10)};
        border: 1px solid ${tokenMix(token.colorSuccess, 18)};
      }
      .pay-checkout-return-amount-banner--cancel,
      .pay-checkout-return-amount-banner--error {
        background: ${token.colorFillAlter};
        border-color: ${token.colorBorderSecondary};
      }
      .pay-checkout-return-amount-banner__icon {
        position: absolute;
        left: ${token.paddingMD}px;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorBgContainer};
        color: ${token.colorSuccess};
        box-shadow: 0 0 0 1px ${tokenMix(token.colorSuccess, 16)};
      }
      .pay-checkout-return-amount-banner--cancel .pay-checkout-return-amount-banner__icon,
      .pay-checkout-return-amount-banner--error .pay-checkout-return-amount-banner__icon {
        color: ${token.colorPrimary};
        box-shadow: 0 0 0 1px ${token.colorBorderSecondary};
      }
      .pay-checkout-return-amount-banner__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
      }
      .pay-checkout-return-amount-banner__label {
        font-size: 11px !important;
        color: ${token.colorTextSecondary} !important;
        line-height: 1.2 !important;
      }
      .pay-checkout-return-amount-banner__value {
        font-size: ${token.fontSizeHeading4}px !important;
        line-height: 1.25 !important;
        font-variant-numeric: tabular-nums;
        text-align: center;
        color: ${token.colorSuccess} !important;
      }
      .pay-checkout-return-amount-banner--cancel .pay-checkout-return-amount-banner__value,
      .pay-checkout-return-amount-banner--error .pay-checkout-return-amount-banner__value {
        color: ${token.colorTextHeading} !important;
      }

      /* Meta grid: Status / Gateway / Agency / Paid On */
      .pay-checkout-return-meta {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        align-items: stretch;
        gap: 0;
        padding: 4px 0;
      }
      .pay-checkout-return-meta__item {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 0 ${token.paddingSM}px;
        border-right: 1px solid ${token.colorBorderSecondary};
      }
      .pay-checkout-return-meta__item:last-child {
        border-right: 0;
      }
      .pay-checkout-return-meta__top {
        min-height: 48px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .pay-checkout-return-meta__icon {
        width: 24px;
        height: 24px;
        border-radius: ${token.borderRadius}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: ${token.colorPrimary};
        background: ${tokenMix(token.colorPrimary, 10)};
      }
      .pay-checkout-return-meta__value {
        font-size: ${token.fontSize}px !important;
        line-height: 1.25 !important;
        text-align: center;
        word-break: break-word;
        color: ${token.colorTextHeading} !important;
      }
      .pay-checkout-return-meta__label {
        font-size: ${token.fontSizeSM}px !important;
        color: ${token.colorTextSecondary} !important;
        line-height: 1.2 !important;
      }
      .pay-checkout-return-status.ant-tag {
        margin: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border-radius: 999px;
        line-height: 1.35;
        padding-inline: 10px;
        font-weight: 600;
      }
      .pay-checkout-return-status--success.ant-tag {
        color: ${token.colorTextLightSolid};
        background: ${token.colorSuccess};
        border-color: ${token.colorSuccess};
      }
      .pay-checkout-return-status--cancel.ant-tag,
      .pay-checkout-return-status--error.ant-tag {
        color: ${token.colorTextLightSolid};
        background: ${token.colorError};
        border-color: ${token.colorError};
      }

      /* Payment reference row */
      .pay-checkout-return-ref {
        width: 100%;
        display: grid;
        grid-template-columns: 32px minmax(0, 1fr) 28px;
        align-items: center;
        gap: ${token.marginSM}px;
        text-align: left;
        padding: 8px ${token.paddingMD}px;
        border-radius: ${Math.max(token.borderRadiusLG, 12)}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .pay-checkout-return-ref__icon {
        width: 32px;
        height: 32px;
        border-radius: ${token.borderRadius}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${tokenMix(token.colorPrimary, 10)};
        color: ${token.colorPrimary};
      }
      .pay-checkout-return-ref__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .pay-checkout-return-ref__label {
        font-size: ${token.fontSizeSM}px !important;
        color: ${token.colorTextSecondary} !important;
        line-height: 1.2 !important;
      }
      .pay-checkout-return-ref__value {
        display: block;
        word-break: break-all;
        line-height: 1.3 !important;
        font-size: ${token.fontSizeSM}px !important;
      }
      .pay-checkout-return-ref__action.ant-btn {
        color: ${token.colorPrimary};
      }
      .pay-checkout-return-ref__action.is-copied.ant-btn {
        color: ${token.colorSuccess};
      }
      .pay-checkout-return-card__actions {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: ${token.marginSM}px;
      }
      .pay-checkout-return-card__actions .ant-btn {
        width: 100%;
        height: 40px;
      }
      @media (max-width: 720px) {
        .pay-checkout-return-card {
          width: min(100%, 560px);
        }
        .pay-checkout-return-meta {
          grid-template-columns: 1fr 1fr;
          gap: ${token.marginSM}px 0;
        }
        .pay-checkout-return-meta__item {
          border-right: 0;
          padding: ${token.paddingXS}px;
        }
        .pay-checkout-return-meta__item:nth-child(odd) {
          border-right: 1px solid ${token.colorBorderSecondary};
        }
        .pay-checkout-return-card__actions {
          grid-template-columns: 1fr;
        }
      }
      button.dashboard-planning-stat--clickable {
        cursor: pointer;
        font: inherit;
        text-align: left;
        appearance: none;
        -webkit-appearance: none;
      }
      button.dashboard-planning-stat--clickable:hover {
        background: ${token.colorFillTertiary};
      }
      button.dashboard-planning-stat--clickable:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
      }

      @media (max-width: 767px) {
        .pay-pending-summary {
          grid-template-columns: 1fr;
        }
        .pay-pending-row__top {
          flex-direction: column;
          align-items: stretch;
        }
        .pay-pending-row__amount {
          align-items: flex-start;
          text-align: left;
          min-width: 0;
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
        }
        .pay-pending-row__meta {
          grid-template-columns: 1fr 1fr;
        }
        .pay-pending-row__field--route {
          grid-column: 1 / -1;
        }
        .pay-pending-bar {
          flex-direction: column;
          align-items: stretch;
        }
        .pay-pending-bar__actions {
          width: 100%;
          margin-inline-start: 0;
        }
        .pay-pending-bar__actions .ant-btn {
          flex: 1 1 auto;
        }
      }
      @media (max-width: 480px) {
        .pay-pending-row__meta {
          grid-template-columns: 1fr;
        }
        .pay-pending-group__head {
          flex-wrap: wrap;
        }
      }
    `}</style>
  );
}
