import { CopyOutlined } from '@ant-design/icons';
import { App, Input } from 'antd';
import { useCallback, useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';

import { getA11yProps } from '../common/helper';
import type { InputFieldProps, NativeInputEvent } from './types';

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

export function InputField<T extends FieldValues>({
  field,
  type = 'text',
  trimOnBlur = false,
  transform,
  allowCopy,
  onBlur,
  suffix,
  prefix,
  id,
  error,
  autoComplete,
  required,

  ...rest
}: InputFieldProps<T>) {
  const { message } = App.useApp();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Apply transformation if specified
      if (transform) {
        switch (transform) {
          case 'uppercase':
            value = value.toUpperCase();
            break;
          case 'lowercase':
            value = value.toLowerCase();
            break;
          case 'capitalize':
            value =
              value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            break;
        }
      }

      field.onChange(value);
    },
    [field, transform]
  );

  const handleBlur = useCallback(
    (e: NativeInputEvent) => {
      field.onBlur();

      const value = field.value;

      if (trimOnBlur && typeof value === 'string') {
        const stringValue = toStringValue(field.value);
        const trimmed = stringValue.trim();

        if (trimmed !== field.value) {
          field.onChange(trimmed);
        }
      }

      onBlur?.(e);
    },
    [field, trimOnBlur, onBlur]
  );

  const suffixIcon = useMemo(() => {
    if (!allowCopy) {
      // Fix for undefined suffix warning from antd
      return suffix ?? <span />;
    }

    return (
      <span className="flex items-center gap-2 text-gray-400">
        {suffix}
        <CopyOutlined
          className="cursor-pointer text-gray-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();

            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(String(field.value));
              message.success('Copied to clipboard');
            } else {
              message.error?.('Copy not supported');
            }
          }}
        />
      </span>
    );
  }, [allowCopy, field.value, suffix, message]);

  const normalizedValue = toStringValue(field.value);

  const sharedProps = {
    ...rest,
    ...field,
    value: normalizedValue,
    onChange: handleChange,
    onBlur: handleBlur,
    ...getA11yProps({
      id,
      error,
      required,
      autoComplete: autoComplete ?? 'off',
    }),
  };

  if (type === 'password') {
    return <Input.Password {...sharedProps} prefix={prefix} />;
  }

  return (
    <Input {...sharedProps} type={type} prefix={prefix} suffix={suffixIcon} />
  );
}
