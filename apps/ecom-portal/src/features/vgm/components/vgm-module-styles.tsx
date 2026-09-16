// Modified by Sekar Nagarajan (2026-09-16 11:43)
import { theme } from "antd";

export function VgmModuleStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .vgm-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 240px;
        padding: ${token.paddingLG}px;
        flex: 1;
      }
      .vgm-loading-center--fill {
        min-height: calc(100vh - 280px);
      }

      .feature-page-card.vgm-page-card.ant-card {
        border: none;
        border-radius: ${token.borderRadiusLG}px;
      }
      .feature-page-card.vgm-page-card > .ant-card-body {
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        min-height: calc(100vh - 160px);
        overflow: hidden;
      }
      .vgm-page-header {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px 0;
      }
      .vgm-search-panel {
        margin: ${token.marginMD}px ${token.paddingLG}px ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .vgm-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .vgm-search-form .ant-form-item {
        margin-bottom: 0;
      }
      /* Keep inputs aligned when validation text appears (tracking/ARN pattern) */
      .vgm-search-form .ant-form-item .ant-form-item-control,
      .vgm-section-card .ant-form-item .ant-form-item-control,
      .vgm-field-cell .ant-form-item .ant-form-item-control {
        position: relative;
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      .vgm-search-form .ant-form-item .ant-form-item-explain,
      .vgm-section-card .ant-form-item .ant-form-item-explain,
      .vgm-field-cell .ant-form-item .ant-form-item-explain {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        min-height: ${token.fontSize * token.lineHeight}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        margin: 0;
      }
      .vgm-section-card .ant-form-item {
        margin-bottom: 0;
      }
      .vgm-field-cell .ant-form-item {
        margin-bottom: 0;
      }
      .vgm-search-actions-field {
        display: flex;
        flex-direction: column;
        width: 100%;
        /* Match reserved error slot under inputs so Search stays level */
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      .vgm-search-actions-label {
        visibility: hidden;
        display: block;
        margin-bottom: ${token.marginXXS}px;
        min-height: ${token.fontSizeSM * token.lineHeight}px;
      }
      .vgm-search-actions {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-height: ${token.controlHeightLG}px;
        width: 100%;
      }
      .vgm-search-actions .sm-app-button,
      .vgm-search-actions .ant-btn {
        min-height: ${token.controlHeightLG}px;
      }
      .vgm-search-actions .ant-btn-primary {
        flex: 1;
        min-width: 120px;
      }
      .vgm-idle {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${token.paddingXL}px;
      }
      .vgm-form-layout {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      .vgm-form-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 0 ${token.paddingLG}px ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .vgm-meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginMD}px ${token.marginLG}px;
        margin-bottom: ${token.marginMD}px;
      }
      .vgm-meta-item {
        min-width: 160px;
      }
      .vgm-meta-item__label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXXS}px;
      }
      .vgm-meta-item__value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      /* Booking / B/L Details — TrackingOverview-style meta + expand */
      .vgm-reference-card > .ant-card-head {
        display: flex;
        align-items: center;
      }
      .vgm-reference-card__ref-tag {
        margin-inline-end: 0;
      }
      .vgm-reference-overview__meta {
        margin-bottom: 0;
      }
      .vgm-reference-meta-item {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .vgm-reference-meta-item__label {
        font-size: ${token.fontSizeSM}px;
        display: block;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .vgm-reference-meta-item__value {
        font-size: ${token.fontSizeLG}px;
        display: block;
        line-height: 1.3;
        word-break: break-word;
      }
      .vgm-reference-meta-item__sub {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.35;
      }
      .vgm-reference-overview__toggle-col {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
      .vgm-reference-overview__toggle.ant-btn {
        width: 36px;
        height: 36px;
        padding: 0;
      }
      .vgm-reference-overview__toggle--open {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .vgm-reference-overview__toggle-chevron {
        display: inline-flex;
        transition: transform 0.35s ease;
      }
      .vgm-reference-overview__toggle--open
        .vgm-reference-overview__toggle-chevron {
        transform: rotate(180deg);
      }
      .vgm-reference-overview__route-panel {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
          grid-template-rows 0.35s ease,
          opacity 0.28s ease;
      }
      .vgm-reference-overview__route-panel--open {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .vgm-reference-overview__route-panel-inner {
        overflow: hidden;
        min-height: 0;
      }
      .vgm-reference-overview__route {
        margin-top: ${token.marginMD}px;
        padding-top: ${token.marginMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .vgm-reference-overview__route-panel:not(
          .vgm-reference-overview__route-panel--open
        )
        .vgm-reference-overview__route {
        margin-top: 0;
        padding-top: 0;
        border-top-color: transparent;
      }
      @media (prefers-reduced-motion: reduce) {
        .vgm-reference-overview__route-panel,
        .vgm-reference-overview__toggle-chevron {
          transition: none;
        }
      }
      @media (max-width: 991px) {
        .vgm-reference-overview__toggle-col {
          justify-content: flex-start;
        }
      }
      /* Modified by Sekar Nagarajan (2026-09-01 00:56) — declaration fields 5-column grid */
      .vgm-declaration-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        column-gap: ${token.marginMD}px;
        row-gap: ${token.marginXS}px;
        width: 100%;
      }
      /* Modified by Sekar Nagarajan (2026-09-01 10:52) — form-field-cell gap (commodity card parity) */
      .vgm-declaration-grid .form-field-cell {
        min-width: 0;
      }
      .vgm-declaration-grid .form-field-cell .form-field-label {
        margin-bottom: 0;
      }
      .vgm-declaration-grid .form-field-cell .ant-form-item {
        margin-bottom: 0;
      }
      .vgm-declaration-grid .form-field-cell .ant-form-item-label {
        display: none;
      }
      @media (max-width: 1199px) {
        .vgm-declaration-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 767px) {
        .vgm-declaration-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 479px) {
        .vgm-declaration-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .vgm-section-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .vgm-section-card > .ant-card-head {
        min-height: auto;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .vgm-section-card > .ant-card-body {
        padding: ${token.paddingLG}px !important;
      }
      .vgm-section-card--flush > .ant-card-body {
        padding: 0 !important;
      }
      .vgm-methods-list {
        margin: ${token.marginXS}px 0 0;
        padding-left: ${token.paddingLG}px;
        font-size: ${token.fontSizeSM}px;
      }
      .vgm-methods-list li {
        margin-bottom: ${token.marginXXS}px;
      }
      .vgm-methods-list li:last-child {
        margin-bottom: 0;
      }
      .vgm-field-cell {
        margin-top: ${token.marginXXS}px;
      }
      /* Modified by Sekar Nagarajan (2026-09-01 00:57) — containers table padding + spacing */
      .vgm-containers-wrap {
        padding: ${token.paddingMD}px ${token.paddingLG}px ${token.paddingLG}px;
      }
      .vgm-containers-wrap .ant-table-thead > tr > th {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .vgm-containers-wrap .ant-table-tbody > tr > td {
        padding: ${token.paddingXS}px ${token.paddingMD}px;
        vertical-align: middle;
      }

      @media (max-width: 767px) {
        .vgm-page-header,
        .vgm-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .vgm-page-header {
          padding-left: ${token.paddingMD}px;
          padding-right: ${token.paddingMD}px;
        }
        .vgm-search-panel {
          margin-left: ${token.paddingMD}px;
          margin-right: ${token.paddingMD}px;
        }
        .vgm-search-panel__body {
          padding: ${token.paddingMD}px;
        }
        .vgm-form-scroll {
          padding: 0 ${token.paddingMD}px ${token.paddingMD}px;
        }
        .vgm-search-actions {
          flex-direction: column;
        }
        .vgm-search-actions .sm-app-button,
        .vgm-search-actions .ant-btn {
          width: 100%;
        }
        .vgm-route-strip {
          flex-direction: column;
        }
        .vgm-route-connector {
          min-width: 0;
          width: 100%;
          flex-direction: row;
          justify-content: center;
          gap: ${token.marginSM}px;
        }
        .vgm-route-connector__line {
          max-width: 80px;
        }
        .vgm-section-card > .ant-card-body {
          padding: ${token.paddingMD}px !important;
        }
      }
    `}</style>
  );
}
