import type { CheckboxProps } from 'antd';

export type AppCheckboxLabelPosition = 'left' | 'right' | 'top' | 'bottom';

export interface AppCheckboxProps extends Omit<CheckboxProps, 'children'> {
  labelPosition?: AppCheckboxLabelPosition;
  description?: string;
  isLoading?: boolean;
  required?: boolean;
  labelSpacing?: number;
  children?: React.ReactNode;
}
