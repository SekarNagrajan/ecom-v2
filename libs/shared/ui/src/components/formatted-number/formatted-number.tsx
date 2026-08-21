import React, { memo } from 'react';

import { useNumberFormat } from '../../hooks/use-number-format';
import type { FormattedNumberProps } from './types';

const FormattedNumberComponent: React.FC<FormattedNumberProps> = ({
  value,
  fallback = '-',
  options,
  className,
  style,
}) => {
  const { formatNumber } = useNumberFormat();

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

  const displayValue = formatNumber(numericValue, options);

  return (
    <span className={className} style={style}>
      {displayValue}
    </span>
  );
};

export const FormattedNumber = memo(FormattedNumberComponent);
