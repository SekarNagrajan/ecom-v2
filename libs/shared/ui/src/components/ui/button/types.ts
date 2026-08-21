import type { ButtonProps } from 'antd';

export type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'danger'
  | 'success';

export interface AppButtonProps extends ButtonProps {
  appVariant?: AppButtonVariant;
  enableRateLimit?: boolean;
  rateLimitDuration?: number;
}
