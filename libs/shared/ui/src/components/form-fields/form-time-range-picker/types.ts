import type { DateTime } from 'luxon';
import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import type { AntdLuxonTimeRangePickerProps } from '../../../base/antd-luxon-time-range-picker';
import type { BaseControlledFieldProps } from '../common/types';

export type TimeRangePickerValueType = [DateTime | null, DateTime | null];

type BaseTimeRangePickerProps = Omit<
  AntdLuxonTimeRangePickerProps,
  'value' | 'defaultValue' | 'onChange'
>;

type TimeRangeFeatureProps = {
  disablePast?: boolean;
  disableFuture?: boolean;
  minimumGap?: number;
};

export type FormTimeRangePickerProps<T extends FieldValues> =
  BaseControlledFieldProps<T> &
    BaseTimeRangePickerProps &
    TimeRangeFeatureProps;

/**
 * TimeRangePickerField
 */
export type TimeRangePickerFieldProps<T extends FieldValues> =
  BaseTimeRangePickerProps &
    TimeRangeFeatureProps & {
      field: ControllerRenderProps<T, Path<T>>;
      error?: FieldError;
      required?: boolean;
    };
