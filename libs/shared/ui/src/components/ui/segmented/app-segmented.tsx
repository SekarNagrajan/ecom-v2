import { Segmented } from 'antd';
import type { CSSProperties } from 'react';

import { toSegmentedOptions } from './app-segmented-utils';
import type { AppSegmentedProps, AppSegmentedValue } from './types';

export function AppSegmented<
  ValueType extends AppSegmentedValue = AppSegmentedValue
>({
  options,
  value,
  onChange,
  disabled,
  size,
  className,
  style,
  id,
  optionMinWidth,
  ...rest
}: AppSegmentedProps<ValueType>) {
  const segmentedOptions = toSegmentedOptions(options, optionMinWidth);
  // Lock Segmented to `'middle'` (unless the caller explicitly opts into a
  // size). Density scaling is already baked into the global `controlHeight`
  // token by the theme builder, and Input / Select stay at `'middle'` too,
  // so this keeps Segmented track height in sync with surrounding form
  // controls at every density. Switching to `'small'` / `'large'` would
  // pull in `controlHeightSM` / `controlHeightLG`, which Select doesn't
  // use, and produce the height mismatch.
  const resolvedSize = size ?? 'middle';

  const scrollStyle: CSSProperties = {
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorX: 'contain',
    WebkitOverflowScrolling: 'touch',
    userSelect: 'none',
  };
  const segmentedStyle = {
    ...style,
    width: style?.width ?? 'max-content',
    minWidth: style?.minWidth ?? (rest.block ? '100%' : undefined),
    overflowX: 'visible',
    userSelect: 'none',
  } satisfies CSSProperties;

  return (
    <div style={scrollStyle}>
      <Segmented<ValueType>
        {...rest}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        size={resolvedSize}
        className={className}
        style={segmentedStyle}
        options={segmentedOptions}
      />
    </div>
  );
}
