import { useCallback } from 'react';

import type {
  FormatCurrencyOptions,
  FormatNumberOptions,
  NumberValue,
  UseNumberFormatReturn,
} from '../components/formatted-number/types';
import { formatCurrency as formatCurrencyUtil } from '../utils/i18n/currency-helpers';
import {
  parseNumberValue,
  formatNumber as formatNumberUtil,
} from '../utils/i18n/locale-helpers';
import { useAppConfig } from './use-app-config';

export const useNumberFormat = (): UseNumberFormatReturn => {
  const { formattingRegion, currency, currencyDisplay } = useAppConfig();

  const formatNumber = useCallback(
    (value: NumberValue, options?: FormatNumberOptions): string => {
      const fallback = options?.fallback ?? '-';
      const numericValue = parseNumberValue(value);

      if (numericValue === null) return fallback;

      const { fallback: _fallback, ...intlOptions } = options ?? {};
      return formatNumberUtil(numericValue, formattingRegion, intlOptions);
    },
    [formattingRegion]
  );

  const formatCurrency = useCallback(
    (value: NumberValue, options?: FormatCurrencyOptions): string => {
      const fallback = options?.fallback ?? '-';
      const numericValue = parseNumberValue(value);

      if (numericValue === null) return fallback;

      const {
        fallback: _fallback,
        currency: overrideCurrency,
        currencyDisplay: overrideCurrencyDisplay,
        style: _style,
        ...intlOptions
      } = options ?? {};

      return formatCurrencyUtil(
        numericValue,
        formattingRegion,
        overrideCurrency ?? currency,
        {
          currencyDisplay: overrideCurrencyDisplay ?? currencyDisplay,
          ...intlOptions,
        }
      );
    },
    [formattingRegion, currency, currencyDisplay]
  );

  return {
    formatNumber,
    formatCurrency,
  };
};
