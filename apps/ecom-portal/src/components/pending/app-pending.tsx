// Modified by Sekar Nagarajan (2026-09-07 17:24)
import { Flex, Spin, Typography, theme } from "antd";

const { Text } = Typography;

interface AppPendingFallbackProps {
  message?: string;
}

export function AppPendingFallback({
  message = "Loading...",
}: AppPendingFallbackProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{
        flex: 1,
        width: "100%",
        minHeight: "100%",
        padding: token.paddingLG,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <Spin size="large" style={{ marginBottom: token.marginMD }} />
      <Text type="secondary">{message}</Text>
    </Flex>
  );
}
