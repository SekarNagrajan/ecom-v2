import { Button, Flex, theme } from 'antd';
import { type DateTime } from 'luxon';
import { useCallback } from 'react';

import {
  AntdLuxonDatePicker,
  type AntdLuxonDatePickerProps,
} from '../../../base/antd-luxon-date-picker';
import { cn } from '../../../utils/cn';
import type { AppDateRangePickerProps } from './types';

export function MobileDateRangePicker({
  value,
  onChange,
  presets,
  disabledDate,
  className,
  style,
  id,
  open: _open,
  onOpenChange: _onOpenChange,
  ...rest
}: AppDateRangePickerProps) {
  const { token } = theme.useToken();
  const [startValue, endValue] = (value as [
    DateTime | null,
    DateTime | null
  ]) || [null, null];

  const handleStartChange = useCallback(
    (date: DateTime | null) => {
      onChange?.(
        [date, endValue],
        [
          date ? date.toUTC().toISO() ?? '' : '',
          endValue ? endValue.toUTC().toISO() ?? '' : '',
        ]
      );
    },
    [endValue, onChange]
  );

  const handleEndChange = useCallback(
    (date: DateTime | null) => {
      onChange?.(
        [startValue, date],
        [
          startValue ? startValue.toUTC().toISO() ?? '' : '',
          date ? date.toUTC().toISO() ?? '' : '',
        ]
      );
    },
    [startValue, onChange]
  );

  const handleBlur = useCallback(() => {
    if (startValue && endValue && startValue > endValue) {
      // Swap values if start > end
      onChange?.(
        [endValue, startValue],
        [endValue.toUTC().toISO() ?? '', startValue.toUTC().toISO() ?? '']
      );
    }
  }, [startValue, endValue, onChange]);

  const disabledStartDate = useCallback(
    (current: DateTime) => {
      if (disabledDate?.(current, { type: 'date', from: undefined }))
        return true;
      return false;
    },
    [disabledDate]
  );

  const disabledEndDate = useCallback(
    (current: DateTime) => {
      if (
        disabledDate?.(current, {
          type: 'date',
          from: startValue ?? undefined,
        })
      )
        return true;
      return false;
    },
    [disabledDate, startValue]
  );

  const applyPreset = useCallback(
    (
      value: NonNullable<AppDateRangePickerProps['presets']>[number]['value']
    ) => {
      const resolvedValue = typeof value === 'function' ? value() : value;

      if (!Array.isArray(resolvedValue)) {
        return;
      }

      const [startDate, endDate] = resolvedValue;
      onChange?.(
        [startDate ?? null, endDate ?? null],
        [
          startDate ? startDate.toUTC().toISO() ?? '' : '',
          endDate ? endDate.toUTC().toISO() ?? '' : '',
        ]
      );
    },
    [onChange]
  );

  const isPresetSelected = useCallback(
    (
      value: NonNullable<AppDateRangePickerProps['presets']>[number]['value']
    ) => {
      const resolvedValue = typeof value === 'function' ? value() : value;

      if (!Array.isArray(resolvedValue)) {
        return false;
      }

      const [startDate, endDate] = resolvedValue;

      return Boolean(
        startValue &&
          endValue &&
          startDate &&
          endDate &&
          startValue.hasSame(startDate, 'day') &&
          endValue.hasSame(endDate, 'day')
      );
    },
    [endValue, startValue]
  );

  return (
    <Flex
      vertical
      gap="small"
      className={cn('w-full', className)}
      style={style}
    >
      {presets && presets.length > 0 && (
        <Flex
          wrap
          gap={token.marginXS}
          style={{
            paddingBlock: token.paddingXXS,
            paddingInline: token.paddingXXS,
            marginBottom: token.marginSM,
          }}
        >
          {presets.map((preset, index) => (
            <Button
              key={index}
              type={isPresetSelected(preset.value) ? 'primary' : 'default'}
              onClick={() => applyPreset(preset.value)}
              style={{
                paddingBlock: token.paddingXXS,
                paddingInline: token.paddingSM,
                borderRadius: token.borderRadiusSM,
                fontSize: token.fontSize,
                height: 'auto',
              }}
            >
              {preset.label}
            </Button>
          ))}
        </Flex>
      )}

      <AntdLuxonDatePicker
        {...(rest as unknown as AntdLuxonDatePickerProps)}
        id={id ? `${id}-start` : undefined}
        placeholder="Start Date"
        value={startValue}
        onChange={(date) => {
          handleStartChange(date as DateTime | null);
        }}
        onBlur={handleBlur}
        disabledDate={disabledStartDate}
        className="w-full"
      />

      <AntdLuxonDatePicker
        {...(rest as unknown as AntdLuxonDatePickerProps)}
        id={id ? `${id}-end` : undefined}
        placeholder="End Date"
        value={endValue}
        onChange={(date) => handleEndChange(date as DateTime | null)}
        onBlur={handleBlur}
        disabledDate={disabledEndDate}
        className="w-full"
      />
    </Flex>
  );
}
