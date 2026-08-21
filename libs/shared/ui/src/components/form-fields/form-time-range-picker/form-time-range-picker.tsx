import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { FormFieldWrapper } from '../common/form-field-wrapper';
import { TimeRangePickerField } from './time-range-picker-field';
import type { FormTimeRangePickerProps } from './types';

export function FormTimeRangePicker<T extends FieldValues>({
  // Base
  name,
  control: propsControl,
  label,
  tooltip,
  required,
  hasFeedback,
  wrapperClassName,
  formItemProps,
  id: propsId,

  // Pass-through
  ...rest
}: FormTimeRangePickerProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  // Resolve RHF control
  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormTimeRangePicker must be used within a FormProvider or passed a control prop.'
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
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      itemProps={formItemProps}
    >
      <TimeRangePickerField
        {...rest}
        id={id}
        field={field}
        error={fieldState.error}
        required={required}
      />
    </FormFieldWrapper>
  );
}
