import type { PickerRef } from '@rc-component/picker';
import { type PickerTimeProps } from 'antd/es/time-picker';
import { type DateTime } from 'luxon';
import { forwardRef } from 'react';

import { AntdLuxonDatePicker } from './antd-luxon-date-picker';

export type AntdLuxonTimePickerProps = Omit<
  PickerTimeProps<DateTime>,
  'picker'
>;

export const AntdLuxonTimePicker = forwardRef<
  PickerRef,
  AntdLuxonTimePickerProps
>((props, ref) => (
  <AntdLuxonDatePicker {...props} picker="time" mode={undefined} ref={ref} />
));

AntdLuxonTimePicker.displayName = 'AntdLuxonTimePicker';
