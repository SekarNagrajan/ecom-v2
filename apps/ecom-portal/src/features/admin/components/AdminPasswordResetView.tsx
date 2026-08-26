// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Alert, Col, Input, Row, Space } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import { RESPONSIVE_COL } from '../../../constants/responsive-grid';
import { AdminPanelShell } from './AdminPanelShell';

interface AdminPasswordResetViewProps {
  onResetPassword: (username: string) => Promise<{ success: boolean; message: string }>;
}

export function AdminPasswordResetView({ onResetPassword }: AdminPasswordResetViewProps) {
  const [username, setUsername] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [resultMsg, setResultMsg] = React.useState<string | null>(null);
  const toast = useToast();

  const handleReset = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const res = await onResetPassword(username);
      setResultMsg(res.message);
      toast.success(res.message);
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPanelShell
      icon={Icons.lock}
      title="Admin Password Reset"
      subtitle="Force password reset and generate temporary OTP credentials for customer and agency accounts."
    >
      <Row gutter={[16, 16]}>
        <Col {...RESPONSIVE_COL.formHalf}>
          <Space direction="vertical" size="middle" className="admin-stack-full">
            <div>
              <span className="form-field-label">Customer / Agency Login Name</span>
              <Input
                size="large"
                prefix={<AppIcon icon={Icons.key} size={16} />}
                placeholder="Enter login username (e.g. CUST_ADMIN_01)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <AppButton
              type="primary"
              size="large"
              icon={<AppIcon icon={Icons.send} size={16} />}
              loading={loading}
              onClick={handleReset}
            >
              Reset Password & Send OTP Mail
            </AppButton>

            {resultMsg ? (
              <Alert message="Security Action Logged" description={resultMsg} type="success" showIcon />
            ) : null}
          </Space>
        </Col>
      </Row>
    </AdminPanelShell>
  );
}
