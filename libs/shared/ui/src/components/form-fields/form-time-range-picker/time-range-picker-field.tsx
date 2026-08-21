import { DateTime } from 'luxon';
import { useMemo, useCallback } from 'react';
import type { FieldValues } from 'react-hook-form';

import {
  AntdLuxonTimeRangePicker,
  type AntdLuxonTimeRangePickerProps,
} from '../../../base/antd-luxon-time-range-picker';
import { useAppConfig } from '../../../hooks/use-app-config';
import { parseStoredDateTimeToZone, toUtcIsoString } from '../../../utils';
import { cn } from '../../../utils/cn';
import { getA11yProps } from '../common/helper';
import { buildDisabledTime } from './helpers/time-range-restrictions';
import type {
  TimeRangePickerFieldProps,
  TimeRangePickerValueType,
} from './types';

export function TimeRangePickerField<T extends FieldValues>({
  field,
  disabledTime,
  className,

  disablePast,
  disableFuture,
  minimumGap,

  id,
  error,
  required,
  autoComplete,

  ...rest
}: TimeRangePickerFieldProps<T>) {
  const { timeFormat, timezone } = useAppConfig();
  const { value, onChange } = field;

  const pickerValue = useMemo<TimeRangePickerValueType | null>(() => {
    if (!Array.isArray(value) || value.length !== 2) return null;

    return value.map((dateString: unknown) => {
      const date =
        typeof dateString === 'string'
          ? parseStoredDateTimeToZone(dateString, timezone)
          : null;

      return date?.isValid ? date : null;
    });
  }, [value, timezone]);

  const handleChange = useCallback<
    NonNullable<AntdLuxonTimeRangePickerProps['onChange']>
  >(
    (dates) => {
      // AntD can emit null (clear / reset)
      if (!dates) {
        onChange([null, null]);
        return;
      }

      onChange(
        dates.map((date) => {
          if (!date) return null;

          // We're creating time based on our settings, due to browser intervention
          const anchorDate = DateTime.now().setZone(timezone);
          const targetTime = anchorDate.set({
            hour: date.hour,
            minute: date.minute,
            second: date.second,
            millisecond: 0,
          });

          return toUtcIsoString(targetTime);
        })
      );
    },
    [onChange, timezone]
  );

  const mergedDisabledTime = useMemo(() => {
    return buildDisabledTime({
      timezone,
      disablePast,
      disableFuture,
      disabledTime,
      minimumGap,
    });
  }, [timezone, disablePast, disableFuture, disabledTime, minimumGap]);

  return (
    <AntdLuxonTimeRangePicker
      {...rest}
      {...getA11yProps({ id, error, required, autoComplete })}
      value={pickerValue}
      onChange={handleChange}
      disabledTime={mergedDisabledTime}
      format={timeFormat}
      className={cn('w-full', className)}
    />
  );
}
