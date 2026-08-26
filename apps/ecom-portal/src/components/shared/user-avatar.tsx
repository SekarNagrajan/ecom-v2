// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { Avatar, theme, type AvatarProps } from 'antd';

import { AppIcon, Icons } from '../icons';

interface UserAvatarProps extends Omit<AvatarProps, 'children'> {
  initials?: string | null;
}

export function UserAvatar({
  initials,
  icon,
  style,
  className,
  ...props
}: UserAvatarProps) {
  const { token } = theme.useToken();
  const trimmedInitials = initials?.trim();

  return (
    <Avatar
      {...props}
      icon={trimmedInitials ? undefined : icon ?? <AppIcon icon={Icons.user} size={18} />}
      className={['app-icon-inherit', 'primary-surface', className].filter(Boolean).join(' ')}
      style={{
        backgroundColor: token.colorPrimary,
        color: token.colorTextLightSolid,
        flexShrink: 0,
        fontWeight: token.fontWeightStrong,
        ...style,
      }}
    >
      {trimmedInitials || undefined}
    </Avatar>
  );
}
