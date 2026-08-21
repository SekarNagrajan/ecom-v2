import { Form, type FormItemProps, Space } from 'antd';
import React, { useMemo } from 'react';

import { usePopupContainer } from '../../../hooks';
import { cn } from '../../../utils/cn';
import { normalizeTooltip, getAriaId } from './helper';
import type { FormFieldWrapperProps } from './types';

const FormFieldWrapperComponent: React.FC<FormFieldWrapperProps> = ({
  id,
  label,
  labelIcon,
  error,
  isValidating,
  tooltip,
  required,
  children,
  className,
  hasFeedback,
  itemProps, // For Form.Item
}) => {
  const getPopupContainer = usePopupContainer();

  // Calculate Status - memoized to avoid recalculation
  const status = useMemo((): FormItemProps['validateStatus'] => {
    if (itemProps?.validateStatus) {
      return itemProps.validateStatus; // Manual override (e.g., 'warning') wins
    } else if (error) {
      return 'error';
    } else if (isValidating) {
      return 'validating';
    } else if (hasFeedback && !error && !isValidating) {
      return 'success'; // Optional: Show checkmark if valid (only if hasFeedback is on)
    }
    return '';
  }, [itemProps?.validateStatus, error, isValidating, hasFeedback]);

  // Calculate Help Text (The message below input) - memoized
  const helpText = useMemo(
    () => itemProps?.help || error?.message,
    [itemProps?.help, error?.message]
  );

  // Memoize ariaId calculation
  const ariaId = useMemo(() => getAriaId(id), [id]);

  // Memoize help element
  const help = useMemo(
    () =>
      helpText ? (
        <span id={ariaId ? `${ariaId}-help` : undefined}>{helpText}</span>
      ) : undefined,
    [helpText, ariaId]
  );

  // Fix for tooltip clipping
  const normalizedTooltip = useMemo(() => {
    return normalizeTooltip(tooltip, getPopupContainer);
  }, [getPopupContainer, tooltip]);

  // Automated label with icon rendering
  const finalLabel = useMemo(() => {
    if (!label) return null;
    if (!labelIcon) return label;

    return (
      <Space size={8}>
        {labelIcon}
        {label}
      </Space>
    );
  }, [label, labelIcon]);

  return (
    <Form.Item
      style={{ width: '100%' }}
      {...itemProps}
      id={id}
      htmlFor={id}
      label={finalLabel}
      validateStatus={status}
      help={help}
      hasFeedback={hasFeedback}
      className={cn(className, itemProps?.className)}
      tooltip={normalizedTooltip}
      required={required}
    >
      {children}
    </Form.Item>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const FormFieldWrapper = React.memo(FormFieldWrapperComponent);
