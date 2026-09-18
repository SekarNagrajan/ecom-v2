// Modified by Sekar Nagarajan (2026-09-17 22:18)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tooltip, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon, Icons, NavBookingIcon } from "../../../components/icons";
import type {
  CalendarDayCell,
  CalendarWeek,
  CalendarWeekday,
  PlanningDaySelection,
  PlanningKpi,
} from "../mocks/dashboard.mock";

const { Text } = Typography;

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

function dayAriaLabel(cell: CalendarDayCell): string {
  if (cell.count <= 0) return "No bookings";
  const parts = [bookingCountLabel(cell.count)];
  if (cell.missingSI > 0) {
    parts.push(
      `${cell.missingSI} pending shipping instruction${cell.missingSI === 1 ? "" : "s"}`,
    );
  }
  if (cell.pendingPayment > 0) {
    parts.push(
      `${cell.pendingPayment} payment${cell.pendingPayment === 1 ? "" : "s"} pending`,
    );
  }
  return parts.join(", ");
}

/** Compact status dots under the day count — details live in the tooltip. */
function DayStatusDots({
  missingSI,
  pendingPayment,
}: {
  missingSI: number;
  pendingPayment: number;
}) {
  if (missingSI <= 0 && pendingPayment <= 0) {
    return <span className="dashboard-cal-status" aria-hidden />;
  }
  return (
    <span className="dashboard-cal-status" aria-hidden>
      {missingSI > 0 ? (
        <span className="dashboard-cal-status__dot dashboard-cal-status__dot--si" />
      ) : null}
      {pendingPayment > 0 ? (
        <span className="dashboard-cal-status__dot dashboard-cal-status__dot--pay" />
      ) : null}
    </span>
  );
}

function DayTooltipBody({
  cell,
  isTotal = false,
}: {
  cell: Pick<CalendarDayCell, "count" | "missingSI" | "pendingPayment">;
  isTotal?: boolean;
}): ReactNode {
  if (cell.count <= 0) return "No bookings this day";
  return (
    <div className="dashboard-cal-tip">
      <Text className="dashboard-cal-tip__title">
        {isTotal ? "Week total" : bookingCountLabel(cell.count)}
        {!isTotal && cell.count > 0 ? " — click to view" : null}
      </Text>
      {(cell.missingSI > 0 || cell.pendingPayment > 0) && (
        <ul className="dashboard-cal-tip__list">
          {cell.missingSI > 0 ? (
            <li className="dashboard-cal-tip__row">
              <span className="dashboard-cal-status__dot dashboard-cal-status__dot--si" />
              <span>
                {cell.missingSI} need shipping instruction
              </span>
            </li>
          ) : null}
          {cell.pendingPayment > 0 ? (
            <li className="dashboard-cal-tip__row">
              <span className="dashboard-cal-status__dot dashboard-cal-status__dot--pay" />
              <span>
                {cell.pendingPayment} payment pending
              </span>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

type PlanningStatTone = "bookings" | "teus" | "si" | "payment";

interface PlanningStatProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: PlanningStatTone;
}

/** Inline planning stat — strip layout, not a bordered summary card. */
function PlanningStat({ label, value, icon, tone }: PlanningStatProps) {
  return (
    <div className={`dashboard-planning-stat dashboard-planning-stat--${tone}`}>
      <span
        className={`dashboard-planning-stat__icon dashboard-planning-stat__icon--${tone} app-icon-inherit`}
      >
        <AppIcon icon={icon} size={15} />
      </span>
      <div className="dashboard-planning-stat__copy">
        <Text className="dashboard-planning-stat__label">{label}</Text>
        <Text className="dashboard-planning-stat__value">{value}</Text>
      </div>
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
      <div className="dashboard-planning-kpis" role="list">
        <PlanningStat
          label="Bookings (Next 7 Days)"
          value={kpis.bookingsNext7Days}
          icon={NavBookingIcon}
          tone="bookings"
        />
        <PlanningStat
          label="TEUs"
          value={kpis.feusNext7Days}
          icon={Icons.packageCheck}
          tone="teus"
        />
        <PlanningStat
          label="SI Pending"
          value={kpis.missingSI}
          icon={Icons.fileText}
          tone="si"
        />
        <PlanningStat
          label="Payment Pending"
          value={kpis.atRisk}
          icon={Icons.creditCard}
          tone="payment"
        />
      </div>

      {/* <Text className="dashboard-subsection-label">
        Upcoming Bookings Calendar (May / Jun 2025)
      </Text> */}

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
                      <Tooltip title={<DayTooltipBody cell={cell} />}>
                        <button
                          type="button"
                          className={[
                            "dashboard-cal-day",
                            clickable ? "dashboard-cal-day--clickable" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          disabled={!clickable}
                          aria-label={`${label} ${week.week}: ${dayAriaLabel(cell)}`}
                          onClick={() =>
                            handleDayActivate(week, key, label, cell)
                          }
                        >
                          <span className={calCellClass(cell.count, clickable)}>
                            {cell.count || "—"}
                          </span>
                          <DayStatusDots
                            missingSI={cell.missingSI}
                            pendingPayment={cell.pendingPayment}
                          />
                        </button>
                      </Tooltip>
                    </td>
                  );
                })}
                <td className="is-center dashboard-table__rank">
                  <Tooltip
                    title={
                      <DayTooltipBody
                        isTotal
                        cell={{
                          count: week.days.total,
                          missingSI: week.days.totalMissingSI,
                          pendingPayment: week.days.totalPendingPayment,
                        }}
                      />
                    }
                  >
                    <div className="dashboard-cal-day">
                      <span className="dashboard-cal-cell dashboard-cal-cell--mid">
                        {week.days.total}
                      </span>
                      <DayStatusDots
                        missingSI={week.days.totalMissingSI}
                        pendingPayment={week.days.totalPendingPayment}
                      />
                    </div>
                  </Tooltip>
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
            <span className="dashboard-legend__dot dashboard-legend__dot--warning" />
            Pending SI
          </span>
          <span className="dashboard-legend__item">
            <span className="dashboard-legend__dot dashboard-legend__dot--verdigris" />
            Payment Pending
          </span>
        </div>
      </div>
    </Card>
  );
}
