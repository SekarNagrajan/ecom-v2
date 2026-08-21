// Modified by Sekar Nagarajan (2026-08-21 14:55)
import React from 'react';
import { Card, Input, Typography, Space, Row, Col, Alert } from 'antd';
import { LockOutlined, KeyOutlined, SendOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';

const { Text, Title } = Typography;

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
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ marginBottom: 20 }}>
        <Space align="center">
          <LockOutlined style={{ fontSize: 20, color: '#f5222d' }} />
          <Title level={4} style={{ margin: 0 }}>Admin Password Reset</Title>
        </Space>
        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          Force password reset and generate temporary OTP credentials for customer & agency accounts
        </Text>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Customer / Agency Login Name</Text>
              <Input
                size="large"
                prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Enter login username (e.g. CUST_ADMIN_01)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <AppButton type="primary" size="large" icon={<SendOutlined />} loading={loading} onClick={handleReset}>
              Reset Password & Send OTP Mail
            </AppButton>

            {resultMsg && <Alert message="Security Action Logged" description={resultMsg} type="success" showIcon />}
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
