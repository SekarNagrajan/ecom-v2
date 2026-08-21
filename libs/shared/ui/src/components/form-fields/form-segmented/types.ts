import type { SegmentedProps } from 'antd';
import type { CSSProperties } from 'react';
import type { FieldValues } from 'react-hook-form';

import type { BaseControlledFieldProps } from '../common/types';

/**
 * Base Props for Segmented
 * We omit 'value', 'onChange' (handled by RHF) and 'label' (to avoid conflicts with our BaseControlledFieldProps)
 * Redefine 'options' to support ReadonlyArray for 'as const' constants.
 */
type BaseSegmentedProps = Omit<
  SegmentedProps,
  'value' | 'onChange' | 'label' | 'options'
> & {
  optionMinWidth?: CSSProperties['minWidth'];
  options:
    | SegmentedProps['options']
    | ReadonlyArray<NonNullable<SegmentedProps['options']>[number]>;
};

export type FormSegmentedProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & BaseSegmentedProps;
