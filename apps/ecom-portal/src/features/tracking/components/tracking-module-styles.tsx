// Modified by Sekar Nagarajan (2026-09-11 13:05)
import { theme } from "antd";
import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed Tracking module layout classes (agenct.md). */
export function TrackingModuleStyles() {
  const { token } = theme.useToken();
  const mapPulse = tokenMix(token.colorInfo, 50);
  const mapPinShadow = tokenMix(token.colorText, 40);
  const mapCoreRing = tokenMix(token.colorText, 30);

  return (
    <style>{`
      @keyframes tracking-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes tracking-map-pulse {
        0% { transform: scale(0.6); opacity: 0.9; }
        70% { transform: scale(2.4); opacity: 0; }
        100% { opacity: 0; }
      }
      @keyframes tracking-route-pulse {
        0% { transform: scale(0.85); opacity: 0.55; }
        70% { transform: scale(1.55); opacity: 0; }
        100% { opacity: 0; }
      }

      .tracking-search-panel.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginMD}px;
        box-shadow: none !important;
      }
      .tracking-search-panel .ant-card-body {
        padding: ${token.paddingSM}px;
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

      /* Modified by Sekar Nagarajan (2026-10-27 11:00) — overview route strip + facts */
      .tracking-overview.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
        margin-bottom: ${token.marginMD}px;
      }
      .tracking-overview .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .tracking-overview__header {
        width: 100%;
      }
      .tracking-overview__summary {
        display: flex;
        align-items: stretch;
        gap: 0;
        width: 100%;
        min-width: 0;
      }
      .tracking-overview__journey .tracking-journey {
        margin-bottom: 0;
      }

      .tracking-overview-route {
        display: grid;
        grid-template-columns: minmax(96px, 140px) minmax(120px, 1fr) minmax(96px, 140px);
        align-items: center;
        gap: ${token.marginSM}px;
        flex: 1 1 280px;
        min-width: 0;
        padding-right: ${token.marginLG}px;
        margin-right: ${token.marginLG}px;
        border-right: 1px solid ${token.colorBorderSecondary};
      }
      .tracking-overview-route__port {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .tracking-overview-route__port--pod {
        text-align: left;
      }
      .tracking-overview-route__port-code {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeLG}px;
        line-height: 1.25;
        color: ${token.colorText};
      }
      .tracking-overview-route__port-name {
        display: block;
        margin: 0;
        max-width: 100%;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: default;
      }
      .tracking-overview-route__track {
        position: relative;
        display: flex;
        align-items: center;
        min-width: 0;
        height: ${token.controlHeight}px;
        overflow: visible;
      }
      .tracking-overview-route__rail {
        position: relative;
        display: block;
        width: 100%;
        height: 3px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorBorderSecondary};
        overflow: hidden;
      }
      .tracking-overview-route__rail-fill {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: ${token.colorPrimary};
        transition: width 0.55s ease;
      }
      .tracking-overview-route__marker {
        position: absolute;
        top: 50%;
        width: 32px;
        height: 32px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 3px ${token.colorPrimaryBg};
        z-index: 1;
        transition: left 0.55s ease;
        pointer-events: none;
      }
      .tracking-overview-route__marker-pulse {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${tokenMix(token.colorPrimary, 45)};
        z-index: -1;
      }
      .tracking-overview-route__track--in-transit
        .tracking-overview-route__marker-pulse {
        animation: tracking-route-pulse 1.8s ease-out infinite;
      }

      .tracking-overview-facts {
        display: grid;
        grid-template-columns: repeat(3, minmax(120px, 160px));
        gap: 0;
        flex: 0 1 auto;
        min-width: 0;
        align-items: stretch;
        padding-right: ${token.marginLG}px;
        margin-right: ${token.marginLG}px;
        border-right: 1px solid ${token.colorBorderSecondary};
      }
      .tracking-overview-fact {
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        padding-inline: ${token.marginMD}px;
      }
      .tracking-overview-fact:first-child {
        padding-left: 0;
      }
      .tracking-overview-fact:not(:first-child) {
        border-left: 1px solid ${token.colorBorderSecondary};
      }
      .tracking-overview-fact__label {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.25;
        color: ${token.colorTextSecondary};
      }
      .tracking-overview-fact__value {
        display: block;
        margin: 0;
        font-size: ${token.fontSize}px;
        line-height: 1.3;
        color: ${token.colorText};
        max-width: 100%;
        color: ${token.colorPrimaryActive};
      }
      .tracking-overview-fact__sub {
        display: block;
        margin: 0;
        max-width: 100%;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tracking-pipeline,
      .tracking-journey {
        background: ${token.colorBgContainer};
        padding: ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginMD}px;
      }
      /* Modified by Sekar Nagarajan (2026-10-27 10:50) — cargo journey match reference */
      .tracking-journey__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        margin-bottom: ${token.marginLG}px;
      }
      .tracking-journey__header-main {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .tracking-journey__header-icon {
        width: ${token.controlHeight}px;
        height: ${token.controlHeight}px;
        border-radius: ${token.borderRadius}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .tracking-journey__title {
        margin: 0 !important;
        color: ${token.colorText} !important;
        font-weight: ${token.fontWeightStrong} !important;
        line-height: 1.3 !important;
      }
      .tracking-journey__updated {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.35;
        color: ${token.colorTextSecondary};
      }
      .tracking-journey__updated-icon {
        display: inline-flex;
        color: ${token.colorTextTertiary};
      }
      .tracking-journey__updated-value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .tracking-journey__eta {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.35;
      }
      .tracking-journey__eta-value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .tracking-journey-timeline {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .tracking-journey-timeline--horizontal {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 0;
        overflow-x: auto;
        overflow-y: hidden;
        padding: ${token.paddingXS}px 0 ${token.paddingSM}px;
      }
      .tracking-journey-timeline--vertical {
        max-height: 420px;
        overflow-y: auto;
        padding-right: ${token.paddingXS}px;
      }

      .tracking-journey-stop__node {
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 1;
        line-height: 1;
        border: 2px solid ${token.colorPrimary};
      }
      .tracking-journey-stop__node .app-icon {
        display: block;
        position: relative;
        z-index: 1;
      }
      .tracking-journey-stop__node-pulse {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${tokenMix(token.colorPrimary, 45)};
        z-index: 0;
      }
      .tracking-journey-stop--completed .tracking-journey-stop__node {
        background: ${token.colorSuccess};
        border-color: ${token.colorSuccess};
        color: ${token.colorTextLightSolid};
      }
      .tracking-journey-stop--current .tracking-journey-stop__node {
        background: ${token.colorPrimary};
        border-color: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        box-shadow: 0 0 0 4px ${token.colorPrimaryBg};
      }
      .tracking-journey-stop--current .tracking-journey-stop__node-pulse {
        animation: tracking-route-pulse 1.8s ease-out infinite;
      }
      .tracking-journey-stop--upcoming .tracking-journey-stop__node {
        background: ${token.colorBgContainer};
        border-color: ${token.colorBorder};
        color: ${token.colorTextTertiary};
      }
      .tracking-journey-stop__spin {
        display: inline-flex;
        animation: tracking-spin 1.2s linear infinite;
      }
      .tracking-journey-stop__line--solid {
        border-color: ${token.colorSuccess};
        border-style: solid;
      }
      .tracking-journey-stop__line--dotted {
        border-color: ${token.colorBorder};
        border-style: dashed;
      }
      .tracking-journey-stop__line--ghost {
        visibility: hidden;
      }
      .tracking-journey-stop__line--hidden {
        display: none;
      }
      .tracking-journey-stop__place {
        display: block;
        margin: 0;
        max-width: 100%;
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.35;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: default;
      }
      .tracking-journey-stop--upcoming .tracking-journey-stop__place {
        color: ${token.colorTextSecondary};
      }
      .tracking-journey-stop__terminal {
        display: block;
        margin: 0;
        max-width: 100%;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: default;
      }
      .tracking-journey-stop__badge {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        padding: 2px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusLG * 2}px;
        font-size: ${token.fontSizeSM - 1}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.4;
        white-space: nowrap;
      }
      .tracking-journey-stop__badge-icon {
        display: inline-flex;
        flex-shrink: 0;
      }
      .tracking-journey-stop__badge--done {
        background: ${tokenMix(token.colorSuccess, 12)};
        color: ${token.colorSuccess};
        border: 1px solid ${tokenMix(token.colorSuccess, 22)};
      }
      .tracking-journey-stop__badge--current {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border: 1px solid ${tokenMix(token.colorPrimary, 30)};
      }
      .tracking-journey-stop__badge--todo {
        background: ${token.colorFillAlter};
        color: ${token.colorTextSecondary};
        border: 1px solid ${token.colorBorderSecondary};
      }
      .tracking-journey-stop__time {
        display: block;
        margin: 0;
        margin-top: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.35;
        min-height: 1.35em;
      }
      .tracking-journey-stop__time--empty {
        visibility: hidden;
      }
      .tracking-journey-stop__time-date {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .tracking-journey-stop--completed .tracking-journey-stop__time-date {
        color: ${token.colorSuccess};
      }
      .tracking-journey-stop--current .tracking-journey-stop__time-date {
        color: ${token.colorPrimary};
      }

      /* Horizontal: icon centered; half-lines left/right so copy sits under the node */
      .tracking-journey--horizontal .tracking-journey-timeline--horizontal {
        width: 100%;
      }
      .tracking-journey--horizontal .tracking-journey-stop {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        flex: 1 1 0;
        min-width: 148px;
      }
      .tracking-journey--horizontal .tracking-journey-stop__rail {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 40px;
        margin-bottom: ${token.marginMD}px;
      }
      .tracking-journey--horizontal .tracking-journey-stop__line {
        flex: 1 1 0;
        height: 0;
        min-width: 0;
        border-top-width: 2px;
        border-left: 0;
        border-right: 0;
        border-bottom: 0;
      }
      .tracking-journey--horizontal .tracking-journey-stop__line--before {
        margin-right: ${token.marginXXS}px;
      }
      .tracking-journey--horizontal .tracking-journey-stop__line--after {
        margin-left: ${token.marginXXS}px;
      }
      .tracking-journey--horizontal .tracking-journey-stop__body {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        width: 100%;
        padding-inline: ${token.paddingXXS}px;
      }
      .tracking-journey--horizontal .tracking-journey-stop__place,
      .tracking-journey--horizontal .tracking-journey-stop__terminal,
      .tracking-journey--horizontal .tracking-journey-stop__time {
        width: 100%;
        text-align: center;
      }
      .tracking-journey--horizontal .tracking-journey-stop__terminal {
        white-space: nowrap;
      }

      /* Vertical compact (drawer) — booking route rail */
      .tracking-journey--vertical .tracking-journey-stop {
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr);
        gap: ${token.marginSM}px;
        align-items: stretch;
      }
      .tracking-journey--vertical .tracking-journey-stop__rail {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .tracking-journey--vertical .tracking-journey-stop__line {
        flex: 1;
        width: 0;
        min-height: ${token.controlHeightLG}px;
        margin: ${token.marginXXS}px 0;
        border-left-width: 2px;
        border-top: 0;
        border-right: 0;
        border-bottom: 0;
      }
      .tracking-journey--vertical .tracking-journey-stop__line--before {
        display: none;
      }
      .tracking-journey--vertical .tracking-journey-stop__body {
        min-width: 0;
        padding-bottom: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        gap: ${token.marginXXS}px;
      }
      .tracking-journey--vertical .tracking-journey-stop:last-child
        .tracking-journey-stop__body {
        padding-bottom: 0;
      }

      .tracking-overview__journey {
        margin-top: ${token.marginMD}px;
        padding-top: ${token.marginMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      /* Modified by Sekar Nagarajan (2026-09-11 13:05) — smooth expand / collapse */
      .tracking-overview__journey-panel {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
          grid-template-rows 0.35s ease,
          opacity 0.28s ease;
      }
      .tracking-overview__journey-panel--open {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .tracking-overview__journey-panel-inner {
        overflow: hidden;
        min-height: 0;
      }
      .tracking-overview__journey-panel:not(.tracking-overview__journey-panel--open)
        .tracking-overview__journey {
        margin-top: 0;
        padding-top: 0;
        border-top-color: transparent;
      }
      .tracking-overview__toggle-col {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-shrink: 0;
        margin-left: auto;
        padding-left: ${token.marginSM}px;
      }
      .tracking-overview__toggle.ant-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border-radius: 50%;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        color: ${token.colorPrimary};
      }
      .tracking-overview__toggle--open {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border-color: ${tokenMix(token.colorPrimary, 30)};
      }
      .tracking-overview__toggle-chevron {
        display: inline-flex;
        transition: transform 0.35s ease;
      }
      .tracking-overview__toggle--open .tracking-overview__toggle-chevron {
        transform: rotate(180deg);
      }
      @media (max-width: 1199px) {
        .tracking-overview__summary {
          flex-wrap: wrap;
          row-gap: ${token.marginMD}px;
        }
        .tracking-overview-route {
          flex: 1 1 100%;
          padding-right: 0;
          margin-right: 0;
          border-right: none;
          padding-bottom: ${token.marginMD}px;
          margin-bottom: 0;
          border-bottom: 1px solid ${token.colorBorderSecondary};
        }
        .tracking-overview-facts {
          flex: 1 1 auto;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          padding-right: ${token.marginMD}px;
          margin-right: ${token.marginMD}px;
        }
      }
      @media (max-width: 767px) {
        .tracking-overview-route {
          grid-template-columns: minmax(0, 1fr) minmax(72px, 1fr) minmax(0, 1fr);
          gap: ${token.marginXS}px;
        }
        .tracking-overview-facts {
          grid-template-columns: 1fr;
          width: 100%;
          padding-right: 0;
          margin-right: 0;
          border-right: none;
          padding-bottom: ${token.marginMD}px;
          border-bottom: 1px solid ${token.colorBorderSecondary};
        }
        .tracking-overview-fact {
          padding-inline: 0;
          padding-block: ${token.paddingSM}px;
        }
        .tracking-overview-fact:not(:first-child) {
          border-left: none;
          border-top: 1px solid ${token.colorBorderSecondary};
        }
        .tracking-overview__toggle-col {
          margin-left: 0;
          width: 100%;
          justify-content: flex-end;
          padding-left: 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .tracking-overview__journey-panel,
        .tracking-overview__toggle-chevron,
        .tracking-overview-route__rail-fill,
        .tracking-overview-route__marker {
          transition: none;
        }
        .tracking-overview-route__track--in-transit
          .tracking-overview-route__marker-pulse,
        .tracking-journey-stop--current .tracking-journey-stop__node-pulse {
          animation: none;
        }
      }

      .tracking-overview--pipeline.ant-card {
        margin-bottom: 0;
        height: 100%;
      }
      .tracking-overview--pipeline .ant-card-body {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .tracking-overview--pipeline .tracking-pipeline,
      .tracking-overview--pipeline .tracking-journey {
        margin-bottom: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .tracking-route-map-card.ant-card {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
        height: 100%;
        overflow: hidden;
      }
      .tracking-route-map-card .ant-card-head {
        border-bottom: 1px solid ${token.colorBorderSecondary};
        min-height: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .tracking-route-map-card .ant-card-head-title {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        padding: ${token.paddingXXS}px 0;
      }
      .tracking-route-map-card__title {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
      }
      .tracking-route-map-card__ais {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorSuccess};
        white-space: nowrap;
      }
      .tracking-route-map-card .ant-card-extra {
        margin-inline-start: ${token.marginSM}px;
      }

      .tracking-live-map-drawer-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        width: 100%;
      }
      .tracking-live-map-drawer-stack__journey.ant-card {
        margin-bottom: 0;
        width: 100%;
      }
      .tracking-live-map-drawer-stack__journey .ant-card-head {
        border-bottom: 1px solid ${token.colorBorderSecondary};
        min-height: auto;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .tracking-live-map-drawer-stack__journey .ant-card-head-title {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        padding: ${token.paddingXXS}px 0;
      }
      .tracking-live-map-drawer-stack__journey .ant-card-body {
        padding: ${token.paddingMD}px;
      }
      .tracking-live-map-drawer-stack__journey .tracking-pipeline,
      .tracking-live-map-drawer-stack__journey .tracking-journey {
        margin-bottom: 0;
      }
      .tracking-live-map-drawer-stack__map {
        width: 100%;
        min-width: 0;
      }
      .tracking-live-map-drawer-row {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: stretch;
        gap: ${token.marginMD}px;
        min-height: 480px;
        width: 100%;
        overflow-x: auto;
      }
      .tracking-live-map-drawer-row__pipeline {
        flex: 0 0 280px;
        width: 280px;
        max-width: 280px;
        min-width: 240px;
      }
      .tracking-live-map-drawer-row__map {
        flex: 1 1 auto;
        min-width: 420px;
      }
      .tracking-route-map-card .ant-card-body {
        padding: 0;
        height: auto;
        position: relative;
      }
      .tracking-map-shell {
        display: flex;
        flex-direction: column;
        width: 100%;
        background: ${token.colorBgContainer};
      }
      .tracking-map-voyage {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: stretch;
        gap: ${token.marginLG}px;
        width: 100%;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        z-index: 2;
      }
      .tracking-map-voyage__lead {
        flex: 1 1 220px;
        min-width: 180px;
        max-width: 320px;
      }
      .tracking-map-voyage__title {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorInfo};
        margin-bottom: ${token.marginXXS}px;
      }
      .tracking-map-voyage__progress-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginXXS}px;
      }
      .tracking-map-voyage__progress-label {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .tracking-map-voyage__progress-value {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .tracking-map-voyage__bar {
        height: 6px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorFillSecondary};
        overflow: hidden;
      }
      .tracking-map-voyage__bar-fill {
        height: 100%;
        width: calc(var(--tracking-voyage-progress, 0) * 1%);
        background: ${token.colorInfo};
        border-radius: ${token.borderRadiusSM}px;
        transition: width 0.35s ease;
      }
      .tracking-map-voyage__rows {
        display: flex;
        flex: 1 1 360px;
        flex-wrap: wrap;
        align-items: center;
        gap: ${token.marginMD}px ${token.marginXL}px;
        min-width: 0;
      }
      .tracking-map-voyage__row {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 120px;
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-map-voyage__row span {
        color: ${token.colorTextSecondary};
      }
      .tracking-map-voyage__row strong {
        color: ${token.colorText};
        font-weight: ${token.fontWeightStrong};
      }
      .tracking-map-stage {
        position: relative;
        width: 100%;
        height: 480px;
        min-height: 480px;
        background: ${token.colorFillAlter};
      }
      .tracking-map__viewport {
        width: 100%;
        height: 100%;
        min-height: 480px;
        position: absolute;
        inset: 0;
      }
      .tracking-map-route-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
        overflow: visible;
      }
      .tracking-map-route-svg__casing {
        stroke: ${token.colorText};
        stroke-width: 6;
        stroke-opacity: 0.35;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .tracking-map-route-svg__sailed {
        stroke-width: 3.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .tracking-map-route-svg__remaining {
        stroke-width: 2.5;
        stroke-dasharray: 6 6;
        stroke-opacity: 0.95;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .tracking-map-legend {
        position: absolute;
        bottom: ${token.paddingSM}px;
        left: ${token.paddingSM}px;
        z-index: 2;
        display: flex;
        gap: ${token.marginMD}px;
        align-items: center;
        flex-wrap: wrap;
        max-width: calc(100% - ${token.paddingLG * 2}px);
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadius}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgElevated};
        box-shadow: ${token.boxShadowTertiary};
        pointer-events: none;
      }
      .tracking-map-legend__item {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .tracking-map-legend__dot {
        width: 10px;
        height: 10px;
        border-radius: 9999px;
        border: 2px solid ${token.colorTextLightSolid};
        box-shadow: 0 0 0 1px ${token.colorBorder};
        flex: none;
      }
      .tracking-map-legend__dot--origin {
        background: ${token.colorSuccess};
      }
      .tracking-map-legend__dot--vessel {
        background: ${token.colorInfo};
      }
      .tracking-map-legend__dot--wp {
        background: ${token.colorWarning};
        border-width: 1.5px;
      }
      .tracking-map-legend__dot--dest {
        background: ${token.colorError};
      }
      .tracking-map-legend__line {
        width: 16px;
        height: 3px;
        flex: none;
        border-radius: 2px;
      }
      .tracking-map-legend__line--sailed {
        background: ${token.colorInfo};
      }
      .tracking-map-legend__line--remaining {
        height: 0;
        border-top: 2px dashed ${token.colorTextLightSolid};
        background: transparent;
        box-shadow: 0 0 0 1px ${tokenMix(token.colorText, 25)};
      }
      .tracking-map-pin {
        width: 16px;
        height: 16px;
        border-radius: 9999px;
        border: 3px solid ${token.colorTextLightSolid};
        box-shadow: 0 1px 4px ${mapPinShadow};
        cursor: pointer;
      }
      .tracking-map-pin--origin {
        background: ${token.colorSuccess};
      }
      .tracking-map-pin--dest {
        background: ${token.colorError};
      }
      .tracking-map-wp {
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        background: ${token.colorWarning};
        border: 1.5px solid ${token.colorTextLightSolid};
        box-shadow: 0 1px 3px ${mapPinShadow};
        cursor: pointer;
      }
      .tracking-map-vessel {
        width: 18px;
        height: 18px;
        position: relative;
        cursor: pointer;
      }
      .tracking-map-vessel__core {
        position: absolute;
        inset: 3px;
        border-radius: 9999px;
        background: ${token.colorInfo};
        border: 2px solid ${token.colorTextLightSolid};
        box-shadow: 0 0 0 1px ${mapCoreRing};
      }
      .tracking-map-vessel__ring {
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        background: ${mapPulse};
        animation: tracking-map-pulse 1.8s ease-out infinite;
      }
      .tracking-map-pop__role {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: ${token.colorInfo};
      }
      .tracking-map-pop__title {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .tracking-map-pop__sub {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        margin-top: 2px;
        line-height: 1.5;
      }
      .maplibregl-popup-content {
        border-radius: ${token.borderRadius}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        box-shadow: ${token.boxShadowSecondary};
        font-family: inherit;
      }
      .maplibregl-ctrl-group {
        border-radius: ${token.borderRadiusSM}px !important;
        overflow: hidden;
      }

      .tracking-deadlines {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        align-items: stretch;
        gap: ${token.marginSM}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        padding: ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .tracking-deadlines__heading {
        display: none;
      }
      .tracking-deadline {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        font-size: ${token.fontSizeSM}px;
        min-width: 0;
      }
      .tracking-deadline__icon {
        width: 32px;
        height: 32px;
        border-radius: ${token.borderRadius}px;
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
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-deadline__value {
        display: block;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.3;
      }

      .tracking-results-panel {
        background: ${token.colorBgContainer};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 420px);
        overflow: hidden;
      }
      .tracking-results-toolbar {
        width: 100%;
        flex-shrink: 0;
      }
      .tracking-results-title {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
      }
      .tracking-results-count {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        line-height: 1.2;
        background-color: ${token.colorError};
        color: ${token.colorWhite};
        padding: ${token.paddingXXS}px ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        min-width: ${token.controlHeightSM}px;
        height: ${token.controlHeightSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .tracking-grid {
        flex: 1;
        min-height: 360px;
        display: flex;
        flex-direction: column;
      }
      .tracking-grid .ag-theme-alpine,
      .tracking-grid .ag-root-wrapper {
        height: 100% !important;
        min-height: 360px;
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

      /* Modified by Sekar Nagarajan (2026-09-11 12:40) — movement drawer redesign */
      .tracking-movement-drawer__header-wrap.ant-drawer-header {
        padding-block: ${token.paddingMD}px;
      }
      .tracking-movement-drawer__header {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .tracking-movement-drawer__header-icon {
        width: 40px;
        height: 40px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${tokenMix(token.colorInfo, 10)};
        color: ${token.colorInfo};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .tracking-movement-drawer__header-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .tracking-movement-drawer__eyebrow {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .tracking-movement-drawer__heading {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .tracking-movement-drawer__meta {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.35;
      }
      .tracking-movement-drawer.tracking-drawer-body {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }

      .tracking-movement-summary {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        padding: ${token.paddingMD}px;
      }
      .tracking-movement-summary__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${token.marginMD}px ${token.marginLG}px;
      }
      .tracking-movement-summary__cell {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .tracking-movement-summary__label {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        letter-spacing: 0.03em;
        text-transform: uppercase;
        line-height: 1.2;
      }
      .tracking-movement-summary__value {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.35;
        word-break: break-word;
      }

      .tracking-movement-status {
        display: inline-flex;
        align-items: center;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.controlHeightSM - 4}px;
        width: fit-content;
      }
      .tracking-movement-status--in-transit {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .tracking-movement-status--delivered {
        background: ${token.colorSuccessBg};
        color: ${token.colorSuccess};
      }
      .tracking-movement-status--gate-in {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .tracking-movement-status--loaded {
        background: ${tokenMix(token.purple, 12)};
        color: ${token.purple};
      }
      .tracking-movement-status--discharged {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }

      .tracking-movement-timeline-section__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
        margin-bottom: ${token.marginMD}px;
      }
      .tracking-movement-timeline-section__title {
        margin: 0 !important;
      }
      .tracking-movement-timeline-section__count {
        font-size: ${token.fontSizeSM}px;
      }
      .tracking-movement-timeline {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .tracking-movement-event {
        display: grid;
        grid-template-columns: 32px minmax(0, 1fr);
        gap: ${token.marginSM}px;
        align-items: stretch;
      }
      .tracking-movement-event__rail {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .tracking-movement-event__node {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border: 1px solid ${tokenMix(token.colorPrimary, 35)};
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 1;
      }
      .tracking-movement-event--latest .tracking-movement-event__node {
        background: ${token.colorPrimary};
        color: ${token.colorTextLightSolid};
        border-color: ${token.colorPrimary};
        box-shadow: 0 0 0 3px ${token.colorPrimaryBg};
      }
      .tracking-movement-event__line {
        flex: 1;
        width: 0;
        min-height: ${token.marginLG}px;
        margin: ${token.marginXXS}px 0;
        border-left: 2px solid ${tokenMix(token.colorPrimary, 35)};
      }
      /* Modified by Sekar Nagarajan (2026-10-26 16:35) — aligned event card layout */
      .tracking-movement-event__body {
        min-width: 0;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        margin-bottom: ${token.marginSM}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .tracking-movement-event:last-child .tracking-movement-event__body {
        margin-bottom: 0;
      }
      .tracking-movement-event--latest .tracking-movement-event__body {
        border-color: ${tokenMix(token.colorPrimary, 35)};
        background: ${tokenMix(token.colorPrimary, 4)};
      }
      .tracking-movement-event__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
      }
      .tracking-movement-event__name {
        display: block;
        margin: 0;
        min-width: 0;
        flex: 1 1 auto;
        font-size: ${token.fontSize}px;
        line-height: 1.35;
      }
      .tracking-movement-event__time {
        flex-shrink: 0;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        white-space: nowrap;
        line-height: 1.4;
        text-align: right;
      }
      .tracking-movement-event--latest .tracking-movement-event__time {
        color: ${token.colorPrimary};
      }
      .tracking-movement-event__meta {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        padding-top: ${token.paddingSM}px;
        border-top: 1px solid ${token.colorBorderSecondary};
      }
      .tracking-movement-event__meta-item {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr);
        gap: ${token.marginSM}px;
        align-items: start;
        min-width: 0;
      }
      .tracking-movement-event__meta-icon {
        width: 28px;
        height: 28px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorFillAlter};
        color: ${token.colorTextSecondary};
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .tracking-movement-event__meta-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .tracking-movement-event__meta-label {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
      }
      .tracking-movement-event__meta-value {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.4;
        word-break: break-word;
      }
      .tracking-movement-empty {
        padding: ${token.paddingMD}px 0;
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
        .tracking-journey--horizontal .tracking-journey-stop {
          min-width: 156px;
        }
        .tracking-journey__updated {
          width: 100%;
        }
        .tracking-deadlines {
          grid-template-columns: 1fr;
        }
        .tracking-movement-summary__grid {
          grid-template-columns: 1fr 1fr;
        }
        .tracking-movement-event__head {
          flex-direction: column;
          align-items: stretch;
        }
        .tracking-movement-event__time {
          white-space: normal;
          text-align: left;
        }
      }

      .tracking-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px ${token.paddingLG + 4}px;
      }
      .tracking-share-mail-form {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .tracking-share-mail-summary {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
        padding: ${token.paddingMD}px;
      }
      .tracking-share-mail-summary__title {
        display: block;
        margin-bottom: ${token.marginXS}px;
      }
      .tracking-share-mail-summary__list {
        margin: 0;
        padding-left: ${token.paddingLG}px;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .tracking-share-mail-editor {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXS}px;
      }
      .tracking-share-mail-editor .ant-form-item {
        margin-bottom: 0;
      }
      .tracking-share-mail-editor .ProseMirror {
        min-height: ${token.controlHeightLG * 6}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
      }
      .tracking-share-mail-editor .ProseMirror > * + * {
        margin-top: ${token.marginXS}px;
      }
      .tracking-share-mail-editor .ProseMirror p,
      .tracking-share-mail-editor .ProseMirror ul,
      .tracking-share-mail-editor .ProseMirror ol {
        margin: 0;
      }
      .tracking-share-mail-editor .ProseMirror ul,
      .tracking-share-mail-editor .ProseMirror ol {
        padding-left: ${token.paddingLG}px;
      }
      .tracking-share-mail-footer {
        padding: ${token.paddingMD}px ${token.paddingLG}px !important;
        border-top: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
      }
      .tracking-share-mail-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        width: 100%;
      }
    `}</style>
  );
}
