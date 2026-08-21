import React from 'react';
import { Form, Select, SelectProps } from 'antd';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';

export interface FormSelectOption {
  label: string;
  value: string | number;
}

export interface FormSelectProps<TFieldValues extends FieldValues = FieldValues> extends Omit<SelectProps, 'name'> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  required?: boolean;
  help?: string;
  options: FormSelectOption[];
}

export function FormSelect<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  required,
  help,
  options,
  ...props
}: FormSelectProps<TFieldValues>) {
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
          <Select
            {...field}
            {...props}
            options={options}
            onChange={(val, option) => {
              field.onChange(val);
              if (props.onChange) {
                props.onChange(val, option);
              }
            }}
            value={field.value ?? undefined}
          />
        </Form.Item>
      )}
    />
  );
}
