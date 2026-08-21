import { DateTime } from 'luxon';

import type { AntdLuxonDatePickerProps } from '../../../base/antd-luxon-date-picker';

type BuildRestrictionsArgs = {
  timezone: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  disabledDate?: AntdLuxonDatePickerProps['disabledDate'];
  disabledTime?: AntdLuxonDatePickerProps['disabledTime'];
};

type RestrictionsResult = {
  disabledDate: AntdLuxonDatePickerProps['disabledDate'];
  disabledTime: AntdLuxonDatePickerProps['disabledTime'];
};

export function buildDatePickerRestrictions({
  timezone,
  disablePast,
  disableFuture,
  disabledDate: baseDisabledDate,
  disabledTime: baseDisabledTime,
}: BuildRestrictionsArgs): RestrictionsResult {
  // Reference point: "Now" in the App's Timezone
  const now = DateTime.now().setZone(timezone);
  const todayStart = now.startOf('day');

  /**
   * 1. Date Restrictions (Days)
   */
  const disabledDate: AntdLuxonDatePickerProps['disabledDate'] = (
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

    return false;
  };

  /**
   * 2. Time Restrictions (HH:mm:ss)
   */
  const disabledTime: AntdLuxonDatePickerProps['disabledTime'] = (
    current // The specific date node being hovered/selected
  ) => {
    // Get user custom time restrictions
    const base = baseDisabledTime ? baseDisabledTime(current) : {};

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
