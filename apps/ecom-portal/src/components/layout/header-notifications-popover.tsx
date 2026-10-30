import { AppButton } from "@solverminds/shared-ui";
import { Badge, Popover, Tooltip, Typography, theme } from "antd";
import { useState } from "react";

import { useAlertLogsQuery } from "../../features/user-modules/api/user-modules.queries";
import { AlertActivityLogList } from "../../features/user-modules/components/AlertActivityLogList";
import { UserModulesModuleStyles } from "../../features/user-modules/components/user-modules-module-styles";
import { AppIcon, Icons } from "../icons";

const { Text } = Typography;

export interface HeaderNotificationsPopoverProps {
  onOpenPreferences: () => void;
}

export function HeaderNotificationsPopover({
  onOpenPreferences,
}: HeaderNotificationsPopoverProps) {
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);

  const logsQuery = useAlertLogsQuery(true);
  const logs = logsQuery.data ?? [];
  const messageCount = logs.length;

  const handleOpenPreferences = () => {
    setOpen(false);
    onOpenPreferences();
  };

  const content = (
    <div className="app-header-notifications-panel">
      <div className="app-header-notifications-panel__header">
        <span className="app-header-notifications-panel__title">
          <AppIcon icon={Icons.bell} size={16} />
          <Text strong>Recent Alert Activity Log</Text>
        </span>
        <Badge
          count={messageCount}
          showZero
          overflowCount={99}
          className="app-header-notifications-panel__count"
        />
      </div>
      <AlertActivityLogList
        logs={logs}
        loading={logsQuery.isLoading}
        className="app-header-notifications-panel__list"
      />
      <div className="app-header-notifications-panel__footer">
        <AppButton type="link" size="small" onClick={handleOpenPreferences}>
          Manage alert preferences
        </AppButton>
      </div>
    </div>
  );

  return (
    <>
      <UserModulesModuleStyles />
      <Popover
        content={content}
        trigger="click"
        placement="bottomRight"
        arrow={false}
        open={open}
        onOpenChange={setOpen}
      >
        <span className="app-header-notifications-trigger">
          <Tooltip title="Notifications">
            <AppButton
              type="text"
              shape="circle"
              className="app-header-action"
              icon={<AppIcon icon={Icons.bell} size={16} />}
              aria-label="Notifications"
              style={{ color: token.colorTextSecondary }}
            />
          </Tooltip>
        </span>
      </Popover>
    </>
  );
}
