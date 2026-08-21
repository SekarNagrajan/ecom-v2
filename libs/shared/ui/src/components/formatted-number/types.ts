import type { CSSProperties, ReactNode } from 'react';

import type { CurrencyDisplay } from '../../providers/types';

export type NumberValue = number | string | null | undefined;

export interface FormattedNumberProps {
  value: NumberValue;
  fallback?: ReactNode;
  options?: Intl.NumberFormatOptions;
  className?: string;
  style?: CSSProperties;
}

export interface FormattedCurrencyProps
  extends Omit<FormattedNumberProps, 'options'> {
  currency?: string;
  currencyDisplay?: CurrencyDisplay;
  options?: Intl.NumberFormatOptions;
}

export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  fallback?: string;
}

export interface FormatCurrencyOptions extends Intl.NumberFormatOptions {
  currency?: string;
  fallback?: string;
}

export interface UseNumberFormatReturn {
  formatNumber: (value: NumberValue, options?: FormatNumberOptions) => string;
  formatCurrency: (
    value: NumberValue,
    options?: FormatCurrencyOptions
  ) => string;
}
