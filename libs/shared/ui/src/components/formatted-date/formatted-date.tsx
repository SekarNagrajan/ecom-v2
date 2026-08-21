import React, { memo } from 'react';

import { useDateFormat } from '../../hooks/use-date-format';
import type { FormattedDateProps } from './types';

/**
 * FormattedDate component
 *
 * Displays a date/time string formatted according to app configuration.
 * Automatically uses timezone, dateFormat, and timeFormat from AppConfigProvider.
 *
 * @example
 * // Date only
 * <FormattedDate value={user.createdAt} />
 *
 * // Date and time
 * <FormattedDate value={user.createdAt} showTime />
 *
 * // Relative time ("2 days ago")
 * <FormattedDate value={user.createdAt} relative />
 *
 * // Custom fallback
 * <FormattedDate value={null} fallback="Not set" />
 */
const FormattedDateComponent: React.FC<FormattedDateProps> = ({
  value,
  showTime = false,
  relative = false,
  fallback = '-',
  className,
  style,
}) => {
  const { formatDate, formatDateTime, formatRelative } = useDateFormat();

  let displayValue: React.ReactNode;

  if (!value) {
    displayValue = fallback;
  } else if (relative) {
    displayValue = formatRelative(value);
  } else if (showTime) {
    displayValue = formatDateTime(value);
  } else {
    displayValue = formatDate(value);
  }

  return (
    <span className={className} style={style}>
      {displayValue}
    </span>
  );
};

export const FormattedDate = memo(FormattedDateComponent);
