import type { SegmentedProps } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

export type AppSegmentedValue = string | number;

export type AppSegmentedAntdOptions<
  ValueType extends AppSegmentedValue = AppSegmentedValue
> = NonNullable<SegmentedProps<ValueType>['options']>;

export type AppSegmentedLabeledOption<
  ValueType extends AppSegmentedValue = AppSegmentedValue
> = {
  value: ValueType;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  title?: string;
  mobileIcon?: ReactNode;
  mobileLabel?: ReactNode;
};

export type AppSegmentedOption<
  ValueType extends AppSegmentedValue = AppSegmentedValue
> = ValueType | AppSegmentedLabeledOption<ValueType>;

export interface AppSegmentedProps<
  ValueType extends AppSegmentedValue = AppSegmentedValue
> extends Omit<SegmentedProps<ValueType>, 'options'> {
  options: ReadonlyArray<AppSegmentedOption<ValueType>>;
  optionMinWidth?: CSSProperties['minWidth'];
}
