// Modified by Sekar Nagarajan (2026-09-15 17:20)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Import Booking + workbench layout (full-height, aligned whitespace). */
export function BookingImportModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint6 = tokenMix(token.colorPrimary, 6);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const errorTint8 = tokenMix(token.colorError, 8);
  const warningTint8 = tokenMix(token.colorWarning, 8);

  return (
    <style>{`
      .feature-page-card.booking-import-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.booking-import-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        height: calc(100vh - 160px);
        overflow: hidden;
      }

      .booking-import-page {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        height: 100%;
        overflow: hidden;
        background: ${token.colorBgContainer};
      }

      .import-wb {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        height: 100%;
        gap: 0;
      }

      .import-wb__header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingXL}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }

      .import-wb__header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        flex-wrap: wrap;
      }

      .import-wb__title-block {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginXS}px;
        min-width: 0;
        flex: 1 1 220px;
      }

      .import-wb__title-text {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding-top: 2px;
      }

      .import-wb__title-text .ant-typography {
        margin: 0 !important;
      }

      .import-wb__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        flex: 1 1 auto;
        flex-wrap: wrap;
        min-width: 0;
      }

      .import-wb__body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        padding: ${token.paddingMD}px ${token.paddingXL}px ${token.paddingLG}px;
        overflow: hidden;
        gap: ${token.marginMD}px;
      }

      .import-wb__alerts {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        flex-shrink: 0;
      }

      /* —— Empty state: split upload + column guide —— */
      .import-wb-empty {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
        gap: ${token.marginLG}px;
        overflow: hidden;
      }

      .import-wb-empty__upload {
        display: flex;
        flex-direction: column;
        min-height: 0;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        padding: ${token.paddingLG}px;
        gap: ${token.marginMD}px;
      }

      .import-wb-empty__upload-intro {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        flex-shrink: 0;
      }

      .import-wb-empty__hints {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        flex-shrink: 0;
      }

      .import-wb-empty__hint {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        white-space: nowrap;
      }

      .import-wb-empty__dropzone {
        flex: 1;
        min-height: 220px;
        display: flex;
        align-items: stretch;
      }

      .import-wb-empty__dropzone > * {
        flex: 1;
        width: 100%;
        min-height: 220px;
      }

      .import-wb-empty__guide {
        display: flex;
        flex-direction: column;
        min-height: 0;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        overflow: hidden;
      }

      .import-wb-empty__guide-head {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }

      .import-wb-empty__guide-body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: ${token.paddingMD}px ${token.paddingLG}px ${token.paddingLG}px;
      }

      /* —— Field overview (dense cards) —— */
      .import-wb-fields {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }

      .import-wb-fields__section {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }

      .import-wb-fields__section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
      }

      .import-wb-fields__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: ${token.marginSM}px;
      }

      .import-wb-field-card {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        min-height: 72px;
      }

      .import-wb-field-card--required {
        border-color: ${tokenMix(token.colorPrimary, 28)};
        background: ${primaryTint6};
      }

      .import-wb-field-card__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginXS}px;
      }

      .import-wb-field-card__meta {
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        line-height: 1.35;
      }

      /* —— Review mode —— */
      .import-wb-review {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        overflow: hidden;
      }

      .import-wb-metrics {
        flex-shrink: 0;
        display: grid;
        grid-template-columns: minmax(160px, 1.4fr) repeat(4, minmax(0, 1fr));
        gap: ${token.marginSM}px;
      }

      .import-wb-metric {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }

      .import-wb-metric--file {
        background: ${token.colorBgContainer};
      }

      .import-wb-metric--valid {
        background: ${successTint8};
        border-color: ${tokenMix(token.colorSuccess, 28)};
      }

      .import-wb-metric--invalid {
        background: ${errorTint8};
        border-color: ${tokenMix(token.colorError, 28)};
      }

      .import-wb-metric--issues {
        background: ${warningTint8};
        border-color: ${tokenMix(token.colorWarning, 28)};
      }

      .import-wb-metric__label {
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
      }

      .import-wb-metric__value {
        font-weight: 600;
        font-size: ${token.fontSizeLG}px;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .import-wb-metric__value--sm {
        font-size: ${token.fontSize}px;
        font-weight: 500;
      }

      .import-wb-toolbar {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        flex-wrap: wrap;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }

      .import-wb-toolbar__filters {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        flex: 1 1 280px;
        min-width: 0;
        flex-wrap: wrap;
      }

      .import-wb-toolbar__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginXS}px;
        flex: 1 1 auto;
        flex-wrap: wrap;
        min-width: 0;
      }

      .import-wb-review__grid {
        flex: 1;
        min-height: 0;
        display: flex;
        overflow: hidden;
      }

      .import-wb-grid-shell {
        flex: 1;
        min-width: 0;
        min-height: 0;
        height: 100%;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
        background: ${token.colorBgContainer};
      }

      .import-wb-grid-shell .import-wb-col-highlight {
        background: ${primaryTint6} !important;
        font-weight: 600;
      }

      .import-wb-grid-shell .import-wb-col-highlight-cell {
        box-shadow: inset 0 0 0 1px ${tokenMix(token.colorPrimary, 35)};
      }

      .import-wb-errors-pane {
        flex: 0 0 300px;
        width: 300px;
        max-width: 300px;
        min-height: 0;
        height: 100%;
        overflow: hidden;
        margin-left: ${token.marginMD}px;
      }

      @media (max-width: 991px) {
        .import-wb__header {
          padding: ${token.paddingSM}px ${token.paddingMD}px;
        }
        .import-wb__body {
          padding: ${token.paddingSM}px ${token.paddingMD}px ${token.paddingMD}px;
        }
        .import-wb-empty {
          grid-template-columns: 1fr;
          overflow: auto;
        }
        .import-wb-empty__upload {
          min-height: auto;
        }
        .import-wb-empty__dropzone,
        .import-wb-empty__dropzone > * {
          min-height: 180px;
        }
        .import-wb-empty__guide {
          max-height: none;
          min-height: 280px;
        }
        .import-wb-metrics {
          grid-template-columns: 1fr 1fr;
        }
        .import-wb-metric--file {
          grid-column: 1 / -1;
        }
        .import-wb-errors-pane {
          display: none;
        }
      }

      @media (max-width: 575px) {
        .import-wb-metrics {
          grid-template-columns: 1fr;
        }
        .import-wb-fields__grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}
