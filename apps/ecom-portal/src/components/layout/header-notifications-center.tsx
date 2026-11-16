// Modified by Sekar Nagarajan (2026-11-16 14:50) — sidebar nav icons; ref number view-only
/**
 * Header bell: unread badge from the polled alert feed. Desktop opens a 380px popover;
 * mobile opens the same body in a bottom AppDrawer.
 */
import {
  AppButton,
  AppDrawer,
  AppNotificationCenter,
  AppPopover,
  type AppNotificationItem,
  type AppNotificationSeverity,
} from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Badge, Tooltip, theme } from "antd";
import { useEffect, useState } from "react";

import {
  useAlertLogsQuery,
  useMarkAlertReadMutation,
  useMarkAllAlertsReadMutation,
} from "../../features/user-modules/api/user-modules.queries";
import type { AlertHistoryLog } from "../../features/user-modules/types/user-modules.types";
import { useResponsiveLayout } from "../../hooks/use-responsive-layout";
import { AppIcon, Icons, NavIcons } from "../icons";
import { formatAlertRelativeTime } from "./format-alert-relative-time";

const CATEGORY_SHORT: Record<AlertHistoryLog["category"], string> = {
  BOOKING: "Booking",
  SI: "SI",
  BL: "B/L",
  SCHEDULE: "Schedule",
  PAYMENT: "Payment",
};

/** Same module icons as AuthenticatedSidebar. */
const CATEGORY_ICON: Record<AlertHistoryLog["category"], (typeof NavIcons)[keyof typeof NavIcons]> =
  {
    BOOKING: NavIcons.booking,
    SI: NavIcons.shippingInstruction,
    BL: NavIcons.billOfLading,
    SCHEDULE: NavIcons.schedules,
    PAYMENT: NavIcons.payments,
  };

const CATEGORY_CHIPS = [
  { key: "BOOKING", label: "Booking" },
  { key: "SI", label: "SI" },
  { key: "BL", label: "B/L" },
  { key: "SCHEDULE", label: "Schedule" },
  { key: "PAYMENT", label: "Payment" },
];

/** Spec §6.2 — severity from event text, not category. */
export function resolveSeverity(log: AlertHistoryLog): AppNotificationSeverity {
  const t = `${log.title} ${log.message}`.toLowerCase();
  if (/(fail|declin|reject|cancel|overdue|error)/.test(t)) return "error";
  if (/(confirm|validat|approv|received|released final|paid|success)/.test(t)) return "success";
  if (/(eta|etd|amend|revis|delay|change|pending|awaiting)/.test(t)) return "warning";
  return "info";
}

/** Build a detail (or list fallback) path for the alert's resolved route id. */
export function resolveActionHref(log: AlertHistoryLog, severity: AppNotificationSeverity): string {
  const key = (log.routeId || log.referenceNo || "").trim();
  const enc = key ? encodeURIComponent(key) : "";

  switch (log.category) {
    case "BOOKING":
      return enc ? `/app/booking/${enc}` : "/app/booking";
    case "SI":
      return enc ? `/app/shipping-instruction/${enc}` : "/app/shipping-instruction";
    case "BL":
      return enc ? `/app/bl/${enc}` : "/app/bl";
    case "SCHEDULE":
      return "/app/schedules";
    case "PAYMENT":
      return severity === "error" ? "/app/payments" : "/app/payments";
    default:
      return "/app/dashboard";
  }
}

function resolveAction(
  log: AlertHistoryLog,
  severity: AppNotificationSeverity,
): AppNotificationItem["action"] {
  const href = resolveActionHref(log, severity);
  switch (log.category) {
    case "BOOKING":
      return { label: "View booking", href };
    case "SI":
      return { label: "Open SI", href };
    case "BL": {
      const draft = /draft/i.test(`${log.title} ${log.message}`);
      return { label: draft ? "Verify draft" : "View B/L", href };
    }
    case "SCHEDULE":
      return { label: "View schedule", href };
    case "PAYMENT":
      return {
        label: severity === "error" ? "Retry payment" : "View receipt",
        href,
      };
    default:
      return { label: "Open", href };
  }
}

function toNotificationItem(log: AlertHistoryLog): AppNotificationItem {
  const severity = resolveSeverity(log);
  const Icon = CATEGORY_ICON[log.category] ?? NavIcons.dashboard;
  const iso = log.timestampIso;
  return {
    id: log.id,
    title: log.title,
    message: log.message,
    timestamp: iso ? formatAlertRelativeTime(iso) : log.timestamp,
    timestampIso: iso,
    read: log.isRead,
    category: log.category,
    categoryShortLabel: CATEGORY_SHORT[log.category],
    severity,
    reference: log.referenceNo || undefined,
    icon: <AppIcon icon={Icon} size={14} variant="nav" />,
    action: resolveAction(log, severity),
  };
}

