// Created by Sekar Nagarajan (2026-09-28 15:28)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for the Agency Hotline drawer + footer trigger. */
export function HotlineModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const primaryTint12 = tokenMix(token.colorPrimary, 12);

  return (
    <style>{`
      .hotline-drawer-header-bar.ant-drawer-header {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .hotline-drawer-body.ant-drawer-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        background: ${token.colorBgLayout};
      }

      .hotline-panel-header {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        width: 100%;
        padding-right: ${token.paddingLG}px;
        min-width: 0;
      }
      .hotline-panel-header__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      .hotline-panel-header__copy {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .hotline-panel-header__title {
        margin: 0 !important;
        line-height: 1.25 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .hotline-panel-header__description {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        color: ${token.colorTextSecondary};
      }

      .hotline-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }

      .hotline-country.ant-collapse {
        background: transparent;
        border: none;
      }
      .hotline-country.ant-collapse > .ant-collapse-item {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px !important;
        background: ${token.colorBgContainer};
        overflow: hidden;
        margin-bottom: 0;
      }
      .hotline-country.ant-collapse > .ant-collapse-item + .ant-collapse-item {
        margin-top: ${token.marginSM}px;
      }
      .hotline-country.ant-collapse > .ant-collapse-item > .ant-collapse-header {
        align-items: center;
        padding: ${token.paddingSM}px ${token.paddingMD}px !important;
      }
      .hotline-country.ant-collapse .ant-collapse-content {
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .hotline-country.ant-collapse .ant-collapse-content-box {
        padding: ${token.paddingSM}px ${token.paddingMD}px ${token.paddingMD}px !important;
      }

      .hotline-country__label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        width: 100%;
        min-width: 0;
      }
      .hotline-country__name {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .hotline-country__count {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${primaryTint8};
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1;
      }

      .hotline-ports.ant-collapse {
        background: transparent;
        border: none;
      }
      .hotline-ports.ant-collapse > .ant-collapse-item {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadius}px !important;
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .hotline-ports.ant-collapse > .ant-collapse-item + .ant-collapse-item {
        margin-top: ${token.marginXS}px;
      }
      .hotline-ports.ant-collapse > .ant-collapse-item > .ant-collapse-header {
        align-items: center;
        padding: ${token.paddingXS}px ${token.paddingSM}px !important;
      }
      .hotline-ports.ant-collapse .ant-collapse-content {
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .hotline-ports.ant-collapse .ant-collapse-content-box {
        padding: ${token.paddingSM}px !important;
      }

      .hotline-port__label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }

      .hotline-contact {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .hotline-contact__row {
        display: grid;
        grid-template-columns: ${token.controlHeightSM}px minmax(0, 1fr);
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .hotline-contact__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${primaryTint12};
        color: ${token.colorPrimary};
        flex-shrink: 0;
      }
      .hotline-contact__value {
        min-width: 0;
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
        color: ${token.colorText};
        word-break: break-word;
      }
      .hotline-contact__value--muted {
        color: ${token.colorTextSecondary};
      }
      a.hotline-contact__value {
        color: ${token.colorPrimary};
        text-decoration: none;
      }
      a.hotline-contact__value:hover {
        text-decoration: underline;
      }

      .app-footer__hotline {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-shrink: 0;
        line-height: 1;
      }
      .app-footer__hotline-btn.ant-btn {
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        min-width: ${token.controlHeightSM}px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: ${token.colorTextSecondary};
      }
      .app-footer__hotline-btn.ant-btn:hover,
      .app-footer__hotline-btn.ant-btn:focus-visible {
        color: ${token.colorPrimary};
        background: ${primaryTint8};
      }
    `}</style>
  );
}
