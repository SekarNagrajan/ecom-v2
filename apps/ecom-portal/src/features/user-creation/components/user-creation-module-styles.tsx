// Modified by Sekar Nagarajan (2026-11-11 15:10)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function UserCreationModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const primaryTint12 = tokenMix(token.colorPrimary, 12);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const successTint12 = tokenMix(token.colorSuccess, 12);
  const errorTint8 = tokenMix(token.colorError, 8);

  return (
    <style>{`
      .usc-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .usc-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.usc-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.usc-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .usc-page-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        gap: ${token.marginSM}px;
      }
      .usc-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }

      .usc-status-filter {
        flex-shrink: 0;
        margin: 0 ${token.paddingLG}px;
        padding: ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .usc-status-filter__pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 6px 12px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        font-size: ${token.fontSize}px;
        line-height: 1.3;
        cursor: pointer;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          color 0.15s ease;
      }
      .usc-status-filter__pill:hover {
        border-color: ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .usc-status-filter__pill--selected {
        border-color: transparent;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }
      .usc-status-filter__pill--empty {
        opacity: 0.55;
      }
      .usc-status-filter__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        background: ${token.colorPrimary};
      }
      .usc-status-filter__pill--accepted .usc-status-filter__dot {
        background: ${token.colorSuccess};
      }
      .usc-status-filter__pill--invited .usc-status-filter__dot {
        background: ${token.colorInfo};
      }
      .usc-status-filter__pill--approval .usc-status-filter__dot {
        background: ${token.colorWarning};
      }
      .usc-status-filter__pill--deactivated .usc-status-filter__dot {
        background: ${token.colorTextQuaternary};
      }
      .usc-status-filter__pill--selected.usc-status-filter__pill--all .usc-status-filter__dot {
        background: ${token.colorPrimary};
      }
      .usc-status-filter__label {
        font-weight: 600;
      }
      .usc-status-filter__count {
        color: ${token.colorTextSecondary};
        font-weight: 400;
      }
      .usc-status-filter__pill--selected .usc-status-filter__count {
        color: inherit;
        opacity: 0.75;
      }

      .usc-grid-wrap {
        flex: 1;
        min-height: 0;
        width: 100%;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
      }
      /* Hide empty DataView toolbar card left by renderToolbar={() => null} */
      .usc-grid-wrap > .ant-flex > .ant-card:first-child,
      .usc-table-card > .ant-flex > .ant-card:first-child {
        display: none !important;
      }
      .usc-grid-wrap > .ant-flex,
      .usc-table-card > .ant-flex {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .usc-grid-wrap > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .usc-grid-wrap .usc-data-view {
        min-height: calc(100vh - 360px);
      }
      .usc-grid-wrap .ag-theme-alpine,
      .usc-grid-wrap .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
      }
      .usc-data-view .sm-data-view-toolbar,
      .usc-data-view .data-view-toolbar {
        display: none !important;
      }
      .usc-table-card {
        flex: 1;
        min-height: 0;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .usc-login-cell {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .usc-login-cell__icon {
        color: ${token.colorPrimary};
      }

      .usc-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin: 0;
        padding: 2px 10px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid transparent;
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
        line-height: 1.4;
      }
      .usc-status-pill--active {
        color: ${token.colorSuccess};
        background: ${successTint8};
        border-color: ${tokenMix(token.colorSuccess, 16)};
      }
      .usc-status-pill--disabled {
        color: ${token.colorError};
        background: ${errorTint8};
        border-color: ${tokenMix(token.colorError, 16)};
      }
      .usc-status-pill__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }

      .usc-invite-pill {
        display: inline-flex;
        align-items: center;
        margin: 0;
        padding: 2px 8px;
        border-radius: ${token.borderRadiusSM}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
        border: 1px solid ${token.colorInfoBorder};
      }
      .usc-invite-pill--none {
        background: ${token.colorFillAlter};
        color: ${token.colorTextSecondary};
        border-color: ${token.colorBorderSecondary};
      }
      .usc-invite-pill--accepted {
        background: ${successTint8};
        color: ${token.colorSuccess};
        border-color: ${tokenMix(token.colorSuccess, 16)};
      }

      .usc-module-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
        background: ${primaryTint8};
        border-color: ${token.colorPrimaryBorder};
        color: ${token.colorPrimary};
      }

      .usc-drawer-header-bar.ant-drawer-header {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorBgContainer} 100%);
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .usc-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .usc-drawer-title__icon {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorPrimaryBorder};
        color: ${token.colorPrimary};
      }
      .usc-drawer-title__copy {
        min-width: 0;
        padding-top: 2px;
      }
      .usc-drawer-title__text {
        margin: 0;
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
        color: ${token.colorText};
      }
      .usc-drawer-title__meta {
        margin-top: 2px;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.4;
        color: ${token.colorTextSecondary};
      }
      .usc-drawer-body.custom-scroll {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px ${token.paddingLG}px;
        overflow-y: auto;
        background: ${token.colorFillAlter};
      }
      .usc-drawer-footer-bar.ant-drawer-footer {
        padding: 0 !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .usc-drawer-footer.form-step-footer {
        width: 100%;
        margin: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-top: none;
        gap: ${token.marginSM}px;
        background: transparent;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
      .usc-drawer-footer .sm-app-button.ant-btn,
      .usc-drawer-footer .ant-btn {
        height: ${token.controlHeight}px;
        margin: 0;
        padding-inline: ${token.paddingMD}px;
      }

      .usc-form-section {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        margin: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }
      .usc-form-section:last-child {
        margin-bottom: 0;
      }
      .usc-form-section__header {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .usc-form-section__step {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        margin-top: 1px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1;
      }
      .usc-form-section__icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        margin-top: 0;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
        border: 1px solid ${token.colorPrimaryBorder};
      }
      .usc-form-section__heading {
        min-width: 0;
        flex: 1;
      }
      .usc-form-section__extra {
        flex-shrink: 0;
        margin-left: auto;
        align-self: flex-start;
      }
      .usc-form-section__title {
        margin: 0;
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
        color: ${token.colorText};
      }
      .usc-form-section__hint {
        margin: 4px 0 0;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.45;
        color: ${token.colorTextSecondary};
      }
      .usc-form-section__fields {
        width: 100%;
      }
      .usc-form-section .ant-form-item {
        margin-bottom: 0;
        width: 100%;
      }
      .usc-form-section .ant-form-item-row {
        width: 100%;
      }
      .usc-form-section .ant-form-item-control,
      .usc-form-section .ant-form-item-control-input,
      .usc-form-section .ant-form-item-control-input-content {
        width: 100%;
      }
      .usc-form-section .ant-form-item-label {
        padding-bottom: 4px !important;
      }
      .usc-form-section .ant-form-item-label > label {
        height: auto !important;
      }
      .usc-form-section .form-field-label {
        display: inline-block;
      }
      .usc-form-section .ant-input-affix-wrapper,
      .usc-form-section .ant-input {
        width: 100%;
      }

      .usc-provision-options {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px;
        margin-top: ${token.marginXXS}px;
      }
      .usc-provision-option {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: ${token.marginSM}px;
        align-items: flex-start;
        width: 100%;
        text-align: left;
        margin: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        color: ${token.colorText};
        cursor: pointer;
        transition:
          border-color 0.15s ease,
          background-color 0.15s ease,
          box-shadow 0.15s ease;
      }
      .usc-provision-option:hover {
        border-color: ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .usc-provision-option--selected {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
        box-shadow: inset 0 0 0 1px ${token.colorPrimaryBorder};
      }
      .usc-provision-option__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorBgContainer};
        color: ${token.colorPrimary};
      }
      .usc-provision-option__copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .usc-provision-option__title {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
      }
      .usc-provision-option__desc {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.4;
        color: ${token.colorTextSecondary};
      }
      .usc-provision-option__check {
        color: ${token.colorPrimary};
        min-width: 16px;
        min-height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .usc-provision-option:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
      }

      .usc-invite-hint {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-height: ${token.controlHeightLG + 22}px;
        margin-top: 22px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorInfoBorder};
        background: ${token.colorInfoBg};
        color: ${token.colorText};
      }
      .usc-invite-hint strong {
        display: block;
        font-size: ${token.fontSize}px;
        line-height: 1.3;
      }
      .usc-invite-hint span {
        display: block;
        margin-top: 2px;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.4;
        color: ${token.colorTextSecondary};
      }

      .usc-locked-login {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
        padding: ${token.paddingSM + 2}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${primaryTint8};
        border: 1px solid ${token.colorPrimaryBorder};
        color: ${token.colorTextSecondary};
      }
      .usc-locked-login__leading {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorBgContainer};
        color: ${token.colorPrimary};
      }
      .usc-locked-login__copy {
        flex: 1;
        min-width: 0;
      }
      .usc-locked-login__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
        margin-bottom: 2px;
      }
      .usc-locked-login__value {
        display: block;
        color: ${token.colorText};
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
        word-break: break-all;
      }
      .usc-locked-login__badge {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
        line-height: 1.2;
      }

      .usc-modules {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .usc-modules__meta,
      .usc-modules__header-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .usc-modules__count {
        display: inline-flex;
        align-items: center;
        padding: 2px 10px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${successTint8};
        border: 1px solid ${tokenMix(token.colorSuccess, 16)};
        color: ${token.colorSuccess};
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
        line-height: 1.4;
        white-space: nowrap;
      }
      .usc-modules__clear {
        margin: 0;
        padding: 0;
        border: none;
        background: none;
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }
      .usc-modules__clear:hover {
        text-decoration: underline;
      }
      .usc-modules-error {
        display: block;
        font-size: ${token.fontSizeSM}px;
      }
      .usc-modules-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .usc-module-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: ${token.marginSM}px;
        align-items: center;
        width: 100%;
        text-align: left;
        padding: ${token.paddingSM + 2}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        cursor: pointer;
        transition:
          border-color 0.15s ease,
          background-color 0.15s ease,
          box-shadow 0.15s ease;
      }
      .usc-module-card:hover {
        border-color: ${token.colorPrimaryBorder};
        background: ${primaryTint8};
      }
      .usc-module-card--selected {
        border-color: ${token.colorSuccess};
        background: ${successTint8};
        box-shadow: inset 0 0 0 1px ${token.colorSuccessBorder};
      }
      .usc-module-card--selected:hover {
        background: ${successTint12};
      }
      .usc-module-card__icon {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorFillAlter};
        color: ${token.colorPrimary};
      }
      .usc-module-card--selected .usc-module-card__icon {
        background: ${token.colorBgContainer};
        color: ${token.colorSuccess};
      }
      .usc-module-card__copy {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      .usc-module-card__code {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        letter-spacing: 0.02em;
        line-height: 1.25;
      }
      .usc-module-card--selected .usc-module-card__code {
        color: ${token.colorSuccess};
      }
      .usc-module-card__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
      }
      .usc-module-card--selected .usc-module-card__label {
        color: ${token.colorText};
      }
      .usc-module-card__check {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        border: 1.5px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
      .usc-module-card__check--on {
        border-color: ${token.colorSuccess};
        background: ${token.colorSuccess};
        color: #fff;
      }
      .usc-module-card__tick,
      .usc-module-card__tick.app-icon,
      .usc-module-card__check--on .app-icon,
      .usc-module-card__check--on svg {
        color: #fff !important;
        stroke: #fff !important;
      }
      .usc-module-card:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: 2px;
        background: ${primaryTint12};
      }

      @media (max-width: 767px) {
        .usc-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .usc-status-filter {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .usc-grid-wrap {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .usc-drawer-header-bar.ant-drawer-header {
          padding: ${token.paddingSM}px ${token.paddingMD}px !important;
        }
        .usc-drawer-body.custom-scroll {
          gap: ${token.marginSM}px;
          padding: ${token.paddingSM}px ${token.paddingMD}px ${token.paddingMD}px;
        }
        .usc-form-section {
          padding: ${token.paddingMD}px;
        }
        .usc-form-section__header {
          flex-wrap: wrap;
        }
        .usc-form-section__extra {
          width: 100%;
          margin-left: 0;
          margin-top: ${token.marginXXS}px;
        }
        .usc-modules__header-actions {
          justify-content: flex-start;
        }
        .usc-provision-options {
          grid-template-columns: 1fr;
        }
        .usc-invite-hint {
          margin-top: 0;
          min-height: 0;
        }
        .usc-modules-grid {
          grid-template-columns: 1fr;
        }
        .usc-drawer-footer.form-step-footer {
          padding: ${token.paddingSM}px ${token.paddingMD}px;
        }
        .usc-drawer-footer .sm-app-button,
        .usc-drawer-footer .ant-btn {
          flex: 1;
        }
        .module-screen-header__extra .sm-app-button,
        .module-screen-header__extra .ant-btn {
          width: 100%;
        }
      }
    `}</style>
  );
}
