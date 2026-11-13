// Created by Sekar Nagarajan (2026-11-13 03:20)
/**
 * Header bell: unread badge fed by the polled alert feed, opening a drawer with the shared
 * AppNotificationCenter (unread/all, mark read, mark all read) and a link to alert preferences.
 */
import {
  AppButton,
  AppDrawer,
  AppNotificationCenter,
  type AppNotificationItem,
} from "@solverminds/shared-ui";
import { Badge, Tooltip, Typography, theme } from "antd";
import { useState } from "react";

import {
  useAlertLogsQuery,
  useMarkAlertReadMutation,
  useMarkAllAlertsReadMutation,
} from "../../features/user-modules/api/user-modules.queries";
import type { AlertHistoryLog } from "../../features/user-modules/types/user-modules.types";
import { AppIcon, Icons } from "../icons";

const { Text } = Typography;

const CATEGORY_LABEL: Record<AlertHistoryLog["category"], string> = {
  BOOKING: "Booking",
  SI: "Shipping Instruction",
  BL: "Bill of Lading",
  SCHEDULE: "Schedule",
  PAYMENT: "Payment",
};

const CATEGORY_SEVERITY: Record<AlertHistoryLog["category"], AppNotificationItem["severity"]> = {
  BOOKING: "info",
  SI: "warning",
  BL: "success",
  SCHEDULE: "warning",
  PAYMENT: "error",
};

function toNotificationItem(log: AlertHistoryLog): AppNotificationItem {
  return {
    id: log.id,
    title: log.title,
    message: log.message,
    timestamp: log.timestamp,
    read: log.isRead,
    category: log.category,
    categoryLabel: CATEGORY_LABEL[log.category],
    severity: CATEGORY_SEVERITY[log.category],
    reference: log.referenceNo || undefined,
  };
}

export interface HeaderNotificationsCenterProps {
  onOpenPreferences: () => void;
}

export function HeaderNotificationsCenter({ onOpenPreferences }: HeaderNotificationsCenterProps) {
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);
  const logsQuery = useAlertLogsQuery(true);
  const markRead = useMarkAlertReadMutation();
  const markAllRead = useMarkAllAlertsReadMutation();

  const items = (logsQuery.data ?? []).map(toNotificationItem);
  const unreadCount = items.filter((item) => !item.read).length;

  const handleOpenPreferences = () => {
    setOpen(false);
    onOpenPreferences();
  };

  return (
    <>
      <span className="app-header-notifications-trigger">
        <Tooltip
          title={
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "Notifications"
          }
        >
          <Badge count={unreadCount} size="small" overflowCount={99} offset={[-4, 4]}>
            <AppButton
              type="text"
              shape="circle"
              className="app-header-action"
              icon={<AppIcon icon={Icons.bell} size={16} />}
              aria-label={
                unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
              }
              aria-haspopup="dialog"
              aria-expanded={open}
              style={{ color: token.colorTextSecondary }}
              onClick={() => setOpen(true)}
            />
          </Badge>
        </Tooltip>
      </span>

      <AppDrawer
        open={open}
        onClose={() => setOpen(false)}
        dialogSize="sm"
        destroyOnHidden
        title={
          <span className="app-header-notifications-title">
            <AppIcon icon={Icons.bell} size={16} />
            <Text strong>Notifications</Text>
          </span>
        }
        footer={
          <AppButton type="link" size="small" onClick={handleOpenPreferences}>
            Manage alert preferences
          </AppButton>
        }
      >
        <AppNotificationCenter
          items={items}
          loading={logsQuery.isLoading}
          onMarkRead={(item) => markRead.mutate(item.id)}
          onMarkAllRead={() => markAllRead.mutate()}
          ariaLabel="Notifications"
        />
      </AppDrawer>
    </>
  );
}
