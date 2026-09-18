// Modified by Sekar Nagarajan (2026-09-17 18:32)
import { theme } from "antd";
import { BE_COLOR_MAP } from "../../theme/utils/config-mapper";
import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed dashboard layout classes (agenct.md) — shared by all dashboard sections. */
export function DashboardModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint12 = tokenMix(token.colorPrimary, 12);
  const primaryTint25 = tokenMix(token.colorPrimary, 25);
  const primaryTint40 = tokenMix(token.colorPrimary, 40);
  const successTint12 = tokenMix(token.colorSuccess, 12);
  const warningTint12 = tokenMix(token.colorWarning, 12);
  const errorTint12 = tokenMix(token.colorError, 12);
  const infoTint12 = tokenMix(token.colorInfo, 12);
  const purpleTint12 = tokenMix(token.purple, 12);
  const successTint8 = tokenMix(token.colorSuccess, 8);
  const warningTint8 = tokenMix(token.colorWarning, 8);
  const infoTint8 = tokenMix(token.colorInfo, 8);
  const purpleTint8 = tokenMix(token.purple, 8);
  const primaryTint8 = tokenMix(token.colorPrimary, 8);

  const charcoalBlue = BE_COLOR_MAP.CHARCOAL_BLUE;
  const charcoalBlueBg = tokenMix(charcoalBlue, 14);
  const charcoalBlueBorder = tokenMix(charcoalBlue, 32);
  const verdigris = BE_COLOR_MAP.VERDIGRIS;
  const verdigrisBg = tokenMix(verdigris, 14);
  const verdigrisBorder = tokenMix(verdigris, 32);
  const tuscanSun = BE_COLOR_MAP.TUSCAN_SUN;
  const tuscanSunBg = tokenMix(tuscanSun, 14);
  const tuscanSunBorder = tokenMix(tuscanSun, 32);
  const sandyBrown = BE_COLOR_MAP.SANDY_BROWN;
  const sandyBrownBg = tokenMix(sandyBrown, 14);
  const sandyBrownBorder = tokenMix(sandyBrown, 32);
  const burntPeach = BE_COLOR_MAP.BURNT_PEACH;
  const burntPeachBg = tokenMix(burntPeach, 14);
  const burntPeachBorder = tokenMix(burntPeach, 32);
  const terraCotta = BE_COLOR_MAP.TERRA_COTTA;
  const terraCottaBg = tokenMix(terraCotta, 14);
  const terraCottaBorder = tokenMix(terraCotta, 32);

  return (
    <style>{`
      /* ── KPI summary cards (depot-style strip) ── */
      .dashboard-kpi-overview {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginSM}px;
        align-items: stretch;
      }
      .dashboard-summary-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${token.marginXS}px;
        min-width: 0;
        min-height: 132px;
        margin: 0;
        padding: ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorBgContainer};
        box-shadow: 0 ${token.marginXXS}px ${token.marginSM}px ${tokenMix(
      token.colorText,
      6,
    )};
        text-align: left;
        font: inherit;
        cursor: pointer;
        overflow: hidden;
        isolation: isolate;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          transform 0.2s ease;
      }
      .dashboard-summary-card::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background: linear-gradient(
          145deg,
          transparent 42%,
          ${tokenMix(token.colorFillSecondary, 55)} 100%
        );
      }
      .dashboard-summary-card:hover,
      .dashboard-summary-card:focus-visible,
      .dashboard-summary-card--active {
        box-shadow: 0 ${token.marginXXS}px ${token.marginMD}px ${tokenMix(
      token.colorText,
      10,
    )};
        outline: none;
        transform: translateY(-1px);
      }
      .dashboard-summary-card--tone-primary {
        border-color: ${primaryTint40};
      }
      .dashboard-summary-card--tone-primary:hover,
      .dashboard-summary-card--tone-primary:focus-visible,
      .dashboard-summary-card--tone-primary.dashboard-summary-card--active {
        border-color: ${token.colorPrimary};
      }
      .dashboard-summary-card--tone-primary::before {
        background: linear-gradient(145deg, transparent 40%, ${primaryTint8} 100%);
      }
      .dashboard-summary-card--tone-success {
        border-color: ${tokenMix(token.colorSuccess, 40)};
      }
      .dashboard-summary-card--tone-success:hover,
      .dashboard-summary-card--tone-success:focus-visible,
      .dashboard-summary-card--tone-success.dashboard-summary-card--active {
        border-color: ${token.colorSuccess};
      }
      .dashboard-summary-card--tone-success::before {
        background: linear-gradient(145deg, transparent 40%, ${successTint8} 100%);
      }
      .dashboard-summary-card--tone-warning {
        border-color: ${tokenMix(token.colorWarning, 40)};
      }
      .dashboard-summary-card--tone-warning:hover,
      .dashboard-summary-card--tone-warning:focus-visible,
      .dashboard-summary-card--tone-warning.dashboard-summary-card--active {
        border-color: ${token.colorWarning};
      }
      .dashboard-summary-card--tone-warning::before {
        background: linear-gradient(145deg, transparent 40%, ${warningTint8} 100%);
      }
      .dashboard-summary-card--tone-verdigris {
        border-color: ${verdigrisBorder};
      }
      .dashboard-summary-card--tone-verdigris:hover,
      .dashboard-summary-card--tone-verdigris:focus-visible,
      .dashboard-summary-card--tone-verdigris.dashboard-summary-card--active {
        border-color: ${verdigris};
      }
      .dashboard-summary-card--tone-verdigris::before {
        background: linear-gradient(
          145deg,
          transparent 40%,
          ${tokenMix(verdigris, 8)} 100%
        );
      }
      .dashboard-summary-card--tone-terra {
        border-color: ${terraCottaBorder};
      }
      .dashboard-summary-card--tone-terra:hover,
      .dashboard-summary-card--tone-terra:focus-visible,
      .dashboard-summary-card--tone-terra.dashboard-summary-card--active {
        border-color: ${terraCotta};
      }
      .dashboard-summary-card--tone-terra::before {
        background: linear-gradient(
          145deg,
          transparent 40%,
          ${tokenMix(terraCotta, 8)} 100%
        );
      }
      .dashboard-summary-card--tone-info {
        border-color: ${tokenMix(token.colorInfo, 40)};
      }
      .dashboard-summary-card--tone-info:hover,
      .dashboard-summary-card--tone-info:focus-visible,
      .dashboard-summary-card--tone-info.dashboard-summary-card--active {
        border-color: ${token.colorInfo};
      }
      .dashboard-summary-card--tone-info::before {
        background: linear-gradient(145deg, transparent 40%, ${infoTint8} 100%);
      }
      .dashboard-summary-card--tone-purple {
        border-color: ${tokenMix(token.purple, 40)};
      }
      .dashboard-summary-card--tone-purple:hover,
      .dashboard-summary-card--tone-purple:focus-visible,
      .dashboard-summary-card--tone-purple.dashboard-summary-card--active {
        border-color: ${token.purple};
      }
      .dashboard-summary-card--tone-purple::before {
        background: linear-gradient(145deg, transparent 40%, ${purpleTint8} 100%);
      }
      .dashboard-summary-card__head {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        width: 100%;
        min-width: 0;
      }
      .dashboard-summary-card__icon {
        width: 34px;
        height: 34px;
        border-radius: ${token.borderRadiusSM}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .dashboard-summary-card__icon--primary {
        background: ${primaryTint12};
        color: ${token.colorPrimary};
      }
      .dashboard-summary-card__icon--success {
        background: ${successTint12};
        color: ${token.colorSuccess};
      }
      .dashboard-summary-card__icon--warning {
        background: ${warningTint12};
        color: ${token.colorWarning};
      }
      .dashboard-summary-card__icon--verdigris {
        background: ${verdigrisBg};
        color: ${verdigris};
      }
      .dashboard-summary-card__icon--terra {
        background: ${terraCottaBg};
        color: ${terraCotta};
      }
      .dashboard-summary-card__icon--info {
        background: ${infoTint12};
        color: ${token.colorInfo};
      }
      .dashboard-summary-card__icon--purple {
        background: ${purpleTint12};
        color: ${token.purple};
      }
      .dashboard-summary-card__title {
        position: relative;
        z-index: 1;
        display: block;
        margin: 0;
        min-width: 0;
        font-size: ${token.fontSizeSM}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorText} !important;
        line-height: 1.25 !important;
      }
      .dashboard-summary-card__value {
        position: relative;
        z-index: 1;
        display: block;
        margin: ${token.marginXXS}px 0 0 !important;
        font-size: ${token.fontSizeHeading2}px !important;
        font-weight: 800 !important;
        line-height: 1 !important;
        color: ${token.colorTextHeading} !important;
      }
      .dashboard-summary-card__meta {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        gap: ${token.marginXXS}px;
        width: 100%;
        max-width: 100%;
        margin-top: auto;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.35;
        color: ${token.colorTextSecondary};
      }
      .dashboard-summary-card__meta-item {
        display: inline-flex;
        flex-shrink: 0;
        align-items: baseline;
        gap: ${token.marginXXS}px;
        white-space: nowrap;
      }
      .dashboard-summary-card__meta-label {
        font-weight: 500;
        color: ${token.colorTextSecondary};
      }
      .dashboard-summary-card__meta-value {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }
      .dashboard-summary-card__sep {
        color: ${token.colorTextQuaternary};
        margin-inline-end: ${token.marginXXS}px;
      }

      .dashboard-panel.ant-card {
        width: 100%;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
        display: flex;
        flex-direction: column;
      }
      .dashboard-panel .ant-card-head {
        flex-shrink: 0;
      }
      .dashboard-equal-row.ant-row {
        align-items: stretch;
      }
      .dashboard-equal-row > .ant-col {
        display: flex;
        flex-direction: column;
      }
      .dashboard-equal-row .dashboard-panel.ant-card {
        flex: 1;
        height: 100%;
      }
      /* CSS twin row — equal columns to match Top Active Lanes / Lane Opportunities */
      /* Modified by Sekar Nagarajan (2026-09-17 22:08) */
      .dashboard-equal-row.dashboard-intelligence-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: stretch;
      }
      .dashboard-intelligence-row__primary,
      .dashboard-intelligence-row__secondary {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .dashboard-intelligence-row .dashboard-panel.ant-card {
        flex: 1;
        height: 100%;
      }
      .dashboard-panel.ant-card:hover {
        box-shadow: none !important;
      }
      .dashboard-panel .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .dashboard-split-stack {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
        min-height: 0;
      }
      .dashboard-split-stack__block {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .dashboard-intelligence-tabs.ant-tabs {
        flex-shrink: 0;
      }
      .dashboard-intelligence-body.ant-row {
        flex: 1;
        min-height: 0;
        align-items: stretch;
      }
      .dashboard-intelligence-body > .ant-col {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .dashboard-panel-stack {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginMD}px;
      }
      .dashboard-panel-stack__grow {
        flex: 1;
        min-height: 0;
      }
      .dashboard-intelligence-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginSM}px;
        flex-shrink: 0;
      }
      .dashboard-intelligence-segmented {
        max-width: 100%;
      }
      .dashboard-intelligence-segmented .ant-segmented-group {
        flex-wrap: wrap;
      }
      .dashboard-intelligence-summary {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: ${token.marginXXS}px;
        font-size: ${token.fontSizeSM}px;
      }
      .dashboard-intelligence-layout {
        flex: 1;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(140px, 0.42fr) minmax(0, 1fr);
        gap: ${token.marginMD}px;
        align-items: stretch;
      }
      .dashboard-intelligence-chart {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        min-height: ${token.controlHeightLG * 5}px;
      }
      .dashboard-intelligence-table {
        min-width: 0;
      }
      .dashboard-panel__title {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
      }

      /* ── Ongoing panel ── */
      .dashboard-ongoing-panel {
        background: ${token.colorBgContainer};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border: 1px solid ${token.colorBorderSecondary};
      }
      .dashboard-ongoing-toolbar {
        margin-bottom: ${token.marginSM}px;
        width: 100%;
      }
      .dashboard-ongoing-search {
        width: min(240px, 100%);
      }
      .dashboard-ongoing-grid {
        min-height: 320px;
      }
      .dashboard-link-btn.ant-btn {
        padding: 0;
        height: auto;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorPrimary};
      }
      .dashboard-ellipsis-cell {
        display: block;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dashboard-amount-strong {
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSize}px;
      }
      /* Modified by Sekar Nagarajan (2026-09-16 17:07) — volume stage segmented */
      .dashboard-volume-panel .ant-card-head {
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
      }
      .dashboard-volume-panel .ant-card-extra {
        margin-inline-start: 0;
      }
      .dashboard-volume-stage-segmented {
        max-width: 100%;
      }
      .dashboard-volume-stage-segmented .ant-segmented-group {
        flex-wrap: wrap;
      }
      .dashboard-volume-stage-label {
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
      }
      .dashboard-volume-panel .ant-card-body {
        container-type: inline-size;
        container-name: dashboard-volume;
        min-width: 0;
        overflow: hidden;
      }
      /* Grid tracks can shrink to 0 so sidebar toggle never lets the
         Volume Trend canvas spill over the KPI tiles. */
      .dashboard-volume-analytics-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        align-items: stretch;
        gap: ${token.marginMD}px;
        min-width: 0;
        width: 100%;
        overflow: hidden;
      }
      .dashboard-volume-analytics-grid > .dashboard-volume-kpi-grid,
      .dashboard-volume-analytics-grid > .dashboard-trend-wrap {
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
      }
      @container dashboard-volume (max-width: 900px) {
        .dashboard-volume-analytics-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .dashboard-volume-kpi-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: ${token.marginSM}px;
        align-items: stretch;
        min-width: 0;
        position: relative;
        z-index: 1;
      }

      /* ── Shared metric tiles / tables ── */
      .dashboard-section-stack {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      .dashboard-metric-grid {
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        gap: ${token.marginSM}px;
        width: 100%;
      }
      .dashboard-metric-grid--2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: ${token.marginMD}px;
        align-items: stretch;
      }
      .dashboard-metric-tile {
        background: ${token.colorFillAlter};
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingSM}px ${token.paddingSM}px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        min-height: 132px;
        box-shadow: none;
      }
      .dashboard-metric-tile--center {
        align-items: center;
        text-align: center;
        justify-content: center;
        min-height: 96px;
      }
      .dashboard-metric-tile--tone-primary {
        background: ${token.colorPrimaryBg};
        border-color: ${token.colorPrimaryBorder};
      }
      .dashboard-metric-tile--tone-primary .dashboard-metric-tile__value {
        color: ${token.colorPrimary} !important;
      }
      .dashboard-metric-tile--tone-error {
        background: ${token.colorErrorBg};
        border-color: ${token.colorErrorBorder};
      }
      .dashboard-metric-tile--tone-error .dashboard-metric-tile__value {
        color: ${token.colorError} !important;
      }
        .dashboard-ongoing-count{
        background-color: ${token.colorError};
        color: ${token.colorWhite};
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border-radius: ${token.borderRadiusSM}px;
      margin-left: ${token.marginXXS}px;
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        line-height: ${token.lineHeight};
        }
      .dashboard-metric-tile--tone-warning {
        background: ${token.colorWarningBg};
        border-color: ${token.colorWarningBorder};
      }
      .dashboard-metric-tile--tone-warning .dashboard-metric-tile__value {
        color: ${token.colorWarning} !important;
      }
      .dashboard-metric-tile--tone-sandy-brown {
        background: ${sandyBrownBg};
        border-color: ${sandyBrownBorder};
      }
      .dashboard-metric-tile--tone-sandy-brown .dashboard-metric-tile__value {
        color: ${sandyBrown} !important;
      }
      .dashboard-metric-tile--tone-charcoal-blue {
        background: ${charcoalBlueBg};
        border-color: ${charcoalBlueBorder};
      }
      .dashboard-metric-tile--tone-charcoal-blue .dashboard-metric-tile__value {
        color: ${charcoalBlue} !important;
      }
      .dashboard-metric-tile--tone-verdigris {
        background: ${verdigrisBg};
        border-color: ${verdigrisBorder};
      }
      .dashboard-metric-tile--tone-verdigris .dashboard-metric-tile__value {
        color: ${verdigris} !important;
      }
      .dashboard-metric-tile--tone-tuscan-sun {
        background: ${tuscanSunBg};
        border-color: ${tuscanSunBorder};
      }
      .dashboard-metric-tile--tone-tuscan-sun .dashboard-metric-tile__value {
        color: ${tuscanSun} !important;
      }
      .dashboard-metric-tile--tone-burnt-peach {
        background: ${burntPeachBg};
        border-color: ${burntPeachBorder};
      }
      .dashboard-metric-tile--tone-burnt-peach .dashboard-metric-tile__value {
        color: ${burntPeach} !important;
      }
      .dashboard-metric-tile__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .dashboard-metric-tile__period {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextTertiary};
        display: block;
        margin-bottom: ${token.marginXS}px;
      }
      .dashboard-metric-tile__value-row {
        display: flex;
        align-items: baseline;
        gap: ${token.marginXXS}px;
      }
      .dashboard-metric-tile__value {
        margin: 0 !important;
        line-height: 1 !important;
        font-weight: 800 !important;
        color: ${token.colorText} !important;
      }
      .dashboard-metric-tile__unit {
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .dashboard-metric-tile__delta {
        margin-top: ${token.marginXS}px;
        margin-bottom: ${token.marginXS}px;
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .dashboard-delta-badge {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        border-radius: ${token.borderRadiusSM}px;
        padding: 1px 5px;
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }
      .dashboard-delta-badge--up {
        color: ${token.colorSuccess};
        background: ${tokenMix(token.colorSuccess, 12)};
      }
      .dashboard-delta-badge--down {
        color: ${token.colorError};
        background: ${token.colorErrorBg};
      }
      .dashboard-sparkline {
        width: 100%;
        height: 32px;
      }
      .dashboard-trend-wrap {
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadiusLG}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        width: 100%;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        isolation: isolate;
        display: flex;
        flex-direction: column;
        box-shadow: none;
      }
      .dashboard-trend-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginSM}px;
        gap: ${token.marginSM}px;
        flex-shrink: 0;
        min-width: 0;
      }
      .dashboard-trend-chart {
        position: relative;
        width: 100%;
        max-width: 100%;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 180px;
        overflow: hidden;
      }
      .dashboard-select-sm {
        width: 100px;
      }

      .dashboard-table-wrap {
        width: 100%;
        overflow-x: auto;
      }
      .dashboard-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        font-size: ${token.fontSizeSM}px;
      }
      .dashboard-table th {
        padding: ${token.paddingXXS}px ${token.paddingXS}px;
        color: ${token.colorTextSecondary};
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        white-space: nowrap;
        text-align: left;
      }
      .dashboard-table th.is-center,
      .dashboard-table td.is-center {
        text-align: center;
      }
      .dashboard-table th.is-right,
      .dashboard-table td.is-right {
        text-align: right;
        font-variant-numeric: tabular-nums;
        padding-inline-end: ${token.paddingSM}px;
      }
      .dashboard-table td {
        padding: ${token.paddingXS}px;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        vertical-align: middle;
      }
      .dashboard-table tr.is-alt {
        background: ${token.colorFillAlter};
      }
      .dashboard-table__rank {
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorPrimary};
      }
      .dashboard-col-rank {
        width: 44px;
      }
      .dashboard-col-numeric {
        width: 72px;
      }
      .dashboard-col-bar {
        width: 28%;
      }
      .dashboard-col-lane,
      .dashboard-col-name {
        width: auto;
      }
      .dashboard-rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: ${token.controlHeightSM * 0.7}px;
        height: ${token.controlHeightSM * 0.7}px;
        padding: 0 ${token.paddingXXS}px;
        border-radius: ${token.borderRadiusSM}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        font-weight: ${token.fontWeightStrong};
        font-size: ${token.fontSizeSM}px;
        font-variant-numeric: tabular-nums;
      }
      .dashboard-volume-bar {
        width: 100%;
        min-width: ${token.controlHeightLG * 2}px;
        max-width: 100%;
      }
      .dashboard-volume-bar .ant-progress {
        margin: 0;
        line-height: 1;
      }
      .dashboard-lane-route {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        max-width: 100%;
      }
      .dashboard-lane-chip-row {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .dashboard-port-chip {
        display: inline-flex;
        align-items: center;
        max-width: 100%;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        color: ${token.colorText};
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.lineHeight};
        white-space: nowrap;
      }
      .dashboard-lane-route--emphasis .dashboard-port-chip--pol {
        background: ${token.colorPrimaryBg};
        border-color: ${token.colorPrimaryBorder};
        color: ${token.colorPrimary};
      }
      .dashboard-lane-route--emphasis .dashboard-port-chip--pod {
        background: ${token.colorInfoBg};
        border-color: ${token.colorInfoBorder};
        color: ${token.colorInfo};
      }
      .dashboard-lane-route--muted .dashboard-port-chip {
        color: ${token.colorTextSecondary};
      }
      .dashboard-last-used {
        border-top: 1px solid ${token.colorBorderSecondary};
        padding-top: ${token.paddingSM}px;
        flex-shrink: 0;
      }
      .dashboard-last-used__head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginSM}px;
      }
      .dashboard-last-used__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: ${token.marginXS}px;
      }
      .dashboard-last-used__card {
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadius}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        box-shadow: none;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .dashboard-last-used__meta {
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
      }
      .dashboard-list-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${token.paddingXS}px 0;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .dashboard-list-row:last-child {
        border-bottom: none;
      }
      .dashboard-opportunity-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }
      .dashboard-subsection-head {
        margin-bottom: ${token.marginXS}px;
      }
      .dashboard-subsection-label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        display: block;
        margin-bottom: 0;
      }
      .dashboard-subsection-hint {
        display: block;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
        margin-top: ${token.marginXXS}px;
      }
      .dashboard-status-pill {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        padding: 0 ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        border: 1px solid transparent;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: ${token.lineHeight};
        white-space: nowrap;
      }
      .dashboard-status-pill--idle {
        background: ${token.colorErrorBg};
        border-color: ${token.colorErrorBorder};
        color: ${token.colorError};
      }
      .dashboard-status-pill--high {
        background: ${token.colorWarningBg};
        border-color: ${token.colorWarningBorder};
        color: ${token.colorWarning};
      }
      .dashboard-status-pill--watch {
        background: ${token.colorInfoBg};
        border-color: ${token.colorInfoBorder};
        color: ${token.colorInfo};
      }
      .dashboard-planning-kpis {
        display: flex;
        flex-wrap: nowrap;
        align-items: stretch;
        gap: 0;
        margin-bottom: ${token.marginMD}px;
        padding: ${token.paddingSM}px 0;
        border-block: 1px solid ${token.colorBorderSecondary};
        background: transparent;
      }
      .dashboard-planning-stat {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: ${token.marginSM}px;
        padding: ${token.paddingXS}px ${token.paddingMD}px;
        border: 0;
        border-right: 1px solid ${token.colorBorderSecondary};
        background: transparent;
        box-shadow: none;
        border-radius: 0;
      }
      .dashboard-planning-stat:first-child {
        padding-inline-start: 0;
      }
      .dashboard-planning-stat:last-child {
        border-right: 0;
        padding-inline-end: 0;
      }
      .dashboard-planning-stat__icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .dashboard-planning-stat__icon--bookings {
        background: ${sandyBrownBg};
        color: ${sandyBrown};
      }
      .dashboard-planning-stat__icon--teus {
        background: ${primaryTint12};
        color: ${token.colorPrimary};
      }
      .dashboard-planning-stat__icon--si {
        background: ${warningTint12};
        color: ${token.colorWarning};
      }
      .dashboard-planning-stat__icon--payment {
        background: ${verdigrisBg};
        color: ${verdigris};
      }
      .dashboard-planning-stat__copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .dashboard-planning-stat__label {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px !important;
        line-height: 1.2 !important;
        color: ${token.colorTextSecondary} !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dashboard-planning-stat__value {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeHeading4}px !important;
        font-weight: 700 !important;
        line-height: 1.1 !important;
        color: ${token.colorTextHeading} !important;
      }
      .dashboard-planning-stat--bookings .dashboard-planning-stat__value {
        color: ${sandyBrown} !important;
      }
      .dashboard-planning-stat--teus .dashboard-planning-stat__value {
        color: ${token.colorPrimary} !important;
      }
      .dashboard-planning-stat--si .dashboard-planning-stat__value {
        color: ${token.colorWarning} !important;
      }
      .dashboard-planning-stat--payment .dashboard-planning-stat__value {
        color: ${verdigris} !important;
      }
      .dashboard-cal-cell {
        width: 26px;
        height: 24px;
        border: 0;
        border-radius: ${token.borderRadiusSM}px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        font-size: ${token.fontSizeSM}px;
        padding: 0;
        background: transparent;
        font: inherit;
        color: inherit;
      }
      /* Modified by Sekar Nagarajan (2026-09-17 22:18) — status dots + friendly tooltips */
      .dashboard-cal-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${token.marginXXS}px;
        width: 100%;
        margin: 0 auto;
        border: 0;
        padding: ${token.paddingXXS}px 0;
        background: transparent;
        font: inherit;
        color: inherit;
      }
      .dashboard-cal-day--clickable {
        cursor: pointer;
        border-radius: ${token.borderRadiusSM}px;
        transition: box-shadow 0.15s ease, transform 0.15s ease;
      }
      .dashboard-cal-day--clickable:hover,
      .dashboard-cal-day--clickable:focus-visible {
        box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
        transform: translateY(-1px);
        outline: none;
      }
      .dashboard-cal-day--clickable:disabled {
        cursor: default;
        transform: none;
        box-shadow: none;
      }
      .dashboard-cal-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-height: 6px;
      }
      .dashboard-cal-status__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .dashboard-cal-status__dot--si {
        background: ${token.colorWarning};
      }
      .dashboard-cal-status__dot--pay {
        background: ${verdigris};
      }
      .dashboard-cal-tip {
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .dashboard-cal-tip__title {
        color: inherit !important;
        font-weight: ${token.fontWeightStrong};
      }
      .dashboard-cal-tip__list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .dashboard-cal-tip__row {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-size: ${token.fontSizeSM}px;
        opacity: 0.92;
      }
      .dashboard-cal-cell--0 {
        color: ${token.colorTextQuaternary};
        background: transparent;
        cursor: default;
      }
      .dashboard-cal-cell--low {
        color: ${token.colorPrimary};
        background: ${primaryTint12};
        font-weight: ${token.fontWeightStrong};
      }
      .dashboard-cal-cell--mid {
        color: ${token.colorPrimary};
        background: ${primaryTint25};
        font-weight: ${token.fontWeightStrong};
      }
      .dashboard-cal-cell--high {
        color: ${token.colorPrimary};
        background: ${primaryTint40};
        font-weight: ${token.fontWeightStrong};
      }
      /* Modified by Sekar Nagarajan (2026-09-07 18:42) — clickable planning day counts */
      .dashboard-cal-cell--clickable {
        cursor: pointer;
      }
      .dashboard-cal-cell--clickable:disabled {
        cursor: default;
      }
      /* Modified by Sekar Nagarajan (2026-09-07 18:49) — tiled planning day drawer header */
      .dashboard-planning-day-drawer__header-wrap.ant-drawer-header {
        padding-block: ${token.paddingMD}px;
      }
      .dashboard-planning-day-drawer__header {
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
        width: 100%;
        min-width: 0;
        padding-right: ${token.paddingLG}px;
      }
      .dashboard-planning-day-drawer__brand {
        display: flex;
        align-items: flex-start;
        gap: ${token.marginSM}px;
        min-width: 0;
      }
      .dashboard-planning-day-drawer__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        flex-shrink: 0;
      }
      .dashboard-planning-day-drawer__brand-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .dashboard-planning-day-drawer__eyebrow {
        display: block;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .dashboard-planning-day-drawer__heading {
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .dashboard-planning-day-drawer__tiles {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: ${token.marginXS}px;
        width: 100%;
      }
      .dashboard-planning-day-tile {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
        min-height: 64px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .dashboard-planning-day-tile--primary {
        background: ${token.colorPrimaryBg};
        border-color: ${token.colorPrimaryBorder};
      }
      .dashboard-planning-day-tile--range {
        grid-column: span 1;
      }
      .dashboard-planning-day-tile__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        line-height: 1.2;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .dashboard-planning-day-tile__value {
        font-size: ${token.fontSizeLG}px;
        font-weight: 800;
        color: ${token.colorText};
        line-height: 1.15;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
      .dashboard-planning-day-tile__value--sm {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
      }
      .dashboard-planning-day-tile--primary .dashboard-planning-day-tile__value {
        color: ${token.colorPrimary};
      }
      .dashboard-planning-day-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: ${token.marginSM}px;
      }
      .dashboard-planning-day-list__item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .dashboard-planning-day-list__copy {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: ${token.marginXXS}px;
      }
      .dashboard-planning-day-list__no {
        font-size: ${token.fontSize}px;
      }
      .dashboard-planning-day-list__route {
        font-size: ${token.fontSizeSM}px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dashboard-planning-day-list__tags {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        flex-wrap: wrap;
      }
      /* Modified by Sekar Nagarajan (2026-09-17 22:40) — cues top-right with View */
      .dashboard-planning-day-drawer__summary {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginXS}px;
        margin-top: ${token.marginXXS}px;
      }
      .dashboard-planning-day-list__item--attention {
       
      }
      .dashboard-planning-day-list__aside {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: ${token.marginXS}px;
        flex-shrink: 0;
        max-width: 48%;
      }
      .dashboard-planning-day-cues {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: ${token.marginXXS}px;
      }
      .dashboard-planning-day-cue {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: ${token.marginXXS}px;
        padding: ${token.paddingXXS}px ${token.paddingXS}px;
        border-radius: ${token.borderRadiusSM}px;
        font-size: ${token.fontSizeSM}px;
        line-height: 1.3;
        text-align: right;
        white-space: nowrap;
      }
      .dashboard-planning-day-cue--si {
        color: ${token.colorWarning};
        background: ${token.colorWarningBg};
      }
      .dashboard-planning-day-cue--pay {
        color: ${verdigris};
        background: ${tokenMix(verdigris, 12)};
      }
      @media (max-width: 575px) {
        .dashboard-planning-day-drawer__tiles {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .dashboard-planning-day-tile--range {
          grid-column: span 2;
        }
      }
      .dashboard-legend {
        display: flex;
        flex-wrap: wrap;
        gap: ${token.marginMD}px;
        margin-top: ${token.marginSM}px;
      }
      .dashboard-legend__item {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXS}px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
      }
      .dashboard-legend__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .dashboard-legend__dot--primary { background: ${token.colorPrimary}; }
      .dashboard-legend__dot--error { background: ${token.colorError}; }
      .dashboard-legend__dot--verdigris { background: ${verdigris}; }
      .dashboard-legend__dot--warning { background: ${token.colorWarning}; }
      .dashboard-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .dashboard-dot--primary { background: ${token.colorPrimary}; }
      .dashboard-dot--success { background: ${token.colorSuccess}; }
      .dashboard-dot--warning { background: ${token.colorWarning}; }
      .dashboard-dot--error { background: ${token.colorError}; }
      .dashboard-dot--info { background: ${token.colorInfo}; }
      .dashboard-dot--purple { background: ${token.purple}; }
      .dashboard-dot--neutral { background: ${token.colorTextQuaternary}; }
      .dashboard-donut {
        width: 100%;
        height: ${token.controlHeightLG * 5}px;
      }
      .dashboard-name-cell {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }
      .dashboard-name-cell__text {
        display: block;
        min-width: 0;
        max-width: 100%;
      }

      .dashboard-twin-sections {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      @media (max-width: 1399px) {
        .dashboard-kpi-overview {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
      @media (max-width: 1199px) {
        .dashboard-kpi-overview {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .dashboard-metric-grid--2 {
          grid-template-columns: 1fr;
        }
        .dashboard-planning-kpis {
          flex-wrap: wrap;
          row-gap: ${token.marginSM}px;
        }
        .dashboard-planning-stat {
          flex: 1 1 45%;
          border-right: 0;
          padding-inline: 0;
        }
        .dashboard-planning-stat:nth-child(odd) {
          padding-inline-end: ${token.paddingSM}px;
          border-right: 1px solid ${token.colorBorderSecondary};
        }
        .dashboard-planning-stat:nth-child(-n + 2) {
          padding-bottom: ${token.paddingSM}px;
          border-bottom: 1px solid ${token.colorBorderSecondary};
        }
        .dashboard-equal-row.dashboard-intelligence-row {
          grid-template-columns: minmax(0, 1fr);
        }
        .dashboard-intelligence-layout {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      @media (max-width: 767px) {
        .dashboard-kpi-overview {
          grid-template-columns: 1fr;
        }
        .dashboard-last-used__grid {
          grid-template-columns: 1fr;
        }
        .dashboard-planning-kpis {
          flex-direction: column;
        }
        .dashboard-planning-stat,
        .dashboard-planning-stat:nth-child(odd),
        .dashboard-planning-stat:nth-child(-n + 2) {
          flex: 1 1 auto;
          width: 100%;
          border-right: 0;
          border-bottom: 1px solid ${token.colorBorderSecondary};
          padding: ${token.paddingXS}px 0;
        }
        .dashboard-planning-stat:last-child {
          border-bottom: 0;
        }
        .dashboard-col-bar {
          width: 22%;
        }
        .dashboard-col-numeric {
          width: 64px;
        }
      }
    `}</style>
  );
}
