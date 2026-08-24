import { AppButton } from '@solverminds/shared-ui';
import { Flex, Tooltip, theme } from 'antd';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

const ACTION_TOOLTIP_DELAY = 0.5; // 500ms

export interface ListActionButtonProps {
  icon: ReactNode;
  title: string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  danger?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  color?: string;
}

export function ListActionButton({
  icon,
  title,
  onClick,
  danger,
  disabled,
  ariaLabel,
  color,
}: ListActionButtonProps) {
  const { token } = theme.useToken();
  const style: CSSProperties = {
    padding: 0,
    height: 'auto',
    fontSize: token.fontSizeLG,
    ...(color && !disabled ? { color } : {}),
  };

  return (
    <Tooltip title={title} mouseEnterDelay={ACTION_TOOLTIP_DELAY}>
      <AppButton
        type="link"
        size="small"
        icon={icon}
        aria-label={ariaLabel ?? title}
        danger={danger}
        disabled={disabled}
        onClick={onClick}
        style={style}
      />
    </Tooltip>
  );
}

interface ListActionsRowProps {
  children: ReactNode;
}

export function ListActionsRow({ children }: ListActionsRowProps) {
  const { token } = theme.useToken();
  return (
    <Flex
      align="center"
      gap={token.marginSM}
      style={{ height: '100%', lineHeight: 1 }}
    >
      {children}
    </Flex>
  );
}
