// Modified by Sekar Nagarajan (2026-10-27 12:30) — rates estimator drawer redesign
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function ScheduleModuleStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      .schedule-search-panel {
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginMD}px;
        overflow: hidden;
      }
      /* Modified by Sekar Nagarajan (2026-09-17 21:14) — collapse in-page search when pinned (no spacer gap) */
      .schedule-search-pin-sentinel {
        height: 1px;
        width: 100%;
        margin: 0;
        padding: 0;
        pointer-events: none;
      }
      .schedule-search-sentinel {
        width: 100%;
      }
      .schedule-search-sentinel--pinned {
        display: none;
        margin-bottom: 0;
        height: 0;
        overflow: hidden;
      }
      .schedule-search-panel--header {
        margin-bottom: 0;
        border: none;
        border-radius: ${token.borderRadius}px;
        background: transparent;
        overflow: visible;
        width: 100%;
        min-width: 0;
        animation: schedule-header-search-in 0.28s ease both;
      }
      .schedule-search-panel--header .schedule-search-panel__body {
        padding: 0;
        background: transparent;
      }
      .schedule-search-panel--header .schedule-search-type-wrap {
        display: none;
      }
      .schedule-search-panel--header .schedule-search-panel__body > .ant-form {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: nowrap;
        min-width: 0;
      }
      .schedule-search-panel--header .ant-form-item {
        margin-bottom: 0 !important;
      }
      .schedule-search-panel--header .ant-form-item-label {
        display: none;
      }
      .schedule-search-panel--header .ant-row {
        flex: 1 1 auto;
        min-width: 0;
        flex-wrap: nowrap !important;
        width: 100%;
      }
      /* Modified by Sekar Nagarajan (2026-09-17 21:19) — give POL/POD more width than date */
      .schedule-search-panel--header .ant-row > .ant-col {
        max-width: none !important;
      }
      .schedule-search-panel--header .schedule-search-header-col--port {
        flex: 2 1 260px !important;
        min-width: 220px !important;
      }
      .schedule-search-panel--header .schedule-search-header-col--swap,
      .schedule-search-panel--header .schedule-search-header-col--actions {
        flex: 0 0 auto !important;
        min-width: auto !important;
      }
      .schedule-search-panel--header .schedule-search-header-col--date {
        flex: 0 1 220px !important;
        min-width: 180px !important;
        max-width: 240px !important;
      }
      .schedule-search-panel--header .schedule-date-range {
        min-width: 0;
        max-width: 100%;
      }
      .schedule-search-panel--header .ant-select,
      .schedule-search-panel--header .ant-picker {
        width: 100% !important;
        max-width: 100%;
      }
      .schedule-search-panel--header .schedule-search-header-col--port .ant-select-selection-item {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .schedule-search-panel--header .ant-select-single.ant-select-sm,
      .schedule-search-panel--header .ant-select-single:not(.ant-select-customize-input) .ant-select-selector,
      .schedule-search-panel--header .ant-picker {
        height: ${token.controlHeightSM}px !important;
      }
      .schedule-search-actions--compact {
        display: inline-flex;
        gap: ${token.marginXXS}px;
        align-items: center;
        width: auto;
        min-height: ${token.controlHeightSM}px;
      }
      .schedule-search-actions--compact .schedule-search-actions__icon-btn.sm-app-button,
      .schedule-search-actions--compact .schedule-search-actions__icon-btn.ant-btn {
        width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        min-width: ${token.controlHeightSM}px;
        min-height: ${token.controlHeightSM}px;
        padding: 0;
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      @keyframes schedule-header-search-in {
        from {
          opacity: 0;
          transform: translateY(-${token.marginSM}px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .schedule-search-panel__header {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
      }
      .schedule-search-panel__header-icon {
        width: ${token.controlHeightLG}px;
        height: ${token.controlHeightLG}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${tokenMix(token.colorTextLightSolid, 18)};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .schedule-search-panel__header-title {
        color: ${token.colorTextLightSolid};
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
        display: block;
        line-height: ${token.lineHeight};
      }
      .schedule-search-panel__header-subtitle {
        color: ${tokenMix(token.colorTextLightSolid, 85)};
        font-size: ${token.fontSizeSM}px;
        display: block;
      }
      .schedule-search-panel__body {
        padding: ${token.paddingMD}px ${token.paddingMD}px ${token.paddingSM}px;
        background: ${token.colorFillAlter};
      }
      .schedule-search-panel__body .ant-form-item {
        margin-bottom: ${token.marginSM}px;
      }
      .schedule-search-panel__body .ant-form-item-label {
        padding-bottom: ${token.paddingXXS}px;
      }
      /* Modified by Sekar Nagarajan (2026-09-08 16:40) — tighter spacing; tab font size unchanged */
      .schedule-search-type-wrap {
        margin-bottom: ${token.marginSM}px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .schedule-search-tabs.ant-tabs {
        margin-bottom: 0;
      }
      .schedule-search-tabs .ant-tabs-nav {
        margin-bottom: 0;
      }
      .schedule-search-tabs .ant-tabs-nav::before {
        border-bottom-color: ${token.colorBorderSecondary};
      }
      .schedule-search-tabs .ant-tabs-tab {
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        font-size: ${token.fontSize}px;
        line-height: ${token.lineHeight};
      }
      .schedule-search-tabs .ant-tabs-content-holder {
        display: none;
      }
      /* Hide Ant Design tabs overflow / more control on the search type bar */
      .schedule-search-tabs .ant-tabs-nav-operations {
        display: none !important;
      }
        .schedule-card__actions-quote{
        background: ${token.colorWarning};
        color: ${token.colorWhite};
        }
        .schedule-card__actions-quote:hover{
        background: ${token.colorWarningTextHover};
        border-color: ${token.colorWarningHover};
        }
      .schedule-tab-label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        line-height: 1;
        font-size: ${token.fontSize}px;
      }
      .schedule-tab-label .app-icon {
        display: block;
        flex: none;
      }
      .schedule-port-swap-field .ant-form-item-control-input-content {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .schedule-search-actions-field {
        margin-bottom: 0 !important;
      }
      .schedule-search-actions-field .ant-form-item-label {
        min-height: ${token.fontSizeSM * token.lineHeight + token.marginXS}px;
      }
      .schedule-search-actions-field .ant-form-item-label > label {
        visibility: hidden;
      }
      .schedule-search-actions {
        display: flex;
        gap: ${token.marginXS}px;
        width: 100%;
        align-items: center;
        min-height: ${token.controlHeightLG}px;
      }
      .schedule-search-actions .sm-app-button,
      .schedule-search-actions .ant-btn {
        min-height: ${token.controlHeightLG}px;
      }
      .schedule-search-actions .sm-app-button[type='submit'],
      .schedule-search-actions .sm-app-button.ant-btn-primary {
        flex: 1;
      }

      .schedule-results-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-results-bar__count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorError};
        color: ${token.colorTextLightSolid};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-results-bar__title {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
      }

      /* Available Sailings — inactive primary icons; active white on primary */
      .schedule-results-bar .schedule-view-mode-tabs.ant-segmented {
        background: ${token.colorBgContainer};
        border-color: ${token.colorBorder};
        flex-shrink: 0;
        margin-left: auto;
      }
      .schedule-results-bar .schedule-view-mode-tabs.ant-segmented
        .ant-segmented-item {
        color: ${token.colorPrimary};
      }
      .schedule-results-bar .schedule-view-mode-tabs.ant-segmented
        .ant-segmented-item:not(.ant-segmented-item-selected) .app-icon {
        color: ${token.colorPrimary} !important;
      }
      .schedule-results-bar .schedule-view-mode-tabs.ant-segmented
        .ant-segmented-item:hover:not(.ant-segmented-item-selected):not(
          .ant-segmented-item-disabled
        ) {
        color: ${token.colorPrimary};
      }
      .schedule-results-bar .schedule-view-mode-tabs.ant-segmented
        .ant-segmented-thumb {
        background: ${token.colorPrimary} !important;
      }
      .schedule-results-bar .schedule-view-mode-tabs.ant-segmented
        .ant-segmented-item-selected {
        background: ${token.colorPrimary} !important;
        color: ${token.colorTextLightSolid} !important;
      }
      .schedule-results-bar .schedule-view-mode-tabs.ant-segmented
        .ant-segmented-item-selected .app-icon {
        color: ${token.colorTextLightSolid} !important;
      }
      .schedule-results-bar .schedule-view-mode-tabs__icon {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        line-height: 1;
      }

      .schedule-grid-wrap {
        width: 100%;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .schedule-grid-wrap--no-toolbar .schedule-data-view > .ant-card:first-child {
        display: none;
      }
      .schedule-list-grid {
        width: 100%;
        flex: 1;
        min-height: calc(100vh - 360px);
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .schedule-list-grid > * {
        flex: 1;
        min-height: 0;
        height: 100%;
      }
      .schedule-list-grid .schedule-data-view {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: calc(100vh - 360px);
        height: 100%;
      }
      .schedule-list-grid .schedule-data-view .ant-card {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .schedule-list-grid .schedule-data-view .ant-card > .ant-card-body {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      .schedule-list-grid .ag-theme-alpine,
      .schedule-list-grid .ag-root-wrapper {
        height: 100% !important;
        min-height: calc(100vh - 360px);
      }
      .schedule-card-view-panel.module-card-view-panel--active {
        margin-bottom: ${token.marginMD}px;
      }
      .schedule-card-view-panel .schedule-card-list {
        padding: ${token.paddingMD}px;
      }
      .schedule-card-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .schedule-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        overflow: hidden;
        box-shadow: none !important;
        transition: border-color 0.2s ease;
      }
      .schedule-card:hover {
        border-color: ${tokenMix(token.colorPrimary, 30)};
        box-shadow: none !important;
      }
      .schedule-card--recommended {
        border-color: ${tokenMix(token.colorWarning, 40)};
        box-shadow: none !important;
      }
      .schedule-card__main {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginMD}px;
        padding: ${token.paddingLG}px;
        align-items: start;
      }
      .schedule-card__content {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .schedule-card__meta {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        align-items: center;
      }
      /* Modified by Sekar Nagarajan (2026-09-17 21:29) — recommended = gold star icons */
      .schedule-card__recommended-stars {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        line-height: 1;
        color: ${token.colorWarning};
      }
      .schedule-card__recommended-stars .schedule-card__star.app-icon,
      .schedule-card__recommended-stars .schedule-card__star.app-icon svg {
        color: ${token.colorWarning};
        fill: ${token.colorWarning};
      }
      .schedule-card__vessel-tag {
      background-color: ${tokenMix(token.colorWarning, 20)};
        color: ${token.colorText};
        border-color: ${tokenMix(token.colorWarning, 32)};
        cursor: pointer;
      }
      .schedule-card__distance {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
        margin-left: auto;
      }

      /* Origin —— duration pill —— destination (equal columns) */
      .schedule-card__route {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginMD}px;
        align-items: start;
        width: 100%;
      }
      .schedule-card__endpoint {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .schedule-card__endpoint--dest {
        text-align: left;
        align-items: flex-start;
      }
      .schedule-card__date {
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.15;
        letter-spacing: -0.02em;
      }
      .schedule-card__place {
        display: block;
        font-size: ${token.fontSizeLG}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
      }
      .schedule-card__port-code {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .schedule-card__etime {
        margin-top: ${token.marginXXS}px;
      }
      .schedule-card__terminal {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
      }
      .schedule-card__connector {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        align-self: center;
        width: 100%;
      }
      .schedule-card__connector-line {
        display: flex;
        align-items: center;
        width: 130%;
        gap: ${token.marginXXS}px;
      }
      .schedule-card__connector-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        flex-shrink: 0;
      }
      .schedule-card__connector-rail {
        flex: 1 1 0;
        min-width: ${token.marginSM}px;
        height: 0;
        border-top: 2px dashed ${tokenMix(token.colorPrimary, 55)};
      }
      .schedule-card__connector-pill {
        flex-shrink: 0;
        padding: ${token.paddingXXS}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        border: 1px solid ${tokenMix(token.colorPrimary, 35)};
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        white-space: nowrap;
      }
      .schedule-card__connector-type {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      /* Transport transcript: Road · hub · vessel · Road */
      .schedule-card__transport {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: nowrap;
        overflow-x: auto;
        width: 100%;
        padding-bottom: ${token.paddingXXS}px;
      }
      .schedule-card__transport-rail {
        flex: 0 0 auto;
        width: ${token.controlHeightSM}px;
        min-width: ${token.marginLG}px;
        height: 0;
        border-top: 2px dashed ${token.colorBorder};
      }
      .schedule-card__transport-mode,
      .schedule-card__transport-vessel {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        flex-shrink: 0;
        color: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
        white-space: nowrap;
      }
      .schedule-card__transport-vessel {
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        color: ${token.colorText};
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-card__transport-vessel:hover {
        color: ${token.colorPrimary};
      }
      .schedule-card__transport-hub {
        flex-shrink: 0;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        background: ${token.colorWarning};
        color: ${token.colorText};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.2;
        white-space: nowrap;
      }

      .schedule-card__actions {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        min-width: 0;
        width: 100%;
        padding-top: ${token.paddingSM}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .schedule-card__actions-secondary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: ${token.marginXS}px;
      }
      .schedule-card__actions .sm-app-button {
        width: 100%;
      }
      .schedule-card__footer {
        padding: ${token.paddingSM}px ${token.paddingLG}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-card__deadlines {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      .schedule-card__deadline {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorText};
      }
      .schedule-card__deadline-icon {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .schedule-card__deadline-icon--gate {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .schedule-card__deadline-icon--si {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .schedule-card__deadline-icon--vgm {
        background: ${tokenMix(token.colorSuccess, 10)};
        color: ${token.colorSuccess};
      }
      .schedule-card__deadline-label {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .schedule-card__deadline-value {
        display: block;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.2;
      }
      .schedule-card__legs {
        margin: 0 ${token.marginLG}px ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .schedule-card__leg-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXS}px 0;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .schedule-card__leg-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .schedule-card__terminal-note {
        display: block;
        margin-top: ${token.marginSM}px;
        font-size: ${token.fontSizeSM}px;
      }

      /* Show Details — smooth expand / collapse panel */
      .schedule-card__details-panel {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.32s ease;
      }
      .schedule-card__details-panel--open {
        grid-template-rows: 1fr;
      }
      .schedule-card__details-panel-inner {
        overflow: hidden;
        min-height: 0;
      }
      .schedule-card__details-toggle .app-icon {
        transition: transform 0.28s ease;
      }
      .schedule-card__details-toggle--open .app-icon {
        transform: rotate(180deg);
      }
      .schedule-route-details {
        margin: 0 ${token.marginLG}px ${token.marginMD}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        opacity: 0;
        transform: translateY(-${token.marginXS}px);
        transition:
          opacity 0.24s ease,
          transform 0.32s ease;
        pointer-events: none;
      }
      .schedule-card__details-panel--open .schedule-route-details {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      .schedule-route-details__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        flex-wrap: wrap;
      }
      .schedule-route-details__title {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        font-weight: ${token.fontWeightStrong} !important;
      }
      .schedule-route-details__deadlines {
        margin-top: ${token.marginMD}px;
        padding-top: ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .schedule-route-details__deadlines-title {
        display: block;
        margin-bottom: ${token.marginSM}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .schedule-route-timeline {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .schedule-route-stop {
        display: grid;
        grid-template-columns: 32px minmax(0, 1fr);
        gap: ${token.marginSM}px;
        align-items: stretch;
      }
      .schedule-route-stop__rail {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .schedule-route-stop__node {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 1;
        line-height: 1;
      }
      .schedule-route-stop__node .app-icon {
        display: block;
      }
      .schedule-route-stop__line {
        flex: 1;
        width: 0;
        min-height: ${token.controlHeightLG}px;
        margin: ${token.marginXXS}px 0;
        border-left: 2px solid ${tokenMix(token.colorPrimary, 45)};
      }
      /* Modified by Sekar Nagarajan (2026-09-11 12:35) — solid rail; stronger color = completed */
      .schedule-route-stop__line--solid {
        border-left-color: ${token.colorPrimary};
      }
      .schedule-route-stop__line--dotted {
        border-left-color: ${tokenMix(token.colorPrimary, 45)};
      }
      .schedule-route-stop__body {
        min-width: 0;
        padding-bottom: ${token.paddingLG}px;
      }
      .schedule-route-stop:last-child .schedule-route-stop__body {
        padding-bottom: 0;
      }
      .schedule-route-stop__main {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        align-items: stretch;
      }
      .schedule-route-stop__location {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .schedule-route-stop__place {
        display: block;
        font-size: ${token.fontSize}px;
        color: ${token.colorText};
        line-height: 1.35;
      }
      .schedule-route-stop__code {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .schedule-route-stop__terminal {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
      }
      .schedule-route-stop__badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .schedule-route-stop__badge {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.2;
        white-space: nowrap;
      }
      .schedule-route-stop__badge--road {
        border: 1px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        color: ${token.colorTextSecondary};
      }
      .schedule-route-stop__badge--hub {
        border: none;
        background: ${token.colorWarning};
        color: ${token.colorText};
      }
      .schedule-route-stop__badge--vessel {
        border: 1px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        color: ${token.colorText};
        cursor: pointer;
      }
      .schedule-route-stop__badge--vessel:hover {
        border-color: ${token.colorPrimary};
        color: ${token.colorPrimary};
      }
      .schedule-route-stop__times {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        align-items: flex-start;
      }
      .schedule-route-stop__time {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
        white-space: nowrap;
      }
      .schedule-route-stop__time-date {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }

      .schedule-empty {
        text-align: center;
        padding: ${token.paddingXL}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px dashed ${token.colorBorder};
        background: ${token.colorFillAlter};
      }
      .schedule-empty.module-loading-center,
      .module-loading-center {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: ${token.controlHeightLG * 4}px;
      }
      .schedule-date-range {
        width: 100%;
      }
      .schedule-empty__text {
        display: block;
        margin-top: ${token.marginSM}px;
      }
      .schedule-search-type.ant-form-item {
        margin-bottom: 0;
      }

      .schedule-calendar {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        overflow: hidden;
      }
      .schedule-calendar__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-calendar__title {
        margin: 0 !important;
        font-size: ${token.fontSizeLG}px !important;
      }
      .schedule-calendar__toolbar {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-calendar__layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 0;
        align-items: stretch;
        min-height: 0;
      }
      .schedule-calendar__month {
        min-width: 0;
        display: flex;
        flex-direction: column;
        border-right: none;
        min-height: 0;
      }
      .schedule-calendar__weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        padding: ${token.paddingSM}px ${token.paddingXS}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        position: sticky;
        top: 0;
        z-index: 1;
      }
      .schedule-calendar__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: minmax(112px, 1fr);
      }
      .schedule-calendar__cell {
        min-height: 104px;
        max-height: 132px;
        border-right: 1px solid ${token.colorBorderSecondary};
        border-bottom: 1px solid ${token.colorBorderSecondary};
        padding: ${token.paddingXS}px;
        background: ${token.colorBgContainer};
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        cursor: pointer;
        transition: background 0.15s ease, box-shadow 0.15s ease;
        overflow: hidden;
      }
      .schedule-calendar__cell:nth-child(7n) {
        border-right: none;
      }
      .schedule-calendar__cell:hover {
        background: ${token.colorFillAlter};
      }
      .schedule-calendar__cell--outside {
        background: ${token.colorFillTertiary};
        color: ${token.colorTextQuaternary};
      }
      .schedule-calendar__cell--outside .schedule-calendar__event {
        opacity: 0.72;
      }
      .schedule-calendar__cell--today {
        background: ${tokenMix(token.colorPrimary, 6)};
      }
      .schedule-calendar__cell--selected {
        box-shadow: inset 0 0 0 2px ${token.colorPrimary};
        background: ${token.colorPrimaryBg};
      }
      .schedule-calendar__cell--has-sailings .schedule-calendar__day-number {
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-calendar__cell-day {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginXXS}px;
        flex: 0 0 auto;
      }
      .schedule-calendar__day-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        border-radius: ${token.borderRadiusSM}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorText};
        line-height: 1;
      }
      .schedule-calendar__day-number--today {
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-calendar__cell-count {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        font-variant-numeric: tabular-nums;
        background: ${token.colorFillSecondary};
        border-radius: ${token.borderRadiusSM}px;
        padding: 0 ${token.paddingXXS}px;
        line-height: ${token.lineHeightSM};
      }
      .schedule-calendar__cell-events {
        overflow: hidden;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .schedule-calendar__event {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        border-radius: ${token.borderRadiusSM}px;
        padding: 1px ${token.paddingXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        cursor: pointer;
        border-left: 3px solid ${token.colorPrimary};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.35;
        flex: 0 0 auto;
        max-width: 100%;
      }
      .schedule-calendar__event-time {
        flex: 0 0 auto;
        font-variant-numeric: tabular-nums;
      }
      .schedule-calendar__event-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .schedule-calendar__event--direct {
        background: ${tokenMix(token.colorSuccess, 5)};
        color: ${token.colorSuccess};
        border-left-color: ${token.colorSuccess};
      }
      .schedule-calendar__event--transshipment {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
        border-left-color: ${token.colorInfo};
      }
      .schedule-calendar__event--recommended {
        background: ${tokenMix(token.colorWarning, 12)};
        color: ${token.colorWarning};
        border-left-color: ${token.colorWarning};
      }
      .schedule-calendar__event--active {
        outline: 1px solid ${token.colorPrimary};
      }
      .schedule-calendar__event:hover {
        filter: brightness(0.98);
      }
      .schedule-calendar__more {
        appearance: none;
        border: none;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        text-align: left;
        padding: 1px ${token.paddingXS}px;
        cursor: pointer;
        line-height: 1.35;
        border-radius: ${token.borderRadiusSM}px;
        flex: 0 0 auto;
        width: fit-content;
        max-width: 100%;
      }
      .schedule-calendar__more:hover {
        background: ${token.colorPrimaryBgHover};
      }
      .schedule-calendar-legend {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .schedule-calendar-legend__item {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .schedule-calendar-legend__swatch {
        width: ${token.fontSizeLG}px;
        height: ${token.fontSizeLG}px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid ${token.colorBorder};
        flex: 0 0 auto;
      }
      .schedule-calendar-legend__swatch--direct {
        background: ${tokenMix(token.colorSuccess, 5)};
        border-color: ${token.colorSuccessBorder};
      }
      .schedule-calendar-legend__swatch--transshipment {
        background: ${token.colorInfoBg};
        border-color: ${token.colorInfoBorder};
      }
      .schedule-calendar-legend__swatch--recommended {
        background: ${tokenMix(token.colorWarning, 12)};
        border-color: ${tokenMix(token.colorWarning, 40)};
      }

      .schedule-calendar-day-panel {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        max-height: 420px;
        overflow: hidden;
      }
      .schedule-calendar-day-panel__header {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        flex: 0 0 auto;
      }
      .schedule-calendar-day-panel__title {
        margin: 0 !important;
      }
      .schedule-calendar-day-panel__content {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .schedule-calendar-day-panel__list {
        flex: 0 1 auto;
        max-height: 42%;
        min-height: 96px;
        overflow-y: auto;
        padding: ${token.paddingXS}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .schedule-calendar-day-panel__detail {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px ${token.paddingMD}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .schedule-calendar-day-panel__detail-label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
      }
      .schedule-calendar-day-panel__empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${token.paddingMD}px;
      }
      .schedule-calendar-day-row {
        appearance: none;
        width: 100%;
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr) auto auto;
        align-items: center;
        gap: ${token.marginXS}px;
        text-align: left;
        border: 1px solid transparent;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillAlter};
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .schedule-calendar-day-row:hover {
        border-color: ${token.colorBorder};
        background: ${token.colorBgContainer};
      }
      .schedule-calendar-day-row--selected {
        border-color: ${token.colorPrimary};
        background: ${token.colorPrimaryBg};
        box-shadow: inset 0 0 0 1px ${token.colorPrimaryBorder};
      }
      .schedule-calendar-day-row--recommended {
        border-color: ${tokenMix(token.colorWarning, 35)};
      }
      .schedule-calendar-day-row__time {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        font-variant-numeric: tabular-nums;
        color: ${token.colorTextSecondary};
      }
      .schedule-calendar-day-row__main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .schedule-calendar-day-row__route {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: ${token.fontSizeSM}px;
      }
      .schedule-calendar-day-row__meta {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
      }
      .schedule-calendar-day-row__tag {
        margin-inline-end: 0 !important;
        flex-shrink: 0;
      }
      .schedule-calendar-day-row__badge {
        color: ${token.colorWarning};
        font-size: ${token.fontSizeSM}px;
        line-height: 1;
      }
      .schedule-calendar-day-card {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .schedule-calendar-day-card--recommended {
        background: ${tokenMix(token.colorWarning, 8)};
        border-color: ${tokenMix(token.colorWarning, 40)};
      }
      .schedule-calendar-day-card__top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginSM}px;
      }
      .schedule-calendar-day-card__meta {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .schedule-calendar-day-card__vessel {
        display: block;
      }
      .schedule-calendar-day-card__voyage,
      .schedule-calendar-day-card__ports {
        display: block;
        font-size: ${token.fontSizeSM}px;
      }
      .schedule-calendar-day-card__route,
      .schedule-calendar-day-card__times,
      .schedule-calendar-day-card__cutoffs {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeightSM};
      }
      .schedule-calendar-day-card__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        padding-top: ${token.paddingXS}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }

      .schedule-agenda {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
        max-height: 560px;
        overflow-y: auto;
      }
      .schedule-agenda__day {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        overflow: hidden;
        background: ${token.colorBgContainer};
      }
      .schedule-agenda__day--selected {
        border-color: ${token.colorPrimary};
      }
      .schedule-agenda__day-header {
        appearance: none;
        width: 100%;
        border: none;
        text-align: left;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        cursor: pointer;
      }
      .schedule-agenda__item {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-agenda__item:hover {
        background: ${token.colorFillAlter};
      }
      .schedule-agenda__item--selected {
        background: ${token.colorPrimaryBg};
      }
      .schedule-agenda__item--recommended {
        background: ${tokenMix(token.colorWarning, 8)};
      }
      .schedule-agenda__item-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        flex: 1 1 220px;
      }

      /* Drawer / modal shared (vessel, rates, carbon) */
      .schedule-drawer-title {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .schedule-drawer-title__text {
        margin: 0 !important;
        line-height: 1.3 !important;
      }
      .schedule-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .schedule-drawer-footer {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .schedule-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px ${token.paddingLG + 4}px;
      }

      /* Vessel details drawer */
      .schedule-vessel-drawer__title {
        align-items: flex-start;
      }
      .schedule-vessel-drawer__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        flex-shrink: 0;
      }
      .schedule-vessel-drawer__title-copy {
        min-width: 0;
      }
      .schedule-vessel-details {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .schedule-vessel-details__chips {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: ${token.marginSM}px;
      }
      .schedule-vessel-details__chip {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .schedule-vessel-details__chip .ant-typography {
        margin: 0;
      }
      .schedule-vessel-details__section {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        padding: ${token.paddingMD}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .schedule-vessel-details__section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-vessel-details__section-title {
        margin: 0 !important;
        font-size: ${token.fontSize}px !important;
      }
      .schedule-vessel-details__spec-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${token.marginSM}px ${token.marginLG}px;
      }
      .schedule-vessel-details__spec {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding-bottom: ${token.paddingXS}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
      }
      .schedule-vessel-details__spec-label {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
      }
      .schedule-vessel-details__spec-value {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .schedule-vessel-details__table-wrap {
        width: 100%;
        overflow-x: auto;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadius}px;
      }
      .schedule-vessel-details__table .ant-table {
        margin: 0;
      }
      .schedule-vessel-details__table .ant-table-thead > tr > th {
        white-space: nowrap;
        background: ${token.colorFillAlter} !important;
      }
      .schedule-vessel-details__port-cell {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        min-width: 0;
        max-width: 100%;
      }
      .schedule-vessel-details__port-name {
        min-width: 0;
      }
      @media (max-width: 767px) {
        .schedule-vessel-details__spec-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .schedule-vessel-details__chips {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .schedule-share-mail-form {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .schedule-share-mail-summary {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        padding: ${token.paddingMD}px;
      }
      .schedule-share-mail-summary__title {
        display: block;
        margin-bottom: ${token.marginXS}px;
      }
      .schedule-share-mail-summary__list {
        margin: 0;
        padding-left: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .schedule-share-mail-editor {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .schedule-share-mail-editor .ant-form-item {
        margin-bottom: 0;
      }
      .schedule-share-mail-editor .ProseMirror {
        min-height: ${token.controlHeightLG * 6}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .schedule-share-mail-editor .ProseMirror > * + * {
        margin-top: ${token.marginXS}px;
      }
      .schedule-share-mail-editor .ProseMirror p,
      .schedule-share-mail-editor .ProseMirror ul,
      .schedule-share-mail-editor .ProseMirror ol {
        margin: 0;
      }
      .schedule-share-mail-editor .ProseMirror ul,
      .schedule-share-mail-editor .ProseMirror ol {
        padding-left: ${token.paddingLG}px;
      }
      .schedule-share-mail-footer {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .schedule-share-mail-actions {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        align-items: center;
        justify-content: flex-end;
      }
      .schedule-panel.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
        margin-bottom: ${token.marginLG}px;
      }
      .schedule-panel.ant-card:last-child {
        margin-bottom: 0;
      }
      .schedule-panel .ant-card-head {
        background: ${token.colorFillAlter};
      }
      .schedule-route-banner {
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        margin-bottom: ${token.marginLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .schedule-route-banner__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: ${token.marginXXS}px;
      }
      .schedule-field-label {
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-field-full {
        width: 100%;
      }
      .schedule-eq-row {
        margin-bottom: ${token.marginSM}px;
      }
      .schedule-eq-label {
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-eq-hint {
        font-size: ${token.fontSizeSM}px;
      }

      /* Freight Rates & Surcharge Estimator drawer */
      .schedule-rates-drawer {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .schedule-rates-drawer__title {
        align-items: center;
      }
      .schedule-rates-drawer__title-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        flex-shrink: 0;
      }
      .schedule-rates-drawer__body.custom-scroll {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .schedule-rates-drawer__footer-wrap {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }

      .schedule-rates-route {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorPrimaryBorder};
       
      }
      .schedule-rates-route__endpoint,
      .schedule-rates-route__service {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .schedule-rates-route__service {
        grid-column: 1 / -1;
        padding-top: ${token.paddingXS}px;
        border-top: 1px solid ${tokenMix(token.colorPrimary, 18)};
      }
      .schedule-rates-route__icon {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: ${token.colorBgContainer};
        color: ${token.colorPrimary};
      }
      .schedule-rates-route__icon--pod {
        color: ${token.colorInfo};
      }
      .schedule-rates-route__icon--svc {
        color: ${token.colorPrimary};
      }
      .schedule-rates-route__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .schedule-rates-route__label {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .schedule-rates-route__value {
        display: block;
        line-height: 1.3;
        max-width: 100%;
      }
      .schedule-rates-route__arrow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: ${token.colorTextSecondary};
        line-height: 1;
      }

      .schedule-rates-panel {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        padding: ${token.paddingMD}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .schedule-rates-panel__title {
        display: block;
        font-size: ${token.fontSize}px;
        line-height: 1.3;
      }

      .schedule-rates-eq-list {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .schedule-rates-eq-row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: ${token.marginSM}px ${token.marginMD}px;
        align-items: center;
        padding: ${token.paddingSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillAlter};
      }
      .schedule-rates-eq-row__icon {
        width: 36px;
        height: 36px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .schedule-rates-eq-row__icon--pol {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .schedule-rates-eq-row__icon--success {
        background: ${tokenMix(token.colorSuccess, 12)};
        color: ${token.colorSuccess};
      }
      .schedule-rates-eq-row__icon--purple {
        background: ${tokenMix(token.colorInfo, 12)};
        color: ${token.colorInfo};
      }
      .schedule-rates-eq-row__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .schedule-rates-eq-row__title {
        line-height: 1.25;
      }
      .schedule-rates-eq-row__sub {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
      }
      .schedule-rates-eq-row__reefer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        grid-column: 1 / -1;
      }
      .schedule-rates-eq-row__reefer-label {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.2;
      }

      .schedule-rates-stepper {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        justify-self: start;
        grid-column: 1 / -1;
      }
      .schedule-rates-stepper__btn.sm-app-button,
      .schedule-rates-stepper__btn.ant-btn {
        width: 28px;
        min-width: 28px;
        height: 28px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .schedule-rates-stepper__input.ant-input-number {
        width: 52px;
        min-width: 52px;
        height: 28px;
      }
      .schedule-rates-stepper__input.ant-input-number .ant-input-number-input {
        height: 26px;
        padding: 0 ${token.paddingXXS}px;
        text-align: center;
        font-weight: ${token.fontWeightStrong};
        font-variant-numeric: tabular-nums;
      }

      .schedule-rates-commodity {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        padding-top: ${token.paddingXS}px;
      }
      .schedule-rates-commodity__label {
        font-size: ${token.fontSizeSM}px;
      }
      .schedule-rates-commodity__select {
        width: 100%;
      }

      .schedule-rates-breakdown__table .ant-table-thead > tr > th {
        background: ${token.colorFillAlter} !important;
        white-space: nowrap;
      }
      .schedule-rates-breakdown__subtotal {
        color: ${token.colorText};
        white-space: nowrap;
      }
      .schedule-rates-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        margin-top: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorPrimaryBorder};
        background: ${token.colorPrimaryBg};
      }
      .schedule-rates-total__label {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .schedule-rates-total__value {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
        line-height: 1.2 !important;
      }

      @media (min-width: 640px) {
        .schedule-rates-route {
          grid-template-columns: minmax(0, 1.2fr) auto minmax(0, 1.2fr) auto minmax(100px, 0.7fr);
        }
        .schedule-rates-route__service {
          grid-column: auto;
          padding-top: 0;
          border-top: none;
          padding-inline-start: ${token.paddingMD}px;
          border-inline-start: 1px solid ${tokenMix(token.colorPrimary, 18)};
        }
        .schedule-rates-eq-row {
          grid-template-columns: auto minmax(0, 1fr) auto auto;
        }
        .schedule-rates-stepper,
        .schedule-rates-eq-row__reefer {
          grid-column: auto;
        }
      }

      /* Modified by Sekar Nagarajan (2026-09-17 10:54) — carbon drawer layout */
      .schedule-co2-layout {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .schedule-co2-section-title {
        display: block;
        margin-bottom: ${token.marginSM}px;
      }
      .schedule-co2-route {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .schedule-co2-route__lane {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .schedule-co2-port {
        display: inline-flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .schedule-co2-port__code {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorPrimary};
        line-height: 1.2;
      }
      .schedule-co2-port__name {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .schedule-co2-route__meta {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginSM}px ${token.marginMD}px;
        align-items: center;
      }
      .schedule-co2-meta-chip {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .schedule-co2-criteria {
        display: flex;
        flex-direction: column;
      }
      .schedule-co2-criteria__row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        gap: ${token.marginMD}px;
        align-items: end;
      }
      .schedule-co2-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        min-width: 0;
      }
      .schedule-co2-actions-field {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
        flex-shrink: 0;
      }
      .schedule-co2-actions-field__spacer {
        visibility: hidden;
        user-select: none;
        line-height: ${token.lineHeight};
      }
      .schedule-co2-calc-btn.ant-btn,
      .schedule-co2-calc-btn.sm-app-button {
        height: ${token.controlHeightLG}px;
        min-width: 120px;
      }
        .schedule-card__eta-tag{
        background-color: ${tokenMix(token.colorSuccess, 10)};
        color: ${token.colorSuccess};
        border-color: ${tokenMix(token.colorSuccess, 32)};
        }
        .schedule-card__etd-tag{
        background-color: ${tokenMix(token.colorInfo, 10)};
        color: ${token.colorInfo};
        border-color: ${tokenMix(token.colorInfo, 32)};
        }
      .schedule-co2-results__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        margin-bottom: ${token.marginSM}px;
      }
      .schedule-co2-results__head .schedule-co2-section-title {
        margin-bottom: 0;
      }
      .schedule-co2-verified {
        display: inline-flex;
        align-items: center;
        padding: 0 ${token.paddingSM}px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid ${token.colorSuccessBorder};
        background: ${token.colorSuccessBg};
        color: ${token.colorSuccess};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.lineHeight};
        white-space: nowrap;
      }
      .schedule-co2-kpi-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginSM}px;
      }
      .schedule-co2-kpi {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .schedule-co2-kpi--total {
        border-color: ${token.colorSuccessBorder};
        background: ${tokenMix(token.colorSuccess, 8)};
      }
      .schedule-co2-kpi--ttw {
        border-color: ${token.colorWarningBorder};
        background: ${tokenMix(token.colorWarning, 8)};
      }
      .schedule-co2-kpi--wtt {
        border-color: ${tokenMix(token.purple, 32)};
        background: ${tokenMix(token.purple, 8)};
      }
      .schedule-co2-kpi__label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .schedule-co2-kpi__value {
        margin: 0;
        font-size: ${token.fontSizeHeading3}px;
        font-weight: ${token.fontWeightStrong};
        font-variant-numeric: tabular-nums;
        line-height: 1.15;
        color: ${token.colorText};
      }
      .schedule-co2-kpi--total .schedule-co2-kpi__value {
        color: ${token.colorSuccess};
      }
      .schedule-co2-kpi--ttw .schedule-co2-kpi__value {
        color: ${token.colorInfo};
      }
      .schedule-co2-kpi--wtt .schedule-co2-kpi__value {
        color: ${token.purple};
      }
      .schedule-co2-kpi__unit {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-co2-kpi__hint {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .schedule-co2-idle {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXS}px;
        text-align: center;
        padding: ${token.paddingLG}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px dashed ${token.colorBorder};
        background: ${token.colorFillAlter};
      }
      .schedule-co2-idle__hint {
        max-width: 36ch;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.4;
      }
      .schedule-co2-note {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorPrimary};
        background: ${token.colorPrimaryBg};
      }
      .schedule-co2-note__title {
        display: block;
        margin-bottom: ${token.marginXXS}px;
      }
      .schedule-co2-note__text {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.45;
      }
      @media (max-width: 575px) {
        .schedule-co2-criteria__row,
        .schedule-co2-kpi-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .schedule-co2-calc-btn.ant-btn,
        .schedule-co2-calc-btn.sm-app-button {
          width: 100%;
        }
        .schedule-co2-actions-field__spacer {
          display: none;
        }
      }
      .schedule-list-grid .ag-row.schedule-list-row--recommended,
      .schedule-list-grid .ag-row.schedule-list-row--recommended .ag-cell {
        background: ${tokenMix(token.colorWarning, 10)} !important;
      }
      .schedule-list-grid .ag-row.schedule-list-row--recommended:hover,
      .schedule-list-grid .ag-row.schedule-list-row--recommended:hover .ag-cell {
        background: ${tokenMix(token.colorWarning, 10)} !important;
      }
      .schedule-list-legend {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin-top: ${token.marginSM}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: ${token.lineHeightSM};
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-list-legend__swatch {
        flex: 0 0 auto;
        width: ${token.fontSizeLG}px;
        height: ${token.fontSizeLG}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${tokenMix(token.colorWarning, 20)};
        border: 1px solid ${tokenMix(token.colorWarning, 40)};
      }
      .schedule-list-legend__text {
        min-width: 0;
      }
      .schedule-list-cell__title {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: ${token.lineHeightSM};
      }
      .schedule-list-cell__sub {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: ${token.lineHeightSM};
        margin-top: ${token.marginXXS}px;
      }
      .schedule-list-cell__tags {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        align-items: center;
      }
      .schedule-list-cell__tags .ant-tag {
        margin-inline-end: 0;
      }
      .schedule-list-cell__cutoffs {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        font-variant-numeric: tabular-nums;
      }
      .schedule-list-cell__cutoff-row {
        display: flex;
        align-items: baseline;
        gap: ${token.marginXS}px;
        min-width: 0;
        line-height: ${token.lineHeightSM};
      }
      .schedule-list-cell__cutoff-label {
        flex: 0 0 auto;
        min-width: 3.25em;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextTertiary};
      }
      .schedule-list-cell__cutoff-value {
        flex: 1 1 auto;
        min-width: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorText};
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .schedule-filter-card.ant-card {
        margin-bottom: ${token.marginMD}px;
        border-radius: ${token.borderRadiusLG}px;
        box-shadow: none !important;
      }
      .schedule-filter-toolbar {
        width: 100%;
        justify-content: space-between;
        align-items: flex-end;
      }
      .schedule-filter-field {
        width: 240px;
      }
      .schedule-filter-actions {
        margin-bottom: ${token.marginMD}px;
      }
      .schedule-divider {
        margin: ${token.marginMD}px 0;
      }

      @media (min-width: 768px) {
        .schedule-card__route {
          grid-template-columns: minmax(0, 1fr) minmax(160px, 1.15fr) minmax(0, 1fr);
          gap: ${token.marginMD}px;
          align-items: start;
        }
        .schedule-card__endpoint--dest {
          text-align: right;
          align-items: flex-end;
        }
        .schedule-card__connector {
          align-self: center;
          padding-top: ${token.paddingLG}px;
        }
        .schedule-card__leg-row {
          grid-template-columns: 1.2fr 1.5fr 1fr;
          align-items: center;
        }
        .schedule-route-stop__main {
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: ${token.marginLG}px;
        }
        .schedule-route-stop__times {
          align-items: flex-end;
          text-align: right;
          flex-shrink: 0;
        }
      }

      @media (min-width: 992px) {
        .schedule-card__main {
          grid-template-columns: minmax(0, 1fr) 180px;
          gap: ${token.marginLG}px;
          align-items: stretch;
        }
        .schedule-card__actions {
          width: 180px;
          border-top: none;
          border-left: 1px solid ${token.colorBorderSecondary};
          padding-top: 0;
          padding-left: ${token.paddingMD}px;
          justify-content: center;
        }
        .schedule-calendar__layout {
          grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.9fr);
          align-items: stretch;
        }
        .schedule-calendar__month {
          border-right: 1px solid ${token.colorBorderSecondary};
        }
        .schedule-calendar-day-panel {
          border-top: none;
          max-height: none;
          height: 100%;
          align-self: stretch;
        }
        .schedule-calendar-day-panel__list {
          max-height: none;
          flex: 0 1 38%;
        }
        .schedule-calendar-day-card__times,
        .schedule-calendar-day-card__cutoffs {
          grid-template-columns: 1fr 1fr;
        }
        .schedule-calendar__grid {
          grid-auto-rows: minmax(112px, 1fr);
        }
        .schedule-calendar__cell {
          min-height: 112px;
          max-height: none;
        }
      }

      @media (min-width: 1200px) {
        .schedule-calendar__cell {
          min-height: 120px;
        }
        .schedule-calendar__layout {
          grid-template-columns: minmax(0, 1.7fr) minmax(340px, 0.85fr);
        }
        .schedule-calendar-day-card__times {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 767px) {
        .schedule-search-panel__body {
          padding: ${token.paddingSM}px;
        }
        .schedule-port-swap-field {
          padding-bottom: ${token.paddingXS}px;
        }
        .schedule-search-actions {
          flex-direction: column;
        }
        .schedule-search-actions .sm-app-button {
          width: 100%;
        }
        .schedule-share-mail-actions {
          width: 100%;
          justify-content: stretch;
        }
        .schedule-share-mail-actions .sm-app-button,
        .schedule-share-mail-actions .ant-btn {
          flex: 1;
        }
        .schedule-card__main {
          padding: ${token.paddingMD}px;
        }
        .schedule-card__date {
          font-size: ${token.fontSizeHeading4}px;
        }
        .schedule-card__legs,
        .schedule-route-details {
          margin-left: ${token.marginMD}px;
          margin-right: ${token.marginMD}px;
        }
        .schedule-card__footer {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `}</style>
  );
}
