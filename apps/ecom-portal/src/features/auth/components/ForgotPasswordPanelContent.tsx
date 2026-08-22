// Created by Sekar Nagarajan (2026-08-22 09:10)
import { ArrowLeftOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Input, Result, Spin, Typography, theme } from 'antd';
import { Controller } from 'react-hook-form';

import { useForgotPasswordController } from '../hooks/use-forgot-password-controller';
import { ImageCaptcha } from '../../landing/components/ImageCaptcha';

const { Text, Title } = Typography;

interface ForgotPasswordPanelContentProps {
  onBack: () => void;
}

export function ForgotPasswordPanelContent({ onBack }: ForgotPasswordPanelContentProps) {
  const { token } = theme.useToken();
  const controller = useForgotPasswordController();
  const { form, handleSubmit, serverError, isSubmitting, isSuccess } = controller;
  const { control, formState: { errors } } = form;

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 13,
    color: token.colorTextSecondary,
    marginBottom: 6,
    display: 'block',
  };

  const fieldStyle: React.CSSProperties = {
    borderRadius: token.borderRadius,
  };

  if (isSuccess) {
    return (
      <Flex vertical style={{ height: '100%', justifyContent: 'center' }}>
        <Result
          status="success"
          title="Password Reset Email Sent"
          subTitle="If the username matches an existing account, an email with password reset instructions will be sent."
          extra={[
            <Button key="home" type="primary" size="large" onClick={onBack} block style={{ borderRadius: token.borderRadius, fontWeight: 500, marginBottom: 16 }}>
              Back to Login
            </Button>,
            <Button key="resend" type="text" onClick={controller.resetForm} block>
              Didn't receive it? Try again
            </Button>
          ]}
        />
      </Flex>
    );
  }

  return (
    <Flex vertical style={{ height: '100%' }}>
      <Flex justify="flex-start" style={{ marginBottom: token.marginLG }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={onBack}
          style={{ color: token.colorTextSecondary, padding: 0 }}
        >
          Back to Login
        </Button>
      </Flex>

      <Flex vertical gap={token.marginLG} style={{ flex: 1 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: token.colorPrimaryBg,
              color: token.colorPrimary,
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              <KeyOutlined />
            </div>
            Forgot Password
          </Title>
          <Text type="secondary" style={{ fontSize: token.fontSize, display: 'block', marginTop: token.marginXS }}>
            Enter your login username below to receive password reset instructions.
          </Text>
        </div>

        {serverError && (
          <Alert
            type="error"
            showIcon
            message="Request Failed"
            description={serverError}
            style={{ borderRadius: token.borderRadius }}
          />
        )}

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ marginBottom: token.marginLG }}>
            <label htmlFor="forgot-username" style={labelStyle}>
              Login Username <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name="userName"
              render={({ field }) => (
                <Input
                  {...field}
                  id="forgot-username"
                  prefix={<UserOutlined style={{ color: token.colorTextQuaternary, marginRight: 8 }} />}
                  placeholder="Enter your username (e.g. cust001)"
                  size="large"
                  maxLength={50}
                  autoFocus
                  style={fieldStyle}
                />
              )}
            />
            {errors.userName && (
              <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                {errors.userName.message}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: token.marginXXL }}>
            <label style={labelStyle}>
              Security Check <Text type="danger">*</Text>
            </label>
            <ImageCaptcha
              control={control}
              name="captcha"
              captchaType="ForgotPassword"
              errorMessage={errors.captcha?.message}
            />
          </div>

          <Button
            block
            disabled={isSubmitting}
            htmlType="submit"
            size="large"
            type="primary"
            icon={isSubmitting ? <Spin size="small" /> : undefined}
            style={{
              borderRadius: token.borderRadius,
              fontWeight: 600,
              marginTop: 'auto'
            }}
          >
            {isSubmitting ? 'Sending Request...' : 'Reset Password'}
          </Button>
        </form>
      </Flex>
    </Flex>
  );
}
