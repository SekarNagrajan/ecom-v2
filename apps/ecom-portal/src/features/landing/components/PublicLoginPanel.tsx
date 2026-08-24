// Modified by sekar nagarajan (2026-08-21)
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, SafetyCertificateOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import { PRECONFIGURED_TENANTS } from '@solverminds/auth';
import { useNavigate } from '@tanstack/react-router';
import { Alert, Button, Checkbox, Divider, Flex, Input, Select, Spin, Typography, theme } from 'antd';
import { AppDrawer } from '@solverminds/shared-ui';
import { Controller } from 'react-hook-form';
import { useState } from 'react';

import type { useLoginController } from '../../auth/hooks/use-login-controller';
import { ForgotPasswordPanelContent } from '../../auth/components/ForgotPasswordPanelContent';

const { Text, Title } = Typography;

interface PublicLoginPanelProps {
  open: boolean;
  onClose: () => void;
  /** Login controller from `useLoginController` hook */
  controller: ReturnType<typeof useLoginController>;
}

export function PublicLoginPanel({ open, onClose, controller }: PublicLoginPanelProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  
  const {
    form,
    handleSubmit,
    serverError,
    isSubmitting,
    showCaptcha,
  } = controller;
  const { control, setValue, formState: { errors } } = form;

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 13,
    color: token.colorTextSecondary,
    marginBottom: 6,
    display: 'block',
  };

  const fieldStyle: React.CSSProperties = {
    borderRadius: token.borderRadius, // 8px
  };

  const handleSelectDemoUser = (val: string) => {
    if (val === 'admin') {
      setValue('userName', 'admin');
      setValue('password', 'admin123');
    } else {
      const t = PRECONFIGURED_TENANTS[val];
      if (t) {
        setValue('userName', t.customerCode.toLowerCase());
        setValue('password', 'password123');
      }
    }
  };

  return (
    <AppDrawer
      title={null}
      open={open}
      onClose={onClose}
      placement="right"
      width={440}
      closable={false}
      styles={{
        body: {
          padding: `${token.paddingLG * 2}px ${token.paddingLG * 1.5}px`,
          display: 'flex',
          flexDirection: 'column',
          background: token.colorBgContainer,
        },
      }}
    >
      <Button
        onClick={onClose}
        type="text"
        style={{
          position: 'absolute',
          top: token.marginLG,
          right: token.marginLG,
          color: token.colorTextTertiary,
          fontSize: token.fontSizeLG,
        }}
      >
        ✕
      </Button>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        input:-internal-autofill-selected,
        input:-internal-autofill-previewed {
          -webkit-box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
          box-shadow: 0 0 0 1000px ${token.colorBgContainer} inset !important;
          -webkit-text-fill-color: ${token.colorText} !important;
          color: ${token.colorText} !important;
          caret-color: ${token.colorText} !important;
          transition: background-color 50000s ease-in-out 0s !important;
        }

        input::selection,
        input::-moz-selection {
          background-color: ${token.colorPrimaryBg} !important;
          color: ${token.colorText} !important;
        }
      `}</style>

      {view === 'forgot-password' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: token.marginMD }}>
          <ForgotPasswordPanelContent onBack={() => setView('login')} />
        </div>
      ) : (
        <>
          <Flex vertical style={{ marginBottom: token.marginLG, marginTop: token.marginMD }}>
            <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
              Login to your Account
            </Title>
            <Text type="secondary" style={{ fontSize: token.fontSize, marginTop: token.marginXS }}>
              Welcome to E-COM PORTAL. Select a tenant account or enter your credentials.
            </Text>
          </Flex>

      {/* Quick Tenant Credential Auto-Fill Selector */}
      <div style={{ marginBottom: token.marginLG, background: token.colorBgLayout, padding: token.padding, borderRadius: token.borderRadius, border: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 12, color: token.colorTextSecondary, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <ShopOutlined style={{ color: token.colorPrimary }} /> Quick Tenant Credential Selector:
        </Text>
        <Select
          placeholder="Select a Tenant or Admin account..."
          onChange={handleSelectDemoUser}
          style={{ width: '100%' }}
          options={[
            { value: 'admin', label: '👑 Admin (Multi-Tenant Admin Switcher Access)' },
            ...Object.values(PRECONFIGURED_TENANTS).map((t) => ({
              value: t.id,
              label: `🏢 ${t.customerCode} - ${t.name}`,
            })),
          ]}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {serverError && (
          <Alert
            id="login-error-alert"
            type="error"
            showIcon
            message="Login Failed"
            description={serverError}
            closable
            style={{ marginBottom: token.marginLG, borderRadius: token.borderRadius }}
          />
        )}

        <form
          id="login-form"
          onSubmit={handleSubmit}
          autoComplete="off"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ marginBottom: token.marginLG, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="login-username" style={labelStyle}>
              Username <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name="userName"
              render={({ field }) => (
                <Input
                  {...field}
                  id="login-username"
                  prefix={<UserOutlined style={{ color: token.colorTextQuaternary, marginRight: 8 }} />}
                  placeholder="Enter your username (e.g., cust001, admin)"
                  size="large"
                  maxLength={50}
                  autoComplete="off"
                  autoFocus
                  style={fieldStyle}
                />
              )}
            />
            {errors.userName && (
              <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                {errors.userName.message}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: token.marginMD, display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="login-password" style={labelStyle}>
              Password <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id="login-password"
                  prefix={<LockOutlined style={{ color: token.colorTextQuaternary, marginRight: 8 }} />}
                  placeholder="Enter your password"
                  size="large"
                  maxLength={20}
                  autoComplete="off"
                  style={fieldStyle}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              )}
            />
            {errors.password && (
              <Text type="danger" style={{ fontSize: 12, marginTop: 2 }}>
                {errors.password.message}
              </Text>
            )}
          </div>

          <Flex justify="space-between" align="center" style={{ marginBottom: token.marginXXL }}>
            <div>
              <Controller
                control={control}
                name={"remember" as any}
                render={({ field: { value, onChange, ...field } }) => (
                  <Checkbox
                    {...field}
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    style={{ color: token.colorPrimary, fontWeight: 500 }}
                  >
                    Remember me
                  </Checkbox>
                )}
              />
            </div>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setView('forgot-password');
              }}
              style={{ fontSize: token.fontSize, fontWeight: 500, color: token.colorPrimary }}
            >
              Forgot Password?
            </a>
          </Flex>

          {showCaptcha && (
            <div style={{ marginBottom: token.marginLG, display: 'flex', flexDirection: 'column' }}>
              <Text strong style={{ color: token.colorTextSecondary, marginBottom: token.marginXS }}>Security Check</Text>
              <div
                id="login-captcha-container"
                style={{
                  padding: token.padding,
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgLayout,
                  color: token.colorTextSecondary,
                  fontSize: token.fontSizeSM,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: token.marginXS,
                }}
              >
                <SafetyCertificateOutlined style={{ fontSize: token.fontSizeHeading3, color: token.colorTextQuaternary }} />
                <span>Google reCAPTCHA will appear here after too many failed attempts.</span>
              </div>
            </div>
          )}

          <Button
            block
            disabled={isSubmitting}
            htmlType="submit"
            id="login-submit-btn"
            size="large"
            type="primary"
            icon={isSubmitting ? <Spin size="small" /> : undefined}
            style={{
              borderRadius: token.borderRadius,
              fontWeight: 600,
            }}
          >
            {isSubmitting ? 'Logging in…' : 'Login'}
          </Button>
        </form>

        <Divider style={{ margin: `${token.marginXXL}px 0`, borderColor: token.colorBorderSecondary }}>
          <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>Don't have an account?</Text>
        </Divider>

        <Button
          block
          size="large"
          onClick={() => {
            onClose();
            navigate({ to: '/register' });
          }}
          style={{ borderRadius: token.borderRadius, fontWeight: 500 }}
        >
          Register Now
        </Button>
      </div>
      </>
      )}
    </AppDrawer>
  );
}
