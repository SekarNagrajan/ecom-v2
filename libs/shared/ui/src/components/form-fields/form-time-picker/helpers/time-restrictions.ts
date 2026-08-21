import { DateTime } from 'luxon';

import type { AntdLuxonTimePickerProps } from '../../../../base/antd-luxon-time-picker';

type BuildDisabledTimeArgs = {
  timezone: string;
  disablePast?: boolean;
  disableFuture?: boolean;
  disabledTime?: AntdLuxonTimePickerProps['disabledTime'];
};

export function buildDisabledTime({
  timezone,
  disablePast,
  disableFuture,
  disabledTime,
}: BuildDisabledTimeArgs): AntdLuxonTimePickerProps['disabledTime'] {
  return (current) => {
    // Base (user-provided) disabledTime
    const base = disabledTime?.(current) ?? {};

    // Always compute "now" in app timezone
    const now = current
      ? current.setZone(timezone)
      : DateTime.now().setZone(timezone);

    const currentHour = now.hour;
    const currentMinute = now.minute;
    const currentSecond = now.second;

    return {
      disabledHours: () => {
        const hours = new Set<number>(base.disabledHours?.() ?? []);

        if (disablePast) {
          for (let h = 0; h < currentHour; h++) {
            hours.add(h);
          }
        }

        if (disableFuture) {
          for (let h = currentHour + 1; h < 24; h++) {
            hours.add(h);
          }
        }

        return [...hours].sort((a, b) => a - b);
      },

      disabledMinutes: (hour) => {
        const minutes = new Set<number>(base.disabledMinutes?.(hour) ?? []);

        if (hour === currentHour) {
          if (disablePast) {
            for (let m = 0; m < currentMinute; m++) {
              minutes.add(m);
            }
          }

          if (disableFuture) {
            for (let m = currentMinute + 1; m < 60; m++) {
              minutes.add(m);
            }
          }
        }

        return [...minutes].sort((a, b) => a - b);
      },

      disabledSeconds: (hour, minute) => {
        const seconds = new Set<number>(
          base.disabledSeconds?.(hour, minute) ?? []
        );

        if (hour === currentHour && minute === currentMinute) {
          if (disablePast) {
            for (let s = 0; s < currentSecond; s++) {
              seconds.add(s);
            }
          }

          if (disableFuture) {
            for (let s = currentSecond + 1; s < 60; s++) {
              seconds.add(s);
            }
          }
        }

        return [...seconds].sort((a, b) => a - b);
      },
    };
  };
}
