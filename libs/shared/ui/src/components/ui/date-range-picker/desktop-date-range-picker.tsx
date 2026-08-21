import { Flex, Tag, theme } from 'antd';
import { useCallback } from 'react';

import { AntdLuxonDateRangePicker } from '../../../base/antd-luxon-date-range-picker';
import type { AppDateRangePickerProps } from './types';

export function DesktopDateRangePicker(props: AppDateRangePickerProps) {
  const { token } = theme.useToken();
  const {
    presets,
    presetsPlacement = 'left',
    onChange,
    onOpenChange,
    renderExtraFooter,
    ...rest
  } = props;

  // Desktop Footer Logic
  const renderFooter = useCallback(() => {
    if (presetsPlacement !== 'bottom' || !presets || presets.length === 0) {
      return null;
    }

    return (
      <Flex
        wrap
        gap={token.marginXS}
        style={{
          paddingBlock: token.paddingXS,
          paddingInline: token.paddingSM,
        }}
      >
        {presets.map((preset, index) => (
          <Tag
            key={index}
            className="cursor-pointer hover:opacity-80 m-0"
            style={{
              paddingBlock: token.paddingXXS,
              paddingInline: token.paddingXS,
            }}
            onClick={() => {
              const val =
                typeof preset.value === 'function'
                  ? preset.value()
                  : preset.value;

              if (Array.isArray(val)) {
                // Safely cast to expected tuple type
                const [startDate, endDate] = val;

                // Call onChange with DateTime objects
                onChange?.(
                  [startDate ?? null, endDate ?? null],
                  [
                    startDate ? startDate.toUTC().toISO() ?? '' : '',
                    endDate ? endDate.toUTC().toISO() ?? '' : '',
                  ]
                );

                // Close the picker
                onOpenChange?.(false);
              }
            }}
          >
            {preset.label}
          </Tag>
        ))}
      </Flex>
    );
  }, [
    onChange,
    onOpenChange,
    presets,
    presetsPlacement,
    token.marginXS,
    token.paddingSM,
    token.paddingXS,
    token.paddingXXS,
  ]);

  const effectivePresets = presetsPlacement === 'left' ? presets : undefined;

  return (
    <AntdLuxonDateRangePicker
      {...rest}
      presets={effectivePresets}
      onChange={onChange}
      onOpenChange={onOpenChange}
      renderExtraFooter={
        presetsPlacement === 'bottom' ? renderFooter : renderExtraFooter
      }
    />
  );
}
