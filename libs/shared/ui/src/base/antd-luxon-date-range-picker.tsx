import { type PickerRef } from '@rc-component/picker';
import type { GetProps as AntdGetProps } from 'antd';
import { forwardRef } from 'react';

import { AntdLuxonDatePicker } from './antd-luxon-date-picker';

type RangePickerProps = AntdGetProps<typeof AntdLuxonDatePicker.RangePicker>;

export type AntdLuxonDateRangePickerProps = Omit<
  RangePickerProps,
  'picker' | 'multiple'
> & {
  picker?: Exclude<RangePickerProps['picker'], 'time'>;
};

export const AntdLuxonDateRangePicker = forwardRef<
  PickerRef,
  AntdLuxonDateRangePickerProps
>((props, ref) => <AntdLuxonDatePicker.RangePicker {...props} ref={ref} />);

AntdLuxonDateRangePicker.displayName = 'AntdLuxonDateRangePicker';
