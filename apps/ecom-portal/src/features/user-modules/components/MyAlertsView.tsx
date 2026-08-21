// Modified by sekar nagarajan (2026-08-21)
import { BellOutlined, DesktopOutlined, MailOutlined, MobileOutlined, SaveOutlined } from '@ant-design/icons';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Badge, Card, Col, Divider, List, Row, Space, Spin, Switch, Tag, theme, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { userModulesApi } from '../api/user-modules.api';
import type { AlertHistoryLog, AlertPreference } from '../types/user-modules.types';

const { Title, Text } = Typography;

export interface MyAlertsViewProps {
  open?: boolean;
  onClose?: () => void;
}

export function MyAlertsView({ open = true, onClose }: MyAlertsViewProps) {
  const { token } = theme.useToken();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<AlertPreference>({
    bookingUpdates: true,
    siConfirmation: true,
    blRelease: true,
    scheduleDelays: true,
    paymentInvoices: true,
    channelEmail: true,
    channelSms: false,
    channelPortal: true,
  });
  const [logs, setLogs] = useState<AlertHistoryLog[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([userModulesApi.getAlertPreferences(), userModulesApi.getAlertLogs()])
        .then(([p, l]) => {
          setPrefs(p);
          setLogs(l);
        })
        .catch(() => toast.error('Failed to load alert settings'))
        .finally(() => setLoading(false));
    }
  }, [open, toast]);

  const handleToggle = (key: keyof AlertPreference, checked: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userModulesApi.updateAlertPreferences(prefs);
      setPrefs(updated);
      toast.success('Alert preferences saved successfully');
      if (onClose) onClose();
    } catch {
      toast.error('Failed to update alert preferences');
    } finally {
      setSaving(false);
    }
  };

  const bodyContent = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <BellOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              My Alert Preferences & Notifications
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Configure transactional email/SMS subscription alerts for e-Bookings, SI, BL, and Vessel delays
          </Text>
        </div>

        {!onClose && (
          <AppButton type="primary" size="large" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            Save Preferences
          </AppButton>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" tip="Loading alert preferences..." />
        </div>
      ) : (
        <Row gutter={24}>
          {/* Left Column: Notification Subscriptions */}
          <Col span={14}>
            <Card title="Transactional Subscription Categories" type="inner" style={{ borderRadius: 12, marginBottom: 20 }}>
              <List itemLayout="horizontal">
                <List.Item
                  extra={
                    <Switch
                      checked={prefs.bookingUpdates}
                      onChange={(val) => handleToggle('bookingUpdates', val)}
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
                      onChange={(val) => handleToggle('siConfirmation', val)}
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
                      onChange={(val) => handleToggle('blRelease', val)}
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
                      onChange={(val) => handleToggle('scheduleDelays', val)}
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
                      onChange={(val) => handleToggle('paymentInvoices', val)}
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

            <Card title="Notification Delivery Channels" type="inner" style={{ borderRadius: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space align="center">
                    <MailOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                    <div>
                      <Text strong>Email Notifications</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        Send summary alerts to account primary email
                      </Text>
                    </div>
                  </Space>
                  <Switch
                    checked={prefs.channelEmail}
                    onChange={(val) => handleToggle('channelEmail', val)}
                  />
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space align="center">
                    <MobileOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                    <div>
                      <Text strong>SMS Mobile Alerts</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        Send urgent delay SMS alerts to mobile phone
                      </Text>
                    </div>
                  </Space>
                  <Switch
                    checked={prefs.channelSms}
                    onChange={(val) => handleToggle('channelSms', val)}
                  />
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space align="center">
                    <DesktopOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                    <div>
                      <Text strong>Portal Badge Notifications</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        Display bell badge indicators inside header
                      </Text>
                    </div>
                  </Space>
                  <Switch
                    checked={prefs.channelPortal}
                    onChange={(val) => handleToggle('channelPortal', val)}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          {/* Right Column: Alert Activity Logs */}
          <Col span={10}>
            <Card title="Recent Alert Activity Log" type="inner" style={{ borderRadius: 12, height: '100%' }}>
              <List
                itemLayout="horizontal"
                dataSource={logs}
                renderItem={(log) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Badge status={log.isRead ? 'default' : 'processing'} />}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ fontSize: 13 }}>
                            {log.title}
                          </Text>
                          <Tag color="blue" style={{ fontSize: 11 }}>
                            {log.category}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Text style={{ fontSize: 12, display: 'block', color: token.colorTextSecondary }}>
                            {log.message}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
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
      )}
    </div>
  );

  if (onClose) {
    return (
      <AppDrawer
        open={open}
        onClose={onClose}
        width="50%"
        styles={{
          body: { overflowY: 'auto', maxHeight: 'calc(100vh - 105px)', padding: '20px 24px' },
          footer: { display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${token.colorBorderSecondary}`, padding: '8px 20px', background: token.colorBgContainer },
        }}
        title="My Notification & Alert Settings"
        mask={{ blur: false }}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} size={8}>
            <AppButton danger onClick={onClose}>Close</AppButton>
            <AppButton type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Save Preferences
            </AppButton>
          </Space>
        }
      >
        {bodyContent}
      </AppDrawer>
    );
  }

  return bodyContent;
}
