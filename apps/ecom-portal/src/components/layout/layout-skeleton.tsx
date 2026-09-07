// Modified by Sekar Nagarajan (2026-09-07 17:24)
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { Flex, Layout, Skeleton, Spin, theme } from "antd";

const { Header, Content, Sider } = Layout;

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const HEADER_HEIGHT = 64;
const SIDEBAR_ICON_SIZE = 40;
const SIDEBAR_ICON_COUNT = 8;

/** Shell-shaped pending UI for `/app` while authenticated layout loads. */
export function LayoutSkeleton() {
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();

  return (
    <Layout
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
      }}
      hasSider={!isMobile}
    >
      {!isMobile ? (
        <Sider
          collapsible={false}
          collapsed
          width={SIDEBAR_WIDTH}
          collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
          theme="light"
          style={{
            overflow: "hidden",
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Flex vertical style={{ height: "100%" }}>
            <Flex
              align="center"
              justify="center"
              style={{ height: HEADER_HEIGHT, flex: "0 0 auto" }}
            >
              <Skeleton.Avatar
                active
                shape="square"
                size={36}
                style={{ borderRadius: token.borderRadius }}
              />
            </Flex>
            <Flex
              vertical
              align="center"
              justify="center"
              gap={24}
              style={{
                flex: 1,
                minHeight: 0,
                paddingBlock: token.paddingSM,
              }}
            >
              {Array.from({ length: SIDEBAR_ICON_COUNT }).map((_, idx) => (
                <Skeleton.Avatar
                  key={idx}
                  active
                  shape="square"
                  size={SIDEBAR_ICON_SIZE}
                  style={{ borderRadius: 10 }}
                />
              ))}
            </Flex>
          </Flex>
        </Sider>
      ) : null}

      <Layout style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <Header
          style={{
            height: HEADER_HEIGHT,
            display: "flex",
            alignItems: "center",
            gap: token.marginMD,
            paddingInline: token.paddingMD,
            background: token.colorBgLayout,
            lineHeight: "normal",
          }}
        >
          <Skeleton.Button active size="small" style={{ width: 180, height: 22 }} />
          <Flex align="center" gap={token.marginSM} style={{ marginLeft: "auto" }}>
            <Skeleton.Avatar active shape="circle" size={32} />
          </Flex>
        </Header>
        <Content
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: token.colorBgLayout,
          }}
        >
          <Spin size="large" />
        </Content>
      </Layout>
    </Layout>
  );
}
