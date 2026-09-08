// Modified by Sekar Nagarajan (2026-09-08 10:54)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Badge, Card, List, Switch, Tag, Typography } from "antd";
import { useEffect, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { MODULE_TITLES } from "../../../constants/module-titles";
import {
  useAlertLogsQuery,
  useAlertPreferencesQuery,
  useUpdateAlertPreferencesMutation,
} from "../api/user-modules.queries";
import type { AlertPreference } from "../types/user-modules.types";
import { UmLoadingCenter } from "./um-loading-center";
import { UmPanelHeader } from "./um-panel-header";
import { UserModulesModuleStyles } from "./user-modules-module-styles";

const { Text } = Typography;

const ALERTS_DESCRIPTION =
  "Configure transactional email/SMS subscription alerts for e-Bookings, SI, BL, and vessel delays.";

const EMPTY_PREFS: AlertPreference = {
  bookingUpdates: true,
  siConfirmation: true,
  blRelease: true,
  scheduleDelays: true,
  paymentInvoices: true,
  channelEmail: true,
  channelSms: false,
  channelPortal: true,
};

const SUBSCRIPTION_ITEMS: {
  key: keyof AlertPreference;
  title: string;
  description: string;
}[] = [
  {
    key: "bookingUpdates",
    title: "e-Booking Confirmations & Status Updates",
    description:
      "Receive instant alerts when e-Bookings are accepted, revised, or rolled",
  },
  {
    key: "siConfirmation",
    title: "Shipping Instructions (SI) & Draft Approvals",
    description: "Notifications upon SI validation and draft BL verification",
  },
  {
    key: "blRelease",
    title: "Bill of Lading (BL) & Document Release",
    description: "Alerts when Original BL or Waybill is ready for download",
  },
  {
    key: "scheduleDelays",
    title: "Vessel Schedule Changes & Delay Advisories",
    description: "Operational alerts for ETA/ETD schedule adjustments",
  },
  {
    key: "paymentInvoices",
    title: "Freight Invoices & Payment Receipts",
    description: "Alerts for new billing invoices and online payments",
  },
];

const CHANNEL_ITEMS: {
  key: keyof AlertPreference;
  icon: typeof Icons.mail;
  title: string;
  hint: string;
}[] = [
  {
    key: "channelEmail",
    icon: Icons.mail,
    title: "Email Notifications",
    hint: "Send summary alerts to account primary email",
  },
  {
    key: "channelSms",
    icon: Icons.smartphone,
    title: "SMS Mobile Alerts",
    hint: "Send urgent delay SMS alerts to mobile phone",
  },
  {
    key: "channelPortal",
    icon: Icons.monitor,
    title: "Portal Badge Notifications",
    hint: "Display bell badge indicators inside header",
  },
];

export interface MyAlertsViewProps {
  open?: boolean;
  onClose?: () => void;
}

export function MyAlertsView({ open = true, onClose }: MyAlertsViewProps) {
  const isDrawer = Boolean(onClose);
  const prefsQuery = useAlertPreferencesQuery(open);
  const logsQuery = useAlertLogsQuery(open);
  const { mutateAsync: savePrefs, isPending: isSaving } =
    useUpdateAlertPreferencesMutation();

  const [prefs, setPrefs] = useState<AlertPreference>(EMPTY_PREFS);

  useEffect(() => {
    if (prefsQuery.data) {
      setPrefs(prefsQuery.data);
    }
  }, [prefsQuery.data]);

  const isLoading = prefsQuery.isLoading || logsQuery.isLoading;
  const logs = logsQuery.data ?? [];

  const handleToggle = (key: keyof AlertPreference, checked: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: checked }));
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleSave = async () => {
    await savePrefs(prefs);
    handleClose();
  };

  const saveButton = (
    <AppButton
      type="primary"
      icon={<AppIcon icon={Icons.save} size={16} />}
      loading={isSaving}
      onClick={handleSave}
    >
      Save Preferences
    </AppButton>
  );

  const panelHeader = (
    <UmPanelHeader
      icon={Icons.bell}
      title={MODULE_TITLES.myAlerts}
      description={ALERTS_DESCRIPTION}
      extra={!isDrawer && !isLoading ? saveButton : undefined}
      compact={isDrawer}
    />
  );

  const bodyContent = isLoading ? (
    <UmLoadingCenter fill={!isDrawer} />
  ) : (
    <div className="um-alerts-layout">
      <div className="um-alerts-row">
        <Card
          className="um-alerts-card"
          title="Transactional Subscription Categories"
          type="inner"
        >
          <ul className="um-alerts-sub-list">
            {SUBSCRIPTION_ITEMS.map((item) => (
              <li key={item.key} className="um-alerts-sub-row">
                <div className="um-alerts-sub-row__copy">
                  <Text strong className="um-alerts-sub-row__title">
                    {item.title}
                  </Text>
                  <Text type="secondary" className="um-alerts-sub-row__hint">
                    {item.description}
                  </Text>
                </div>
                <Switch
                  checked={prefs[item.key]}
                  onChange={(val) => handleToggle(item.key, val)}
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="um-alerts-row">
        <Card
          className="um-alerts-card"
          title="Recent Alert Activity Log"
          type="inner"
        >
          <List
            className="um-alerts-log custom-scroll"
            itemLayout="horizontal"
            dataSource={logs}
            locale={{
              emptyText: (
                <ModuleEmptyState
                  artSize="sm"
                  variant="blank"
                  title="No recent alert activity"
                  className="um-alerts-empty"
                />
              ),
            }}
            renderItem={(log) => (
              <List.Item className="um-alerts-log__item">
                <List.Item.Meta
                  avatar={
                    <Badge status={log.isRead ? "default" : "processing"} />
                  }
                  title={
                    <div className="um-alerts-log__title">
                      <Text strong>{log.title}</Text>
                      <Tag color="blue">{log.category}</Tag>
                    </div>
                  }
                  description={
                    <div className="um-alerts-log__desc">
                      <Text className="um-alerts-log__message">
                        {log.message}
                      </Text>
                      <Text type="secondary" className="um-alerts-log__meta">
                        {log.timestamp} • Ref: {log.referenceNo}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>

      <div className="um-alerts-row">
        <Card
          className="um-alerts-card"
          title="Notification Delivery Channels"
          type="inner"
        >
          <div className="um-channel-grid">
            {CHANNEL_ITEMS.map((item) => (
              <div key={item.key} className="um-channel-tile">
                <div className="um-channel-tile__top">
                  <span className="um-channel-tile__icon app-icon-inherit">
                    <AppIcon icon={item.icon} size={18} />
                  </span>
                  <Switch
                    checked={prefs[item.key]}
                    onChange={(val) => handleToggle(item.key, val)}
                  />
                </div>
                <Text strong className="um-channel-tile__title">
                  {item.title}
                </Text>
                <Text type="secondary" className="um-channel-tile__hint">
                  {item.hint}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <>
        <UserModulesModuleStyles />
        <AppDrawer
          open={open}
          onClose={handleClose}
          placement="right"
          dialogSize="md"
          destroyOnClose
          maskClosable={!isSaving}
          keyboard={!isSaving}
          classNames={{
            header: "um-drawer-header-bar",
            body: "um-drawer-body custom-scroll",
            footer: "um-drawer-footer-bar",
          }}
          styles={{ body: { padding: 0 } }}
          title={panelHeader}
          footer={
            <div className="um-drawer-footer form-step-footer">
              <AppButton onClick={handleClose} disabled={isSaving} danger>
                Cancel
              </AppButton>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.save} size={16} />}
                loading={isSaving}
                onClick={handleSave}
              >
                Save
              </AppButton>
            </div>
          }
        >
          {bodyContent}
        </AppDrawer>
      </>
    );
  }

  return (
    <div className="um-page-layout">
      {panelHeader}
      {bodyContent}
    </div>
  );
}
