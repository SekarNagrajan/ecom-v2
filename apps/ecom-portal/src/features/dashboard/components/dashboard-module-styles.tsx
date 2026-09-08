// Modified by Sekar Nagarajan (2026-09-08 12:36)
import { theme } from "antd";
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

  return (
    <style>{`
      /* ── KPI overview (Total + Progress + Action) — compact ── */
      .dashboard-kpi-overview {
        display: grid;
        grid-template-columns: minmax(180px, 0.85fr) minmax(0, 2.5fr) minmax(220px, 1.05fr);
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginSM}px;
        align-items: stretch;
      }
      .dashboard-kpi-total.ant-card,
      .dashboard-kpi-progress.ant-card,
      .dashboard-kpi-action.ant-card,
      .dashboard-panel.ant-card {
        width: 100%;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
      }
      .dashboard-panel.ant-card {
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
      .dashboard-kpi-total.ant-card,
      .dashboard-kpi-progress.ant-card,
      .dashboard-kpi-action.ant-card,
      .dashboard-panel.ant-card:hover {
        box-shadow: none !important;
      }
      .dashboard-kpi-total.ant-card {
        position: relative;
        overflow: hidden;
        height: 100%;
        cursor: pointer;
        border-color: ${tokenMix(token.colorSuccess, 40)};
        background: ${tokenMix(token.colorSuccess, 5)};
      }
      .dashboard-kpi-total.ant-card:hover {
    
      }
      .dashboard-kpi-total .ant-card-body {
        height: 100%;
        padding: 0;
      }
      .dashboard-kpi-total__accent {
        position: absolute;
        left: 0;
        top: ${token.paddingXS}px;
        bottom: ${token.paddingXS}px;
       
        border-radius: 0 ${token.borderRadiusSM}px ${token.borderRadiusSM}px 0;
        background: ${tokenMix(token.colorPrimary, 5)};
      }
      .dashboard-kpi-total__body {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        padding: ${token.paddingSM + 2}px ${token.paddingMD}px ${
      token.paddingSM + 2
    }px ${token.paddingMD + 2}px;
        gap: ${token.marginXXS}px;
      }
      .dashboard-kpi-total__head {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin-bottom: ${token.marginXXS}px;
      }
      .dashboard-kpi-total__icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${tokenMix(token.colorSuccess, 5)};
        color: ${token.colorSuccess};
        flex-shrink: 0;
      }
      .dashboard-kpi-total__eyebrow {
        display: block;
           font-size: ${token.fontSize}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        line-height: 1.25 !important;
 
        text-transform: none;
        color: ${token.colorText} !important;

      }
      .dashboard-kpi-total__metric {
        margin: 0 !important;
        font-weight: 800 !important;
        line-height: 1 !important;
        font-size: 32px !important;
        color: ${token.colorSuccess} !important;
      }
      .dashboard-kpi-total__subtitle {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .dashboard-kpi-total__link {
        margin-top: auto;
        padding: ${token.paddingXXS}px 0 0;
        border: 0;
        background: transparent;
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        font: inherit;
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorSuccess};
        cursor: pointer;
      }
      .dashboard-kpi-total__link-arrow {
        display: inline-flex;
      }

      .dashboard-kpi-progress.ant-card {
        height: 100%;
        border-color: ${tokenMix(token.colorPrimary, 40)};
        background: ${tokenMix(token.colorPrimary, 5)};
      }
      .dashboard-kpi-progress .ant-card-body {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        padding: ${token.paddingMD}px;
        gap: ${token.marginSM}px;
      }
      .dashboard-kpi-progress__header {
        margin: 0;
        padding: 0 0 ${token.paddingXXS}px;
        flex-shrink: 0;
      }
      .dashboard-kpi-progress__title {
        margin: 0 !important;
        font-size: ${token.fontSize}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        line-height: 1.25 !important;
        color: ${token.colorText} !important;
      }
      .dashboard-kpi-progress__subtitle {
        display: block;
        margin-top: 2px;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .dashboard-kpi-progress__grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: ${token.marginXS}px;
        flex: 1;
        min-height: 0;
        align-items: stretch;
        margin: 0;
        padding: 0;
      }
      .dashboard-kpi-progress__cell {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: ${token.marginXXS}px;
        min-width: 0;
        height: 100%;
        margin: 0;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border: 0;
        border-right: 1px solid ${tokenMix(token.colorPrimary, 25)};
        border-radius: 0;
        background: transparent;
        text-align: left;
        font: inherit;
        cursor: pointer;
      }
      .dashboard-kpi-progress__cell:last-child {
        border-right: 0;
      }
      .dashboard-kpi-progress__cell:hover,
      .dashboard-kpi-progress__cell:focus,
      .dashboard-kpi-progress__cell:focus-visible,
      .dashboard-kpi-progress__cell--active {
        background: transparent;
        outline: none;
        box-shadow: none;
      }
      .dashboard-kpi-progress__icon {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin: 0 0 ${token.marginXXS}px;
      }
      .dashboard-kpi-progress__icon--success {
        background: ${successTint12};
        color: ${token.colorSuccess};
      }
      .dashboard-kpi-progress__icon--purple {
        background: ${purpleTint12};
        color: ${token.purple};
      }
      .dashboard-kpi-progress__icon--info {
        background: ${infoTint12};
        color: ${token.colorInfo};
      }
      .dashboard-kpi-progress__label {
        display: block;
        font-size: ${token.fontSizeSM - 1}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorTextSecondary};
        line-height: 1.2;
      }
      .dashboard-kpi-progress__metric {
        margin: 0 !important;
        font-weight: 800 !important;
        line-height: 1.05 !important;
        font-size: 26px !important;
      }
      .dashboard-kpi-progress__metric--success {
        color: ${token.colorSuccess} !important;
      }
      .dashboard-kpi-progress__metric--purple {
        color: ${token.purple} !important;
      }
      .dashboard-kpi-progress__metric--info {
        color: ${token.colorInfo} !important;
      }
      .dashboard-kpi-progress__trend {
        display: block;
        font-size: ${token.fontSizeSM - 1}px;
        line-height: 1.25;
        margin: 0;
      }
      .dashboard-kpi-progress__trend--up {
        color: ${token.colorSuccess};
      }
      .dashboard-kpi-progress__trend--down {
        color: ${token.colorError};
      }
      .dashboard-kpi-progress__trend--neutral {
        color: ${token.colorTextSecondary};
      }

      .dashboard-kpi-action.ant-card {
        height: 100%;
        border-color: ${tokenMix(token.colorWarning, 40)};
        background: ${tokenMix(token.colorWarning, 5)};
      }
      .dashboard-kpi-action .ant-card-body {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        padding: ${token.paddingSM + 2}px ${token.paddingMD}px;
        gap: ${token.marginXS}px;
      }
      .dashboard-kpi-action__header {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin: 0;
        padding: 0;
        flex-shrink: 0;
      }
      .dashboard-kpi-action__header-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${warningTint12};
        color: ${token.colorWarning};
        flex-shrink: 0;
      }
      .dashboard-kpi-action__header-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .dashboard-kpi-action__title {
        margin: 0 !important;
        font-size: ${token.fontSize}px !important;
        font-weight: ${token.fontWeightStrong} !important;
        line-height: 1.25 !important;
        color: ${token.colorText} !important;
      }
      .dashboard-kpi-action__subtitle {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM}px;
        color: ${token.colorTextSecondary};
        line-height: 1.3;
      }
      .dashboard-kpi-action__list {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        margin: 0;
        padding: 0;
        gap: 0;
        justify-content: center;
      }
      .dashboard-kpi-action__row {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        width: 100%;
        margin: 0;
        padding: ${token.paddingXS}px ${token.paddingXXS}px;
        border: 0;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusSM}px;
        background: transparent;
        text-align: left;
        font: inherit;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .dashboard-kpi-action__row:first-child {
        padding-top: ${token.paddingXXS}px;
      }
      .dashboard-kpi-action__row:last-child {
        border-bottom: 0;
        padding-bottom: ${token.paddingXXS}px;
      }
      .dashboard-kpi-action__row:hover,
      .dashboard-kpi-action__row--active {
        background: ${tokenMix(token.colorWarning, 8)};
      }
      .dashboard-kpi-action__row-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .dashboard-kpi-action__row-icon--warning {
        background: ${warningTint12};
        color: ${token.colorWarning};
      }
      .dashboard-kpi-action__row-icon--error {
        background: ${errorTint12};
        color: ${token.colorError};
      }
      .dashboard-kpi-action__row-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;
        padding-right: ${token.paddingXXS}px;
      }
      .dashboard-kpi-action__row-label {
        display: block;
        margin: 0;
        font-size: ${token.fontSizeSM - 1}px;
        font-weight: ${token.fontWeightStrong};
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: ${token.colorTextSecondary};
        line-height: 1.15;
      }
      .dashboard-kpi-action__row-value {
        margin: 0 !important;
        font-weight: 800 !important;
        line-height: 1.05 !important;
        font-size: 22px !important;
      }
      .dashboard-kpi-action__row-value--warning {
        color: ${token.colorWarning} !important;
      }
      .dashboard-kpi-action__row-value--error {
        color: ${token.colorError} !important;
      }
      .dashboard-kpi-action__row-meta {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        flex-shrink: 0;
        max-width: 48%;
        padding-left: 0;
      }
      .dashboard-kpi-action__row-detail {
        margin: 0;
        font-size: ${token.fontSizeSM - 1}px;
        font-weight: 500;
        color: ${token.colorError};
        text-align: right;
        line-height: 1.2;
      }
      .dashboard-kpi-action__row-chevron {
        display: inline-flex;
        color: ${token.colorTextQuaternary};
        flex-shrink: 0;
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
      .dashboard-metric-tile--tone-warning {
        background: ${token.colorWarningBg};
        border-color: ${token.colorWarningBorder};
      }
      .dashboard-metric-tile--tone-warning .dashboard-metric-tile__value {
        color: ${token.colorWarning} !important;
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
      .dashboard-lane-chip-row {
        display: inline-flex;
        align-items: center;
        gap: ${token.marginXXS}px;
      }
      .dashboard-last-used {
        border-top: 1px solid ${token.colorBorderSecondary};
        padding-top: ${token.paddingSM}px;
      }
      .dashboard-last-used__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${token.marginXS}px;
      }
      .dashboard-last-used__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: ${token.marginXS}px;
      }
      .dashboard-last-used__card {
        background: ${token.colorFillAlter};
        border-radius: ${token.borderRadius}px;
        padding: ${token.paddingXS}px ${token.paddingSM}px;
        border: 1px solid ${token.colorBorderSecondary};
        box-shadow: none;
      }
      .dashboard-list-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${token.paddingXS}px 0;
        border-bottom: 1px solid ${token.colorBorderSecondary};
        gap: ${token.marginSM}px;
      }
      .dashboard-list-row:last-child {
        border-bottom: none;
      }
      .dashboard-subsection-label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorTextSecondary};
        display: block;
        margin-bottom: ${token.marginXS}px;
      }
      .dashboard-planning-kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: ${token.marginSM}px;
        margin-bottom: ${token.marginMD}px;
        align-items: stretch;
      }
      .dashboard-planning-kpis .dashboard-metric-tile {
        min-height: 88px;
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
        transition: box-shadow 0.15s ease, transform 0.15s ease;
      }
      .dashboard-cal-cell--clickable:hover,
      .dashboard-cal-cell--clickable:focus-visible {
        box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
        transform: translateY(-1px);
        outline: none;
      }
      .dashboard-cal-cell--clickable:disabled {
        cursor: default;
        transform: none;
        box-shadow: none;
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
        align-items: center;
        justify-content: space-between;
        gap: ${token.marginMD}px;
        padding: ${token.paddingSM}px ${token.paddingMD}px;
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${token.borderRadiusLG}px;
        background: ${token.colorFillAlter};
      }
      .dashboard-planning-day-list__copy {
        min-width: 0;
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
      .dashboard-legend__dot--warning { background: ${token.colorWarning}; }
      .dashboard-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .dashboard-dot--primary { background: ${token.colorPrimary}; }
      .dashboard-dot--success { background: ${tokenMix(
        token.colorSuccess,
        12,
      )}; }
      .dashboard-dot--warning { background: ${tokenMix(
        token.colorWarning,
        12,
      )}; }
      .dashboard-dot--error { background: ${tokenMix(token.colorError, 12)}; }
      .dashboard-dot--info { background: ${tokenMix(token.colorInfo, 12)}; }
      .dashboard-dot--purple { background: ${tokenMix(token.purple, 12)}; }
      .dashboard-dot--neutral { background: ${tokenMix(
        token.colorTextQuaternary,
        12,
      )}; }
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

      .dashboard-twin-sections {
        display: flex;
        flex-direction: column;
        gap: ${token.marginLG}px;
      }
      @media (max-width: 1199px) {
        .dashboard-kpi-overview {
          grid-template-columns: 1fr 1fr;
        }
        .dashboard-kpi-progress {
          grid-column: 1 / -1;
        }
        .dashboard-kpi-progress__grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: ${token.marginSM}px ${token.marginXS}px;
        }
        .dashboard-kpi-progress__cell {
          border-right: 1px solid ${tokenMix(token.colorPrimary, 25)};
          padding: ${token.paddingXS}px ${token.paddingSM}px;
        }
        .dashboard-kpi-progress__cell:nth-child(2n) {
          border-right: 0;
        }
        .dashboard-kpi-progress__cell:nth-child(-n + 2) {
          border-bottom: 1px solid ${tokenMix(token.colorPrimary, 25)};
          padding-bottom: ${token.paddingSM}px;
        }
        .dashboard-metric-grid--2 {
          grid-template-columns: 1fr;
        }
        .dashboard-planning-kpis {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 767px) {
        .dashboard-kpi-overview {
          grid-template-columns: 1fr;
        }
        .dashboard-kpi-progress {
          grid-column: auto;
        }
        .dashboard-kpi-progress__grid {
          grid-template-columns: 1fr 1fr;
        }
        .dashboard-kpi-action__row-meta {
          max-width: 42%;
        }
        .dashboard-last-used__grid {
          grid-template-columns: 1fr;
        }
        .dashboard-planning-kpis {
          grid-template-columns: 1fr 1fr;
        }
      }
    `}</style>
  );
}
