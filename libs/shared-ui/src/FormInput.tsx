import React from 'react';
import { Form, Input, InputProps } from 'antd';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

export interface FormInputProps<TFieldValues extends FieldValues = FieldValues> extends Omit<InputProps, 'name'> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  required?: boolean;
  help?: string;
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  required,
  help,
  ...props
}: FormInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <Form.Item
          label={label}
          required={required}
          validateStatus={error ? 'error' : ''}
          help={error?.message || help}
          style={{ marginBottom: 16 }}
        >
          <Input {...field} {...props} value={field.value ?? ''} />
        </Form.Item>
      )}
    />
  );
}
