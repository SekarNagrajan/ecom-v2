import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { AppSelect } from '../../ui/select';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import type { FormSelectProps } from './types';

export function FormSelect<T extends FieldValues>({
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

  // Select Props
  ...rest
}: FormSelectProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormSelect must be used within a FormProvider or passed a control prop.'
    );
  }

  // Use useController for better performance - more stable than Controller render prop
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
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      itemProps={formItemProps}
    >
      <AppSelect
        {...rest}
        {...field}
        id={id}
        invalid={!!fieldState.error}
        required={required}
      />
    </FormFieldWrapper>
  );
}
