// Modified by Sekar Nagarajan (2026-08-28 17:47)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed styles for SI/BL cargo list+grid editor. */
export function CargoLinesEditorStyles() {
  const { token } = theme.useToken();
  const successBg = tokenMix(token.colorSuccess, 12);
  const warningBg = tokenMix(token.colorWarning, 12);
  const fillHover = token.colorFillAlter;

  return (
    <style>{`
      .si-cargo-editor {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }

      /* —— Controls card (toolbar + summary) —— */
      .si-cargo-controls {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
      }
      .si-cargo-toolbar {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: ${token.marginSM}px ${token.marginMD}px;
      }
      .si-cargo-toolbar__filters,
      .si-cargo-toolbar__actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .si-cargo-toolbar__actions {
        justify-content: flex-end;
      }
      /* Modified by Sekar Nagarajan (2026-08-28 18:02) — icon + label baseline align */
      .si-cargo-view-opt {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        line-height: 1;
      }
      .si-cargo-view-opt .app-icon {
        display: block;
        flex: none;
      }
      /* Modified by Sekar Nagarajan (2026-09-01 11:11) — default segment style (not primary) */
      .si-cargo-view-segmented.ant-segmented .ant-segmented-item-selected {
        background: ${token.colorBgElevated} !important;
        color: ${token.colorText} !important;
      }
      .si-cargo-view-segmented.ant-segmented
        .ant-segmented-item-selected
        .ant-segmented-item-label {
        color: ${token.colorText} !important;
      }
      .si-cargo-view-segmented.ant-segmented .ant-segmented-thumb {
        background: ${token.colorBgElevated} !important;
        box-shadow: ${token.boxShadowSecondary} !important;
      }
      .si-cargo-view-segmented.ant-segmented
        .ant-segmented-item-selected
        .si-cargo-view-opt
        .app-icon {
        color: ${token.colorText};
      }
      .si-cargo-toolbar__search {
        flex: 1 1 220px;
        min-width: 180px;
        max-width: 320px;
      }
      .si-cargo-toolbar__add {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding-left: ${token.paddingSM}px;
        border-left: 1px solid ${token.colorBorderSecondary};
        height: ${token.controlHeightLG}px;
      }
      .si-cargo-toolbar__add > span {
        display: inline-flex;
        align-items: center;
        height: 100%;
      }
      .si-cargo-toolbar__add-qty.ant-input-number {
        width: ${token.controlHeightLG * 2}px;
        height: ${token.controlHeightLG}px;
      }
      .si-cargo-toolbar__add-qty.ant-input-number .ant-input-number-input {
        height: ${token.controlHeightLG}px;
        text-align: center;
      }
      .si-cargo-toolbar__add-type.ant-select {
        width: ${token.controlHeightLG * 2.75}px;
        height: ${token.controlHeightLG}px;
      }
      .si-cargo-toolbar__add-type .ant-select-selector {
        height: ${token.controlHeightLG}px !important;
        display: flex !important;
        align-items: center;
      }
      .si-cargo-toolbar__add-type .ant-select-selection-item,
      .si-cargo-toolbar__add-type .ant-select-selection-placeholder {
        line-height: ${token.controlHeightLG - 2}px !important;
      }
      .si-cargo-toolbar__add-btn.ant-btn {
        height: ${token.controlHeightLG}px;
        min-width: ${token.controlHeightLG * 4}px;
        padding-inline: ${token.paddingMD}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .si-cargo-toolbar__add-times {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeightLG / 2}px;
        height: ${token.controlHeightLG}px;
        flex: none;
      }
      .si-cargo-chip.ant-btn {
        border-radius: ${token.borderRadiusLG * 2}px;
        height: ${token.controlHeightLG}px;
      }
      .si-cargo-chip--on.ant-btn {
        color: ${token.colorWarning};
        border-color: ${token.colorWarningBorder};
        background: ${warningBg};
      }

      .si-cargo-summary {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginSM}px ${token.marginLG}px;
        padding-top: ${token.paddingSM}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .si-cargo-summary__metric {
        display: inline-flex;
        align-items: baseline;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .si-cargo-summary__metric-value {
        font-variant-numeric: tabular-nums;
      }
      .si-cargo-summary__filter-hint {
        margin-left: auto;
      }

      .si-cargo-vchip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-height: 22px;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
        white-space: nowrap;
      }
      .si-cargo-vchip--ok {
        background: ${successBg};
        color: ${token.colorSuccess};
      }
      .si-cargo-vchip--warn {
        background: ${warningBg};
        color: ${token.colorWarning};
      }

      /* —— Container list —— */
      .si-cargo-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .si-cargo-sicard {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        overflow: hidden;
      }
      .si-cargo-ct-row-wrap {
        display: grid;
        grid-template-columns:
          28px
          minmax(128px, 1.4fr)
          64px
          minmax(96px, 1fr)
          minmax(108px, 0.9fr)
          96px
          80px
          104px
          72px;
        align-items: center;
        column-gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        min-height: ${token.controlHeightLG + token.paddingSM * 2}px;
        cursor: pointer;
      }
      .si-cargo-ct-row-wrap:hover {
        background: ${fillHover};
      }
      .si-cargo-ct-row-wrap:focus-visible {
        outline: 2px solid ${token.colorPrimary};
        outline-offset: -2px;
      }
      .si-cargo-ct-chev {
        color: ${token.colorTextQuaternary};
        transition: transform 0.15s ease;
        justify-self: center;
      }
      .si-cargo-ct-chev--open {
        transform: rotate(180deg);
      }
      .si-cargo-ct-no {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .si-cargo-ct-no--empty {
        color: ${token.colorTextQuaternary};
        font-weight: 500;
        font-style: italic;
      }
      .si-cargo-type-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 22px;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorFillSecondary};
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
        justify-self: start;
      }
      .si-cargo-ct-seal {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .si-cargo-ct-meta {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
        line-height: 1.25;
      }
      .si-cargo-ct-meta--end {
        align-items: flex-end;
        text-align: right;
      }
      .si-cargo-ct-meta__value {
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .si-cargo-ct-meta__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextQuaternary};
        white-space: nowrap;
      }
      .si-cargo-ct-status {
        justify-self: end;
      }
      .si-cargo-ct-actions {
        justify-self: end;
        display: inline-flex;
        justify-content: flex-end;
      }

      .si-cargo-editor-panel {
        padding: ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .si-cargo-editor-fields {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        align-items: end;
        gap: ${token.marginMD}px;
        margin-bottom: ${token.marginMD}px;
      }
      .si-cargo-editor-fields .form-field-cell {
        min-width: 0;
      }
      .si-cargo-sitem {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingMD}px;
        background: ${token.colorBgContainer};
        margin-bottom: ${token.marginSM}px;
      }
      .si-cargo-sitem:last-of-type {
        margin-bottom: 0;
      }
      .si-cargo-sitem__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginSM}px;
      }
      /* Modified by Sekar Nagarajan (2026-08-28 17:54) */
      .si-cargo-sitem__grid {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.4fr) minmax(0, 1.1fr) auto;
        gap: ${token.marginSM}px ${token.marginMD}px;
        align-items: start;
      }
      .si-cargo-sitem__grid .form-field-cell {
        min-width: 0;
      }
      .si-cargo-sitem__span {
        grid-column: 1 / -1;
      }
      .si-cargo-sitem__hs {
        grid-column: 1 / 3;
      }
      .si-cargo-sitem__measures {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginXS}px;
        min-width: 0;
        justify-self: end;
      }
      .si-cargo-sitem__half {
        grid-column: span 2;
      }
      .si-cargo-sitem__narrow {
        width: ${token.controlHeightLG * 4.5}px;
        flex: 0 0 auto;
      }
      .si-cargo-sitem__narrow .booking-qty-stepper,
      .si-cargo-sitem__narrow .ant-input-number {
        width: 100%;
        max-width: 100%;
      }
      .si-cargo-empty {
        text-align: center;
        padding: ${token.paddingXL}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }
      .si-cargo-empty__icon {
        display: inline-flex;
        margin-bottom: ${token.marginSM}px;
        color: ${token.colorTextQuaternary};
      }
      .si-cargo-grid-wrap {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        overflow: hidden;
      }
      .si-cargo-grid-scroll {
        max-height: 60vh;
        overflow: auto;
      }
      .si-cargo-grid {
        width: max-content;
        min-width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: ${token.fontSize}px;
      }
      .si-cargo-grid thead th {
        position: sticky;
        top: 0;
        z-index: 2;
        background: ${token.colorFillAlter};
        text-align: left;
        font-size: ${token.fontSizeSM}px;
        font-weight: 600;
        color: ${token.colorTextSecondary};
        padding: ${token.paddingSM}px ${token.paddingXS}px;
        white-space: nowrap;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .si-cargo-grid tbody td {
        padding: ${token.paddingXXS}px ${token.paddingXS}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        vertical-align: middle;
        background: ${token.colorBgContainer};
      }
      .si-cargo-grid tbody tr:hover td {
        background: ${fillHover};
      }
      .si-cargo-grid tbody tr.si-cargo-grid__grp td {
        border-top: 2px solid ${token.colorBorder};
      }
      .si-cargo-grid__th-actions,
      .si-cargo-grid__td-actions {
        position: sticky;
        left: 0;
        z-index: 3;
        width: 112px;
        min-width: 112px;
        box-shadow: 1px 0 0 ${token.colorBorderSecondary};
      }
      .si-cargo-grid__th-actions {
        z-index: 4;
        background: ${token.colorFillAlter};
      }
      .si-cargo-grid__td-actions {
        background: ${token.colorBgContainer};
      }
      .si-cargo-grid tbody tr:hover .si-cargo-grid__td-actions {
        background: ${fillHover};
      }
      .si-cargo-grid__td-actions .list-actions-row {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        flex-wrap: nowrap;
      }
      .si-cargo-grid__action-spacer {
        display: inline-block;
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        flex: none;
      }
      .si-cargo-grid__cont {
        display: inline-flex;
        padding-inline: ${token.paddingXS}px;
        color: ${token.colorTextQuaternary};
        letter-spacing: 0.08em;
      }
      .si-cargo-grid__field {
        width: 100%;
      }
      /* Modified by Sekar Nagarajan (2026-08-28 17:58) — match list-view fields */
      .si-cargo-grid__field--container {
        min-width: 132px;
      }
      .si-cargo-grid__field--seal {
        min-width: 120px;
      }
      .si-cargo-grid__field--hs {
        min-width: 220px;
      }
      .si-cargo-grid__field--kind {
        min-width: 160px;
      }
      .si-cargo-grid__field--qty {
        min-width: ${token.controlHeightLG * 4.5}px;
        width: ${token.controlHeightLG * 4.5}px;
      }
      .si-cargo-grid__field--weight.ant-input-number,
      .si-cargo-grid__field--weight.ant-input-number-group-wrapper {
        min-width: ${token.controlHeightLG * 4.5}px;
        width: ${token.controlHeightLG * 4.5}px;
      }
      .si-cargo-grid__field--desc {
        min-width: 200px;
      }
      .si-cargo-grid__field--marks {
        min-width: 140px;
      }
      .si-cargo-grid-hint {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .si-cargo-pager {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }

      @media (max-width: 1199px) {
        .si-cargo-ct-row-wrap {
          grid-template-columns:
            28px
            minmax(120px, 1.2fr)
            56px
            minmax(80px, 1fr)
            minmax(90px, 0.8fr)
            88px
            104px
            64px;
        }
        .si-cargo-ct-meta--cbm {
          display: none;
        }
      }
      @media (max-width: 991px) {
        .si-cargo-toolbar {
          grid-template-columns: 1fr;
        }
        .si-cargo-toolbar__actions {
          justify-content: flex-start;
        }
        .si-cargo-toolbar__add {
          border-left: 0;
          padding-left: 0;
          width: 100%;
          flex-wrap: wrap;
        }
        .si-cargo-editor-fields {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .si-cargo-sitem__grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .si-cargo-sitem__hs {
          grid-column: 1 / -1;
        }
        .si-cargo-sitem__measures {
          grid-column: 1 / -1;
          flex-wrap: wrap;
        }
        .si-cargo-sitem__half {
          grid-column: span 1;
        }
        .si-cargo-ct-row-wrap {
          grid-template-columns: 28px minmax(0, 1fr) auto auto;
          row-gap: ${token.marginXXS}px;
        }
        .si-cargo-ct-chev { grid-column: 1; grid-row: 1; }
        .si-cargo-ct-no { grid-column: 2; grid-row: 1; }
        .si-cargo-type-badge { grid-column: 3; grid-row: 1; }
        .si-cargo-ct-actions { grid-column: 4; grid-row: 1 / span 2; align-self: center; }
        .si-cargo-ct-seal { grid-column: 2; grid-row: 2; }
        .si-cargo-ct-meta--commod { grid-column: 2; grid-row: 3; }
        .si-cargo-ct-meta--kg { grid-column: 3; grid-row: 3; justify-self: end; }
        .si-cargo-ct-meta--cbm { display: none; }
        .si-cargo-ct-status { grid-column: 2 / 4; grid-row: 4; justify-self: start; }
      }
    `}</style>
  );
}
