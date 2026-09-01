// Modified by Sekar Nagarajan (2026-09-01 18:40)
import { theme } from "antd";
import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Tracking module layout classes (agenct.md). */
export function TrackingModuleStyles() {
  const { token } = theme.useToken();

  return (
    <style>{`
      @keyframes tracking-spin {
        to { transform: rotate(360deg); }
      }

      .tracking-search-panel.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginLG}px;
        box-shadow: none !important;
      }
      .tracking-search-panel .ant-card-body {
        padding: ${token.paddingLG}px;
      }
      .tracking-search-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginMD}px;
        flex-wrap: wrap;
        gap: ${token.marginSM}px;
      }
      /* Modified by Sekar Nagarajan (2026-08-31 11:25) — Tabs as search-type switcher */
      .tracking-search-type {
        margin: 0 !important;
      }
      .tracking-search-tabs.ant-tabs {
        margin-bottom: 0;
      }
      .tracking-search-tabs .ant-tabs-nav {
        margin-bottom: 0;
      }
      .tracking-search-tabs .ant-tabs-content-holder {
        display: none;
      }
      .tracking-tab-label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        line-height: 1;
      }
      .tracking-tab-label .app-icon {
        display: block;
        flex: none;
      }
      .tracking-search-samples {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
      }
      .tracking-search-samples__label {
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-search-sample.ant-tag {
        cursor: pointer;
        border-radius: ${token.borderRadius}px;
      }
      .tracking-search-actions-label {
        visibility: hidden;
      }
      .tracking-search-actions-field {
        margin-bottom: 0 !important;
      }
      .tracking-search-actions {
        display: flex;
        gap: ${token.marginXS}px;
        width: 100%;
        align-items: center;
        min-height: ${token.controlHeightLG}px;
      }
      .tracking-search-actions .sm-app-button.ant-btn-primary {
        flex: 1;
      }

      .tracking-overview.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
        margin-bottom: ${token.marginLG}px;
      }
      .tracking-overview .ant-card-body {
        padding: ${token.paddingLG}px;
      }
      .tracking-overview__meta {
        margin-bottom: ${token.marginLG}px;
      }
      .tracking-meta-item {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .tracking-meta-item__label {
        font-size: ${token.fontSizeSM}px;
        display: block;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .tracking-meta-item__value {
        font-size: ${token.fontSizeLG}px;
        display: block;
      }
      .tracking-meta-item__sub {
        display: block;
        font-size: ${token.fontSizeSM}px;
      }

      .tracking-pipeline {
        background: ${token.colorFillAlter};
        padding: ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginMD}px;
      }
      .tracking-pipeline__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginLG}px;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .tracking-pipeline__title {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
      }
      .tracking-pipeline__eta {
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-pipeline__track {
        position: relative;
        padding: ${token.paddingSM}px 0;
      }
      .tracking-pipeline__line {
        position: absolute;
        top: 23px;
        left: 8%;
        right: 8%;
        height: 4px;
        background: ${token.colorBorderSecondary};
        border-radius: 2px;
        z-index: 0;
      }
      .tracking-pipeline__line-progress {
        position: absolute;
        top: 23px;
        left: 8%;
        height: 4px;
        width: calc(84% * var(--tracking-pipeline-progress, 0) / 100);
        background: ${token.colorSuccess};
        border-radius: 2px;
        z-index: 0;
        transition: width 0.5s ease;
      }
      .tracking-pipeline__steps {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginXXS}px;
      }
      .tracking-pipeline__step {
        text-align: center;
        flex: 1;
        padding: 0 ${token.paddingXXS}px;
        min-width: 0;
      }
      .tracking-pipeline__badge {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto ${token.marginSM}px auto;
        border: 2px solid ${token.colorBorder};
        background: ${token.colorBgContainer};
        color: ${token.colorTextQuaternary};
        transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        box-shadow: none;
      }
      .tracking-pipeline__step--completed .tracking-pipeline__badge {
        background: ${token.colorSuccess};
        border-color: ${token.colorSuccess};
        color: ${token.colorTextLightSolid};
        box-shadow: 0 0 0 3px ${token.colorSuccessBg};
      }
      .tracking-pipeline__step--current .tracking-pipeline__badge {
        background: ${token.colorPrimary};
        border-color: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        box-shadow: 0 0 0 4px ${token.colorPrimaryBg};
      }
      .tracking-pipeline__spin {
        display: inline-flex;
        animation: tracking-spin 1.2s linear infinite;
      }
      .tracking-pipeline__step-name {
        font-size: ${token.fontSize}px;
        display: block;
        color: ${token.colorTextSecondary};
      }
      .tracking-pipeline__step--completed .tracking-pipeline__step-name,
      .tracking-pipeline__step--current .tracking-pipeline__step-name {
        color: ${token.colorText};
        font-weight: ${token.fontWeightStrong};
      }
      .tracking-pipeline__step-loc {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: 2px;
      }
      .tracking-pipeline__step-time {
        font-size: ${token.fontSizeSM}px;
        display: block;
        margin-top: 2px;
        color: ${token.colorTextQuaternary};
      }
      .tracking-pipeline__step--completed .tracking-pipeline__step-time {
        color: ${token.colorSuccess};
      }
      .tracking-pipeline__step--current .tracking-pipeline__step-time {
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
      }

      .tracking-deadlines {
        display: flex;
        align-items: center;
        gap: ${token.marginMD}px;
        flex-wrap: wrap;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .tracking-deadline {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        padding: ${token.paddingXXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-deadline__icon {
        width: 26px;
        height: 26px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .tracking-deadline__icon--gate {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .tracking-deadline__icon--si {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .tracking-deadline__icon--vgm {
        background: ${tokenMix(token.colorSuccess, 10)};
        color: ${token.colorSuccess};
      }
      .tracking-deadline__label {
        display: block;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .tracking-deadline__value {
        display: block;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.2;
      }

      .tracking-results-panel {
        background: ${token.colorBgContainer};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .tracking-results-toolbar {
        width: 100%;
      }
      .tracking-results-title {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
      }
      .tracking-results-count.ant-badge .ant-badge-count {
        background: ${token.colorError};
        box-shadow: none;
      }
      .tracking-grid {
        min-height: 320px;
      }
      .tracking-cell-stack {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        gap: 2px;
      }
      .tracking-cell-title {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.2;
      }
      .tracking-cell-sub {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }

      .tracking-drawer-title {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .tracking-drawer-title__text {
        margin: 0 !important;
      }
      .tracking-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
      }
      .tracking-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px;
      }
      .tracking-drawer-panel.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginLG}px;
        box-shadow: none !important;
      }
      .tracking-drawer-section-title {
        margin-bottom: ${token.marginSM}px !important;
      }
      .tracking-event-name {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        display: block;
      }
      .tracking-event-loc {
        font-size: ${token.fontSizeSM}px;
        display: block;
      }
      .tracking-event-facility {
        font-size: ${token.fontSizeSM}px;
      }

      /* Interactive Container Live Map (mock AIS) */
      @keyframes tracking-live-pulse {
        0% { opacity: 0.55; transform: scale(0.85); }
        70% { opacity: 0; transform: scale(1.45); }
        100% { opacity: 0; transform: scale(1.45); }
      }
      .tracking-live-map {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .tracking-live-map__toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        overflow-x: auto;
      }
      .tracking-live-map__actions {
        flex: none;
      }
      .tracking-live-map__viewport {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        overflow: hidden;
      }
      .tracking-live-map__svg {
        display: block;
        width: 100%;
        height: auto;
        min-height: 320px;
        max-height: 480px;
        background: ${token.colorInfoBg};
      }
      .tracking-live-map__svg--interactive {
        cursor: grab;
        touch-action: none;
        user-select: none;
      }
      .tracking-live-map__svg--interactive:active {
        cursor: grabbing;
      }
      .tracking-live-map__ocean {
        fill: ${token.colorInfoBg};
      }
      .tracking-live-map__ocean-overlay {
        opacity: 0.35;
        pointer-events: none;
      }
      .tracking-live-map__ocean-hatch {
        stroke: ${token.colorInfo};
        stroke-width: 0.6;
        opacity: 0.18;
        fill: none;
      }
      .tracking-live-map__graticule {
        fill: none;
        stroke: ${token.colorBorderSecondary};
        stroke-width: 0.8;
        opacity: 0.7;
      }
      .tracking-live-map__land {
        fill: ${token.colorFillSecondary ?? token.colorFillAlter};
        stroke: ${token.colorBorder};
        stroke-width: 0.8;
        opacity: 0.95;
      }
      .tracking-live-map__bg {
        fill: ${token.colorFillAlter};
      }
      .tracking-live-map__rail {
        stroke: ${token.colorBorder};
        stroke-width: 3.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0.9;
      }
      .tracking-live-map__done {
        stroke: ${token.colorPrimary};
        stroke-width: 3.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .tracking-live-map__port {
        fill: ${token.colorPrimary};
        stroke: ${token.colorBgContainer};
        stroke-width: 2;
        cursor: pointer;
      }
      .tracking-live-map__waypoint {
        fill: ${token.colorTextQuaternary};
        stroke: ${token.colorBgContainer};
        stroke-width: 1;
        cursor: pointer;
      }
      .tracking-live-map__event {
        fill: ${token.colorWarning};
        stroke: ${token.colorBgContainer};
        stroke-width: 1;
        cursor: pointer;
      }
      .tracking-live-map__node--selected {
        stroke: ${token.colorSuccess};
        stroke-width: 3;
      }
      .tracking-live-map__label {
        fill: ${token.colorText};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        pointer-events: none;
        paint-order: stroke;
        stroke: ${token.colorBgContainer};
        stroke-width: 3px;
      }
      .tracking-live-map__vessel-group {
        cursor: pointer;
      }
      .tracking-live-map__pulse {
        fill: ${token.colorPrimaryBg};
        transform-box: fill-box;
        transform-origin: center;
        animation: tracking-live-pulse 1.8s ease-out infinite;
      }
      .tracking-live-map__ship {
        fill: ${token.colorPrimary};
        stroke: ${token.colorBgContainer};
        stroke-width: 1.5;
      }
      .tracking-live-map__ship-core {
        fill: ${token.colorTextLightSolid};
      }
      .tracking-live-map__vessel {
        fill: ${token.colorPrimary};
        stroke: ${token.colorBgContainer};
        stroke-width: 2;
      }
      .tracking-live-map__vessel-group--selected .tracking-live-map__ship {
        stroke: ${token.colorSuccess};
        stroke-width: 2.5;
      }
      .tracking-live-map__scale-line {
        stroke: ${token.colorTextSecondary};
        stroke-width: 2;
      }
      .tracking-live-map__scale-text {
        fill: ${token.colorTextSecondary};
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-live-map__hint {
        display: block;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-live-map__legend {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginMD}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .tracking-live-map__legend span {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .tracking-live-map__swatch {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }
      .tracking-live-map__swatch--land {
        background: ${token.colorFillSecondary ?? token.colorFillAlter};
        border: 1px solid ${token.colorBorder};
        border-radius: 2px;
      }
      .tracking-live-map__swatch--done {
        background: ${token.colorPrimary};
      }
      .tracking-live-map__swatch--rail {
        background: ${token.colorBorder};
      }
      .tracking-live-map__swatch--vessel {
        background: ${token.colorPrimary};
        box-shadow: 0 0 0 3px ${token.colorPrimaryBg};
      }
      .tracking-live-map__swatch--event {
        background: ${token.colorWarning};
      }
      .tracking-live-map__selection {
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .tracking-live-map__selection-title {
        margin: 0 0 ${token.marginXXS}px 0 !important;
      }
      .tracking-live-map__selection-meta {
        display: block;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-live-map__ais-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginSM}px;
        padding: ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .tracking-live-map__ais-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .tracking-live-map__ais-label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .tracking-live-map__ais-value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .tracking-live-map__empty {
        padding: ${token.paddingXL}px ${token.paddingLG}px;
      }

      /* Leaflet AIS Live Map */
      .tracking-ais-map {
        position: relative;
        width: 100%;
        height: min(70vh, 560px);
        min-height: 360px;
        border-radius: ${token.borderRadiusLG}px;
        overflow: hidden;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .tracking-ais-map__leaflet {
        width: 100%;
        height: 100%;
        z-index: 0;
      }
      .tracking-ais-map__leaflet--ocean.leaflet-container,
      .tracking-ais-map .leaflet-container {
        font-family: inherit;
        background: ${token.colorInfoBg};
      }
      .tracking-ais-port-icon {
        background: transparent !important;
        border: none !important;
      }
      .tracking-ais-port-icon__dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${token.colorText};
        border: 2px solid ${token.colorBgContainer};
        box-shadow: ${token.boxShadowSecondary};
      }
      .tracking-ais-route {
        stroke: ${token.colorPrimary} !important;
        stroke-width: 3;
        stroke-opacity: 0.75;
        fill: none !important;
      }
      .tracking-ais-trail {
        fill: none !important;
      }
      .tracking-ais-trail--sailed {
        stroke-width: 3;
        stroke-opacity: 0.95;
      }
      .tracking-ais-trail--remaining {
        stroke-width: 2;
        stroke-opacity: 0.55;
        stroke-dasharray: 4 8;
      }
      .tracking-ais-trail.is-selected.tracking-ais-trail--sailed {
        stroke-width: 4;
      }
      .tracking-ais-trail--underway {
        stroke: ${token.colorPrimary} !important;
      }
      .tracking-ais-trail--anchored {
        stroke: ${token.colorWarning} !important;
      }
      .tracking-ais-trail--moored {
        stroke: ${token.colorTextSecondary} !important;
      }
      .tracking-ais-trail--restricted,
      .tracking-ais-trail--arrived {
        stroke: ${token.colorSuccess} !important;
      }
      .tracking-ais-vessel-icon {
        background: transparent !important;
        border: none !important;
      }
      .tracking-ais-vessel-icon__rotator {
        width: var(--tracking-ais-size, 24px);
        height: var(--tracking-ais-size, 24px);
        transform: rotate(var(--tracking-ais-cog, 0deg));
        transition: transform 0.3s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tracking-ais-vessel-icon__svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 1px 2px ${tokenMix(token.colorText, 35)});
      }
      .tracking-ais-vessel-icon__outline {
        stroke: ${token.colorBgContainer};
      }
      .tracking-ais-status--underway {
        color: ${token.colorPrimary};
      }
      .tracking-ais-status--anchored {
        color: ${token.colorWarning};
      }
      .tracking-ais-status--moored {
        color: ${token.colorTextSecondary};
      }
      .tracking-ais-status--restricted {
        color: ${token.colorError};
      }
      .tracking-ais-status--arrived {
        color: ${token.colorSuccess};
      }
      .tracking-ais-vessel-icon__rotator.is-selected .tracking-ais-vessel-icon__outline {
        stroke: ${token.colorSuccess};
        stroke-width: 2;
      }
      .tracking-ais-legend {
        position: absolute;
        bottom: ${token.marginMD}px;
        left: ${token.marginMD}px;
        z-index: 1000;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadius}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorText};
        box-shadow: ${token.boxShadowSecondary};
      }
      .tracking-ais-legend__title {
        font-weight: ${token.fontWeightStrong};
        margin-bottom: ${token.marginXXS}px;
      }
      .tracking-ais-legend__row {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .tracking-ais-legend__row--line {
        margin-top: ${token.marginSM}px;
        color: ${token.colorTextSecondary};
      }
      .tracking-ais-legend__swatch {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        background: currentColor;
      }
      .tracking-ais-legend__line {
        width: 18px;
        display: inline-block;
        border-top: 2px solid ${token.colorPrimary};
      }
      .tracking-ais-legend__line--remaining {
        border-top-style: dashed;
      }
      .tracking-ais-popup {
        min-width: 200px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorText};
      }
      .tracking-ais-popup__title {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        margin-bottom: ${token.marginXXS}px;
        color: ${token.colorText};
      }
      .tracking-ais-popup__badge {
        display: inline-block;
        margin-bottom: ${token.marginXS}px;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-ais-popup__row {
        display: flex;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        line-height: 1.7;
      }
      .tracking-ais-popup__key {
        color: ${token.colorTextSecondary};
      }
      .tracking-ais-popup__val {
        font-weight: ${token.fontWeightStrong};
      }

      @media (max-width: 767px) {
        .tracking-live-map__ais-grid {
          grid-template-columns: 1fr 1fr;
        }
        .tracking-search-actions {
          flex-direction: column;
        }
        .tracking-search-actions .sm-app-button {
          width: 100%;
        }
        .tracking-pipeline__steps {
          overflow-x: auto;
          padding-bottom: ${token.paddingXS}px;
        }
        .tracking-pipeline__step {
          min-width: 96px;
        }
      }
    `}</style>
  );
}
