// Modified by Sekar Nagarajan (2026-08-31 11:25)
import { theme } from "antd";

import { tokenMix } from "../../theme/utils/token-mix";

export function ScheduleModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint10 = tokenMix(token.colorPrimary, 10);

  return (
    <style>{`
      .schedule-search-panel {
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        border: 1px solid ${token.colorBorderSecondary};
        margin-bottom: ${token.marginLG}px;
        overflow: hidden;
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
        padding: ${token.paddingLG}px;
        background: ${token.colorFillAlter};
      }
      /* Modified by Sekar Nagarajan (2026-08-31 11:25) — Tabs as view/search-type switcher */
      .schedule-search-type-wrap {
        margin-bottom: ${token.marginMD}px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .schedule-search-tabs.ant-tabs {
        margin-bottom: 0;
      }
      .schedule-search-tabs .ant-tabs-nav {
        margin-bottom: 0;
      }
      .schedule-search-tabs .ant-tabs-content-holder {
        display: none;
      }
      .schedule-tab-label {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        line-height: 1;
      }
      .schedule-tab-label .app-icon {
        display: block;
        flex: none;
      }
      .schedule-results-tabs.ant-tabs {
        margin-bottom: 0;
        flex-shrink: 0;
      }
      .schedule-results-tabs .ant-tabs-nav {
        margin-bottom: 0;
      }
      .schedule-results-tabs .ant-tabs-content-holder {
        display: none;
      }
      /* Modified by Sekar Nagarajan (2026-09-01 13:00) — default segment style (not primary) */
      .schedule-results-tabs.ant-segmented .ant-segmented-item-selected {
        background: ${token.colorBgElevated} !important;
        color: ${token.colorText} !important;
      }
      .schedule-results-tabs.ant-segmented
        .ant-segmented-item-selected
        .ant-segmented-item-label {
        color: ${token.colorText} !important;
      }
      .schedule-results-tabs.ant-segmented .ant-segmented-thumb {
        background: ${token.colorBgElevated} !important;
        box-shadow: ${token.boxShadowSecondary} !important;
      }
      .schedule-results-tabs.ant-segmented
        .ant-segmented-item-selected
        .schedule-tab-label
        .app-icon {
        color: ${token.colorText};
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
      .schedule-card__vessel-tag {
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

      /* Show Details — numbered vertical Route timeline */
      .schedule-route-details {
        margin: 0 ${token.marginLG}px ${token.marginMD}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
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
      }
      .schedule-route-stop__line {
        flex: 1;
        width: 0;
        min-height: ${token.controlHeightLG}px;
        margin: ${token.marginXXS}px 0;
        border-left: 2px dashed ${tokenMix(token.colorPrimary, 45)};
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
      .schedule-calendar__weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        padding: ${token.paddingSM}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
      }
      .schedule-calendar__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }
      .schedule-calendar__cell {
        min-height: 96px;
        border: 1px solid ${token.colorBorderSecondary};
        padding: ${token.paddingXS}px;
        background: ${token.colorBgContainer};
        display: flex;
        flex-direction: column;
      }
      .schedule-calendar__cell--blank {
        background: ${token.colorFillAlter};
        opacity: 0.6;
      }
      .schedule-calendar__cell-day {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginXXS}px;
      }
      .schedule-calendar__cell-events {
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .schedule-calendar__event {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border-radius: ${token.borderRadiusSM}px;
        padding: 2px ${token.paddingXS}px;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        cursor: pointer;
        border-left: 3px solid ${token.colorPrimary};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .schedule-calendar__event:hover {
        background: ${primaryTint10};
      }

      .schedule-agenda {
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        padding: ${token.paddingMD}px;
      }
      .schedule-agenda__day {
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        overflow: hidden;
      }
      .schedule-agenda__day-header {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
      }
      .schedule-agenda__item {
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border-top: 1px solid ${token.colorBorderSecondary};
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-agenda__item:hover {
        background: ${token.colorFillAlter};
      }

      /* Drawer / modal shared (vessel, rates, carbon) */
      .schedule-drawer-title {
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
      }
      .schedule-drawer-title__text {
        margin: 0 !important;
      }
      .schedule-drawer-title__meta {
        font-size: ${token.fontSizeSM}px;
        display: block;
      }
      .schedule-drawer-footer {
        display: flex;
        justify-content: flex-end;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .schedule-drawer-body.custom-scroll {
        overflow-y: auto;
        max-height: calc(100vh - 105px);
        padding: ${token.paddingLG}px ${token.paddingLG + 4}px;
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
      .schedule-rates-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: ${token.marginMD}px;
        padding-top: ${token.paddingSM}px;
        border-top: 2px solid ${token.colorBorderSecondary};
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-rates-total__label {
        font-size: ${token.fontSizeLG}px;
        font-weight: ${token.fontWeightStrong};
      }
      .schedule-rates-total__value {
        margin: 0 !important;
        color: ${token.colorPrimary} !important;
      }
      .schedule-co2-result-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginSM}px;
        gap: ${token.marginSM}px;
        flex-wrap: wrap;
      }
      .schedule-co2-metric-grid {
        text-align: center;
      }
      .schedule-co2-metric.ant-card {
        border-radius: ${token.borderRadius}px;
        text-align: center;
        box-shadow: none !important;
      }
      .schedule-co2-metric__label {
        font-size: ${token.fontSizeSM}px;
      }
      .schedule-co2-metric__value {
        margin: ${token.marginXXS}px 0 !important;
      }
      .schedule-co2-metric__value--success {
        color: ${token.colorSuccess} !important;
      }
      .schedule-co2-metric__value--info {
        color: ${token.colorInfo} !important;
      }
      .schedule-co2-metric__value--purple {
        color: ${token.purple} !important;
      }
      .schedule-co2-metric__unit {
        font-size: ${token.fontSizeSM}px;
      }
      .schedule-co2-metric__hint {
        font-size: ${token.fontSizeSM}px;
      }
      .schedule-co2-note.ant-card {
        border-radius: ${token.borderRadius}px;
        background: ${token.colorFillAlter};
        box-shadow: none !important;
        margin-top: ${token.marginMD}px;
      }
      .schedule-co2-note__text {
        font-size: ${token.fontSizeSM}px;
        margin: 0 !important;
      }
      .schedule-list-cell__title {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .schedule-list-cell__sub {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
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
        .schedule-calendar__cell {
          min-height: 110px;
        }
      }

      @media (min-width: 1200px) {
        .schedule-calendar__cell {
          min-height: 120px;
        }
      }

      @media (max-width: 767px) {
        .schedule-search-panel__body {
          padding: ${token.paddingMD}px;
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
        .schedule-results-bar .schedule-results-tabs {
          width: 100%;
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
