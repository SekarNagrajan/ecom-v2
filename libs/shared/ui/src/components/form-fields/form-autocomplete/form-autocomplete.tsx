import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { AppAutoComplete } from '../../ui/autocomplete';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import type { FormAutocompleteProps } from './types';

export function FormAutocomplete<T extends FieldValues>({
  name,
  control: propsControl,
  label,
  tooltip,
  required,
  hasFeedback,
  wrapperClassName,
  formItemProps,
  id: propsId,
  ...rest
}: FormAutocompleteProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormAutocomplete must be used within a FormProvider or passed a control prop.'
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
      <AppAutoComplete
        {...rest}
        value={field.value}
        onChange={field.onChange}
      />
    </FormFieldWrapper>
  );
}
