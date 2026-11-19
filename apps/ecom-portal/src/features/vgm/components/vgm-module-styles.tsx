// Modified by Sekar Nagarajan (2026-10-19 17:25)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

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
      /* Modified by Sekar Nagarajan (2026-10-19 17:25) — Booking / B/L reference strip */
      .vgm-reference-card > .ant-card-head {
        display: flex;
        align-items: center;
      }
      .vgm-reference-card__ref-tag.ant-tag {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        margin-inline-end: 0;
        padding-inline: ${token.paddingSM}px;
        line-height: ${token.controlHeightSM - 2}px;
        border-radius: ${token.borderRadiusLG * 2}px;
      }
      .vgm-reference-card__ref-kind {
        opacity: 0.8;
      }
      .vgm-reference-card__ref-kind::after {
        content: " ·";
      }
      .vgm-reference-card__ref-no {
        font-weight: ${token.fontWeightStrong};
        font-variant-numeric: tabular-nums;
      }
      .vgm-reference-layout {
        display: grid;
        grid-template-columns: minmax(240px, 1fr) minmax(0, 2.2fr);
        gap: ${token.marginLG}px;
        align-items: stretch;
        width: 100%;
      }
      .vgm-reference-parties {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .vgm-reference-fact {
        display: flex;
        align-items: center;
        flex: 1 1 0;
        gap: ${token.marginSM}px;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .vgm-reference-fact__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        color: ${token.colorTextSecondary};
      }
      .vgm-reference-fact__icon--ap {
        color: ${token.geekblue};
        background: ${tokenMix(token.geekblue, 10)};
        border-color: ${tokenMix(token.geekblue, 30)};
      }
      .vgm-reference-fact__icon--shipper {
        color: ${token.colorWarning};
        background: ${tokenMix(token.colorWarning, 10)};
        border-color: ${tokenMix(token.colorWarning, 35)};
      }
      .vgm-reference-fact__copy {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS / 2}px;
        min-width: 0;
      }
      .vgm-reference-fact__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorTextTertiary};
        line-height: 1.2;
      }
      .vgm-reference-fact__value {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.4;
        word-break: break-word;
      }
      .vgm-reference-route {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        min-width: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG + 2}px;
        background: linear-gradient(
          180deg,
          ${tokenMix(token.colorPrimary, 8)} 0%,
          ${token.colorBgContainer} 100%
        );
      }
      .vgm-reference-route__band {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(140px, 1.2fr) minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: center;
      }
      .vgm-reference-route__stop {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .vgm-reference-route__stop--dest {
        align-items: flex-end;
        text-align: right;
      }
      .vgm-reference-route__eyebrow {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorPrimary};
        line-height: 1.2;
      }
      .vgm-reference-route__stop--dest .vgm-reference-route__eyebrow {
        color: ${token.colorSuccess};
      }
      .vgm-reference-route__place {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.25;
        word-break: break-word;
      }
      .vgm-reference-route__code {
        font-size: ${token.fontSizeSM}px;
        letter-spacing: 0.04em;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .vgm-reference-route__pill {
        display: inline-flex;
        align-items: center;
        margin-top: ${token.marginXXS}px;
        padding: ${token.paddingXXS / 2}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusSM}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.4;
        white-space: nowrap;
      }
      .vgm-reference-route__pill--etd {
        color: ${token.colorInfo};
        background: ${tokenMix(token.colorInfo, 8)};
        border: 1px solid ${tokenMix(token.colorInfo, 14)};
      }
      .vgm-reference-route__pill--eta {
        color: ${token.colorSuccess};
        background: ${tokenMix(token.colorSuccess, 8)};
        border: 1px solid ${tokenMix(token.colorSuccess, 14)};
      }
      .vgm-reference-route__connector {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        width: 100%;
        min-width: 0;
      }
      .vgm-reference-route__dot {
        flex-shrink: 0;
        width: ${token.marginXS + 2}px;
        height: ${token.marginXS + 2}px;
        border-radius: 50%;
      }
      .vgm-reference-route__dot--origin {
        background: ${token.colorInfo};
      }
      .vgm-reference-route__dot--dest {
        background: ${token.colorSuccess};
      }
      .vgm-reference-route__dash {
        flex: 1 1 0;
        min-width: ${token.marginSM}px;
        height: 0;
        border-top: ${token.lineWidthBold}px dashed ${tokenMix(token.colorInfo, 45)};
      }
      .vgm-reference-route__transit {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXXS}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        border: 1px solid ${tokenMix(token.colorInfo, 35)};
        background: ${tokenMix(token.colorInfo, 8)};
        color: ${token.colorInfo};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        white-space: nowrap;
      }
      .vgm-reference-route__ports {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginSM}px;
        padding-top: ${token.paddingSM}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .vgm-reference-port {
        display: inline-flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px ${token.marginXS}px;
        min-width: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .vgm-reference-port .app-icon {
        align-self: center;
        color: ${token.colorTextTertiary};
      }
      .vgm-reference-port--pod {
        justify-content: flex-end;
        text-align: right;
      }
      .vgm-reference-port__label {
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorTextTertiary};
      }
      .vgm-reference-port__code {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .vgm-reference-port__name {
        word-break: break-word;
      }
      @media (max-width: 1199px) {
        .vgm-reference-layout {
          grid-template-columns: minmax(0, 1fr);
        }
        .vgm-reference-parties {
          flex-direction: row;
        }
      }
      @media (max-width: 767px) {
        .vgm-reference-parties {
          flex-direction: column;
        }
        .vgm-reference-route {
          padding: ${token.paddingMD}px;
        }
        .vgm-reference-route__band {
          grid-template-columns: minmax(0, 1fr);
        }
        .vgm-reference-route__stop--dest {
          align-items: flex-start;
          text-align: left;
        }
        .vgm-reference-route__ports {
          grid-template-columns: minmax(0, 1fr);
        }
        .vgm-reference-port--pod {
          justify-content: flex-start;
          text-align: left;
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
