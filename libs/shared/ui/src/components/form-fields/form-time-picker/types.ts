import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import type { AntdLuxonTimePickerProps } from '../../../base/antd-luxon-time-picker';
import type { BaseControlledFieldProps } from '../common/types';

type BaseTimePickerProps = Omit<AntdLuxonTimePickerProps, 'value' | 'onChange'>;

type TimePickerFeatureProps = {
  disablePast?: boolean;
  disableFuture?: boolean;
};

export type FormTimePickerProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & BaseTimePickerProps & TimePickerFeatureProps;

/**
 * TimePickerField
 */

export type TimePickerFieldProps<T extends FieldValues> = BaseTimePickerProps &
  TimePickerFeatureProps & {
    field: ControllerRenderProps<T, Path<T>>;
    error?: FieldError;
    required?: boolean;
  };
