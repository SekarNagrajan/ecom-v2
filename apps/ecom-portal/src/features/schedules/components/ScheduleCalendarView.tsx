// Modified by Sekar Nagarajan (2026-09-15 14:45)
import { AppButton } from "@solverminds/shared-ui";
import { Segmented, Space, Tag, Tooltip, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { NavVesselIcon } from "../../../components/icons/nav-svg-icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { useResponsiveLayout } from "../../../hooks/use-responsive-layout";
import type { ScheduleItem } from "../types/schedules.types";
import {
  buildAgendaGroups,
  buildMonthMatrix,
  getScheduleAnchorTime,
  getVisibleCalendarEvents,
  groupSchedulesByDate,
  resolveInitialCalendarMonth,
  type ScheduleDateAnchor,
} from "../utils/schedule-calendar";
import {
  formatCutoffValue,
  ScheduleListRoutingCell,
} from "./list/schedule-list-cells";

const { Text, Title } = Typography;

const WEEKDAY_KEYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

interface ScheduleCalendarViewProps {
  schedules: ScheduleItem[];
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}

function eventClassName(
  item: ScheduleItem,
  isActive: boolean,
): string {
  const classes = ["schedule-calendar__event"];
  if (item.isDefaultRoute) {
    classes.push("schedule-calendar__event--recommended");
  } else if (item.isDirect) {
    classes.push("schedule-calendar__event--direct");
  } else {
    classes.push("schedule-calendar__event--transshipment");
  }
  if (isActive) classes.push("schedule-calendar__event--active");
  return classes.join(" ");
}

function ScheduleCalendarActions({
  schedule,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: {
  schedule: ScheduleItem;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}) {
  const { t } = useTranslation(["schedules", "common", "modules"]);

  return (
    <ListActionsRow>
      <ListActionButton
        title={t("actions.bookNow")}
        icon={<AppIcon icon={Icons.plus} size={16} tone="create" />}
        tone="create"
        disabled={!schedule.bookingAllowed}
        onClick={(e) => {
          e.stopPropagation();
          onBookNow(schedule);
        }}
      />
      <ListActionButton
        title={t("actions.getAQuote")}
        icon={<AppIcon icon={Icons.fileText} size={16} tone="navigate" />}
        tone="navigate"
        onClick={(e) => {
          e.stopPropagation();
          onViewRates(schedule);
        }}
      />
      <ListActionButton
        title={t("actions.co2Estimate")}
        icon={<AppIcon icon={Icons.calculator} size={16} tone="track" />}
        tone="track"
        onClick={(e) => {
          e.stopPropagation();
          onOpenCarbonModal(schedule);
        }}
      />
      <ListActionButton
        title={t("actions.vesselDetails")}
        icon={<AppIcon icon={NavVesselIcon} size={16} tone="view" />}
        tone="view"
        onClick={(e) => {
          e.stopPropagation();
          onViewVessel(schedule.vesselCode);
        }}
      />
    </ListActionsRow>
  );
}

function ScheduleDaySailingCard({
  schedule,
  dateAnchor,
  isSelected,
  onSelect,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: {
  schedule: ScheduleItem;
  dateAnchor: ScheduleDateAnchor;
  isSelected: boolean;
  onSelect: () => void;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}) {
  const { t } = useTranslation(["schedules", "common", "modules"]);
  const anchorTime = getScheduleAnchorTime(schedule, dateAnchor);

  return (
    <article
      className={[
        "schedule-calendar-day-card",
        isSelected ? "schedule-calendar-day-card--selected" : undefined,
        schedule.isDefaultRoute
          ? "schedule-calendar-day-card--recommended"
          : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <div className="schedule-calendar-day-card__top">
        <div className="schedule-calendar-day-card__meta">
          <Text strong className="schedule-calendar-day-card__vessel">
            {schedule.vesselName}
          </Text>
          <Text type="secondary" className="schedule-calendar-day-card__voyage">
            {schedule.voyage}
            {schedule.bound} · {anchorTime || "—"}
          </Text>
        </div>
        <Tag className="module-status-tag" color="blue">
          {schedule.serviceCode}
        </Tag>
      </div>

      <div className="schedule-calendar-day-card__route">
        <Text>
          {schedule.polPortId} → {schedule.podPortId}
        </Text>
        <Text type="secondary" className="schedule-calendar-day-card__ports">
          {schedule.polPortName} → {schedule.podPortName}
        </Text>
      </div>

      <div className="schedule-calendar-day-card__times">
        <span>
          <Text type="secondary">{t("calendar.etd")} </Text>
          {schedule.etd}
        </span>
        <span>
          <Text type="secondary">{t("calendar.eta")} </Text>
          {schedule.eta}
        </span>
        <span>
          <Text type="secondary">{t("calendar.transit")} </Text>
          {t("card.days", { count: schedule.transitTimeDays })}
        </span>
      </div>

      <div className="schedule-calendar-day-card__cutoffs">
        <span>
          <Text type="secondary">{t("calendar.gateIn")} </Text>
          {formatCutoffValue(schedule.deadlines?.containerGateIn)}
        </span>
        <span>
          <Text type="secondary">{t("calendar.si")} </Text>
          {formatCutoffValue(schedule.deadlines?.siDocClosing)}
        </span>
      </div>

      <div className="schedule-calendar-day-card__footer">
        <ScheduleListRoutingCell record={schedule} t={t} />
        <ScheduleCalendarActions
          schedule={schedule}
          onBookNow={onBookNow}
          onViewVessel={onViewVessel}
          onViewRates={onViewRates}
          onOpenCarbonModal={onOpenCarbonModal}
        />
      </div>
    </article>
  );
}

function ScheduleDayPanel({
  selectedDate,
  sailings,
  selectedScheduleId,
  dateAnchor,
  onSelectSchedule,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: {
  selectedDate: string | null;
  sailings: ScheduleItem[];
  selectedScheduleId: string | null;
  dateAnchor: ScheduleDateAnchor;
  onSelectSchedule: (id: string) => void;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}) {
  const { t } = useTranslation(["schedules", "common", "modules"]);

  if (!selectedDate) {
    return (
      <aside className="schedule-calendar-day-panel">
        <div className="schedule-calendar-day-panel__empty">
          <ModuleEmptyState
            variant="blank"
            title={t("calendar.selectDayTitle")}
            message={t("calendar.selectDayMessage")}
            artSize="sm"
          />
        </div>
      </aside>
    );
  }

  return (
    <aside className="schedule-calendar-day-panel">
      <div className="schedule-calendar-day-panel__header">
        <Title level={5} className="schedule-calendar-day-panel__title">
          {dayjs(selectedDate).format("ddd, MMM D, YYYY")}
        </Title>
        <Text type="secondary">
          {t("calendar.sailingsCount", { count: sailings.length })} ·{" "}
          {dateAnchor.toUpperCase()}
        </Text>
      </div>
      <div className="schedule-calendar-day-panel__body custom-scroll">
        {sailings.length === 0 ? (
          <ModuleEmptyState
            variant="filtered"
            title={t("calendar.noSailingsDayTitle")}
            message={t("calendar.noSailingsDayMessage")}
            artSize="sm"
          />
        ) : (
          sailings.map((item) => (
            <ScheduleDaySailingCard
              key={item.id}
              schedule={item}
              dateAnchor={dateAnchor}
              isSelected={selectedScheduleId === item.id}
              onSelect={() => onSelectSchedule(item.id)}
              onBookNow={onBookNow}
              onViewVessel={onViewVessel}
              onViewRates={onViewRates}
              onOpenCarbonModal={onOpenCarbonModal}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function ScheduleAgendaView({
  groups,
  dateAnchor,
  selectedDate,
  selectedScheduleId,
  onSelectDay,
  onSelectSchedule,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: {
  groups: Array<[string, ScheduleItem[]]>;
  dateAnchor: ScheduleDateAnchor;
  selectedDate: string | null;
  selectedScheduleId: string | null;
  onSelectDay: (dateKey: string) => void;
  onSelectSchedule: (dateKey: string, scheduleId: string) => void;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}) {
  const { t } = useTranslation(["schedules", "common", "modules"]);

  if (groups.length === 0) {
    return (
      <div className="schedule-empty">
        <ModuleEmptyState
          variant="filtered"
          title={t("calendar.noSailingsMonthTitle")}
          message={t("calendar.noSailingsMonthMessage")}
          artSize="md"
        />
      </div>
    );
  }

  return (
    <div className="schedule-agenda custom-scroll">
      {groups.map(([date, items]) => (
        <div
          key={date}
          className={[
            "schedule-agenda__day",
            selectedDate === date ? "schedule-agenda__day--selected" : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            type="button"
            className="schedule-agenda__day-header"
            onClick={() => onSelectDay(date)}
          >
            {dayjs(date).format("ddd, MMM D, YYYY")} ·{" "}
            {t("calendar.sailingsCount", { count: items.length })}
          </button>
          {items.map((sch) => (
            <div
              key={sch.id}
              className={[
                "schedule-agenda__item",
                selectedScheduleId === sch.id
                  ? "schedule-agenda__item--selected"
                  : undefined,
                sch.isDefaultRoute
                  ? "schedule-agenda__item--recommended"
                  : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectSchedule(date, sch.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectSchedule(date, sch.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="schedule-agenda__item-main">
                <Text strong>
                  {sch.polPortId} → {sch.podPortId}
                </Text>
                <Text type="secondary">
                  {sch.serviceCode} · {sch.vesselName} ·{" "}
                  {getScheduleAnchorTime(sch, dateAnchor) || "—"}
                </Text>
                <ScheduleListRoutingCell record={sch} t={t} />
              </div>
              <ScheduleCalendarActions
                schedule={sch}
                onBookNow={onBookNow}
                onViewVessel={onViewVessel}
                onViewRates={onViewRates}
                onOpenCarbonModal={onOpenCarbonModal}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ScheduleCalendarView({
  schedules,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: ScheduleCalendarViewProps) {
  const { t } = useTranslation(["schedules", "common", "modules"]);
  const { scrollWideContent } = useResponsiveLayout();
  const [dateAnchor, setDateAnchor] = useState<ScheduleDateAnchor>("etd");
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(() =>
    resolveInitialCalendarMonth(schedules, "etd"),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setCurrentMonth(resolveInitialCalendarMonth(schedules, dateAnchor));
    setSelectedDate(null);
    setSelectedScheduleId(null);
  }, [schedules, dateAnchor]);

  useEffect(() => {
    if (!selectedDate) return;
    const dayItems =
      groupSchedulesByDate(schedules, currentMonth, dateAnchor).get(
        selectedDate,
      ) ?? [];
    setSelectedScheduleId((prev) => {
      if (prev && dayItems.some((item) => item.id === prev)) return prev;
      return dayItems[0]?.id ?? null;
    });
  }, [selectedDate, schedules, currentMonth, dateAnchor]);

  const schedulesByDate = groupSchedulesByDate(
    schedules,
    currentMonth,
    dateAnchor,
  );
  const monthCells = buildMonthMatrix(currentMonth);
  const agendaGroups = buildAgendaGroups(schedulesByDate);
  const selectedDaySailings = selectedDate
    ? (schedulesByDate.get(selectedDate) ?? [])
    : [];

  function selectDay(dateKey: string, preferScheduleId?: string) {
    setSelectedDate(dateKey);
    const dayItems = schedulesByDate.get(dateKey) ?? [];
    if (preferScheduleId && dayItems.some((s) => s.id === preferScheduleId)) {
      setSelectedScheduleId(preferScheduleId);
      return;
    }
    setSelectedScheduleId(dayItems[0]?.id ?? null);
  }

  function goToday() {
    const today = dayjs();
    setCurrentMonth(today.startOf("month"));
    selectDay(today.format("YYYY-MM-DD"));
  }

  return (
    <div className="schedule-calendar">
      <div className="schedule-calendar__header">
        <Space align="center" size={8} wrap>
          <AppIcon icon={Icons.calendar} size={20} />
          <Title level={4} className="schedule-calendar__title">
            {currentMonth.format("MMMM YYYY")}
          </Title>
        </Space>

        <div className="schedule-calendar__toolbar">
          <Segmented
            size="middle"
            value={dateAnchor}
            onChange={(value) => {
              if (value === "etd" || value === "eta") setDateAnchor(value);
            }}
            options={[
              { label: t("calendar.etd"), value: "etd" },
              { label: t("calendar.eta"), value: "eta" },
            ]}
          />
          <Space wrap size={8}>
            <Tooltip title={t("calendar.previousMonth")}>
              <AppButton
                aria-label={t("calendar.previousMonth")}
                icon={
                  <AppIcon icon={Icons.chevronLeft} size={16} tone="navigate" />
                }
                onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}
              />
            </Tooltip>
            <Tooltip title={t("calendar.today")}>
              <AppButton onClick={goToday}>{t("calendar.today")}</AppButton>
            </Tooltip>
            <Tooltip title={t("calendar.nextMonth")}>
              <AppButton
                aria-label={t("calendar.nextMonth")}
                icon={
                  <AppIcon icon={Icons.chevronRight} size={16} tone="navigate" />
                }
                onClick={() => setCurrentMonth((m) => m.add(1, "month"))}
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      {scrollWideContent ? (
        <ScheduleAgendaView
          groups={agendaGroups}
          dateAnchor={dateAnchor}
          selectedDate={selectedDate}
          selectedScheduleId={selectedScheduleId}
          onSelectDay={(dateKey) => selectDay(dateKey)}
          onSelectSchedule={(dateKey, scheduleId) =>
            selectDay(dateKey, scheduleId)
          }
          onBookNow={onBookNow}
          onViewVessel={onViewVessel}
          onViewRates={onViewRates}
          onOpenCarbonModal={onOpenCarbonModal}
        />
      ) : (
        <div className="schedule-calendar__layout">
          <div className="schedule-calendar__month">
            <div className="schedule-calendar__weekdays">
              {WEEKDAY_KEYS.map((key) => (
                <span key={key}>{t(`calendar.weekdays.${key}`)}</span>
              ))}
            </div>
            <div className="schedule-calendar__grid">
              {monthCells.map((cell) => {
                const daySailings = cell.inCurrentMonth
                  ? (schedulesByDate.get(cell.dateKey) ?? [])
                  : [];
                const { visible, overflowCount } =
                  getVisibleCalendarEvents(daySailings);
                const isSelected = selectedDate === cell.dateKey;

                return (
                  <div
                    key={cell.dateKey}
                    className={[
                      "schedule-calendar__cell",
                      !cell.inCurrentMonth
                        ? "schedule-calendar__cell--outside"
                        : undefined,
                      cell.isToday
                        ? "schedule-calendar__cell--today"
                        : undefined,
                      isSelected
                        ? "schedule-calendar__cell--selected"
                        : undefined,
                      daySailings.length > 0
                        ? "schedule-calendar__cell--has-sailings"
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      if (!cell.inCurrentMonth) {
                        setCurrentMonth(cell.date.startOf("month"));
                      }
                      selectDay(cell.dateKey);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!cell.inCurrentMonth) {
                          setCurrentMonth(cell.date.startOf("month"));
                        }
                        selectDay(cell.dateKey);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={
                      daySailings.length
                        ? t("calendar.daySailingsAria", {
                            date: cell.date.format("MMMM D, YYYY"),
                            count: daySailings.length,
                          })
                        : cell.date.format("MMMM D, YYYY")
                    }
                  >
                    <div className="schedule-calendar__cell-day">
                      <span
                        className={
                          cell.isToday
                            ? "schedule-calendar__day-number schedule-calendar__day-number--today"
                            : "schedule-calendar__day-number"
                        }
                      >
                        {cell.date.date()}
                      </span>
                      {daySailings.length > 0 ? (
                        <span className="schedule-calendar__cell-count">
                          {daySailings.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="schedule-calendar__cell-events custom-scroll">
                      {visible.map((sch) => {
                        const time = getScheduleAnchorTime(sch, dateAnchor);
                        return (
                          <div
                            key={sch.id}
                            className={eventClassName(
                              sch,
                              selectedScheduleId === sch.id,
                            )}
                            title={`${sch.vesselName} · ${sch.serviceCode} · ${sch.polPortId}→${sch.podPortId}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!cell.inCurrentMonth) {
                                setCurrentMonth(cell.date.startOf("month"));
                              }
                              selectDay(cell.dateKey, sch.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                selectDay(cell.dateKey, sch.id);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <span className="schedule-calendar__event-time">
                              {time || "—"}
                            </span>
                            <span className="schedule-calendar__event-label">
                              {sch.polPortId}→{sch.podPortId}
                            </span>
                          </div>
                        );
                      })}
                      {overflowCount > 0 ? (
                        <button
                          type="button"
                          className="schedule-calendar__more"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectDay(cell.dateKey);
                          }}
                        >
                          {t("calendar.more", { count: overflowCount })}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="schedule-calendar-legend"
              role="note"
              aria-label={t("calendar.legendAria")}
            >
              <span className="schedule-calendar-legend__item">
                <span className="schedule-calendar-legend__swatch schedule-calendar-legend__swatch--direct" />
                {t("calendar.legendDirect")}
              </span>
              <span className="schedule-calendar-legend__item">
                <span className="schedule-calendar-legend__swatch schedule-calendar-legend__swatch--transshipment" />
                {t("calendar.legendTransshipment")}
              </span>
              <span className="schedule-calendar-legend__item">
                <span className="schedule-calendar-legend__swatch schedule-calendar-legend__swatch--recommended" />
                {t("calendar.legendRecommended")}
              </span>
            </div>
          </div>

          <ScheduleDayPanel
            selectedDate={selectedDate}
            sailings={selectedDaySailings}
            selectedScheduleId={selectedScheduleId}
            dateAnchor={dateAnchor}
            onSelectSchedule={setSelectedScheduleId}
            onBookNow={onBookNow}
            onViewVessel={onViewVessel}
            onViewRates={onViewRates}
            onOpenCarbonModal={onOpenCarbonModal}
          />
        </div>
      )}
    </div>
  );
}
