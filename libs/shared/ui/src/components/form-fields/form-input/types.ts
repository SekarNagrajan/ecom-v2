import { type InputProps } from 'antd';
import type { FocusEvent } from 'react';
import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import type { BaseControlledFieldProps } from '../common/types';

type BaseInputProps = Omit<InputProps, 'type' | 'onChange' | 'value'>;

type InputType = 'text' | 'password' | 'email' | 'tel' | 'url' | 'search';

type FormInputWithExtra = BaseInputProps & {
  type?: InputType;
  trimOnBlur?: boolean;
  transform?: 'uppercase' | 'lowercase' | 'capitalize';
  allowCopy?: boolean;
  autoComplete?: string;
};

export type FormInputProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & FormInputWithExtra;

/**
 * InputField
 */

export type NativeInputEvent = FocusEvent<HTMLInputElement>;

export type InputFieldProps<T extends FieldValues> = FormInputWithExtra & {
  field: ControllerRenderProps<T, Path<T>>;
  id?: string;
  error?: FieldError;
};
