import type { RadioProps } from 'antd';

export type AppRadioLabelPosition = 'left' | 'right' | 'top' | 'bottom';

export interface AppRadioProps extends Omit<RadioProps, 'children'> {
  labelPosition?: AppRadioLabelPosition;
  description?: string;
  isLoading?: boolean;
  labelSpacing?: number;
  children?: React.ReactNode;
}
