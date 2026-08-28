// Modified by Sekar Nagarajan (2026-08-25 18:20)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tooltip, Typography } from "antd";

import type { CalendarWeek, PlanningKpi } from "../mocks/dashboard.mock";

const { Text, Title } = Typography;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function calCellClass(count: number): string {
  if (count === 0) return "dashboard-cal-cell dashboard-cal-cell--0";
  if (count <= 2) return "dashboard-cal-cell dashboard-cal-cell--low";
  if (count <= 4) return "dashboard-cal-cell dashboard-cal-cell--mid";
  return "dashboard-cal-cell dashboard-cal-cell--high";
}

interface PlanningKpiTileProps {
  label: string;
  value: number;
  tone?: "default" | "primary" | "error" | "warning";
}

function PlanningKpiTile({
  label,
  value,
  tone = "default",
}: PlanningKpiTileProps) {
  return (
    <div
      className={`dashboard-metric-tile dashboard-metric-tile--center dashboard-metric-tile--tone-${tone}`}
    >
      <Text ellipsis className="dashboard-metric-tile__label">
        {label}
      </Text>
      <Title level={3} className="dashboard-metric-tile__value">
        {value}
      </Title>
    </div>
  );
}

interface ShipmentPlanningProps {
  kpis: PlanningKpi;
  calendar: CalendarWeek[];
}

export function ShipmentPlanningSection({
  kpis,
  calendar,
}: ShipmentPlanningProps) {
  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          Upcoming Shipment Planning
        </Text>
      }
      extra={
        <Tooltip title="View All Upcoming Bookings">
          <AppButton type="link" size="small">
            View All
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-planning-kpis">
        <PlanningKpiTile
          label="Bookings (Next 7 Days)"
          value={kpis.bookingsNext7Days}
        />
        <PlanningKpiTile
          label="FEUs"
          value={kpis.feusNext7Days}
          tone="primary"
        />
        <PlanningKpiTile
          label="Missing SI"
          value={kpis.missingSI}
          tone="error"
        />
        <PlanningKpiTile label="At Risk" value={kpis.atRisk} tone="warning" />
      </div>

      <Text className="dashboard-subsection-label">
        Upcoming Bookings Calendar (May / Jun 2025)
      </Text>

      <div className="dashboard-table-wrap custom-scroll">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Week</th>
              {DAYS.map((d) => (
                <th key={d} className="is-center">
                  {d}
                </th>
              ))}
              <th className="is-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((week, idx) => (
              <tr
                key={week.week}
                className={idx % 2 === 1 ? "is-alt" : undefined}
              >
                <td>
                  <Text strong>{week.week}</Text>
                  <Text
                    type="secondary"
                    className="dashboard-metric-tile__period"
                  >
                    {week.dateRange}
                  </Text>
                </td>
                {(Object.entries(week.days) as [string, number][])
                  .filter(([k]) => k !== "total")
                  .map(([day, count]) => (
                    <td key={day} className="is-center">
                      <Tooltip title={`${count} booking(s)`}>
                        <div className={calCellClass(count)}>{count || ""}</div>
                      </Tooltip>
                    </td>
                  ))}
                <td className="is-center dashboard-table__rank">
                  {week.days.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="dashboard-legend">
          <span className="dashboard-legend__item">
            <span className="dashboard-legend__dot dashboard-legend__dot--primary" />
            Bookings
          </span>
          <span className="dashboard-legend__item">
            <span className="dashboard-legend__dot dashboard-legend__dot--error" />
            Missing SI
          </span>
          <span className="dashboard-legend__item">
            <span className="dashboard-legend__dot dashboard-legend__dot--warning" />
            At Risk
          </span>
        </div>
      </div>
    </Card>
  );
}
