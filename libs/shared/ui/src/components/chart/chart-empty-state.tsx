import { Flex, theme, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

export interface ChartEmptyStateProps {
  message?: ReactNode;
  icon?: ReactNode;
}

const DEFAULT_MESSAGE = 'No data available';

const DefaultIcon = ({ color }: { color: string }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 3v18h18" />
    <path d="M7 14l3-3 3 3 5-6" />
  </svg>
);

export function ChartEmptyState({
  message = DEFAULT_MESSAGE,
  icon,
}: ChartEmptyStateProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={token.marginXS}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 160,
        color: token.colorTextTertiary,
      }}
    >
      {icon ?? <DefaultIcon color={token.colorTextTertiary} />}
      <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {message}
      </Text>
    </Flex>
  );
}
