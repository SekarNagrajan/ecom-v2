import type { ChangeEvent } from 'react';
import type { FieldValues } from 'react-hook-form';

import { AppTextarea } from '../../ui/app-textarea';
import { getA11yProps } from '../common/helper';
import type { NativeTextareaEvent, TextareaFieldProps } from './types';

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function applyTransform(
  value: string,
  transform: 'uppercase' | 'lowercase' | 'capitalize' | undefined
): string {
  switch (transform) {
    case 'uppercase':
      return value.toUpperCase();
    case 'lowercase':
      return value.toLowerCase();
    case 'capitalize':
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    default:
      return value;
  }
}

export function TextareaField<T extends FieldValues>({
  field,
  trimOnBlur = false,
  transform,
  onBlur,
  id,
  error,
  autoComplete,
  required,
  ...rest
}: TextareaFieldProps<T>) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    field.onChange(applyTransform(e.target.value, transform));
  };

  const handleBlur = (e: NativeTextareaEvent) => {
    field.onBlur();

    if (trimOnBlur && typeof field.value === 'string') {
      const trimmed = field.value.trim();
      if (trimmed !== field.value) {
        field.onChange(trimmed);
      }
    }

    onBlur?.(e);
  };

  return (
    <AppTextarea
      {...rest}
      {...field}
      value={toStringValue(field.value)}
      onChange={handleChange}
      onBlur={handleBlur}
      {...getA11yProps({
        id,
        error,
        required,
        autoComplete: autoComplete ?? 'off',
      })}
    />
  );
}
