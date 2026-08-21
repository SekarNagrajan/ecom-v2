import { Avatar, Badge, Flex, Typography, theme } from 'antd';

import type { EmailThreadListItemRenderProps } from '../types';

export function EmailThreadListItemDefault({
  thread,
  isSelected,
  formattedDate,
  onSelect,
}: EmailThreadListItemRenderProps) {
  const { token } = theme.useToken();
  const primaryParticipant = thread.participants[0];
  const displayName =
    primaryParticipant?.name ?? primaryParticipant?.email ?? 'Unknown';
  const initials = displayName
    .split(' ')
    .map((part) => part.trim()[0] ?? '')
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        appearance: 'none',
        borderRadius: token.borderRadius,
        border: `1px solid ${
          isSelected ? token.colorPrimaryBorder : token.colorBorderSecondary
        }`,
        background: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
        padding: token.paddingSM,
        cursor: 'pointer',
      }}
    >
      <Flex vertical gap={token.marginXXS}>
        <Flex justify="space-between" gap={token.marginXS}>
          <Flex align="center" gap="middle" style={{ flex: 1, minWidth: 0 }}>
            <Badge count={thread.unreadCount} size="small">
              <Avatar
                size={token.controlHeight}
                style={{
                  backgroundColor: isSelected
                    ? token.colorPrimary
                    : token.colorPrimaryBgHover,
                  color: isSelected ? token.colorWhite : token.colorPrimary,
                }}
              >
                {initials}
              </Avatar>
            </Badge>

            <Flex vertical style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text strong ellipsis>
                {thread.subject}
              </Typography.Text>
              <Typography.Text type="secondary" ellipsis>
                {displayName}
              </Typography.Text>
            </Flex>
          </Flex>

          <Typography.Text type="secondary">{formattedDate}</Typography.Text>
        </Flex>

        <Typography.Text type="secondary" ellipsis>
          {thread.snippet}
        </Typography.Text>
      </Flex>
    </button>
  );
}
