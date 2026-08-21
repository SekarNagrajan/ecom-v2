import { Space } from 'antd';
import { DateTime } from 'luxon';
import { useMemo, useCallback } from 'react';
import type { FieldValues } from 'react-hook-form';

import { AntdLuxonTimePicker } from '../../../base/antd-luxon-time-picker';
import { useAppConfig } from '../../../hooks/use-app-config';
import { parseStoredDateTimeToZone, toUtcIsoString } from '../../../utils';
import { cn } from '../../../utils/cn';
import { getA11yProps } from '../common/helper';
import { buildDisabledTime } from './helpers/time-restrictions';
import type { TimePickerFieldProps } from './types';

export function TimePickerField<T extends FieldValues>({
  field,
  className,
  format,
  prefix,

  // Logic
  disablePast = false,
  disableFuture = false,
  disabledTime,

  id,
  error,
  required,
  autoComplete,

  ...rest
}: TimePickerFieldProps<T>) {
  const { timeFormat, timezone } = useAppConfig(); // Ensure this returns a Luxon compatible format (e.g. "HH:mm:ss")

  const { value, onChange } = field;

  const pickerValue = useMemo<DateTime | null>(() => {
    if (!value || typeof value !== 'string') return null;

    const dt = parseStoredDateTimeToZone(value, timezone);
    return dt.isValid ? dt : null;
  }, [value, timezone]);

  const handleChange = useCallback(
    (time: DateTime | null) => {
      if (!time) {
        onChange(null);
        return;
      }

      // We're creating time based on our settings, due to browser intervention
      const anchorDate = DateTime.now().setZone(timezone);
      const targetTime = anchorDate.set({
        hour: time.hour,
        minute: time.minute,
        second: time.second,
        millisecond: 0,
      });

      onChange(toUtcIsoString(targetTime));
    },
    [onChange, timezone]
  );

  /**
   * Disabled time logic
   */
  const mergedDisabledTime = useMemo(() => {
    return buildDisabledTime({
      timezone,
      disablePast,
      disableFuture,
      disabledTime,
    });
  }, [disablePast, disableFuture, disabledTime, timezone]);

  return (
    <Space.Compact block>
      {prefix && <Space.Addon>{prefix}</Space.Addon>}
      <AntdLuxonTimePicker
        {...rest}
        {...field}
        {...getA11yProps({ id, error, required, autoComplete })}
        value={pickerValue}
        onChange={handleChange}
        disabledTime={mergedDisabledTime}
        format={format ?? timeFormat} // User can overide format via prop
        className={cn('w-full', className)}
        style={{ width: '100%', ...rest.style }}
      />
    </Space.Compact>
  );
}
