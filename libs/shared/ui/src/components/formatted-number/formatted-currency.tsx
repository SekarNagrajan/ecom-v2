import React, { memo } from 'react';

import { useNumberFormat } from '../../hooks/use-number-format';
import type { FormattedCurrencyProps } from './types';

const FormattedCurrencyComponent: React.FC<FormattedCurrencyProps> = ({
  value,
  fallback = '-',
  options,
  className,
  style,
  currency,
  currencyDisplay,
}) => {
  const { formatCurrency } = useNumberFormat();

  if (value === null || value === undefined || value === '') {
    return (
      <span className={className} style={style}>
        {fallback}
      </span>
    );
  }

  const numericValue = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numericValue)) {
    return (
      <span className={className} style={style}>
        {fallback}
      </span>
    );
  }

  const displayValue = formatCurrency(numericValue, {
    currency,
    currencyDisplay,
    ...options,
  });

  return (
    <span className={className} style={style}>
      {displayValue}
    </span>
  );
};

export const FormattedCurrency = memo(FormattedCurrencyComponent);
