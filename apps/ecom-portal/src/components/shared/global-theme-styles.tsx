// Modified by Sekar Nagarajan (2026-08-28 14:18)
import { theme } from "antd";

import { tokenMix } from "../../features/theme/utils/token-mix";

/** App-wide CSS classes backed by Ant Design theme tokens. Prefer className over inline style. */
export function GlobalThemeStyles() {
  const { token } = theme.useToken();

  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const primaryTint12 = tokenMix(token.colorPrimary, 12);
  const lightSolid18 = tokenMix(token.colorTextLightSolid, 18);
  const lightSolid15 = tokenMix(token.colorTextLightSolid, 15);
  const lightSolid85 = tokenMix(token.colorTextLightSolid, 85);

  return (
    <style>{`
      /* Project-wide custom scrollbar (agenct.md UI #1) */
      .custom-scroll {
        scrollbar-width: thin;
        scrollbar-color: ${token.colorTextQuaternary} transparent;
 
       
      }
      .custom-scroll::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background-color: ${token.colorTextQuaternary};
        border-radius: 20px;
      }
      .custom-scroll::-webkit-scrollbar-thumb:hover {
        background-color: ${token.colorTextTertiary};
      }
      .form-field-label {
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginSM}px;
        display: block;
      }
      .form-field-error {
        font-size: ${token.fontSizeSM}px;
        margin-top: ${token.marginXXS}px;
      }
      .form-section-toggle {
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSize}px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .form-step-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .form-step-scroll {
        flex: 1;
        overflow-y: auto;
        padding: ${token.paddingLG}px;
      }
      .form-step-section {
        margin-bottom: ${token.marginLG}px;
      }
      .form-step-section:last-child {
        margin-bottom: 0;
      }
      .form-step-hint {
        display: block;
        margin-bottom: ${token.marginMD}px;
      }
      .form-step-toolbar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginLG}px;
      }
      .form-step-card.ant-card {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
      }
      .form-step-card > .ant-card-head {
        min-height: auto;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .form-step-card > .ant-card-head .ant-card-head-title {
        padding: 0;
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.lineHeight};
      }
      .form-step-card > .ant-card-body {
        padding: ${token.paddingLG}px !important;
      }
      .form-step-card.ant-card-small > .ant-card-head {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .form-step-card.ant-card-small > .ant-card-body {
        padding: ${token.paddingMD}px !important;
      }
      .form-step-card .ant-row {
        row-gap: ${token.marginLG}px !important;
      }
      .form-step-card > .ant-card-body > .form-step-section {
        margin-top: ${token.marginLG}px;
      }
      .form-field-cell {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        gap: ${token.marginXXS}px;
      }
      .form-step-footer {
        flex-shrink: 0;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: ${token.marginXS}px;
        background-color: ${token.colorBgContainer};
      }
      .form-step-footer--split {
        justify-content: space-between;
      }
      .form-step-footer__start {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
      }
      .form-step-card-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        flex-wrap: wrap;
      }
      .form-step-card-toolbar__actions {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .form-step-card-title {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        font-size: ${token.fontSizeLG}px !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .form-step-readonly-value {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        margin-top: ${token.marginXXS}px;
      }
      .form-step-readonly-value--emphasis {
        font-size: ${token.fontSizeHeading3}px;
        color: ${token.colorPrimary};
        margin-top: ${token.marginSM}px;
      }
      .form-step-callout {
        margin-top: ${token.marginLG}px;
        padding: ${token.paddingMD}px;
        background-color: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
      }
      .form-step-summary-title {
        text-align: center;
        margin-bottom: ${token.marginLG}px !important;
      }
      .form-step-card-toolbar--flush {
        margin-bottom: 0;
      }
      .form-field-full-width {
        width: 100%;
      }
      .form-field-full-width.ant-input-number,
      .form-field-full-width.ant-input-number-group-wrapper {
        width: 100%;
      }
      .wizard-step-content > .ant-spin-nested-loading,
      .wizard-step-content > .ant-spin-nested-loading > .ant-spin-container {
        height: 100%;
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .wizard-step-content .form-step-layout {
        flex: 1;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }
      .wizard-step-content .form-step-scroll.custom-scroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }
      .list-action-button {
        padding: 0 !important;
        line-height: 1;
      }
      .list-actions-row {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        height: 100%;
        line-height: 1;
      }
      /* AG-Grid Actions cell — suppress AntD text-btn stretch under the icon */
      .ag-cell .ant-btn:has(.app-icon-grid-action),
      .ag-cell .list-action-button.ant-btn {
        box-shadow: none !important;
      }
      .ag-cell .ant-btn:has(.app-icon-grid-action)::after,
      .ag-cell .list-action-button.ant-btn::after {
        display: none !important;
      }

      .booking-template-modal__modal-body {
        padding: 0 !important;
      }
      .booking-template-modal__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
      }
      .booking-template-modal__header-main {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .booking-template-modal__header-icon {
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${lightSolid18};
        color: ${token.colorTextLightSolid};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .booking-template-modal__header-title {
        color: ${token.colorTextLightSolid};
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        display: block;
        line-height: ${token.lineHeight};
      }
      .booking-template-modal__header-subtitle {
        color: ${lightSolid85};
        font-size: ${token.fontSizeSM}px;
        display: block;
        line-height: ${token.lineHeight};
      }
      .booking-template-modal__close {
        border: none;
        background: ${lightSolid15};
        color: ${token.colorTextLightSolid};
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadiusLG}px;
        cursor: pointer;
        font-size: ${token.fontSizeHeading5}px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .booking-template-modal__body {
        padding: ${token.paddingMD + 4}px ${token.paddingLG}px ${
      token.paddingLG
    }px;
      }
      .booking-template-modal__table {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
      }
      .booking-template-modal__empty {
        padding: ${token.paddingXL}px 0;
      }
      .booking-template-modal__name-cell {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .booking-template-modal__name-badge {
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .booking-template-modal__route-cell {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS + 2}px;
      }
      .booking-template-modal__confirm-content {
        margin-top: ${token.marginXS}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }

      .booking-template-modal .ant-table-thead > tr > th {
        background: ${primaryTint12} !important;
        color: ${token.colorPrimary} !important;
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
      }
      .booking-template-modal .ant-table-tbody > tr:hover > td {
        background: ${primaryTint8} !important;
      }
      .booking-template-modal .ant-pagination-item-active {
        border-color: ${token.colorPrimary};
      }
      .booking-template-modal .ant-pagination-item-active a {
        color: ${token.colorPrimary};
      }

      /* ── Responsive layout (mobile / tablet / web / monitor) ── */
      .app-layout-root {
        height: 100vh;
        overflow: hidden;
        position: relative;
      }
      .app-layout-main {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
        transition: margin-left 0.25s cubic-bezier(0.2, 0, 0, 1);
        margin-left: 0;
      }
      .app-layout-content {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        background: ${token.colorBgLayout};
        display: flex;
        flex-direction: column;
      }
      .app-content-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
        min-height: 0;
        padding: ${token.paddingSM}px;
      }
      .app-content-inner {
        min-height: 100%;
        display: flex;
        flex-direction: column;
      }
      .feature-page-shell {
        width: 100%;
      }
      .module-screen-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginLG}px;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .module-screen-header__title-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .module-screen-header__title {
        margin: 0 !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .module-screen-header__subtitle {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
      }
      .module-screen-header__extra {
        flex-shrink: 0;
      }
      .wizard-page-card {
        border-radius: ${token.borderRadiusLG}px;
        border: none;
        display: flex;
        flex-direction: column;
        min-height: 0;
        height: calc(100vh - 120px);
      }
      .wizard-page-card .ant-card-body {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        padding: 0;
        overflow: hidden;
      }
      .wizard-page-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .wizard-step-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
        min-height: 0;
      }
      .wizard-step-content .form-step-scroll {
        padding-top: ${token.paddingSM}px;
      }
      .wizard-confirmation {
        padding: ${token.paddingXL}px ${token.paddingLG}px;
        text-align: center;
      }
      .wizard-page-header {
        padding: ${token.paddingMD}px ${token.paddingMD}px 0;
        flex-shrink: 0;
      }
      .wizard-page-header .module-screen-header {
        margin-bottom: ${token.marginXS}px;
      }
      .wizard-steps-scroll {
        flex-shrink: 0;
        /* Room for larger pipeline icons + pulse ring */
        padding: ${token.paddingSM}px ${token.paddingMD}px ${token.paddingXS}px;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
      }
      .wizard-steps-inner {
        box-sizing: border-box;
        width: 100%;
        min-width: 980px;
        padding: 0;
        margin: 0;
      }
      .custom-booking-steps.ant-steps {
        width: 100%;
        /* Keep Ant Design rail math in sync with custom circle size */
        --ant-cmp-steps-icon-size: ${token.sizeXXL}px;
        --ant-cmp-steps-icon-size-max: ${token.sizeXXL}px;
      }
      .custom-booking-steps .ant-steps-item {
        flex: 1 1 0;
        min-width: 120px;
        overflow: visible !important;
        position: relative;
      }
      .custom-booking-steps .ant-steps-item-container,
      .custom-booking-steps .ant-steps-item-wrapper {
        overflow: visible !important;
      }
      /* Pipeline badge size — shared by Booking / SI / BL wizards */
      .wizard-step-icon {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        width: ${token.sizeXXL}px !important;
        height: ${token.sizeXXL}px !important;
        border-radius: 50%;
        font-size: ${Math.round(token.sizeXXL * 0.45)}px;
        line-height: 1;
        box-sizing: border-box;
        position: relative;
        z-index: 1;
      }
      .custom-booking-steps .ant-steps-item-icon {
        background: transparent !important;
        border: none !important;
        width: ${token.sizeXXL}px !important;
        height: ${token.sizeXXL}px !important;
        margin-inline-start: auto !important;
        margin-inline-end: auto !important;
        margin-block-start: 0 !important;
        display: flex !important;
        align-items: center;
        justify-content: center;
        line-height: 1 !important;
        overflow: visible !important;
        position: relative;
        z-index: 1;
      }
      .custom-booking-steps .ant-steps-item-content {
        width: 100% !important;
        text-align: center;
        overflow: visible !important;
      }
      .custom-booking-steps .ant-steps-item-title {
        font-weight: ${token.fontWeightStrong} !important;
        margin-top: ${token.marginXS}px !important;
        padding-inline-end: 0 !important;
        font-size: ${token.fontSize}px !important;
        line-height: 1.3 !important;
        white-space: normal !important;
      }
      /*
       * Connector rail: Ant Design 6 uses item-rail (not legacy item-tail).
       * Center the horizontal line through the middle of the sizeXXL circle.
       * Modified by Sekar Nagarajan (2026-08-28 14:18) — raise rail opacity;
       * finish used colorBorderSecondary and vanished on white backgrounds.
       */
      .custom-booking-steps .ant-steps-item-rail,
      .custom-booking-steps .ant-steps-item-tail {
        position: absolute !important;
        top: calc(${token.sizeXXL / 2}px - 1px) !important;
        margin-top: 0 !important;
        inset-inline-start: calc(
          50% + ${token.sizeXXL / 2}px + ${token.marginXXS}px
        ) !important;
        width: calc(
          100% - ${token.sizeXXL}px - ${token.marginXXS * 2}px
        ) !important;
        height: 0 !important;
        border-block-start-width: 2px !important;
        border-block-start-style: solid !important;
        border-block-start-color: ${token.colorBorder} !important;
        background: transparent !important;
        padding: 0 !important;
        opacity: 1 !important;
      }
      .custom-booking-steps .ant-steps-item-tail::after {
        display: none !important;
      }
      .custom-booking-steps .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after,
      .custom-booking-steps .ant-steps-item-finish .ant-steps-item-rail,
      .custom-booking-steps .ant-steps-item-rail-finish {
        border-block-start-color: ${token.colorSuccess} !important;
        opacity: 1 !important;
      }
      .custom-booking-steps .ant-steps-item-process .ant-steps-item-rail,
      .custom-booking-steps .ant-steps-item-rail-process {
        border-block-start-color: ${token.colorPrimary} !important;
        opacity: 1 !important;
      }
      .custom-booking-steps .ant-steps-item-wait .ant-steps-item-rail,
      .custom-booking-steps .ant-steps-item-rail-wait {
        border-block-start-color: ${token.colorBorder} !important;
        opacity: 1 !important;
      }
      .pipeline-stage-current-badge {
        animation: pipeline-stage-current-pulse 1.5s ease-in-out infinite;
      }
      @keyframes pipeline-stage-current-pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 ${tokenMix(token.colorPrimary, 45)};
        }
        50% {
          box-shadow: 0 0 0 6px ${tokenMix(token.colorPrimary, 0)};
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .pipeline-stage-current-badge {
          animation: none;
        }
      }
      .feature-page-stack {
        width: 100%;
      }
      .feature-page-card {
        border-radius: ${token.borderRadiusLG}px;
        border: none;
        box-shadow: none;
      }
      .feature-page-card .ant-card-body {
        padding: ${token.paddingMD}px;
      }
      .feature-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: ${token.marginMD + 4}px;
        margin-bottom: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .feature-toolbar__title {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
      }
      .admin-layout {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .admin-layout__header {
        background: ${token.colorBgContainer};
        border-bottom: 1px solid ${token.colorBorderSecondary};
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .admin-layout__header-main {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .admin-layout__header-icon {
        padding: ${token.paddingXS}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorPrimaryBg};
        display: inline-flex;
      }
      .admin-layout__header-title {
        margin: 0 !important;
        font-size: ${token.fontSizeLG}px !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .admin-layout__header-subtitle {
        font-size: ${token.fontSizeSM}px;
      }
      .admin-redesigned-tabs .ant-tabs-nav {
        background: ${token.colorBgContainer};
        padding: 4px 6px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginSM}px !important;
        overflow-x: auto;
        flex-wrap: nowrap;
      }
      .admin-redesigned-tabs .ant-tabs-tab {
        border-radius: ${token.borderRadiusLG}px !important;
        padding: 6px 12px !important;
        margin-right: 4px !important;
        border: none !important;
        background: transparent !important;
        font-weight: 500;
        white-space: nowrap;
      }
      .admin-redesigned-tabs .ant-tabs-tab:hover {
        background: ${token.colorFillAlter} !important;
        color: ${token.colorPrimary} !important;
      }
      .admin-redesigned-tabs .ant-tabs-tab-active {
        background: ${token.colorPrimaryBg} !important;
        border: 1px solid ${token.colorPrimaryBorder} !important;
      }
      .admin-redesigned-tabs .ant-tabs-tab-active span {
        font-weight: ${token.fontWeightStrong} !important;
        color: ${token.colorPrimary} !important;
      }
      .admin-redesigned-tabs .ant-tabs-ink-bar {
        display: none !important;
      }
      .tracking-results-panel {
        background: ${token.colorBgContainer};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingMD}px ${token.paddingMD + 4}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .tracking-search-field {
        margin-bottom: 0 !important;
      }
      .tracking-search-field .ant-form-item-control {
        position: relative;
        /* Reserve error-line height so Track/Reset stay fixed when validation appears */
        padding-bottom: ${
          token.fontSize * token.lineHeight + token.marginXXS
        }px;
      }
      .tracking-search-field .ant-form-item-explain {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        min-height: ${token.fontSize * token.lineHeight}px;
      }
      .tracking-search-actions-field {
        margin-bottom: 0 !important;
      }
      .tracking-search-actions-field .ant-form-item-label {
        min-height: ${token.fontSizeSM * token.lineHeight + token.marginXS}px;
      }
      .tracking-search-actions-field .ant-form-item-label > label {
        visibility: hidden;
      }
      .tracking-search-actions {
        display: flex;
        gap: ${token.marginXS}px;
        width: 100%;
        align-items: center;
        justify-content: flex-end;
        min-height: ${token.controlHeightLG}px;
        flex-wrap: wrap;
      }
      .tracking-search-actions .sm-app-button,
      .tracking-search-actions .ant-btn {
        min-height: ${token.controlHeightLG}px;
      }
      .admin-layout__badge {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorSuccess};
      }
      .responsive-table-wrap,
      .ag-theme-alpine {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .app-header-brand-detail {
        display: flex;
        flex-direction: column;
      }
      .app-header-actions {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .app-header-brand-home {
        display: inline-flex;
        align-items: center;
        margin: 0;
        padding: ${token.paddingXXS}px ${token.paddingXS}px;
        border: 0;
        border-radius: ${token.borderRadius}px;
        background: transparent;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.2s ease;
      }
      .app-header-brand-home:hover,
      .app-header-brand-home:focus-visible {
        background: ${token.colorFillSecondary};
        outline: none;
      }
      .app-header-actions .app-header-action.ant-btn,
      .app-header-actions .sm-app-button.app-header-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        height: ${token.controlHeightSM}px;
        min-height: ${token.controlHeightSM}px;
        padding-inline: ${token.paddingSM}px;
        line-height: 1;
        transition:
          background-color 0.2s ease,
          color 0.2s ease,
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          transform 0.2s ease;
      }
      .app-header-actions .app-header-action.ant-btn-text:hover,
      .app-header-actions .app-header-action.ant-btn-text:focus-visible,
      .app-header-actions .sm-app-button.app-header-action.ant-btn-text:hover,
      .app-header-actions .sm-app-button.app-header-action.ant-btn-text:focus-visible {
        color: ${token.colorText} !important;
        background: ${token.colorFillSecondary} !important;
      }
      .app-header-actions .app-header-action--primary.ant-btn,
      .app-header-actions .sm-app-button.app-header-action--primary {
        padding-inline: ${token.paddingMD}px;
      }
      .app-header-actions .app-header-action--primary.ant-btn:hover,
      .app-header-actions .app-header-action--primary.ant-btn:focus-visible,
      .app-header-actions .sm-app-button.app-header-action--primary:hover,
      .app-header-actions .sm-app-button.app-header-action--primary:focus-visible {
        background: ${token.colorPrimaryHover} !important;
        border-color: ${token.colorPrimaryHover} !important;
        
        box-shadow: 0 4px 12px ${tokenMix(token.colorPrimary, 22)};
      }
      .app-header-actions .app-header-action--primary.ant-btn:active,
      .app-header-actions .sm-app-button.app-header-action--primary:active {
        transform: translateY(0);
        box-shadow: 0 1px 4px ${tokenMix(token.colorPrimary, 18)};
      }
      .app-header-select {
        min-width: 160px;
      }
      .app-header-user-meta {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
      }
      .app-sidebar-sider {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        background: ${token.colorBgContainer};
        border-right: 1px solid ${token.colorBorderSecondary};
        z-index: 100;
        overflow-y: auto;
        overflow-x: hidden;
        box-shadow: 2px 0 8px 0 ${tokenMix(token.colorText, 5)};
        transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
      }
      .app-sidebar-sider:not(.ant-layout-sider-collapsed) {
        box-shadow: 8px 0 28px 0 ${tokenMix(token.colorText, 15)};
      }
      .app-sidebar-brand {
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        border-top: 3px solid ${token.colorPrimary};
        overflow: hidden;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        background: ${token.colorBgContainer};
        gap: 10px;
      }
      .app-sidebar-brand__logo {
        height: 38px;
        max-width: 100%;
        object-fit: contain;
      }
      .app-sidebar-menu {
        border-right: 0;
        padding-top: ${token.paddingXS}px;
        background: transparent !important;
      }
      /* Selected rail item: solid primary plate + light icons (readable on primary) */
      .app-sidebar-menu.ant-menu-light .ant-menu-item-selected,
      .app-sidebar-menu.ant-menu .ant-menu-item-selected,
      .pub-layout-sider__menu.ant-menu-light .ant-menu-item-selected,
      .pub-layout-sider__menu.ant-menu .ant-menu-item-selected {
        background: ${token.colorPrimary} !important;
        color: ${token.colorTextLightSolid} !important;
        font-weight: ${token.fontWeightStrong};
        border-inline-start: 3px solid ${token.colorPrimary};
      }
      .app-sidebar-menu .ant-menu-item-selected .app-icon,
      .app-sidebar-menu .ant-menu-item-selected .app-icon-nav,
      .pub-layout-sider__menu .ant-menu-item-selected .app-icon,
      .pub-layout-sider__menu .ant-menu-item-selected .app-icon-nav {
        color: ${token.colorTextLightSolid} !important;
      }
      .app-sidebar-menu .ant-menu-item:not(.ant-menu-item-selected):hover,
      .pub-layout-sider__menu .ant-menu-item:not(.ant-menu-item-selected):hover {
        background: ${token.colorFillSecondary} !important;
      }
      .app-sidebar-menu .ant-menu-item:not(.ant-menu-item-selected):hover .app-icon,
      .app-sidebar-menu .ant-menu-item:not(.ant-menu-item-selected):hover .app-icon-nav,
      .pub-layout-sider__menu .ant-menu-item:not(.ant-menu-item-selected):hover .app-icon,
      .pub-layout-sider__menu .ant-menu-item:not(.ant-menu-item-selected):hover .app-icon-nav {
        color: ${token.colorPrimary} !important;
      }
      .app-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title,
      .pub-layout-sider__menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
        color: ${token.colorPrimary} !important;
      }
      .app-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .app-icon-nav,
      .pub-layout-sider__menu .ant-menu-submenu-selected > .ant-menu-submenu-title .app-icon-nav {
        color: ${token.colorPrimary} !important;
      }
      /* Collapsed icon-rail: active parent (e.g. More) must use light icons on primary */
      .app-sidebar-menu.ant-menu-inline-collapsed > .ant-menu-submenu-selected > .ant-menu-submenu-title,
      .pub-layout-sider__menu.ant-menu-inline-collapsed > .ant-menu-submenu-selected > .ant-menu-submenu-title {
        background: ${token.colorPrimary} !important;
        color: ${token.colorTextLightSolid} !important;
      }
      .app-sidebar-menu.ant-menu-inline-collapsed > .ant-menu-submenu-selected > .ant-menu-submenu-title .app-icon,
      .app-sidebar-menu.ant-menu-inline-collapsed > .ant-menu-submenu-selected > .ant-menu-submenu-title .app-icon-nav,
      .pub-layout-sider__menu.ant-menu-inline-collapsed > .ant-menu-submenu-selected > .ant-menu-submenu-title .app-icon,
      .pub-layout-sider__menu.ant-menu-inline-collapsed > .ant-menu-submenu-selected > .ant-menu-submenu-title .app-icon-nav {
        color: ${token.colorTextLightSolid} !important;
      }
      /* More / Schedules / Rates flyout (portal) — same contrast rules */
      .app-sidebar-menu-popup.ant-menu-submenu-popup .ant-menu-item .app-icon-nav {
        color: ${token.colorText} !important;
      }
      .app-sidebar-menu-popup.ant-menu-submenu-popup .ant-menu-item:hover:not(.ant-menu-item-selected) .app-icon-nav {
        color: ${token.colorPrimary} !important;
      }
      .app-sidebar-menu-popup.ant-menu-submenu-popup .ant-menu-item-selected {
        background: ${token.colorPrimary} !important;
        color: ${token.colorTextLightSolid} !important;
      }
      .app-sidebar-menu-popup.ant-menu-submenu-popup .ant-menu-item-selected .app-icon,
      .app-sidebar-menu-popup.ant-menu-submenu-popup .ant-menu-item-selected .app-icon-nav {
        color: ${token.colorTextLightSolid} !important;
      }
      .app-sidebar-drawer-body {
        padding: 0 !important;
      }
      .app-layout-header {
        background: ${token.colorBgContainer};
        padding: 0 ${token.paddingMD}px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        z-index: 90;
        gap: ${token.marginSM}px;
      }
      .app-layout-header__left {
        display: flex;
        align-items: center;
        gap: ${token.marginMD}px;
        min-width: 0;
        flex: 1;
      }
      .app-layout-header__brand-row {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
      }
      .app-layout-header__tenant-name {
        font-size: ${token.fontSizeLG}px;
        color: ${token.colorText};
      }
      .app-layout-header__welcome {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
      }
      .app-header-tag {
        font-size: ${token.fontSizeSM}px;
        margin: 0;
      }
      .app-header-user-cluster {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .app-header-user-trigger {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin: 0;
        padding: 0 ${token.paddingXS}px;
        border: none;
        background: transparent;
        cursor: pointer;
        color: inherit;
        min-width: 0;
      }
      .app-header-logout.ant-btn,
      .app-header-logout.sm-app-button {
        color: ${token.colorTextSecondary};
      }
      .app-header-logout.ant-btn:hover,
      .app-header-logout.sm-app-button:hover {
        color: ${token.colorError} !important;
      }
      .app-header-avatar {
        background-color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }
      .app-header-user-name {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorText};
      }
      .app-header-user-role {
        font-size: ${token.fontSizeSM}px;
      }

      /* Public (pre-login) header */
      .pub-layout-header.ant-layout-header {
        position: sticky;
        top: 0;
        z-index: ${token.zIndexBase + 20};
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        padding-inline: ${token.paddingLG}px;
        height: 48px;
        line-height: 48px;
        background: ${token.colorBgContainer};
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .pub-layout-header__left {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
        flex: 1 1 auto;
      }
      .pub-layout-header__brand-link {
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        min-width: 0;
      }
      .pub-layout-header__logo {
        max-height: 32px;
        object-fit: contain;
      }
      .pub-layout-header__brand {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .pub-layout-header__brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
        min-width: 0;
      }
      .pub-layout-header__brand-name {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.15;
      }
      .pub-layout-header__brand-portal {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorPrimary};
        line-height: 1.15;
        letter-spacing: 0.5px;
      }
      .pub-header-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginXXS}px;
        flex: 0 0 auto;
        height: 100%;
      }
      .pub-header-actions .pub-header-action.ant-btn,
      .pub-header-actions .sm-app-button.pub-header-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        height: ${token.controlHeightSM}px;
        min-height: ${token.controlHeightSM}px;
        padding-inline: ${token.paddingSM}px;
        line-height: 1;
        vertical-align: middle;
      }
      .pub-header-actions .pub-header-action--primary.ant-btn,
      .pub-header-actions .sm-app-button.pub-header-action--primary {
        padding-inline: ${token.paddingMD}px;
        transition:
          background-color 0.2s ease,
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          transform 0.2s ease;
      }
      .pub-header-actions .pub-header-action--primary.ant-btn:hover,
      .pub-header-actions .pub-header-action--primary.ant-btn:focus-visible,
      .pub-header-actions .sm-app-button.pub-header-action--primary:hover,
      .pub-header-actions .sm-app-button.pub-header-action--primary:focus-visible {
        background: ${token.colorPrimaryHover} !important;
        border-color: ${token.colorPrimaryHover} !important;
   
      
      }
      .pub-header-actions .pub-header-action--primary.ant-btn:active,
      .pub-header-actions .sm-app-button.pub-header-action--primary:active {
        transform: translateY(0);
        box-shadow: 0 1px 4px ${tokenMix(token.colorPrimary, 18)};
      }
      .pub-header-action__label {
        white-space: nowrap;
      }
      .pub-header-lang-trigger {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .pub-header-lang-trigger__code {
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.02em;
      }
      .pub-header-lang-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 180px;
        padding-block: 2px;
      }
      .pub-header-lang-item__name {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.3;
      }

      .pub-header-lang-item__detail {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }

      /* Public layout shell (pre-login) — same overlay-rail pattern as AuthenticatedLayout */
      .pub-layout-root {
        height: 100vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .pub-layout-shell {
        position: relative;
        flex: 1;
        min-height: 0;
        min-width: 0;
        width: 100%;
        overflow: hidden;
      }
      .pub-layout-sider.ant-layout-sider {
        position: absolute !important;
        left: 0;
        top: 0;
        bottom: 0;
        height: 100% !important;
        background: ${token.colorBgContainer};
        border-right: 1px solid ${token.colorBorderSecondary};
        z-index: 100;
        overflow-y: auto;
        overflow-x: hidden;
        box-shadow: 2px 0 8px 0 ${tokenMix(token.colorText, 5)};
        transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
      }
      .pub-layout-sider.ant-layout-sider:not(.ant-layout-sider-collapsed) {
        box-shadow: 8px 0 28px 0 ${tokenMix(token.colorText, 15)};
      }
      .pub-layout-sider__menu {
        border-right: 0;
        padding-top: ${token.paddingMD}px;
      }
      /* JSP .disabled parity — auth-required modules on public sider */
      .pub-layout-sider__menu .ant-menu-item-locked,
      .pub-layout-sider__menu .ant-menu-submenu-locked > .ant-menu-submenu-title {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .pub-layout-sider__menu .ant-menu-item-locked:hover,
      .pub-layout-sider__menu .ant-menu-submenu-locked > .ant-menu-submenu-title:hover {
        background: transparent !important;
      }
      .app-sidebar-menu .ant-menu-item-locked,
      .app-sidebar-menu .ant-menu-submenu-locked > .ant-menu-submenu-title {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .app-sidebar-menu .ant-menu-item-locked:hover {
        background: transparent !important;
      }
      .pub-layout-main {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        min-width: 0;
        width: 100%;
        overflow: hidden;
        margin-left: 0;
        transition: margin-left 0.25s cubic-bezier(0.2, 0, 0, 1);
      }
      .pub-layout-main--with-rail {
        margin-left: 80px;
        width: calc(100% - 80px);
      }
      .pub-layout-content {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        min-width: 0;
        width: 100%;
        overflow: hidden;
      }
      .pub-layout-bg {
        position: absolute;
        inset: 0;
        /* Light mode (default) */
        background-image: url(/landing-bg-light.png);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 1;
        z-index: 0;
      }
      /* Dark mode — navy logistics hero */
      html.dark .pub-layout-bg {
        background-image: url(/hero-bg.png);
      }
      /* Modified by Sekar Nagarajan (2026-08-27 15:47) — theme-aware wash for readable hero copy */
      .pub-layout-bg-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to right,
          ${tokenMix(token.colorBgContainer, 62)} 0%,
          ${tokenMix(token.colorBgContainer, 32)} 45%,
          transparent 82%
        );
        z-index: 1;
      }
      html.dark .pub-layout-bg-overlay {
        background: linear-gradient(
          to right,
          ${tokenMix(token.colorBgContainer, 70)} 0%,
          ${tokenMix(token.colorBgContainer, 38)} 48%,
          transparent 85%
        );
      }
      .pub-layout-page {
        flex: 1;
        z-index: 2;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .pub-layout-page--outlet {
        padding: ${token.paddingMD}px;
        overflow: auto;
      }
      .pub-layout-page--outlet-locked {
        overflow: hidden;
      }
      .pub-layout-page--outlet-locked > .feature-page-shell {
        flex: 1;
        min-height: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .pub-landing {
        flex: 1;
        display: flex;
        flex-direction: column;
        z-index: 2;
        min-height: 0;
        min-width: 0;
        width: 100%;
        overflow-y: auto;
        padding: ${token.paddingMD}px;
        gap: ${token.marginLG}px;
      }
      .pub-landing__copy {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        max-width: 100%;
        min-width: 0;
      }
      .pub-landing__copy--narrow {
        max-width: 650px;
        padding-right: ${token.paddingXL}px;
      }
      .pub-landing__eyebrow {
        display: inline-block;
        align-self: flex-start;
        padding: ${token.paddingXS}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        border: 1px solid ${token.colorPrimary};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        letter-spacing: 1px;
        margin-bottom: ${token.marginMD}px;
        background: ${token.colorBgContainer};
      }
      .pub-landing__title {
        margin: 0 0 ${token.marginSM}px 0;
        font-weight: 800;
        line-height: 1.1;
        color: ${token.colorText};
        font-size: clamp(1.75rem, 4vw, 3.5rem);
      }
      .pub-landing__subtitle {
        font-size: clamp(1rem, 2vw, 1.25rem);
        color: ${token.colorTextSecondary};
        margin-bottom: ${token.marginXL}px;
        line-height: 1.6;
        max-width: 550px;
      }
      .pub-landing__cards {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginMD}px;
      }
      .pub-landing__card.ant-card {
        flex: 1 1 140px;
        min-width: 140px;
        border-radius: ${token.borderRadiusLG}px;
        cursor: pointer;
        border: 1px solid ${token.colorPrimary};
      }
      .pub-landing__card--active.ant-card {
        border-color: ${token.colorPrimary};
      }
      .pub-landing__card .ant-card-body {
        padding: ${token.paddingMD}px;
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .pub-landing__card-icon {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        padding: ${token.paddingXS}px;
        border-radius: ${token.borderRadius}px;
        display: inline-flex;
      }
      .pub-landing__card-label {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
      }
      .pub-landing__panel {
        width: 100%;
        min-width: 0;
        display: flex;
        align-items: stretch;
        justify-content: center;
      }
      .pub-landing__search-card {
        background: ${token.colorBgContainer};
        border-radius: ${token.borderRadiusLG * 2}px;
        box-shadow: ${token.boxShadowSecondary};
        width: 100%;
        overflow: hidden;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .pub-landing__search-tabs {
        padding: ${token.paddingMD}px ${token.paddingLG * 2}px 0;
      }
      .pub-landing__search-tabs--mobile {
        padding: ${token.paddingMD}px ${token.paddingMD}px 0;
      }
      .pub-landing__search-tabs-pad {
        padding: 0 ${token.paddingLG * 2}px ${token.paddingLG * 2}px;
      }
      .pub-landing__search-tabs-pad--mobile {
        padding: 0 ${token.paddingMD}px ${token.paddingLG}px;
      }
      /* Legacy alpine grids — follow html.dark / Ant tokens (CRM parity bridge) */
      html.dark .ag-theme-alpine {
        --ag-background-color: ${token.colorBgContainer};
        --ag-header-background-color: ${token.colorBgElevated};
        --ag-odd-row-background-color: ${token.colorFillAlter};
        --ag-foreground-color: ${token.colorText};
        --ag-secondary-foreground-color: ${token.colorTextSecondary};
        --ag-border-color: ${token.colorBorderSecondary};
        --ag-row-hover-color: ${token.colorFillSecondary};
      }
      .text-amount-success {
        color: ${token.colorSuccess} !important;
      }
      .text-amount-error {
        color: ${token.colorError} !important;
      }
      .text-amount-warning {
        color: ${token.colorWarning} !important;
      }
      .co2-result-card {
        border-radius: ${token.borderRadiusLG}px;
        background: linear-gradient(
          135deg,
          ${token.colorSuccessBg} 0%,
          ${token.colorInfoBg} 100%
        );
        border: 1px solid ${token.colorSuccessBorder};
        margin-bottom: ${token.marginLG}px;
      }
      .co2-calc-btn.ant-btn-primary {
        width: 100%;
        background: ${token.colorSuccess} !important;
        border-color: ${token.colorSuccess} !important;
      }
      .co2-calc-btn.ant-btn-primary:hover {
        background: ${token.colorSuccessHover} !important;
        border-color: ${token.colorSuccessHover} !important;
      }
      .app-header-theme-toggle {
        display: inline-flex;
        align-items: center;
      }
      /* Autofill tracks container (dark-safe) */
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px ${
          token.colorBgContainer
        } inset !important;
        -webkit-text-fill-color: ${token.colorText} !important;
        transition: background-color 50000s ease-in-out 0s !important;
      }
      .pub-landing__panel--side {
        width: min(720px, 48%);
        min-width: 360px;
        justify-content: flex-end;
        align-items: center;
      }
      .landing-search-actions.ant-flex {
        width: 100%;
        display: grid !important;
        grid-template-columns: 1fr 1fr;
        gap: ${token.marginSM}px;
      }
      .landing-search-actions.ant-flex > .ant-btn.sm-app-button {
        width: 100%;
        min-width: 0;
      }
      .app-footer {
        text-align: center;
        background: ${token.colorBgContainer};
        border-top: 1px solid ${token.colorBorderSecondary};
        padding: ${token.paddingXS}px ${token.paddingMD}px;
        z-index: 2;
        flex-shrink: 0;
        width: 100%;
        min-width: 0;
      }
      .app-footer__inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        width: 100%;
      }
      .app-footer__text {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: normal;
      }

      /* mobile < 768 */
      @media (max-width: 767px) {
        .pub-layout-header.ant-layout-header {
          padding-inline: ${token.paddingSM}px;
        }
        .pub-header-action__label {
          display: none;
        }
        .pub-header-actions {
          gap: ${token.marginXXS}px;
        }
        .pub-header-actions .pub-header-action.ant-btn,
        .pub-header-actions .sm-app-button.pub-header-action {
          padding-inline: ${token.paddingXS}px;
        }
        .pub-header-lang-trigger__code {
          display: inline;
        }
        .pub-layout-page--outlet {
          padding: ${token.paddingSM}px;
        }
        .pub-landing {
          padding: ${token.paddingMD}px ${token.paddingSM}px;
          gap: ${token.marginMD}px;
        }
        .pub-landing__panel--side {
          width: 100%;
          min-width: 0;
        }
        .pub-landing__copy--narrow {
          padding-right: 0;
        }
        .app-footer__inner {
          flex-direction: column;
          text-align: center;
          justify-content: center;
        }
        .module-screen-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .module-screen-header__extra {
          width: 100%;
        }
        .module-screen-header__extra .ant-space {
          width: 100%;
          flex-wrap: wrap;
        }
        .app-header-brand-detail,
        .app-header-user-meta {
          display: none;
        }
        .app-header-select {
          min-width: 120px;
          max-width: 140px;
        }
        .app-layout-header {
          height: 56px;
          padding: 0 ${token.paddingSM}px;
        }
        .custom-booking-steps .ant-steps-item-title {
          font-size: ${token.fontSizeSM}px !important;
        }
        .form-step-scroll {
          padding: ${token.paddingMD}px;
        }
        .form-step-card > .ant-card-head {
          padding: ${token.paddingSM}px ${token.paddingMD}px;
        }
        .form-step-card > .ant-card-body {
          padding: ${token.paddingMD}px !important;
        }
        .form-step-card.ant-card-small > .ant-card-body {
          padding: ${token.paddingSM}px !important;
        }
        .form-step-footer {
          padding: ${token.paddingSM}px ${token.paddingMD}px;
          flex-wrap: wrap;
          gap: ${token.marginXS}px;
        }
        .booking-template-modal__header {
          padding: ${token.paddingSM}px ${token.paddingMD}px;
        }
        .booking-template-modal__body {
          padding: ${token.paddingMD}px;
        }
        .feature-toolbar {
          flex-direction: column;
          align-items: flex-start;
        }
        .feature-toolbar .ant-segmented {
          width: 100%;
        }
        .feature-page-card .ant-card-body {
          padding: ${token.paddingSM}px;
        }
        .admin-layout__header {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      /* tablet 768–991 */
      @media (min-width: 768px) and (max-width: 991px) {
        .app-layout-header__welcome,
        .app-header-user-role {
          display: none;
        }
        .app-header-actions {
          gap: ${token.marginSM}px;
        }
        .app-header-select {
          min-width: 140px;
          max-width: 180px;
        }
        .pub-landing {
          padding: ${token.paddingLG}px;
        }
        .pub-layout-page--outlet {
          padding: ${token.paddingMD}px ${token.paddingLG}px;
        }
        .app-content-main {
          padding: ${token.paddingMD}px;
        }
        .wizard-page-header {
          padding: ${token.paddingLG}px ${token.paddingLG}px 0;
        }
        .wizard-steps-scroll {
          padding: 6px ${token.paddingLG}px 2px;
        }
        .wizard-steps-inner {
          min-width: 980px;
        }
        .wizard-page-card {
          height: auto;
          min-height: calc(100vh - 120px);
        }
        .pub-landing__copy--narrow {
          padding-right: 0;
          max-width: 100%;
        }
        .pub-landing__panel--side {
          width: 100%;
          min-width: 0;
        }
      }

      @media (min-width: 768px) {
        .app-content-main {
          padding: ${token.paddingMD}px;
        }
        .wizard-page-header {
          padding: ${token.paddingLG}px ${token.paddingLG}px 0;
        }
        .wizard-steps-scroll {
          padding: 6px ${token.paddingLG}px 2px;
        }
        .wizard-steps-inner {
          min-width: 980px;
        }
        .pub-landing--row {
          flex-direction: row;
        }
      }

      /* web 992–1599 */
      @media (min-width: 992px) {
        .app-layout-main {
          margin-left: 80px;
        }
        .app-content-main {
          padding: ${token.paddingMD}px;
        }
        .wizard-page-card {
          height: calc(100vh - 140px);
        }
        .wizard-step-content .form-step-scroll.custom-scroll {
          overflow-y: auto;
        }
        .pub-landing {
          padding: ${token.paddingXL}px ${token.paddingXL + 12}px;
          gap: ${token.marginXL}px;
        }
        .pub-layout-page--outlet {
          padding: ${token.paddingLG}px ${token.paddingXL}px;
        }
        .landing-search-actions.ant-flex {
          grid-template-columns: 7fr 3fr;
        }
      }

      @media (min-width: 1200px) {
        .app-content-main {
          padding: ${token.paddingLG}px;
        }
        .feature-page-shell {
          max-width: 1440px;
        }
      }

      /* monitor ≥ 1600 */
      @media (min-width: 1600px) {
        .app-content-main {
          padding: ${token.paddingXL}px;
        }
        .feature-page-shell {
          max-width: 1600px;
          margin: 0 auto;
        }
        .pub-landing {
          padding: ${token.paddingXL}px calc((100% - 1600px) / 2 + ${
      token.paddingXL
    }px);
        }
        .pub-layout-page--outlet {
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }
      }

      @media (max-width: 991px) {
        .wizard-page-card {
          height: auto;
          min-height: calc(100vh - 120px);
        }
      }
    `}</style>
  );
}
