// Modified by Antigravity (2026-08-21)
import { Flex, Layout, Typography, theme } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

export function AppFooter() {
  const { token } = theme.useToken();

  return (
    <Footer
      style={{
        textAlign: 'center',
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        padding: `${token.paddingXS}px ${token.paddingLG}px`,
        zIndex: 2,
      }}
    >
      <Flex justify="space-between" align="center">
        <Text type="secondary" style={{ fontSize: 12 }}>
          Version 1.0.0
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Copyright &copy; {new Date().getFullYear()} All rights reserved. Solverminds Solutions &amp; Technologies Pvt.Ltd
        </Text>
      </Flex>
    </Footer>
  );
}
