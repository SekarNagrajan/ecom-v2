import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { AppCheckbox } from '../../ui/checkbox';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import { getA11yProps } from '../common/helper';
import type { FormCheckboxProps } from './types';

export function FormCheckbox<T extends FieldValues>({
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
  autoComplete,

  ...rest
}: FormCheckboxProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormCheckbox must be used within a FormProvider or passed a control prop.'
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
      <AppCheckbox
        {...rest}
        {...field}
        checked={field.value}
        {...getA11yProps({
          id,
          error: fieldState.error,
          required,
          autoComplete,
        })}
      />
    </FormFieldWrapper>
  );
}
