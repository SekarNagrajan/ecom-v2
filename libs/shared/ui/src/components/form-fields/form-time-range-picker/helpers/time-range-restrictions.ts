import { DateTime } from 'luxon';

import { type AntdLuxonTimeRangePickerProps } from '../../../../base/antd-luxon-time-range-picker';

type BuildDisabledTimeArgs = {
  timezone: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  disabledTime?: AntdLuxonTimeRangePickerProps['disabledTime'];
  minimumGap?: number;
};

export function buildDisabledTime({
  timezone,
  disablePast,
  disableFuture,
  disabledTime,
  minimumGap = 0,
}: BuildDisabledTimeArgs): AntdLuxonTimeRangePickerProps['disabledTime'] {
  return (date, range, info) => {
    const now = DateTime.now().setZone(timezone);

    // Base disabledTime (user-provided)
    const base = disabledTime?.(date, range, info) ?? {};

    const disabledHours = new Set<number>(base.disabledHours?.() ?? []);
    const disabledMinutesMap = new Map<number, Set<number>>();

    /**
     * Helpers
     */
    const disableWholeHour = (hour: number) => {
      disabledHours.add(hour);
    };

    const disableMinutes = (hour: number, from: number, to: number) => {
      if (from > to) return;

      const set = disabledMinutesMap.get(hour) ?? new Set<number>();

      for (let m = from; m <= to; m++) {
        set.add(m);
      }

      disabledMinutesMap.set(hour, set);
    };

    /**
     * Past / Future logic (only for today)
     */
    if (date && date.hasSame(now, 'day')) {
      const currentHour = now.hour;
      const currentMinute = now.minute;

      if (disablePast) {
        for (let h = 0; h < currentHour; h++) {
          disableWholeHour(h);
        }

        disableMinutes(currentHour, 0, currentMinute);
      }

      if (disableFuture) {
        for (let h = currentHour + 1; h < 24; h++) {
          disableWholeHour(h);
        }

        disableMinutes(currentHour, currentMinute + 1, 59);
      }
    }

    /**
     * Range logic:
     * Disable invalid END times (end < start)
     */
    if (
      range === 'end' &&
      info.from &&
      date &&
      info.from.hasSame(date, 'day')
    ) {
      const minEnd = info.from.plus({ minutes: minimumGap });

      const minHour = minEnd.hour;
      const minMinute = minEnd.minute;

      // Disable all hours before the start hour
      for (let h = 0; h < minHour; h++) {
        disableWholeHour(h);
      }

      // Disable minutes before the start minute in the same hour
      disableMinutes(minHour, 0, minMinute - 1);
    }

    /**
     * Final merged result
     */
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
}
