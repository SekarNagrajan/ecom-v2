import { useAntdBreakpoint } from '@solverminds/shared-ui/hooks';
import { Flex, theme, Typography } from 'antd';
import { type ReactNode } from 'react';

const { Text } = Typography;

export interface FormSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  embedded?: boolean;
  children: ReactNode;
}

export function FormSection({
  title,
  description,
  action,
  embedded = false,
  children,
}: FormSectionProps) {
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();
  const sectionPadding = isMobile ? token.paddingSM : token.paddingMD;
  const hasHeader = Boolean(title) || Boolean(description) || Boolean(action);

  if (embedded) {
    return <>{children}</>;
  }

  return (
    <section
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        padding: sectionPadding,
        display: 'flex',
        flexDirection: 'column',
        gap: token.marginSM,
      }}
    >
      {hasHeader ? (
        <Flex justify="space-between" align="center" gap={token.marginSM} wrap>
          <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, flex: 1 }}>
            {title ? (
              <Text
                style={{
                  fontSize: token.fontSizeLG,
                  fontWeight: 500,
                  lineHeight: token.lineHeight,
                  color: token.colorText,
                }}
              >
                {title}
              </Text>
            ) : null}
            {description ? <Text type="secondary">{description}</Text> : null}
          </Flex>
          {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
        </Flex>
      ) : null}

      <div>{children}</div>
    </section>
  );
}
