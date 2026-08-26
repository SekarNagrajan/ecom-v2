// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton } from "@solverminds/shared-ui";
import { Badge, Empty, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { useResponsiveLayout } from "../../../hooks/use-responsive-layout";
import type { ScheduleItem } from "../types/schedules.types";

const { Text, Title } = Typography;

interface ScheduleCalendarViewProps {
  schedules: ScheduleItem[];
  onSelectSchedule: (schedule: ScheduleItem) => void;
}

function buildAgendaGroups(
  schedules: ScheduleItem[],
  currentMonth: dayjs.Dayjs,
) {
  const map = new Map<string, ScheduleItem[]>();
  schedules
    .filter((s) => s.etd.startsWith(currentMonth.format("YYYY-MM")))
    .forEach((sch) => {
      const day = sch.etd.slice(0, 10);
      const list = map.get(day) ?? [];
      list.push(sch);
      map.set(day, list);
    });
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function ScheduleAgendaView({
  schedules,
  currentMonth,
  onSelectSchedule,
}: {
  schedules: ScheduleItem[];
  currentMonth: dayjs.Dayjs;
  onSelectSchedule: (schedule: ScheduleItem) => void;
}) {
  const grouped = buildAgendaGroups(schedules, currentMonth);

  if (grouped.length === 0) {
    return (
      <div className="schedule-empty">
        <Empty description="No departures this month for your search" />
      </div>
    );
  }

  return (
    <div className="schedule-agenda">
      {grouped.map(([date, items]) => (
        <div key={date} className="schedule-agenda__day">
          <div className="schedule-agenda__day-header">
            {dayjs(date).format("ddd, MMM D, YYYY")} · {items.length} sailing
            {items.length === 1 ? "" : "s"}
          </div>
          {items.map((sch) => (
            <div
              key={sch.id}
              className="schedule-agenda__item"
              onClick={() => onSelectSchedule(sch)}
              onKeyDown={(e) => e.key === "Enter" && onSelectSchedule(sch)}
              role="button"
              tabIndex={0}
            >
              <div>
                <Text strong>
                  {sch.polPortId} → {sch.podPortId}
                </Text>
                <br />
                <Text type="secondary">
                  {sch.serviceCode} · {sch.vesselName}
                </Text>
              </div>
              <Tag color="blue">{sch.etd.slice(11, 16)}</Tag>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ScheduleCalendarView({
  schedules,
  onSelectSchedule,
}: ScheduleCalendarViewProps) {
  const { scrollWideContent } = useResponsiveLayout();
  const [currentMonth, setCurrentMonth] = useState(dayjs("2026-09-01"));

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));

  return (
    <div className="schedule-calendar">
      <div className="schedule-calendar__header">
        <Space align="center" size={8}>
          <AppIcon icon={Icons.calendar} size={20} />
          <Title level={4} className="schedule-calendar__title">
            {currentMonth.format("MMMM YYYY")}
          </Title>
        </Space>
        <Space wrap>
          <AppButton
            icon={<AppIcon icon={Icons.chevronLeft} size={16} tone="navigate" />}
            onClick={prevMonth}
          >
            Previous
          </AppButton>
          <AppButton
            icon={<AppIcon icon={Icons.chevronRight} size={16} tone="navigate" />}
            onClick={nextMonth}
          >
            Next
          </AppButton>
        </Space>
      </div>

      {scrollWideContent ? (
        <ScheduleAgendaView
          schedules={schedules}
          currentMonth={currentMonth}
          onSelectSchedule={onSelectSchedule}
        />
      ) : (
        <>
          <div className="schedule-calendar__weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="schedule-calendar__grid">
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div
                key={`blank-${idx}`}
                className="schedule-calendar__cell schedule-calendar__cell--blank"
              />
            ))}

            {daysArray.map((dayNum) => {
              const dateStr = currentMonth.date(dayNum).format("YYYY-MM-DD");
              const matchingSchedules = schedules.filter((s) =>
                s.etd.startsWith(dateStr),
              );

              return (
                <div key={dayNum} className="schedule-calendar__cell">
                  <div className="schedule-calendar__cell-day">
                    <Text strong>{dayNum}</Text>
                    {matchingSchedules.length > 0 ? (
                      <Badge count={matchingSchedules.length} color="blue" />
                    ) : null}
                  </div>
                  <div className="schedule-calendar__cell-events custom-scroll">
                    {matchingSchedules.map((sch) => (
                      <div
                        key={sch.id}
                        className="schedule-calendar__event"
                        title={`${sch.vesselName} (${sch.serviceCode})`}
                        onClick={() => onSelectSchedule(sch)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && onSelectSchedule(sch)
                        }
                        role="button"
                        tabIndex={0}
                      >
                        {sch.serviceCode} · {sch.polPortId}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
