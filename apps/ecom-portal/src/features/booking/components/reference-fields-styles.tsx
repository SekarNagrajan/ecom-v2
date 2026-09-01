// Modified by Sekar Nagarajan (2026-09-01 12:04)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for Reference Information step (agenct.md). */
export function ReferenceFieldsStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);

  return (
    <style>{`
      .ref-fields-header {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        margin-bottom: ${token.marginMD}px;
      }
      .ref-fields-header__intro {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .ref-fields-header__icon {
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorPrimary};
        color: ${token.colorWhite};
      }
      .ref-fields-header__title-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: ${token.marginXS}px;
      }
      .ref-fields-header__title {
        margin: 0 !important;
      }
      .ref-fields-header__count {
        font-size: ${token.fontSizeSM}px;
      }
      .ref-fields-header__hint {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .ref-fields-catalog-menu {
        max-height: 280px;
        overflow-y: auto;
      }
      .ref-fields-catalog-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .ref-fields-catalog-item__tag {
        font-size: ${token.fontSizeSM}px;
        text-transform: uppercase;
      }
      .ref-fields-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginSM}px;
        padding-block: ${token.paddingXL * 2}px;
        color: ${token.colorTextSecondary};
        text-align: center;
      }
      /* Modified by Sekar Nagarajan (2026-09-01 12:04) — 3-column field grid */
      .ref-fields-list {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px;
        align-items: stretch;
      }
      .ref-fields-row {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .ref-fields-row__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginXS}px;
        min-height: ${token.controlHeightSM}px;
      }
      .ref-fields-row__label {
        margin-bottom: 0;
        min-width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ref-fields-row__value {
        min-width: 0;
        width: 100%;
      }
      .ref-fields-row__actions {
        flex-shrink: 0;
      }
      .ref-fields-radio {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .ref-fields-radio.ant-radio-group {
        width: 100%;
      }
      .ref-fields-radio .ant-radio-button-wrapper {
        flex: 1;
        text-align: center;
      }
      .ref-fields-radio__option {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-height: ${token.controlHeight}px;
        padding: ${token.paddingXXS}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        cursor: pointer;
        margin: 0;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
      }
      .ref-fields-radio__option:hover {
        border-color: ${tokenMix(token.colorPrimary, 45)};
        color: ${token.colorPrimary};
      }
      .ref-fields-radio__option--selected {
        border-color: ${token.colorPrimary};
        background: ${primaryTint8};
        color: ${token.colorPrimary};
      }
      @media (max-width: 991px) {
        .ref-fields-list {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 575px) {
        .ref-fields-list {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}
