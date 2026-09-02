// Modified by Sekar Nagarajan (2026-09-02 11:20)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for Reference Information step (agenct.md). */
export function ReferenceFieldsStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const fillHover = token.colorFillAlter;

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
      .ref-fields-header__actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
      }
      .ref-fields-view-opt {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        line-height: 1;
      }
      .ref-fields-view-opt .app-icon {
        display: block;
        flex: none;
      }
      .ref-fields-view-segmented.ant-segmented .ant-segmented-item-selected {
        background: ${token.colorBgElevated} !important;
        color: ${token.colorText} !important;
      }
      .ref-fields-view-segmented.ant-segmented
        .ant-segmented-item-selected
        .ant-segmented-item-label {
        color: ${token.colorText} !important;
      }
      .ref-fields-view-segmented.ant-segmented .ant-segmented-thumb {
        background: ${token.colorBgElevated} !important;
        box-shadow: ${token.boxShadowSecondary} !important;
      }
      .ref-fields-view-segmented.ant-segmented
        .ant-segmented-item-selected
        .ref-fields-view-opt
        .app-icon {
        color: ${token.colorText};
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
      .ref-fields-catalog-popover .ant-popover-inner {
        padding: 0;
      }
      .ref-fields-catalog-picker {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        width: min(300px, calc(100vw - ${token.paddingLG * 2}px));
        padding: ${token.paddingMD}px;
      }
      .ref-fields-catalog-picker__title {
        display: block;
      }
      .ref-fields-catalog-picker__empty {
        display: block;
        padding-block: ${token.paddingSM}px;
      }
      .ref-fields-catalog-picker__select-all {
        align-items: center;
      }
      .ref-fields-catalog-picker__divider {
        margin: 0;
      }
      .ref-fields-catalog-picker__list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        max-height: 280px;
        overflow-y: auto;
      }
      .ref-fields-catalog-picker__option {
        align-items: flex-start;
        width: 100%;
        margin-inline: 0;
      }
      .ref-fields-catalog-picker__option .ant-checkbox + span {
        flex: 1;
        min-width: 0;
      }
      .ref-fields-catalog-picker__footer {
        display: flex;
        justify-content: flex-end;
        gap: ${token.marginXS}px;
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

      /* —— List view table —— */
      .ref-fields-table-wrap {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
        background: ${token.colorBgContainer};
      }
      .ref-fields-table-scroll {
        overflow: auto;
      }
      .ref-fields-table {
        width: 100%;
        min-width: 480px;
        border-collapse: collapse;
        table-layout: fixed;
      }
      .ref-fields-table thead th {
        position: sticky;
        top: 0;
        z-index: 2;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        text-align: left;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        background: ${token.colorFillAlter};
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .ref-fields-table tbody td {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        vertical-align: middle;
      }
      .ref-fields-table tbody tr:hover td {
        background: ${fillHover};
      }
      .ref-fields-table__td-name {
        width: 28%;
        min-width: 140px;
      }
      .ref-fields-table__td-value {
        width: auto;
        min-width: 220px;
      }
      .ref-fields-table__td-actions,
      .ref-fields-table__th-actions {
        width: 88px;
        text-align: center;
      }
      .ref-fields-table__name {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ref-fields-table .ref-fields-radio {
        flex-wrap: wrap;
      }
      .ref-fields-table .ref-fields-radio .ant-radio-button-wrapper {
        flex: 0 1 auto;
        min-width: 88px;
      }
      .ref-fields-input {
        width: 100%;
      }
    `}</style>
  );
}
