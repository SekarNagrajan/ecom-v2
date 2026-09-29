// Modified by Sekar Nagarajan (2026-09-17 22:18)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tooltip, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavBookingIcon } from "../../../components/icons";
import type {
  CalendarDayCell,
  CalendarWeek,
  CalendarWeekday,
  PlanningDaySelection,
  PlanningKpi,
} from "../mocks/dashboard.mock";

const { Text } = Typography;

const DAY_KEYS: CalendarWeekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
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

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

function bookingCountLabel(count: number, t: TranslateFn): string {
  return count === 1
    ? t("planning.bookingOne")
    : t("planning.bookingMany", { count });
}

function dayAriaLabel(cell: CalendarDayCell, t: TranslateFn): string {
  if (cell.count <= 0) return t("planning.emptyDay");
  const parts = [bookingCountLabel(cell.count, t)];
  if (cell.missingSI > 0) {
    parts.push(
      cell.missingSI === 1
        ? t("planning.pendingSiOne")
        : t("planning.pendingSiMany", { count: cell.missingSI }),
    );
  }
  if (cell.pendingPayment > 0) {
    parts.push(
      cell.pendingPayment === 1
        ? t("planning.paymentOne")
        : t("planning.paymentMany", { count: cell.pendingPayment }),
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
  t,
}: {
  cell: Pick<CalendarDayCell, "count" | "missingSI" | "pendingPayment">;
  isTotal?: boolean;
  t: TranslateFn;
}): ReactNode {
  if (cell.count <= 0) return t("planning.emptyDayTooltip");
  return (
    <div className="dashboard-cal-tip">
      <Text className="dashboard-cal-tip__title">
        {isTotal ? t("planning.weekTotal") : bookingCountLabel(cell.count, t)}
        {!isTotal && cell.count > 0 ? t("planning.clickToView") : null}
      </Text>
      {(cell.missingSI > 0 || cell.pendingPayment > 0) && (
        <ul className="dashboard-cal-tip__list">
          {cell.missingSI > 0 ? (
            <li className="dashboard-cal-tip__row">
              <span className="dashboard-cal-status__dot dashboard-cal-status__dot--si" />
              <span>{t("planning.needSi", { count: cell.missingSI })}</span>
            </li>
          ) : null}
          {cell.pendingPayment > 0 ? (
            <li className="dashboard-cal-tip__row">
              <span className="dashboard-cal-status__dot dashboard-cal-status__dot--pay" />
              <span>
                {t("planning.paymentPendingCount", {
                  count: cell.pendingPayment,
                })}
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
  const { t } = useTranslation(["dashboard", "common", "modules"]);

  const days = useMemo(
    () =>
      DAY_KEYS.map((key) => ({
        key,
        label: t(`planning.days.${key}`),
      })),
    [t],
  );

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
          {t("planning.title")}
        </Text>
      }
      extra={
        <Tooltip title={t("planning.viewAllTooltip")}>
          <AppButton type="link" size="small" onClick={onViewAll}>
            {t("actions.viewAll")}
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-planning-kpis" role="list">
        <PlanningStat
          label={t("planning.bookingsNext7Days")}
          value={kpis.bookingsNext7Days}
          icon={NavBookingIcon}
          tone="bookings"
        />
        <PlanningStat
          label={t("planning.teus")}
          value={kpis.feusNext7Days}
          icon={Icons.packageCheck}
          tone="teus"
        />
        <PlanningStat
          label={t("kpi.siPending")}
          value={kpis.missingSI}
          icon={Icons.fileText}
          tone="si"
        />
        <PlanningStat
          label={t("kpi.paymentPending")}
          value={kpis.atRisk}
          icon={Icons.creditCard}
          tone="payment"
        />
      </div>

      <div className="dashboard-table-wrap custom-scroll">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>{t("planning.week")}</th>
              {days.map((d) => (
                <th key={d.key} className="is-center">
                  {d.label}
                </th>
              ))}
              <th className="is-center">{t("planning.total")}</th>
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
                {days.map(({ key, label }) => {
                  const cell = week.days[key];
                  const clickable = cell.count > 0;
                  return (
                    <td key={key} className="is-center">
                      <Tooltip title={<DayTooltipBody cell={cell} t={t} />}>
                        <button
                          type="button"
                          className={[
                            "dashboard-cal-day",
                            clickable ? "dashboard-cal-day--clickable" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          disabled={!clickable}
                          aria-label={t("planning.dayAria", {
                            day: label,
                            week: week.week,
                            summary: dayAriaLabel(cell, t),
                          })}
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
                        t={t}
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
            {t("planning.legendBookings")}
          </span>
          <span className="dashboard-legend__item">
            <span className="dashboard-legend__dot dashboard-legend__dot--warning" />
            {t("planning.legendPendingSi")}
          </span>
          <span className="dashboard-legend__item">
            <span className="dashboard-legend__dot dashboard-legend__dot--verdigris" />
            {t("kpi.paymentPending")}
          </span>
        </div>
      </div>
    </Card>
  );
}
