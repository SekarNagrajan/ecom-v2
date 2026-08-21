import type { FocusEvent } from 'react';
import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import type { AppTextareaProps } from '../../ui/app-textarea';
import type { BaseControlledFieldProps } from '../common/types';

type BaseTextAreaProps = Omit<
  AppTextareaProps,
  'onChange' | 'value' | 'prefix'
>;

type FormTextareaWithExtra = BaseTextAreaProps & {
  /** Trim leading/trailing whitespace on blur. */
  trimOnBlur?: boolean;
  /** Optional text transformation applied on every change. */
  transform?: 'uppercase' | 'lowercase' | 'capitalize';
};

export type FormTextareaProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & FormTextareaWithExtra;

export type NativeTextareaEvent = FocusEvent<HTMLTextAreaElement>;

export type TextareaFieldProps<T extends FieldValues> =
  FormTextareaWithExtra & {
    field: ControllerRenderProps<T, Path<T>>;
    id?: string;
    error?: FieldError;
  };
