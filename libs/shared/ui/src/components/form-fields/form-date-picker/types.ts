import type { DateTime } from 'luxon';
import type { FieldValues } from 'react-hook-form';

import { type AntdLuxonDatePickerProps } from '../../../base/antd-luxon-date-picker';
import { type LuxonPreset } from '../../../types/luxon';
import { type BaseControlledFieldProps } from '../common/types';

type BaseAntdDatePickerProps = Omit<
  AntdLuxonDatePickerProps,
  | 'picker'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'showTime'
  | 'multiple'
  | 'onOk'
>;

// 1. Define Common Props (Everything EXCEPT picker, showTime, multiple)
// We Omit these 3 so we can define them strictly in the union below.
type FormDatePickerCommonProps<T extends FieldValues> =
  BaseControlledFieldProps<T> &
    Omit<BaseAntdDatePickerProps, 'picker' | 'showTime' | 'multiple'> & {
      disablePast?: boolean;
      disableFuture?: boolean;
      valueFormat?: 'utc-date-time' | 'calendar-date';
      minDate?: DateTime;
      maxDate?: DateTime;

      presets?:
        | LuxonPreset<DateTime>[]
        | ((timezone: string) => LuxonPreset<DateTime>[]);
    };

// 2. Scenario A: Standard Date/Week/Month/Year (No Time)
// -> Multiple IS allowed
type CalendarOnlyProps = {
  picker?: Exclude<AntdLuxonDatePickerProps['picker'], 'time'>;
  showTime?: boolean;
  multiple?: boolean;
};

type DateTimeProps = {
  picker?: 'date';
  showTime: AntdLuxonDatePickerProps['showTime'];
  multiple?: never;
};

export type FormDatePickerProps<T extends FieldValues> =
  FormDatePickerCommonProps<T> & (CalendarOnlyProps | DateTimeProps);
