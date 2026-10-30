import { Flex, theme, Typography } from 'antd';

import { AppButton } from '../button';
import { EmptyStateShipArt } from './empty-state-ship-art';
import type { AppEmptyStateProps } from './types';

const { Title, Text } = Typography;

const ART_WIDTH: Record<NonNullable<AppEmptyStateProps['artSize']>, number> = {
  sm: 150,
  md: 220,
};

export function AppEmptyState({
  variant = 'filtered',
  title,
  message,
  actions,
  artSize = 'md',
  hideArt = false,
  className,
  style,
}: AppEmptyStateProps) {
  const { token } = theme.useToken();
  const hasActions = Boolean(actions && actions.length > 0);

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      className={className}
      role="status"
      aria-live="polite"
      style={{
        width: '100%',
        textAlign: 'center',
        padding: `${token.paddingXL}px ${token.paddingLG}px`,
        ...style,
      }}
    >
      {!hideArt ? (
        <EmptyStateShipArt
          variant={variant}
          width={ART_WIDTH[artSize]}
          className="app-empty-state__art"
        />
      ) : null}

      <Title
        level={4}
        style={{
          marginTop: hideArt ? 0 : token.marginMD,
          marginBottom: token.marginXS,
          fontSize: artSize === 'sm' ? token.fontSizeLG : 18,
          fontWeight: 600,
          color: token.colorText,
          lineHeight: 1.35,
        }}
      >
        {title}
      </Title>

      {message ? (
        <Text
          type="secondary"
          style={{
            fontSize: token.fontSizeSM,
            lineHeight: 1.55,
            maxWidth: '42ch',
            margin: 0,
          }}
        >
          {message}
        </Text>
      ) : null}

      {hasActions ? (
        <Flex
          wrap="wrap"
          justify="center"
          gap={token.marginXS}
          style={{ marginTop: token.marginMD }}
        >
          {actions!.map((action) => (
            <AppButton
              key={action.key}
              type={action.type ?? 'default'}
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </AppButton>
          ))}
        </Flex>
      ) : null}
    </Flex>
  );
}
