import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { AppCheckboxGroup } from '../../ui/checkbox-group';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import { getA11yProps } from '../common/helper';
import type { FormCheckboxGroupProps } from './types';

export function FormCheckboxGroup<
  T extends FieldValues,
  V extends string = string
>({
  // Base Props
  name,
  control: propsControl,
  label,
  labelIcon,
  tooltip,
  required,
  hasFeedback,
  wrapperClassName,
  formItemProps,
  id: propsId,
  autoComplete,

  ...rest
}: FormCheckboxGroupProps<T, V>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormCheckboxGroup must be used within a FormProvider or passed a control prop.'
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
      labelIcon={labelIcon}
      tooltip={tooltip}
      required={required}
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      itemProps={formItemProps}
    >
      <AppCheckboxGroup
        {...rest}
        {...field}
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
