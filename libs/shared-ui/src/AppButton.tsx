import React from 'react';
import { Button, ButtonProps } from 'antd';

export interface AppButtonProps extends ButtonProps {
  // Custom solverminds extensions if needed
}

export const AppButton: React.FC<AppButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <Button className={`sm-app-button ${className}`} {...props}>
      {children}
    </Button>
  );
};
