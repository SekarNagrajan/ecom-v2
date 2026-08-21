import { theme } from 'antd';
import { type DateTime } from 'luxon';
import { useState } from 'react';

import { useAppConfig } from '../../../../hooks/use-app-config';
import {
  parseStoredDateTimeToZone,
  toCalendarDateString,
} from '../../../../utils';
import { AppDateRangePicker } from '../../../ui/date-range-picker';
import type { DateRangeFilterControlProps } from './filter-control-types';

/**
 * Date range filter control component
 * Filters items within a date range (inclusive)
 */
export function DateRangeFilterControl({
  config,
  value,
  onChange,
  size,
  disabled,
}: DateRangeFilterControlProps) {
  const { timezone } = useAppConfig();
  const { token } = theme.useToken();
  const [isFocused, setIsFocused] = useState(false);

  const currentValue = value?.value as [string, string] | undefined;

  const hasRange = currentValue && Array.isArray(currentValue);
  const rangeValue: [DateTime | null, DateTime | null] = hasRange
    ? [
        currentValue[0]
          ? parseStoredDateTimeToZone(currentValue[0], timezone)
          : null,
        currentValue[1]
          ? parseStoredDateTimeToZone(currentValue[1], timezone)
          : null,
      ]
    : [null, null];

  const handleChange = (dates: [DateTime | null, DateTime | null] | null) => {
    if (!dates || (!dates[0] && !dates[1])) {
      onChange(undefined);
      return;
    }

    onChange({
      field: config.field,
      type: 'daterange',
      value: [toCalendarDateString(dates[0]), toCalendarDateString(dates[1])],
      operator: 'between',
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${
          isFocused ? token.colorPrimary : token.colorBorder
        }`,
        borderRadius: token.borderRadius,
        transition: 'all 0.2s',
        boxShadow: isFocused ? `0 0 0 2px ${token.colorPrimaryBg}` : 'none',
        background: disabled
          ? token.colorBgContainerDisabled
          : token.colorBgContainer,
        overflow: 'hidden',
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <AppDateRangePicker
        value={rangeValue}
        onChange={handleChange}
        placeholder={['Start date', 'End date']}
        size={size}
        disabled={disabled}
        allowClear
        variant="borderless"
        style={{ width: '100%' }}
      />
    </div>
  );
}
