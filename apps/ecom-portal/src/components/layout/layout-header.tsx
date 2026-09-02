// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { AppButton } from "@solverminds/shared-ui";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { Flex, Layout, Typography, theme } from "antd";
import React, { useState } from "react";

import { AppIcon, Icons } from "../icons";
import { UserMenu } from "./user-menu";

const { Header } = Layout;
const { Text } = Typography;

export const LayoutHeader: React.FC = () => {
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const headerInlinePadding = isMobile ? token.paddingSM : token.paddingMD;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <Header
      style={{
        width: "100%",
        zIndex: token.zIndexBase + 10,
        display: "flex",
        alignItems: "center",
        gap: token.marginMD,
        paddingInline: headerInlinePadding,
        height: 64,
        background: token.colorBgLayout,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        flex: "0 0 auto",
      }}
    >
      <Flex
        vertical
        style={{
          flex: "0 0 auto",
          minWidth: 0,
        }}
      >
        <Text
          strong
          ellipsis
          style={{
            color: token.colorText,
            fontSize: token.fontSizeLG,
            lineHeight: token.lineHeightLG,
          }}
        >
          Solverminds E-Commerce Portal
        </Text>
        <Text
          type="secondary"
          ellipsis
          style={{
            fontSize: token.fontSizeSM,
            lineHeight: token.lineHeightSM,
          }}
        >
          Customer Service & Schedules Workspace
        </Text>
      </Flex>

      <Flex
        align="center"
        gap={token.marginSM}
        style={{
          marginLeft: "auto",
          flex: "0 1 auto",
          minWidth: 0,
          justifyContent: "flex-end",
        }}
      >
        {/* <HeaderThemeToggle /> */}
        <AppButton
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          icon={
            <AppIcon
              icon={isFullscreen ? Icons.minimize : Icons.expand}
              size={16}
            />
          }
          onClick={toggleFullscreen}
          size="small"
          type="text"
        />
        <UserMenu />
      </Flex>
    </Header>
  );
};
