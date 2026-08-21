import { Input, Space } from 'antd';
import { type DateTime } from 'luxon';
import { useCallback, useMemo } from 'react';

import { useAppConfig } from '../../../../hooks/use-app-config';
import {
  parseStoredDateTimeToZone,
  toCalendarDateString,
} from '../../../../utils';
import { AppDatePicker } from '../../../ui/date-picker';
import { AppDateRangePicker } from '../../../ui/date-range-picker';
import type {
  DateOperator,
  DateFilterField,
} from '../../stores/data-view-types';
import type { DateFilterControlProps } from './filter-control-types';
import { OperatorSelect } from './operator-select';

const OPERATOR_OPTIONS: Array<{ label: string; value: DateOperator }> = [
  { label: 'Equals', value: 'equals' },
  { label: 'Before', value: 'before' },
  { label: 'After', value: 'after' },
  { label: 'Between', value: 'between' },
  { label: 'Blank', value: 'blank' },
  { label: 'Not blank', value: 'notBlank' },
];

/**
 * Date filter control component
 * Supports operators: equals, before, after, between, blank, notBlank
 */
export function DateFilterControl({
  config,
  value,
  onChange,
  size,
  disabled,
}: DateFilterControlProps) {
  const { timezone } = useAppConfig();
  const dateConfig = config as DateFilterField;
  const currentOperator =
    (value?.operator as DateOperator) ?? dateConfig.defaultOperator ?? 'equals';

  const currentValue = value?.value as string | string[] | undefined;

  const isBlankOperator =
    currentOperator === 'blank' || currentOperator === 'notBlank';

  const dateValue = useMemo(() => {
    if (!currentValue || isBlankOperator) return null;
    if (Array.isArray(currentValue)) {
      return currentValue.map((v) =>
        v ? parseStoredDateTimeToZone(v, timezone) : null
      );
    }
    return parseStoredDateTimeToZone(currentValue, timezone);
  }, [currentValue, isBlankOperator, timezone]);

  const availableOperators =
    dateConfig.operators ?? OPERATOR_OPTIONS.map((o) => o.value);
  const operatorOptions = OPERATOR_OPTIONS.filter((o) =>
    availableOperators.includes(o.value)
  );

  const handleValueChange = useCallback(
    (date: DateTime<boolean> | DateTime<boolean>[] | null) => {
      if (!date) {
        onChange(undefined);
        return;
      }

      const isoValue = Array.isArray(date)
        ? date.map((d) => toCalendarDateString(d) ?? '').filter(Boolean)
        : toCalendarDateString(date) ?? '';

      onChange({
        field: config.field,
        type: 'date',
        value: isoValue,
        operator: currentOperator,
      });
    },
    [config.field, currentOperator, onChange]
  );

  const handleRangeChange = useCallback(
    (dates: [DateTime | null, DateTime | null] | null) => {
      if (!dates || (!dates[0] && !dates[1])) {
        onChange(undefined);
        return;
      }

      const isoValue = [
        toCalendarDateString(dates[0]),
        toCalendarDateString(dates[1]),
      ];

      onChange({
        field: config.field,
        type: 'date',
        value: isoValue,
        operator: currentOperator,
      });
    },
    [config.field, currentOperator, onChange]
  );

  const handleOperatorChange = useCallback(
    (operator: DateOperator) => {
      const isNewBlank = operator === 'blank' || operator === 'notBlank';

      let newValue: string | string[] | undefined | null = currentValue;
      if (isNewBlank) {
        newValue = undefined;
      } else if (operator === 'between' && !Array.isArray(currentValue)) {
        newValue = currentValue ? [currentValue, ''] : undefined;
      } else if (operator !== 'between' && Array.isArray(currentValue)) {
        newValue = currentValue[0] || '';
      }

      onChange({
        field: config.field,
        type: 'date',
        value: newValue,
        operator,
      });
    },
    [config.field, currentValue, onChange]
  );

  const showOperatorSelect = operatorOptions.length > 1;
  const isBetween = currentOperator === 'between';
  const blankLabel = currentOperator === 'blank' ? 'Blank' : 'Not blank';

  return (
    <Space.Compact block>
      {showOperatorSelect && (
        <Space.Addon style={{ padding: 0 }}>
          <OperatorSelect<DateOperator>
            value={currentOperator}
            onChange={handleOperatorChange}
            options={operatorOptions}
            size={size}
            disabled={disabled}
          />
        </Space.Addon>
      )}
      {!isBlankOperator &&
        (isBetween ? (
          <AppDateRangePicker
            value={
              Array.isArray(dateValue)
                ? (dateValue as [DateTime, DateTime])
                : null
            }
            onChange={handleRangeChange}
            placeholder={['Start', 'End']}
            size={size}
            disabled={disabled}
            allowClear
            style={{ width: '100%' }}
          />
        ) : (
          <AppDatePicker
            value={Array.isArray(dateValue) ? null : dateValue}
            onChange={handleValueChange}
            placeholder={config.placeholder ?? `Select ${config.label}`}
            size={size}
            disabled={disabled}
            allowClear
            style={{ width: '100%' }}
          />
        ))}
      {isBlankOperator && (
        <Input
          value={blankLabel}
          readOnly
          size={size}
          disabled={disabled}
          style={{
            fontStyle: 'italic',
            width: '100%',
          }}
        />
      )}
    </Space.Compact>
  );
}
