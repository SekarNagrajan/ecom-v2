import { Space } from 'antd';
import type { DateTime } from 'luxon';

import { AntdLuxonDatePicker } from '../../../base/antd-luxon-date-picker';
import { useAppConfig } from '../../../hooks/use-app-config';
import { computeDatePickerFormat } from './helpers/date-picker-format';
import type { AppDatePickerProps } from './types';
import { buildDatePickerRestrictions } from './utils';

export function AppDatePicker(props: AppDatePickerProps) {
  const { timezone, dateFormat, timeFormat } = useAppConfig();

  const {
    disablePast,
    disableFuture,
    disabledDate,
    disabledTime,
    picker,
    format,
    showTime,
    allowClear = true,
    prefix,
    ...rest
  } = props;

  const { displayFormat, showTimeConfig } = computeDatePickerFormat({
    picker: picker === 'time' ? undefined : picker,
    format,
    showTime,
    dateFormat,
    timeFormat,
  });

  const { disabledDate: mergedDisabledDate, disabledTime: mergedDisabledTime } =
    buildDatePickerRestrictions({
      timezone,
      disablePast,
      disableFuture,
      disabledDate,
      disabledTime,
    });

  // Cast handlers to specific types to avoid 'unknown' issues from AntD overloads
  const handleChange = (
    date: DateTime | DateTime[] | null,
    dateString: string | string[]
  ) => {
    props.onChange?.(date, dateString);
  };

  const handleOk = (date: DateTime | DateTime[]) => {
    props.onOk?.(date);
  };

  return (
    <Space.Compact block>
      {prefix && <Space.Addon>{prefix}</Space.Addon>}
      <AntdLuxonDatePicker
        {...rest}
        style={{ width: '100%', ...rest.style }}
        picker={picker}
        format={displayFormat}
        showTime={showTimeConfig}
        disabledDate={mergedDisabledDate}
        disabledTime={mergedDisabledTime}
        allowClear={allowClear}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={handleChange as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onOk={handleOk as any}
      />
    </Space.Compact>
  );
}
