import type { SwitchProps } from 'antd';

export type AppSwitchLabelPosition = 'left' | 'right' | 'top' | 'bottom';

export interface AppSwitchProps extends Omit<SwitchProps, 'children'> {
  labelPosition?: AppSwitchLabelPosition;
  description?: string;
  isLoading?: boolean;
  required?: boolean;
  labelSpacing?: number;
  children?: React.ReactNode;
}
