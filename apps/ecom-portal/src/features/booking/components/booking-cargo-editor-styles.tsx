// Modified by Sekar Nagarajan (2026-09-02 17:36)
import { theme } from "antd";

/** Booking-only extensions on top of SI CargoLinesEditorStyles. */
export function BookingCargoEditorStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      /* Modified by Sekar Nagarajan (2026-09-02 17:36) — selected segment icon white + centered */
      .booking-cargo-view-segmented.ant-segmented {
        display: inline-flex;
        align-items: center;
      }
      .booking-cargo-view-segmented.ant-segmented .ant-segmented-group {
        align-items: center;
      }
      .booking-cargo-view-segmented.ant-segmented .ant-segmented-item {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .booking-cargo-view-segmented.ant-segmented .ant-segmented-item-label {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: ${token.controlHeightLG - 8}px;
        line-height: 1;
        padding-inline: ${token.paddingSM}px;
      }
      .booking-cargo-view-segmented.ant-segmented .ant-segmented-item-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-inline-end: 0;
        line-height: 1;
      }
      .booking-cargo-view-segmented.ant-segmented .ant-segmented-item-icon .app-icon {
        display: block;
        color: ${token.colorTextSecondary};
      }
      .booking-cargo-view-segmented.ant-segmented .ant-segmented-item-selected {
        background: ${token.colorPrimary} !important;
        color: ${token.colorTextLightSolid} !important;
      }
      .booking-cargo-view-segmented.ant-segmented .ant-segmented-thumb {
        background: ${token.colorPrimary} !important;
      }
      .booking-cargo-view-segmented.ant-segmented
        .ant-segmented-item-selected
        .ant-segmented-item-icon
        .app-icon {
        color: ${token.colorTextLightSolid};
      }

      /* Modified by Sekar Nagarajan (2026-09-02 16:43) — mock-aligned cargo list/detail layout */
      .si-cargo-ct-row-wrap--booking {
        grid-template-columns:
          28px
          minmax(220px, 1.4fr)
          minmax(200px, 1.6fr)
          auto
          72px;
        align-items: center;
        overflow: hidden;
      }
      .si-cargo-ct-identity {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .si-cargo-ct-identity__main {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .si-cargo-ct-identity .si-cargo-ct-no {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-style: normal;
      }
      .si-cargo-ct-identity .si-cargo-ct-no--empty {
        font-style: normal;
        color: ${token.colorText};
        font-weight: 600;
      }
      .si-cargo-ct-identity .si-cargo-ct-status__tags {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
      }
      .si-cargo-ct-identity .si-cargo-ct-status__tags .ant-tag {
        margin-inline-end: 0;
      }
      .si-cargo-type-badge--primary {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border: 1px solid ${token.colorPrimaryBorder};
      }
      .si-cargo-ct-summary {
        min-width: 0;
        justify-self: end;
        text-align: right;
      }
      .si-cargo-ct-summary__text {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: ${token.marginXXS}px;
        white-space: nowrap;
        font-size: ${token.fontSizeSM}px;
      }
      .si-cargo-ct-summary__dot {
        color: ${token.colorTextQuaternary};
      }
      .si-cargo-ct-row-wrap--booking .si-cargo-ct-status {
        justify-self: end;
        display: inline-flex;
        align-items: center;
        flex-wrap: nowrap;
        max-width: 100%;
        overflow: hidden;
      }
      .si-cargo-ct-row-wrap--booking .si-cargo-ct-actions {
        justify-self: end;
        flex-shrink: 0;
      }
      .si-cargo-editor-panel {
        position: relative;
        z-index: 1;
        background: ${token.colorBgContainer};
      }

      .si-cargo-sitem__grid--booking {
        grid-template-columns:
          minmax(0, 1.8fr)
          minmax(0, 1.2fr)
          ${token.controlHeightLG * 4.5}px
          minmax(110px, 0.9fr)
          minmax(110px, 0.9fr);
        align-items: start;
      }
      .si-cargo-sitem__head-actions {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginMD}px;
      }
      .si-cargo-sitem__hazardous {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .si-cargo-sitem__hazardous .form-field-label {
        margin: 0;
        white-space: nowrap;
      }
      .si-cargo-sitem__dg {
        margin-top: ${token.marginMD}px;
        padding-top: ${token.paddingMD}px;
        border-top: 1px dashed ${token.colorBorderSecondary};
      }

      /* Single-row container fields (type → NOR) */
      .si-cargo-editor-fields--booking.booking-cargo-container-row {
        display: grid;
        grid-template-columns:
          minmax(0, 1.6fr)
          minmax(0, 1.1fr)
          ${token.controlHeightLG * 4.5}px
          minmax(0, 1fr)
          minmax(0, 1fr)
          auto
          auto;
        align-items: end;
        gap: ${token.marginSM}px ${token.marginMD}px;
        margin-bottom: ${token.marginMD}px;
      }
      .si-cargo-editor-fields--booking.booking-cargo-container-row--with-nor {
        grid-template-columns:
          minmax(0, 1.5fr)
          minmax(0, 1fr)
          ${token.controlHeightLG * 4.5}px
          minmax(0, 0.95fr)
          minmax(0, 0.95fr)
          auto
          auto
          auto;
      }
      .si-cargo-editor-fields--booking .form-field-cell {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .si-cargo-editor-fields--booking .form-field-label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        white-space: nowrap;
        min-height: ${token.lineHeight * token.fontSize}px;
        margin: 0;
      }
      .booking-cargo-field-hint {
        display: inline-flex;
        align-items: center;
        color: ${token.colorTextQuaternary};
        cursor: help;
      }
      .si-cargo-editor-fields--booking .booking-cargo-container-row__qty {
        width: ${token.controlHeightLG * 4.5}px;
      }
      .si-cargo-editor-fields--booking .booking-cargo-container-row__switch {
        width: auto;
        min-width: ${token.controlHeightLG * 1.5}px;
      }
      .si-cargo-editor-fields--booking .booking-cargo-container-row__switch .form-yes-no-switch-wrap {
        min-height: ${token.controlHeightLG}px;
        display: flex;
        align-items: center;
      }
      .si-cargo-editor-fields--booking .ant-select-lg,
      .si-cargo-editor-fields--booking .ant-input-lg,
      .si-cargo-editor-fields--booking .ant-input-number-lg,
      .si-cargo-editor-fields--booking .ant-input-number-group-wrapper-lg {
        width: 100%;
      }

      .booking-cargo-detail__section {
        margin-top: ${token.marginMD}px;
        margin-bottom: ${token.marginMD}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px dashed ${token.colorBorder};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .booking-cargo-detail__section--oog {
        border-color: ${token.colorPrimaryBorder};
        background: ${token.colorPrimaryBg};
      }
      .booking-cargo-detail__section--accent {
        border-color: ${token.colorInfoBorder};
        background: ${token.colorInfoBg};
      }
      .booking-cargo-detail__section-head {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin-bottom: ${token.marginMD}px;
      }
      .booking-cargo-detail__section-title {
        margin: 0 !important;
      }
      .booking-cargo-detail__section-tag {
        margin-inline-end: 0 !important;
      }
      .booking-oog-form-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: ${token.marginSM}px ${token.marginMD}px;
        align-items: start;
      }
      .booking-oog-form-grid .form-field-cell {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .booking-oog-form-grid .form-field-label {
        white-space: nowrap;
        margin: 0;
      }
      .booking-oog-form-grid .ant-select,
      .booking-oog-form-grid .ant-input-number,
      .booking-oog-form-grid .ant-input-number-group-wrapper {
        width: 100%;
      }
      .booking-cargo-commodity-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin: ${token.marginLG}px 0 ${token.marginSM}px;
      }
      .booking-cargo-commodity-toolbar__add.ant-btn {
        border-style: dashed;
      }
      .booking-cargo-commodity-card__hazardous-check {
        min-height: ${token.controlHeightLG}px;
        display: inline-flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .booking-cargo-commodity-card__checkbox-col {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        min-height: ${token.controlHeightLG}px;
      }
      .si-cargo-grid__td-haz {
        text-align: center;
      }
      .si-cargo-grid__td-switch {
        text-align: center;
        min-width: 88px;
      }
      .si-cargo-grid__switch-cell {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
      }
      .si-cargo-grid__td-actions {
        width: 112px;
        min-width: 112px;
      }
      .si-cargo-grid__th-actions {
        width: 112px;
        min-width: 112px;
      }
      .booking-cargo-grid-extras-modal-title {
        margin: 0 !important;
      }
      .booking-cargo-grid-extras-modal-fields {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginMD}px;
        align-items: start;
      }
      .booking-cargo-grid-extras-modal-fields .form-field-cell {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .booking-cargo-grid-extras-modal-fields .form-field-label {
        white-space: nowrap;
        min-height: ${token.lineHeight * token.fontSize}px;
        line-height: ${token.lineHeight};
        margin: 0;
      }
      .booking-cargo-grid-extras-modal-fields .ant-select,
      .booking-cargo-grid-extras-modal-fields .ant-input-number,
      .booking-cargo-grid-extras-modal-fields .ant-input-number-group-wrapper,
      .booking-cargo-grid-extras-modal-fields .ant-input {
        width: 100%;
      }
      .booking-cargo-grid-extras-modal-fields .ant-select-selector,
      .booking-cargo-grid-extras-modal-fields .ant-input-number,
      .booking-cargo-grid-extras-modal-fields .ant-input {
        min-height: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
      }
      .booking-cargo-grid-extras-modal-fields__span {
        grid-column: 1 / -1;
      }
      @media (max-width: 575px) {
        .booking-cargo-grid-extras-modal-fields {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 1399px) {
        .booking-oog-form-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 1199px) {
        .si-cargo-editor-fields--booking.booking-cargo-container-row,
        .si-cargo-editor-fields--booking.booking-cargo-container-row--with-nor {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .si-cargo-editor-fields--booking .booking-cargo-container-row__qty {
          width: 100%;
        }
        .si-cargo-ct-row-wrap--booking {
          grid-template-columns:
            28px
            minmax(160px, 1.2fr)
            minmax(140px, 1fr)
            auto
            64px;
        }
        .si-cargo-ct-summary__text {
          white-space: normal;
        }
      }
      @media (max-width: 991px) {
        .si-cargo-editor-fields--booking.booking-cargo-container-row,
        .si-cargo-editor-fields--booking.booking-cargo-container-row--with-nor {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .si-cargo-sitem__grid--booking {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .si-cargo-sitem__grid--booking .si-cargo-sitem__narrow {
          width: 100%;
        }
        .booking-oog-form-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .si-cargo-ct-row-wrap--booking {
          grid-template-columns: 28px minmax(0, 1fr) auto;
          row-gap: ${token.marginXXS}px;
        }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-chev { grid-column: 1; grid-row: 1; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-identity { grid-column: 2; grid-row: 1; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-actions { grid-column: 3; grid-row: 1 / span 3; align-self: start; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-summary { grid-column: 2; grid-row: 2; justify-self: start; text-align: left; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-status { grid-column: 2; grid-row: 3; justify-self: start; }
      }
    `}</style>
  );
}
