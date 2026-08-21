import { DateTime } from 'luxon';

import type { AntdLuxonDateRangePickerProps } from '../../../base/antd-luxon-date-range-picker';

type BuildRestrictionsArgs = {
  timezone: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  disabledDate?: AntdLuxonDateRangePickerProps['disabledDate'];
  disabledTime?: AntdLuxonDateRangePickerProps['disabledTime'];
  minimumGap?: number; // in minutes
};

type RestrictionsResult = {
  disabledDate: AntdLuxonDateRangePickerProps['disabledDate'];
  disabledTime: AntdLuxonDateRangePickerProps['disabledTime'];
};

export function buildDateRangeRestrictions({
  timezone,
  disablePast,
  disableFuture,
  disabledDate: baseDisabledDate,
  disabledTime: baseDisabledTime,
  minimumGap = 0,
}: BuildRestrictionsArgs): RestrictionsResult {
  // Reference point: "Now" in the App's Timezone
  const now = DateTime.now().setZone(timezone);
  const todayStart = now.startOf('day');

  /**
   * 1. Date Restrictions (Days)
   */
  const disabledDate: AntdLuxonDateRangePickerProps['disabledDate'] = (
    current,
    info
  ) => {
    if (!current) return false;

    // Apply user-provided custom logic first
    if (baseDisabledDate && baseDisabledDate(current, info)) {
      return true;
    }

    const currentDay = current.startOf('day');

    // Past / Future checks
    if (disablePast && currentDay < todayStart) return true;
    if (disableFuture && currentDay > todayStart) return true;

    // Minimum Gap Logic
    // info.from exists when one date has already been selected (the "anchor")
    if (info?.from) {
      // Calculate the absolute minimum allowed time
      const minTimestamp = info.from.plus({ minutes: minimumGap });
      // The day of that minimum time
      const minDay = minTimestamp.startOf('day');

      // If the current day is before the day required by the gap, disable it
      if (currentDay < minDay) return true;
    }

    return false;
  };

  /**
   * 2. Time Restrictions (HH:mm:ss)
   */
  const disabledTime: AntdLuxonDateRangePickerProps['disabledTime'] = (
    current, // The specific date node being hovered/selected
    type, // 'start' | 'end'
    info // Contains { from: ... }
  ) => {
    // Get user custom time restrictions
    const base = baseDisabledTime ? baseDisabledTime(current, type, info) : {};

    // If no date is selected/hovered yet, just return base
    if (!current) return base;

    const disabledHours = new Set<number>(base.disabledHours?.() ?? []);
    const disabledMinutesMap = new Map<number, Set<number>>();

    // Helper to disable an entire hour
    const disableWholeHour = (h: number) => disabledHours.add(h);

    // Helper to disable specific minutes in an hour
    const disableMinutes = (h: number, from: number, to: number) => {
      if (from > to) return;
      const set = disabledMinutesMap.get(h) ?? new Set();
      for (let m = from; m <= to; m++) set.add(m);
      disabledMinutesMap.set(h, set);
    };

    const isToday = current.hasSame(now, 'day');

    // -- Disable Past/Future Times (only if current day is Today) --
    if (isToday) {
      if (disablePast) {
        // Disable hours before current hour
        for (let h = 0; h < now.hour; h++) disableWholeHour(h);
        // Disable minutes passed in current hour
        disableMinutes(now.hour, 0, now.minute);
      }
      if (disableFuture) {
        for (let h = now.hour + 1; h < 24; h++) disableWholeHour(h);
        disableMinutes(now.hour, now.minute + 1, 59);
      }
    }

    // -- Minimum Gap Logic --
    // Only applies if we are picking the 'end' date AND we have a 'start' date (from)
    if (type === 'end' && info.from) {
      const minTimestamp = info.from.plus({ minutes: minimumGap });

      // Only restrict time if the current selected date IS the "Gap Boundary Day"
      if (current.hasSame(minTimestamp, 'day')) {
        const minH = minTimestamp.hour;
        const minM = minTimestamp.minute;

        // Disable hours before the gap allows
        for (let h = 0; h < minH; h++) disableWholeHour(h);

        // Disable minutes in the boundary hour
        disableMinutes(minH, 0, minM - 1);
      }
    }

    return {
      disabledHours: () => Array.from(disabledHours).sort((a, b) => a - b),
      disabledMinutes: (hour) => {
        const baseMinutes = base.disabledMinutes?.(hour) ?? [];
        const extraMinutes = disabledMinutesMap.get(hour);
        if (!extraMinutes) return baseMinutes;
        return Array.from(new Set([...baseMinutes, ...extraMinutes])).sort(
          (a, b) => a - b
        );
      },
      disabledSeconds: base.disabledSeconds,
    };
  };

  return { disabledDate, disabledTime };
}
