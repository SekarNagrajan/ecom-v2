// Modified by Sekar Nagarajan (2026-08-24 19:09)
import { theme } from 'antd';

import { tokenMix } from '../../theme/utils/token-mix';

export function UserCreationModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .usc-page {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .usc-limit-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .usc-limit-card > .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
      }
      .usc-limit-card__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .usc-limit-card__count {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .usc-limit-card__status {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        min-height: ${token.controlHeightLG}px;
      }
      .usc-alert {
        margin: 0;
      }
      .usc-search-panel {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .usc-search-panel .ant-input-affix-wrapper,
      .usc-search-panel .ant-input {
        width: 100%;
      }
      .usc-grid-wrap {
        width: 100%;
        min-height: 420px;
      }
      .usc-grid-wrap .ag-theme-alpine,
      .usc-grid-wrap .ag-root-wrapper {
        min-height: 420px;
      }
      .usc-status-tag.ant-tag,
      .usc-module-tag.ant-tag {
        margin: 0;
        border-radius: ${token.borderRadiusSM}px;
      }
      .usc-drawer-body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .usc-drawer-actions {
        display: inline-flex;
        justify-content: flex-end;
        width: 100%;
      }
      .usc-drawer-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginXS}px;
        width: 100%;
        flex-wrap: wrap;
      }
      .usc-flow-strip {
        display: flex;
        align-items: stretch;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .usc-flow-step {
        flex: 1;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .usc-flow-step--credentials {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(180deg, ${primaryTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .usc-flow-step--profile {
        border-left: 4px solid ${token.colorInfo};
        background: linear-gradient(180deg, ${token.colorInfoBg} 0%, ${token.colorFillAlter} 100%);
      }
      .usc-flow-step--access {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(180deg, ${successTint8} 0%, ${token.colorFillAlter} 100%);
      }
      .usc-flow-step__label {
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
      .usc-flow-step__title {
        margin: 0 !important;
        font-size: ${token.fontSize}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        color: ${token.colorText} !important;
      }
      .usc-flow-connector {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${token.colorPrimary};
        padding: 0 ${token.marginXXS}px;
      }
      .usc-form-section {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .usc-form-section__title {
        margin: 0 !important;
        font-size: ${token.fontSizeLG}px !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .usc-modules-group {
        width: 100%;
      }
      .usc-modules-group .ant-checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px ${token.marginMD}px;
      }

      @media (max-width: 767px) {
        .usc-limit-card__status {
          justify-content: flex-start;
        }
        .usc-search-panel {
          padding: ${token.paddingMD}px;
        }
        .usc-flow-strip {
          flex-direction: column;
        }
        .usc-flow-connector {
          transform: rotate(90deg);
          padding: ${token.marginXXS}px 0;
        }
        .module-screen-header__extra .sm-app-button,
        .module-screen-header__extra .ant-btn {
          width: 100%;
        }
      }
    `}</style>
  );
}
