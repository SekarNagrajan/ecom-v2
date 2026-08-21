import { Radio, type RadioGroupProps } from 'antd';
import type { CSSProperties } from 'react';

import { type AppRadioGroupProps } from './types';

const { Group } = Radio;

export function AppRadioGroup({
  options = [],
  value,
  defaultValue,
  onChange,
  disabled,
  children,
  gap,
  style,
  ...rest
}: AppRadioGroupProps) {
  // When a gap is requested we lay the group out as a wrapping flex row so the
  // gap applies between every option (including across wrap lines). Otherwise
  // we fall through to AntD's default inline rendering for backward-compat.
  const resolvedStyle: CSSProperties | undefined =
    gap !== undefined
      ? { display: 'flex', flexWrap: 'wrap', gap, ...style }
      : style;

  return (
    <Group
      {...rest}
      /**
       * Type safety is strictly handled in AppRadioGroupProps.
       * We cast to mutable here to satisfy Ant Design's internal types without breaking reference stability.
       */
      options={
        options.length > 0 ? (options as RadioGroupProps['options']) : undefined
      }
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      disabled={disabled}
      style={resolvedStyle}
    >
      {children}
    </Group>
  );
}
