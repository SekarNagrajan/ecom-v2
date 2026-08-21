// Modified by sekar nagarajan (2026-08-21)
import { CheckCircleOutlined, CloseCircleOutlined, KeyOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { AppButton, AppDrawer } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Form, Input, List, Progress, Space, Typography, theme } from 'antd';
import { useState } from 'react';
import { userModulesApi } from '../api/user-modules.api';

const { Title, Text } = Typography;

export interface ChangePasswordViewProps {
  open?: boolean;
  onClose?: () => void;
}

export function ChangePasswordView({ open = true, onClose }: ChangePasswordViewProps) {
  const { token } = theme.useToken();
  const toast = useToast();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const checks = [
    { label: 'At least 8 characters long', valid: newPassword.length >= 8 },
    { label: 'Contains uppercase letter (A-Z)', valid: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter (a-z)', valid: /[a-z]/.test(newPassword) },
    { label: 'Contains numeric digit (0-9)', valid: /[0-9]/.test(newPassword) },
    { label: 'Contains special character (!@#$%^&*)', valid: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const passedCount = checks.filter((c) => c.valid).length;
  const strengthPercent = Math.round((passedCount / checks.length) * 100);

  const getStrengthColor = () => {
    if (strengthPercent <= 40) return token.colorError;
    if (strengthPercent <= 80) return token.colorWarning;
    return token.colorSuccess;
  };

  const handleFinish = async (values: { oldPassword?: string; newPassword?: string; confirmPassword?: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('New password and confirmation password do not match');
      return;
    }
    if (passedCount < 5) {
      toast.error('Password does not satisfy all complexity requirements');
      return;
    }

    setLoading(true);
    try {
      await userModulesApi.changePassword({
        oldPassword: values.oldPassword || '',
        newPassword: values.newPassword || '',
        confirmPassword: values.confirmPassword || '',
      });
      toast.success('Your account password has been updated successfully');
      form.resetFields();
      setNewPassword('');
      if (onClose) onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formFields = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      size="large"
      requiredMark={(label, { required }) => (
        <span>
          {label}
          {required && <span style={{ color: token.colorError, marginLeft: 4 }}>*</span>}
        </span>
      )}
    >
      <Form.Item
        label="Current Password"
        name="oldPassword"
        rules={[{ required: true, message: 'Please enter your current password' }]}
      >
        <Input.Password prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Enter current password" />
      </Form.Item>

      <Form.Item
        label="New Password"
        name="newPassword"
        rules={[{ required: true, message: 'Please enter new password' }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />}
          placeholder="Enter new password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Form.Item>

      {/* Password Strength Bar */}
      {newPassword && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Password Security Strength:
            </Text>
            <Text style={{ fontSize: 12, fontWeight: 600, color: getStrengthColor() }}>
              {strengthPercent <= 40 ? 'WEAK' : strengthPercent <= 80 ? 'MEDIUM' : 'STRONG'}
            </Text>
          </div>
          <Progress percent={strengthPercent} strokeColor={getStrengthColor()} showInfo={false} />

          <List
            size="small"
            dataSource={checks}
            renderItem={(item) => (
              <List.Item style={{ padding: '4px 0', border: 'none' }}>
                <Space size={6}>
                  {item.valid ? (
                    <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: token.colorTextQuaternary }} />
                  )}
                  <Text type={item.valid ? 'success' : 'secondary'} style={{ fontSize: 12 }}>
                    {item.label}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      <Form.Item
        label="Confirm New Password"
        name="confirmPassword"
        rules={[{ required: true, message: 'Please confirm your new password' }]}
      >
        <Input.Password prefix={<LockOutlined style={{ color: token.colorTextQuaternary }} />} placeholder="Re-enter new password" />
      </Form.Item>

      {!onClose && (
        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <AppButton type="primary" size="large" icon={<SaveOutlined />} loading={loading} htmlType="submit">
            Update Password
          </AppButton>
        </Form.Item>
      )}
    </Form>
  );

  const bodyContent = (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Space align="center" style={{ justifyContent: 'center' }}>
          <KeyOutlined style={{ fontSize: 26, color: token.colorPrimary }} />
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            Change Account Password
          </Title>
        </Space>
        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          Update your portal authentication credentials to maintain account security
        </Text>
      </div>

      {formFields}
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
        title="Security & Password Settings"
        mask={{ blur: false }}
        footer={
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} size={8}>
            <AppButton danger onClick={onClose}>Cancel</AppButton>
            <AppButton type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
              Update Password
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
