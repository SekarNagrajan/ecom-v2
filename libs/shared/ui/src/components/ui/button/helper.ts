import { type ButtonProps } from 'antd';

import { type AppButtonVariant } from './types';

type AntdButtonConfig = {
  type: ButtonProps['type'];
  danger?: ButtonProps['danger'];
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
};

export const getAntdButtonConfig = (
  variant: AppButtonVariant
): AntdButtonConfig => {
  switch (variant) {
    case 'secondary':
      // We're using Custom ButtonWrapper with secondaryColor as primaryColor to render
      return { type: 'primary' };
    case 'ghost':
      return { type: 'text' };
    case 'link':
      return { type: 'link' };
    case 'danger':
      return { type: 'primary', danger: true };
    case 'success':
      return {
        type: 'primary',
        color: 'green',
        variant: 'solid',
      };
    case 'primary':
    default:
      return { type: 'primary' };
  }
};
