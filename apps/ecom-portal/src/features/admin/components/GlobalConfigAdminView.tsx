// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Card, Switch, InputNumber, Input, Typography, Space, Row, Col, Divider } from 'antd';
import { SettingOutlined, SaveOutlined, SafetyCertificateOutlined, AppstoreOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import type { GlobalConfig } from '../types/admin.types';

const { Text, Title } = Typography;

interface GlobalConfigAdminViewProps {
  config?: GlobalConfig;
  onSave: (config: GlobalConfig) => void;
}

export function GlobalConfigAdminView({ config, onSave }: GlobalConfigAdminViewProps) {
  const [formState, setFormState] = React.useState<GlobalConfig>(
    config || {
      enableLoginCaptcha: true,
      captchaSecretKey: '',
      attemptLimit: 3,
      accountLockDurationMinutes: 30,
      enablePasswordValidation: true,
      allowIncompletedRegToLogin: true,
      v1DataEnableStatus: true,
      dashboardDisplay: true,
    }
  );

  React.useEffect(() => {
    if (config) setFormState(config);
  }, [config]);

  const handleChange = <K extends keyof GlobalConfig>(key: K, value: GlobalConfig[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Space align="center">
            <SettingOutlined style={{ fontSize: 20, color: '#1677ff' }} />
            <Title level={4} style={{ margin: 0 }}>Global System Configuration</Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            Manage core security rules, captcha policies, and feature flags
          </Text>
        </div>
        <AppButton type="primary" size="large" icon={<SaveOutlined />} onClick={() => onSave(formState)}>
          Save Global Configs
        </AppButton>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card
            type="inner"
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
                <span>Security & Authentication Controls</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Enable Login reCAPTCHA v2</span>
                <Switch
                  checked={formState.enableLoginCaptcha}
                  onChange={(val) => handleChange('enableLoginCaptcha', val)}
                />
              </div>

              <div>
                <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Captcha Secret Key</Text>
                <Input
                  size="large"
                  value={formState.captchaSecretKey}
                  onChange={(e) => handleChange('captchaSecretKey', e.target.value)}
                />
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Max Invalid Password Attempts Limit</span>
                <InputNumber
                  size="large"
                  min={1}
                  max={10}
                  value={formState.attemptLimit}
                  onChange={(val) => handleChange('attemptLimit', val || 3)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Account Lock Duration (Minutes)</span>
                <InputNumber
                  size="large"
                  min={5}
                  max={1440}
                  value={formState.accountLockDurationMinutes}
                  onChange={(val) => handleChange('accountLockDurationMinutes', val || 30)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Enable Password Complexity Rules</span>
                <Switch
                  checked={formState.enablePasswordValidation}
                  onChange={(val) => handleChange('enablePasswordValidation', val)}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            type="inner"
            title={
              <Space>
                <AppstoreOutlined style={{ color: '#52c41a' }} />
                <span>Platform & Tenant Feature Flags</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Allow Incomplete Registration Login</span>
                <Switch
                  checked={formState.allowIncompletedRegToLogin}
                  onChange={(val) => handleChange('allowIncompletedRegToLogin', val)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>V1 Data Synchronization Engine</span>
                <Switch
                  checked={formState.v1DataEnableStatus}
                  onChange={(val) => handleChange('v1DataEnableStatus', val)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Enable Executive Cargo Dashboard</span>
                <Switch
                  checked={formState.dashboardDisplay}
                  onChange={(val) => handleChange('dashboardDisplay', val)}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
