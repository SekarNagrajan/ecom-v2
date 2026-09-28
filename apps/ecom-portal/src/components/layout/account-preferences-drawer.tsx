// Modified by Sekar Nagarajan (2026-09-28 15:50)
import { AppDrawer } from "@solverminds/shared-ui";
import { Flex, Typography, theme } from "antd";

import { ThemePreferencesPanel } from "../../features/theme/components/theme-preferences-panel";
import { type useThemePreferencesController } from "../../features/theme/hooks/use-theme-preferences-controller";

const { Text, Title } = Typography;

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
      width="40%"
      onClose={onClose}
      open={open}
      classNames={{
        body: "a11y-prefs-drawer-body custom-scroll",
      }}
      title={
        <div className="a11y-prefs-drawer-header">
          <Flex vertical gap={2} style={{ minWidth: 0 }}>
            <Title level={5} className="a11y-prefs-drawer-header__title">
              Accessibility Controls
            </Title>

            {statusLabel ? (
              <Text
                style={{
                  color: statusColor,
                  fontSize: token.fontSizeSM,
                  fontWeight: token.fontWeightStrong,
                }}
              >
                {statusLabel}
              </Text>
            ) : null}
          </Flex>
          {/* <div className="a11y-prefs-drawer-header__actions">
            <Tooltip title="Adjust vision preferences for text, appearance, contrast, and zoom.">
              <AppButton
                type="text"
                shape="circle"
                aria-label="Accessibility help"
                icon={<AppIcon icon={Icons.info} size={18} />}
              />
            </Tooltip>
          </div> */}
        </div>
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
