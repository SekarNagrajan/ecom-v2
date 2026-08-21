import { type PickerRef } from '@rc-component/picker';
import type { RangePickerTimeProps } from 'antd/es/time-picker';
import type { DateTime } from 'luxon';
import { forwardRef } from 'react';

import { AntdLuxonDatePicker } from './antd-luxon-date-picker';

export type AntdLuxonTimeRangePickerProps = Omit<
  RangePickerTimeProps<DateTime>,
  'picker'
>;

export const AntdLuxonTimeRangePicker = forwardRef<
  PickerRef,
  AntdLuxonTimeRangePickerProps
>((props, ref) => (
  <AntdLuxonDatePicker.RangePicker {...props} picker="time" ref={ref} />
));

AntdLuxonTimeRangePicker.displayName = 'AntdLuxonTimeRangePicker';