export interface HeaderNotificationsCenterProps {
  onOpenPreferences: () => void;
}

export function HeaderNotificationsCenter({ onOpenPreferences }: HeaderNotificationsCenterProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { useMobileNav } = useResponsiveLayout();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [popoverMaxHeight, setPopoverMaxHeight] = useState(680);

  const logsQuery = useAlertLogsQuery(true);
  const markRead = useMarkAlertReadMutation();
  const markAllRead = useMarkAllAlertsReadMutation();

  const items = (logsQuery.data ?? []).map(toNotificationItem);
  const unreadCount = items.filter((item) => !item.read).length;

  // Prevent the page behind the popover from scrolling (double scrollbar).
  useEffect(() => {
    if (!open || useMobileNav) return;
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const scrollbarGap = window.innerWidth - html.clientWidth;

    html.classList.add("app-header-notifications-open");
    body.classList.add("app-header-notifications-open");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    return () => {
      html.classList.remove("app-header-notifications-open");
      body.classList.remove("app-header-notifications-open");
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [open, useMobileNav]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPopoverMaxHeight(Math.min(680, Math.max(280, window.innerHeight - 96)));
      setSession((value) => value + 1);
    }
    setOpen(next);
  };

  const handleOpenPreferences = () => {
    setOpen(false);
    onOpenPreferences();
  };

  const goToItem = (item: AppNotificationItem) => {
    markRead.mutate(item.id);
    const href = item.action?.href;
    setOpen(false);
    if (!href) return;
    window.setTimeout(() => {
      void navigate({ to: href });
    }, 0);
  };

  const panel = (
    <AppNotificationCenter
      key={session}
      variant="popover"
      categoryFilter
      categories={CATEGORY_CHIPS}
      items={items}
      loading={logsQuery.isLoading}
      error={logsQuery.isError}
      onRetry={() => void logsQuery.refetch()}
      onMarkRead={(item) => markRead.mutate(item.id)}
      onMarkAllRead={() => markAllRead.mutate()}
      onAction={goToItem}
      ariaLabel="Notifications"
      footer={
        <AppButton type="link" size="small" onClick={handleOpenPreferences}>
          Manage alert preferences
        </AppButton>
      }
    />
  );

  const trigger = (
    <span className="app-header-notifications-trigger">
      <Tooltip
        title={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "Notifications"
        }
        open={open ? false : undefined}
      >
        <Badge
          count={unreadCount}
          size="small"
          overflowCount={99}
          offset={[-4, 4]}
          color={token.colorError}
          styles={{ indicator: { boxShadow: `0 0 0 1px ${token.colorBgContainer}` } }}
        >
          <AppButton
            type="text"
            shape="circle"
            className="app-header-action"
            icon={<AppIcon icon={Icons.bell} size={16} />}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            aria-haspopup="dialog"
            aria-expanded={open}
            style={{ color: token.colorTextSecondary }}
            onClick={useMobileNav ? () => handleOpenChange(true) : undefined}
          />
        </Badge>
      </Tooltip>
    </span>
  );

  if (useMobileNav) {
    return (
      <>
        {trigger}
        <AppDrawer
          open={open}
          onClose={() => handleOpenChange(false)}
          placement="bottom"
          destroyOnHidden
          title={null}
          closable={false}
          styles={{
            body: { padding: 0, overflow: "hidden" },
            header: { display: "none", padding: 0, border: 0 },
          }}
        >
          {panel}
        </AppDrawer>
      </>
    );
  }

  return (
    <AppPopover
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      destroyOnHidden
      classNames={{ root: "app-header-notifications-popover" }}
      getPopupContainer={() => document.body}
      styles={{
        root: {
          zIndex: 1050,
          maxHeight: popoverMaxHeight,
          paddingTop: 0,
        },
        body: {
          padding: 0,
          width: 380,
          maxHeight: popoverMaxHeight,
          borderRadius: token.borderRadiusLG + 4,
          overflow: "hidden",
          boxShadow: token.boxShadowSecondary,
          display: "flex",
          flexDirection: "column",
        },
      }}
      content={
        <div style={{ maxHeight: popoverMaxHeight, overflow: "hidden", display: "flex" }}>
          {panel}
        </div>
      }
    >
      {trigger}
    </AppPopover>
  );
}
