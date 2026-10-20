// Modified by Sekar Nagarajan (2026-09-15 14:45)
import dayjs, { type Dayjs } from "dayjs";

import type { ScheduleItem } from "../types/schedules.types";

export type ScheduleDateAnchor = "etd" | "eta";

export type CalendarDayCell = {
  date: Dayjs;
  dateKey: string;
  inCurrentMonth: boolean;
  isToday: boolean;
};

const MAX_VISIBLE_EVENTS = 3;

export function getScheduleAnchorDate(
  item: ScheduleItem,
  anchor: ScheduleDateAnchor,
): string {
  const raw = anchor === "eta" ? item.eta : item.etd;
  return raw.slice(0, 10);
}

export function getScheduleAnchorTime(
  item: ScheduleItem,
  anchor: ScheduleDateAnchor,
): string {
  const raw = anchor === "eta" ? item.eta : item.etd;
  return raw.length >= 16 ? raw.slice(11, 16) : "";
}

export function groupSchedulesByDate(
  schedules: ScheduleItem[],
  month: Dayjs,
  anchor: ScheduleDateAnchor,
): Map<string, ScheduleItem[]> {
  const monthKey = month.format("YYYY-MM");
  const map = new Map<string, ScheduleItem[]>();

  for (const item of schedules) {
    const dateKey = getScheduleAnchorDate(item, anchor);
    if (!dateKey.startsWith(monthKey)) continue;
    const list = map.get(dateKey) ?? [];
    list.push(item);
    map.set(dateKey, list);
  }

  for (const [, list] of map) {
    list.sort((a, b) => {
      const aTime = getScheduleAnchorTime(a, anchor);
      const bTime = getScheduleAnchorTime(b, anchor);
      return aTime.localeCompare(bTime) || a.vesselName.localeCompare(b.vesselName);
    });
  }

  return map;
}

/** Full Sun–Sat matrix (leading/trailing days included) for even grid alignment. */
export function buildMonthMatrix(month: Dayjs, today = dayjs()): CalendarDayCell[] {
  const start = month.startOf("month");
  const end = month.endOf("month");
  const gridStart = start.startOf("week"); // Sunday
  const gridEnd = end.endOf("week");
  const cells: CalendarDayCell[] = [];
  let cursor = gridStart;

  while (cursor.isBefore(gridEnd) || cursor.isSame(gridEnd, "day")) {
    cells.push({
      date: cursor,
      dateKey: cursor.format("YYYY-MM-DD"),
      inCurrentMonth: cursor.month() === month.month(),
      isToday: cursor.isSame(today, "day"),
    });
    cursor = cursor.add(1, "day");
  }

  return cells;
}

export function resolveInitialCalendarMonth(
  schedules: ScheduleItem[],
  anchor: ScheduleDateAnchor,
  fallback = dayjs(),
): Dayjs {
  if (schedules.length === 0) return fallback.startOf("month");

  let earliest: string | null = null;
  for (const item of schedules) {
    const key = getScheduleAnchorDate(item, anchor);
    if (!earliest || key < earliest) earliest = key;
  }

  return earliest ? dayjs(earliest).startOf("month") : fallback.startOf("month");
}

export function getVisibleCalendarEvents(items: ScheduleItem[]): {
  visible: ScheduleItem[];
  overflowCount: number;
} {
  if (items.length <= MAX_VISIBLE_EVENTS) {
    return { visible: items, overflowCount: 0 };
  }
  return {
    visible: items.slice(0, MAX_VISIBLE_EVENTS),
    overflowCount: items.length - MAX_VISIBLE_EVENTS,
  };
}

export function buildAgendaGroups(
  schedulesByDate: Map<string, ScheduleItem[]>,
): Array<[string, ScheduleItem[]]> {
  return [...schedulesByDate.entries()].sort(([a], [b]) => a.localeCompare(b));
}
