// Modified by Sekar Nagarajan (2026-09-07 17:32)
import { ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
import { AppEmptyState } from "@solverminds/shared-ui";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Flex, theme } from "antd";
import { useTranslation } from "react-i18next";

interface NotFoundProps {
  /** When true, covers the viewport. When false (default in-app), fills the content area. */
  fullScreen?: boolean;
}

/**
 * In-shell / full-page 404 — shipping empty art, no scroll (sticky in content pane).
 */
export function NotFound({ fullScreen = false }: NotFoundProps) {
  const { t } = useTranslation("common");
  const { token } = theme.useToken();
  const router = useRouter();
  const navigate = useNavigate();

  return (
    <Flex
      className="ecom-not-found"
      align="center"
      justify="center"
      style={
        fullScreen
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              width: "100%",
              maxWidth: "100%",
              height: "100dvh",
              overflow: "hidden",
              background: token.colorBgLayout,
              boxSizing: "border-box",
            }
          : {
              flex: 1,
              width: "100%",
              maxWidth: "100%",
              minHeight: 0,
              height: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
            }
      }
    >
      <AppEmptyState
        variant="blank"
        artSize="md"
        title="404"
        message={t("notFound.subtitle")}
        style={{
          flex: 1,
          maxWidth: "100%",
          overflow: "hidden",
          padding: token.paddingLG,
        }}
        actions={[
          {
            key: "back",
            label: t("actions.back"),
            type: "default",
            icon: <ArrowLeftOutlined />,
            onClick: () => router.history.back(),
          },
          {
            key: "home",
            label: t("notFound.backHome"),
            type: "primary",
            icon: <HomeOutlined />,
            onClick: () => {
              void navigate({ to: "/" });
            },
          },
        ]}
      />
    </Flex>
  );
}
