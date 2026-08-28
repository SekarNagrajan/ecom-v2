import { AppDrawer } from "@solverminds/shared-ui";
import { Flex, Typography, theme } from "antd";

import { ThemePreferencesPanel } from "../../features/theme/components/theme-preferences-panel";
import { type useThemePreferencesController } from "../../features/theme/hooks/use-theme-preferences-controller";

const { Text } = Typography;

interface AccountPreferencesDrawerProps {
  email?: string;
  fullName?: string;
  isLoggingOut?: boolean;
  onClose: () => void;
  onLogout?: () => void;
  open: boolean;
  preferencesController: ReturnType<typeof useThemePreferencesController>;
  roleName?: string;
}

export function AccountPreferencesDrawer({
  onClose,
  open,
  preferencesController,
}: AccountPreferencesDrawerProps) {
  const { token } = theme.useToken();

  const statusLabel =
    preferencesController.saveStatus === "saving"
      ? "Saving..."
      : preferencesController.saveStatus === "dirty"
      ? "Not saved"
      : preferencesController.saveStatus === "error"
      ? "Save failed"
      : null;

  const statusColor =
    preferencesController.saveStatus === "error"
      ? token.colorError
      : preferencesController.saveStatus === "dirty"
      ? token.colorWarning
      : token.colorTextSecondary;

  return (
    <AppDrawer
      mask={{ blur: false }}
      width="50%"
      onClose={onClose}
      open={open}
      title={
        <Flex align="center" justify="space-between" gap={token.marginMD}>
          <span style={{ fontWeight: 700 }}>Theme and Preferences</span>
          {statusLabel ? (
            <Text
              style={{
                color: statusColor,
                fontSize: token.fontSizeSM,
                fontWeight: token.fontWeightStrong,
              }}
            ></Text>
          ) : null}
        </Flex>
      }
      styles={{
        body: {
          paddingTop: token.paddingMD,
          paddingBottom: token.paddingMD,
          overflowY: "auto",
          maxHeight: "calc(100vh - 105px)",
        },
        footer: {
          borderTop: "none",
        },
      }}
    >
      <ThemePreferencesPanel controller={preferencesController} />
    </AppDrawer>
  );
}
