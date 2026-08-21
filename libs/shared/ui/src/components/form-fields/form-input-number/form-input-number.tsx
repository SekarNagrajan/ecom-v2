import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { FormFieldWrapper } from '../common/form-field-wrapper';
import { InputNumberField } from './input-number-field';
import type { FormInputNumberProps } from './types';

export function FormInputNumber<T extends FieldValues>({
  // Base Props
  name,
  control: propsControl,
  label,
  tooltip,
  required,
  hasFeedback,
  wrapperClassName,
  formItemProps,
  id: propsId,

  // InputNumber Props
  ...rest
}: FormInputNumberProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormInputNumber must be used within a FormProvider or passed a control prop.'
    );
  }

  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      tooltip={tooltip}
      required={required}
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      itemProps={formItemProps}
    >
      <InputNumberField
        {...rest}
        field={field}
        id={id}
        error={fieldState.error}
        required={required}
      />
    </FormFieldWrapper>
  );
}
