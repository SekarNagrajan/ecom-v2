import { UserOutlined } from '@ant-design/icons';
import { Avatar, theme, type AvatarProps } from 'antd';

interface UserAvatarProps extends Omit<AvatarProps, 'children'> {
  initials?: string | null;
}

export function UserAvatar({
  initials,
  icon,
  style,
  ...props
}: UserAvatarProps) {
  const { token } = theme.useToken();
  const trimmedInitials = initials?.trim();

  return (
    <Avatar
      {...props}
      icon={trimmedInitials ? undefined : icon ?? <UserOutlined />}
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
