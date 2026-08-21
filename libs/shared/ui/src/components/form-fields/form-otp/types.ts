import type { GetProps, Input } from 'antd';
import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import type { BaseControlledFieldProps } from '../common/types';

type OTPProps = GetProps<typeof Input.OTP>;

/**
 * We omit 'onChange' and 'value' to control them via RHF.
 */
type BaseOtpProps = Omit<OTPProps, 'onChange' | 'value'>;

export type FormOtpProps<T extends FieldValues> = BaseControlledFieldProps<T> &
  BaseOtpProps;

/**
 * OtpField
 */
export type OtpFieldProps<T extends FieldValues> = BaseOtpProps & {
  field: ControllerRenderProps<T, Path<T>>;
  id?: string;
  error?: FieldError;
};
