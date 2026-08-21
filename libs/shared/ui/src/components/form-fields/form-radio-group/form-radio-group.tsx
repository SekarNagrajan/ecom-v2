import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { AppRadioGroup } from '../../ui/radio-group/app-radio-group';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import { getA11yProps } from '../common/helper';
import type { FormRadioGroupProps } from './types';

export function FormRadioGroup<T extends FieldValues>({
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
  children,

  ...rest
}: FormRadioGroupProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormRadioGroup must be used within a FormProvider or passed a control prop.'
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
      <AppRadioGroup
        {...rest}
        {...field}
        {...getA11yProps({
          id,
          error: fieldState.error,
          required,
          autoComplete,
        })}
      >
        {children}
      </AppRadioGroup>
    </FormFieldWrapper>
  );
}
