// Modified by Sekar Nagarajan (2026-09-02 12:25)
import { theme } from "antd";

/** Booking-only extensions on top of SI CargoLinesEditorStyles. */
export function BookingCargoEditorStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      /* Modified by Sekar Nagarajan (2026-09-02 12:25) — compact extras modal + aligned fields */
      .si-cargo-ct-row-wrap--booking {
        grid-template-columns:
          28px
          minmax(140px, 1.6fr)
          64px
          48px
          88px
          96px
          80px
          80px
          104px
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
      .si-cargo-ct-identity .si-cargo-ct-no {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      }

      .si-cargo-sitem__grid--booking {
        grid-template-columns:
          minmax(0, 1.6fr)
          minmax(0, 1.2fr)
          auto
          auto
          auto
          auto;
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
          minmax(0, 1.5fr)
          minmax(0, 1.2fr)
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
          minmax(0, 1.4fr)
          minmax(0, 1.1fr)
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
      .si-cargo-editor-fields--booking .booking-cargo-container-row__qty {
        width: ${token.controlHeightLG * 4.5}px;
      }
      .si-cargo-editor-fields--booking .booking-cargo-container-row__switch {
        width: auto;
        min-width: ${token.controlHeightLG}px;
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
        margin-top: ${token.marginLG}px;
        margin-bottom: ${token.marginSM}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }
      .booking-cargo-detail__section-title {
        display: block;
        margin-bottom: ${token.marginMD}px;
      }
      .booking-cargo-commodity-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin: ${token.marginMD}px 0 ${token.marginSM}px;
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
            minmax(120px, 1.2fr)
            56px
            40px
            80px
            88px
            72px
            104px
            64px;
        }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-meta--cbm {
          display: none;
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
        .si-cargo-ct-row-wrap--booking {
          grid-template-columns: 28px minmax(0, 1fr) auto auto;
          row-gap: ${token.marginXXS}px;
        }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-chev { grid-column: 1; grid-row: 1; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-identity { grid-column: 2; grid-row: 1; }
        .si-cargo-ct-row-wrap--booking .si-cargo-type-badge { grid-column: 3; grid-row: 1; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-actions { grid-column: 4; grid-row: 1 / span 2; align-self: center; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-seal { grid-column: 2; grid-row: 2; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-meta--commod { grid-column: 2; grid-row: 3; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-meta--pkgs { grid-column: 3; grid-row: 3; justify-self: end; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-meta--kg { grid-column: 2; grid-row: 4; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-meta--cbm { display: none; }
        .si-cargo-ct-row-wrap--booking .si-cargo-ct-status { grid-column: 2 / 4; grid-row: 5; justify-self: start; }
      }
    `}</style>
  );
}
