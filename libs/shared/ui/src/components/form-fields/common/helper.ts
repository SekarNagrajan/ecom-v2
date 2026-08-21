import type { FormItemProps, TooltipProps } from 'antd';
import React from 'react';
import type { FieldError } from 'react-hook-form';

import type { PopupContainerResolver } from '../../../providers';

export const normalizeTooltip = (
  tooltip: FormItemProps['tooltip'] | undefined,
  getPopupContainer: PopupContainerResolver
): FormItemProps['tooltip'] => {
  if (!tooltip) return undefined;

  // ReactNode / string / JSX / Promise / Iterable
  if (
    typeof tooltip === 'string' ||
    typeof tooltip === 'number' ||
    React.isValidElement(tooltip)
  ) {
    const props: TooltipProps = {
      title: tooltip,
      getPopupContainer,
    };

    return props;
  }

  // Tooltip props object (WrapperTooltipProps)
  if (typeof tooltip === 'object') {
    return {
      ...tooltip,
      getPopupContainer:
        (tooltip as TooltipProps).getPopupContainer ?? getPopupContainer,
    };
  }

  return tooltip;
};

export const getAriaId = (id: unknown): string | undefined => {
  if (typeof id === 'string') return id;
  if (id && typeof id === 'object') {
    if ('start' in id && typeof id.start === 'string') {
      return id.start;
    }
    if (Array.isArray(id) && typeof id[0] === 'string') {
      return id[0];
    }
  }
  return undefined;
};

export interface A11yProps<T = string> {
  id?: T;
  error?: FieldError;
  required?: boolean;
  autoComplete?: string;
}

export const getA11yProps = <T>({
  id,
  error,
  required,
  autoComplete,
}: A11yProps<T>) => {
  const ariaId = getAriaId(id);

  return {
    id,
    autoComplete,
    'aria-invalid': !!error,
    'aria-required': required,
    'aria-describedby': error && ariaId ? `${ariaId}-help` : undefined,
  };
};
