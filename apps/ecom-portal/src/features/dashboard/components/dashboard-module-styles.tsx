// Modified by Sekar Nagarajan (2026-08-25 18:15)
import { theme } from "antd";
import { tokenMix } from "../../theme/utils/token-mix";

/** Token-backed dashboard layout classes (agenct.md) — shared by all dashboard sections. */
export function DashboardModuleStyles() {
  const { token } = theme.useToken();
  const primaryTint12 = tokenMix(token.colorPrimary, 12);
  const primaryTint25 = tokenMix(token.colorPrimary, 25);
  const primaryTint40 = tokenMix(token.colorPrimary, 40);

  return (
    <style>{`
      /* ── KPI filter cards ── */
      .dashboard-kpi-row {
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        gap: ${token.marginMD}px;
        margin-bottom: ${token.marginLG}px;
      }
      .dashboard-kpi-col {
        flex: 1 1 calc((100% - ${token.marginMD * 6}px) / 7);
        min-width: 132px;
        display: flex;
      }
      .dashboard-kpi-card.ant-card,
      .dashboard-panel.ant-card {
        width: 100%;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorBgContainer};
        box-shadow: none !important;
      }
      .dashboard-kpi-card.ant-card {
        height: 100%;
        cursor: pointer;
        transition: border-color 0.2s ease, background 0.2s ease;
        display: flex;
        flex-direction: column;
      }
      .dashboard-kpi-card.ant-card:hover,
      .dashboard-kpi-card.ant-card:focus,
      .dashboard-kpi-card.dashboard-kpi-card--active,
      .dashboard-panel.ant-card:hover {
        box-shadow: none !important;
      }
      .dashboard-kpi-card .ant-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 118px;
        padding: ${token.paddingMD}px ${token.paddingMD + 2}px;
      }
      .dashboard-kpi-card--tone-primary.dashboard-kpi-card--active {
        border-color: ${token.colorPrimary};
        background: ${token.colorPrimaryBg};
      }
      .dashboard-kpi-card--tone-success.dashboard-kpi-card--active {
        border-color: ${token.colorSuccess};
        background: ${token.colorSuccessBg};
      }
      .dashboard-kpi-card--tone-warning.dashboard-kpi-card--active {
        border-color: ${token.colorWarning};
        background: ${token.colorWarningBg};
      }
      .dashboard-kpi-card--tone-error.dashboard-kpi-card--active {
        border-color: ${token.colorError};
        background: ${token.colorErrorBg};
      }
      .dashboard-kpi-card--tone-purple.dashboard-kpi-card--active {
        border-color: ${token.purple};
        background: ${token.colorFillSecondary};
      }
      .dashboard-kpi-card--tone-info.dashboard-kpi-card--active {
        border-color: ${token.colorInfo};
        background: ${token.colorInfoBg};
      }
      .dashboard-kpi-card__icon--primary {
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
      }
      .dashboard-kpi-card__icon--success {
        background: ${token.colorSuccessBg};
        color: ${token.colorSuccess};
      }
      .dashboard-kpi-card__icon--warning {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .dashboard-kpi-card__icon--error {
        background: ${token.colorErrorBg};
        color: ${token.colorError};
      }
      .dashboard-kpi-card__icon--purple {
        background: ${token.colorFillSecondary};
        color: ${token.purple};
      }
      .dashboard-kpi-card__icon--info {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .dashboard-kpi-card__stat--primary .ant-statistic-content {
        color: ${token.colorPrimary} !important;
      }
      .dashboard-kpi-card__stat--success .ant-statistic-content {
        color: ${token.colorSuccess} !important;
      }
      .dashboard-kpi-card__stat--warning .ant-statistic-content {
        color: ${token.colorWarning} !important;
      }
      .dashboard-kpi-card__stat--error .ant-statistic-content {
        color: ${token.colorError} !important;
      }
      .dashboard-kpi-card__stat--purple .ant-statistic-content {
        color: ${token.purple} !important;
      }
      .dashboard-kpi-card__stat--info .ant-statistic-content {
        color: ${token.colorInfo} !important;
      }
      .dashboard-kpi-card__stat .ant-statistic-content-value {
        font-size: 26px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1;
      }
      .dashboard-panel .ant-card-body {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
      }
      .dashboard-panel__title {
        font-size: ${token.fontSize}px;
        font-weight: ${token.fontWeightStrong};
      }
      .dashboard-kpi-card__head {
        display: flex;
        align-items: center;
        gap: ${token.marginXS}px;
        margin-bottom: ${token.marginSM}px;
        min-height: 36px;
      }
      .dashboard-kpi-card__icon {
        width: 36px;
        height: 36px;
        border-radius: ${token.borderRadius}px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .dashboard-kpi-card__label {
        font-size: ${token.fontSizeSM}px;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
      }
      .dashboard-kpi-card__value {
        flex: 1;
        display: flex;
        align-items: flex-end;
      }
      .dashboard-kpi-card__sub {
        font-size: ${token.fontSizeSM}px;
        margin-top: ${token.marginXXS}px;
        display: block;
        font-weight: ${token.fontWeightStrong};
        line-height: 1.3;
        min-height: 1.3em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dashboard-kpi-card__sub--empty {
        visibility: hidden;
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
      .dashboard-volume-kpi-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: ${token.marginSM}px;
        align-items: stretch;
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
        background: ${token.colorSuccessBg};
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
        height: 100%;
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
      }
      .dashboard-trend-chart {
        width: 100%;
        flex: 1;
        min-height: 180px;
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
        border-radius: ${token.borderRadiusSM}px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        font-size: ${token.fontSizeSM}px;
      }
      .dashboard-cal-cell--0 {
        color: ${token.colorTextQuaternary};
        background: transparent;
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
      .dashboard-dot--success { background: ${token.colorSuccess}; }
      .dashboard-dot--warning { background: ${token.colorWarning}; }
      .dashboard-dot--error { background: ${token.colorError}; }
      .dashboard-dot--info { background: ${token.colorInfo}; }
      .dashboard-dot--purple { background: ${token.purple}; }
      .dashboard-dot--neutral { background: ${token.colorTextQuaternary}; }
      .dashboard-donut {
        width: 100%;
        height: 180px;
      }
      .dashboard-name-cell {
        display: flex;
        align-items: center;
        gap: ${token.marginXXS}px;
        min-width: 0;
      }

      @media (max-width: 1199px) {
        .dashboard-kpi-col {
          flex: 1 1 calc((100% - ${token.marginMD * 3}px) / 4);
        }
        .dashboard-metric-grid--2 {
          grid-template-columns: 1fr;
        }
        .dashboard-planning-kpis {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 767px) {
        .dashboard-kpi-col {
          flex: 1 1 calc((100% - ${token.marginMD}px) / 2);
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
