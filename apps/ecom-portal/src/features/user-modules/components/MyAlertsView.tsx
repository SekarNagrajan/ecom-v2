// Modified by Sekar Nagarajan (2026-08-26 16:25)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import {
  Badge,
  Card,
  Col,
  Divider,
  List,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
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
    <Row className="um-alerts-layout" gutter={[16, 16]} align="top">
      <Col {...RESPONSIVE_COL.twoThirds}>
        <Card
          className="um-alerts-card"
          title="Transactional Subscription Categories"
          type="inner"
        >
          <List itemLayout="horizontal">
            <List.Item
              extra={
                <Switch
                  checked={prefs.bookingUpdates}
                  onChange={(val) => handleToggle("bookingUpdates", val)}
                />
              }
            >
              <List.Item.Meta
                title="e-Booking Confirmations & Status Updates"
                description="Receive instant alerts when e-Bookings are accepted, revised, or rolled"
              />
            </List.Item>
            <List.Item
              extra={
                <Switch
                  checked={prefs.siConfirmation}
                  onChange={(val) => handleToggle("siConfirmation", val)}
                />
              }
            >
              <List.Item.Meta
                title="Shipping Instructions (SI) & Draft Approvals"
                description="Notifications upon SI validation and draft BL verification"
              />
            </List.Item>
            <List.Item
              extra={
                <Switch
                  checked={prefs.blRelease}
                  onChange={(val) => handleToggle("blRelease", val)}
                />
              }
            >
              <List.Item.Meta
                title="Bill of Lading (BL) & Document Release"
                description="Alerts when Original BL or Waybill is ready for download"
              />
            </List.Item>
            <List.Item
              extra={
                <Switch
                  checked={prefs.scheduleDelays}
                  onChange={(val) => handleToggle("scheduleDelays", val)}
                />
              }
            >
              <List.Item.Meta
                title="Vessel Schedule Changes & Delay Advisories"
                description="Operational alerts for ETA/ETD schedule adjustments"
              />
            </List.Item>
            <List.Item
              extra={
                <Switch
                  checked={prefs.paymentInvoices}
                  onChange={(val) => handleToggle("paymentInvoices", val)}
                />
              }
            >
              <List.Item.Meta
                title="Freight Invoices & Payment Receipts"
                description="Alerts for new billing invoices and online payments"
              />
            </List.Item>
          </List>
        </Card>

        <Card
          className="um-alerts-card"
          title="Notification Delivery Channels"
          type="inner"
        >
          <Space direction="vertical" size="middle" className="um-channel-list">
            <div className="um-channel-row">
              <Space align="start">
                <AppIcon icon={Icons.mail} size={18} />
                <div className="um-channel-row__meta">
                  <Text strong>Email Notifications</Text>
                  <Text className="um-channel-row__hint">
                    Send summary alerts to account primary email
                  </Text>
                </div>
              </Space>
              <Switch
                checked={prefs.channelEmail}
                onChange={(val) => handleToggle("channelEmail", val)}
              />
            </div>
            <Divider className="um-channel-divider" />
            <div className="um-channel-row">
              <Space align="start">
                <AppIcon icon={Icons.smartphone} size={18} />
                <div className="um-channel-row__meta">
                  <Text strong>SMS Mobile Alerts</Text>
                  <Text className="um-channel-row__hint">
                    Send urgent delay SMS alerts to mobile phone
                  </Text>
                </div>
              </Space>
              <Switch
                checked={prefs.channelSms}
                onChange={(val) => handleToggle("channelSms", val)}
              />
            </div>
            <Divider className="um-channel-divider" />
            <div className="um-channel-row">
              <Space align="start">
                <AppIcon icon={Icons.monitor} size={18} />
                <div className="um-channel-row__meta">
                  <Text strong>Portal Badge Notifications</Text>
                  <Text className="um-channel-row__hint">
                    Display bell badge indicators inside header
                  </Text>
                </div>
              </Space>
              <Switch
                checked={prefs.channelPortal}
                onChange={(val) => handleToggle("channelPortal", val)}
              />
            </div>
          </Space>
        </Card>
      </Col>

      <Col {...RESPONSIVE_COL.oneThird}>
        <Card
          className="um-alerts-card"
          title="Recent Alert Activity Log"
          type="inner"
        >
          <List
            className="um-alerts-log custom-scroll"
            itemLayout="horizontal"
            dataSource={logs}
            renderItem={(log) => (
              <List.Item>
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
                    <div>
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
      </Col>
    </Row>
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
              <AppButton onClick={handleClose} disabled={isSaving}>
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
