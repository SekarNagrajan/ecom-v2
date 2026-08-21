import { TreeSelect } from 'antd';
import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { FormFieldWrapper } from '../common/form-field-wrapper';
import type { FormTreeSelectProps } from './types';

export function FormTreeSelect<T extends FieldValues>({
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

  ...rest
}: FormTreeSelectProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormTreeSelect must be used within a FormProvider or passed a control prop.'
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
      <TreeSelect
        {...field}
        {...rest}
        id={id}
        status={fieldState.error ? 'error' : undefined}
      />
    </FormFieldWrapper>
  );
}
