// Modified by Sekar Nagarajan (2026-09-07 18:42)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tooltip, Typography } from "antd";

import type {
  CalendarDayCell,
  CalendarWeek,
  CalendarWeekday,
  PlanningDaySelection,
  PlanningKpi,
} from "../mocks/dashboard.mock";

const { Text, Title } = Typography;

const DAYS: { key: CalendarWeekday; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

function calCellClass(count: number, clickable: boolean): string {
  const tone =
    count === 0
      ? "dashboard-cal-cell--0"
      : count <= 2
      ? "dashboard-cal-cell--low"
      : count <= 4
      ? "dashboard-cal-cell--mid"
      : "dashboard-cal-cell--high";
  return [
    "dashboard-cal-cell",
    tone,
    clickable ? "dashboard-cal-cell--clickable" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function bookingCountLabel(count: number): string {
  return `${count} ${count === 1 ? "booking" : "bookings"}`;
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
  onDayClick?: (selection: PlanningDaySelection) => void;
  onViewAll?: () => void;
}

export function ShipmentPlanningSection({
  kpis,
  calendar,
  onDayClick,
  onViewAll,
}: ShipmentPlanningProps) {
  const handleDayActivate = (
    week: CalendarWeek,
    day: CalendarWeekday,
    dayLabel: string,
    cell: CalendarDayCell,
  ) => {
    if (cell.count <= 0 || cell.bookings.length === 0) return;
    onDayClick?.({
      week: week.week,
      day,
      dayLabel,
      dateRange: week.dateRange,
      bookings: cell.bookings,
    });
  };

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
          <AppButton type="link" size="small" onClick={onViewAll}>
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
                <th key={d.key} className="is-center">
                  {d.label}
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
                {DAYS.map(({ key, label }) => {
                  const cell = week.days[key];
                  const clickable = cell.count > 0;
                  return (
                    <td key={key} className="is-center">
                      <Tooltip
                        title={
                          clickable
                            ? `${bookingCountLabel(cell.count)} — click to view`
                            : "No bookings"
                        }
                      >
                        <button
                          type="button"
                          className={calCellClass(cell.count, clickable)}
                          disabled={!clickable}
                          aria-label={
                            clickable
                              ? `${label} ${week.week}: ${bookingCountLabel(
                                  cell.count,
                                )}`
                              : `${label} ${week.week}: no bookings`
                          }
                          onClick={() =>
                            handleDayActivate(week, key, label, cell)
                          }
                        >
                          {cell.count || ""}
                        </button>
                      </Tooltip>
                    </td>
                  );
                })}
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
