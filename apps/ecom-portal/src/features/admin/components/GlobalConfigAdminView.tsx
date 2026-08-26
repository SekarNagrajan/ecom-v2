// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Divider, Input, InputNumber, Row, Space, Switch } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import { RESPONSIVE_COL } from '../../../constants/responsive-grid';
import type { GlobalConfig } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

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
    <AdminPanelShell
      icon={Icons.settings}
      title="Global System Configuration"
      subtitle="Manage core security rules, captcha policies, and feature flags."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.save} size={16} />}
          onClick={() => onSave(formState)}
        >
          Save Global Configs
        </AppButton>
      }
    >
      <Row gutter={[24, 24]}>
        <Col {...RESPONSIVE_COL.formHalf}>
          <Card
            className="admin-inner-card"
            type="inner"
            title={
              <Space>
                <AppIcon icon={Icons.shieldCheck} size={16} />
                <span>Security & Authentication Controls</span>
              </Space>
            }
          >
            <Space direction="vertical" size="middle" className="admin-stack-full">
              <div className="admin-toggle-row">
                <span>Enable Login reCAPTCHA v2</span>
                <Switch
                  checked={formState.enableLoginCaptcha}
                  onChange={(val) => handleChange('enableLoginCaptcha', val)}
                />
              </div>

              <div>
                <span className="form-field-label">Captcha Secret Key</span>
                <Input
                  size="large"
                  value={formState.captchaSecretKey}
                  onChange={(e) => handleChange('captchaSecretKey', e.target.value)}
                />
              </div>

              <Divider />

              <div className="admin-toggle-row">
                <span>Max Invalid Password Attempts Limit</span>
                <InputNumber
                  size="large"
                  min={1}
                  max={10}
                  value={formState.attemptLimit}
                  onChange={(val) => handleChange('attemptLimit', val || 3)}
                />
              </div>

              <div className="admin-toggle-row">
                <span>Account Lock Duration (Minutes)</span>
                <InputNumber
                  size="large"
                  min={5}
                  max={1440}
                  value={formState.accountLockDurationMinutes}
                  onChange={(val) => handleChange('accountLockDurationMinutes', val || 30)}
                />
              </div>

              <div className="admin-toggle-row">
                <span>Enable Password Complexity Rules</span>
                <Switch
                  checked={formState.enablePasswordValidation}
                  onChange={(val) => handleChange('enablePasswordValidation', val)}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Card
            className="admin-inner-card"
            type="inner"
            title={
              <Space>
                <AppIcon icon={Icons.layoutGrid} size={16} />
                <span>Platform & Tenant Feature Flags</span>
              </Space>
            }
          >
            <Space direction="vertical" size="middle" className="admin-stack-full">
              <div className="admin-toggle-row">
                <span>Allow Incomplete Registration Login</span>
                <Switch
                  checked={formState.allowIncompletedRegToLogin}
                  onChange={(val) => handleChange('allowIncompletedRegToLogin', val)}
                />
              </div>

              <div className="admin-toggle-row">
                <span>V1 Data Synchronization Engine</span>
                <Switch
                  checked={formState.v1DataEnableStatus}
                  onChange={(val) => handleChange('v1DataEnableStatus', val)}
                />
              </div>

              <div className="admin-toggle-row">
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
    </AdminPanelShell>
  );
}
