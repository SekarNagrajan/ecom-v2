// Modified by Sekar Nagarajan (2026-08-22 00:15)
// AuthenticatedLayoutHeader component with topbar quick action buttons (Schedules, Tracking, Rates)

import {
  BellOutlined,
  BgColorsOutlined,
  CalendarOutlined,
  CompassOutlined,
  CompressOutlined,
  CreditCardOutlined,
  CrownOutlined,
  DollarOutlined,
  EditOutlined,
  ExpandOutlined,
  LockOutlined,
  LogoutOutlined,
  PhoneOutlined,
  ShopOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PRECONFIGURED_TENANTS, useAuthStore, useTenantStore } from '@solverminds/auth';
import { AppButton, AppModal } from '@solverminds/shared-ui';
import { useConfirm, useToast } from '@solverminds/shared-ui/hooks';
import { useNavigate } from '@tanstack/react-router';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Layout, Select, Space, Tag, Typography, theme } from 'antd';
import { useState } from 'react';
import { ContactUsDrawer } from '../../features/contact-us/components/ContactUsDrawer';
import { useThemePreferencesController } from '../../features/theme/hooks/use-theme-preferences-controller';
import { ChangePasswordView } from '../../features/user-modules/components/ChangePasswordView';
import { MyAlertsView } from '../../features/user-modules/components/MyAlertsView';
import { ProfileView } from '../../features/user-modules/components/ProfileView';
import { AccountPreferencesDrawer } from './account-preferences-drawer';

const { Header } = Layout;
const { Text } = Typography;

interface AuthenticatedLayoutHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

export function AuthenticatedLayoutHeader({ onLogout }: AuthenticatedLayoutHeaderProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const user = useAuthStore((state) => state.user);
  const setActiveSubCustomer = useAuthStore((state) => state.setActiveSubCustomer);

  const { activeTenant, setTenant } = useTenantStore();

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [changePasswordDrawerOpen, setChangePasswordDrawerOpen] = useState(false);
  const [myAlertDrawerOpen, setMyAlertDrawerOpen] = useState(false);
  const [contactUsDrawerOpen, setContactUsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
        setIsFullscreen(false);
      }
    }
  };

  const handleLogoutConfirm = () => {
    confirm({
      title: 'Confirm Portal Logout',
      icon: <LogoutOutlined style={{ color: token.colorError }} />,
      content: 'Are you sure you want to terminate your current portal session and log out?',
      okText: 'Confirm Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onConfirm: () => {
        onLogout();
      },
    });
  };

  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const preferencesController = useThemePreferencesController();

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    switch (info.key) {
      case 'profile':
        setProfileDrawerOpen(true);
        break;
      case 'appearance':
      case 'preferences':
        setPreferencesOpen(true);
        break;
      case 'change-password':
        setChangePasswordDrawerOpen(true);
        break;
      case 'contact-us':
        setContactUsDrawerOpen(true);
        break;
      case 'quote':
        navigate({ to: '/app/quotes' as any });
        break;
      case 'my-alert':
        setMyAlertDrawerOpen(true);
        break;
      case 'payment-history':
        navigate({ to: '/app/payments' as any });
        break;
      case 'user-creation':
        navigate({ to: '/app/sub-users' as any });
        break;
      case 'logout':
        handleLogoutConfirm();
        break;
      default:
        break;
    }
  };

  const userNameDisplay = user?.name || user?.email || 'Customer Admin';
  const userRoleDisplay = user?.isSessionAdmin
    ? 'Superuser (Customer Admin)'
    : user?.role === 'ADMIN'
      ? 'System Administrator'
      : 'Customer Account';
  const initials = userNameDisplay
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const subCustomerAccounts = user?.subCustomerAccounts || [
    { custCode: 'CUST-001', compName: 'Apex Logistics Global' },
    { custCode: 'CUST-002', compName: 'Atlantic Freight LLC' },
    { custCode: 'CUST-003', compName: 'Pacific Maritime Corp' },
  ];

  const profileMenuItems: MenuProps['items'] = [
    { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
    { key: 'appearance', label: 'Appearance & Theme Settings', icon: <BgColorsOutlined /> },
    { key: 'change-password', label: 'Change Password', icon: <LockOutlined /> },
    { key: 'contact-us', label: 'Contact Us', icon: <PhoneOutlined /> },
    { key: 'quote', label: 'Quote (Rate Request)', icon: <EditOutlined /> },
    { key: 'my-alert', label: 'My Alert', icon: <BellOutlined /> },
    { key: 'payment-history', label: 'Payment History', icon: <CreditCardOutlined /> },
    ...(user?.isSessionAdmin || user?.role === 'ADMIN' ? [{ key: 'user-creation', label: 'Sub-User Creation', icon: <UserAddOutlined /> }] : []),
    { type: 'divider' },
    { key: 'logout', label: 'Log-Out', icon: <LogoutOutlined />, danger: true },
  ];

  return (
    <Header
      style={{
        background: token.colorBgContainer,
        padding: `0 ${token.paddingMD}px`,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        zIndex: 90,
      }}
    >
      {/* Left side: Active Tenant Brand Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: token.marginMD }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong style={{ fontSize: 15, color: token.colorText }}>
              {activeTenant.name}
            </Text>
            <Tag color="blue" style={{ fontSize: 10, margin: 0, backgroundColor: `${token.colorPrimary}15`, borderColor: token.colorPrimary, color: token.colorPrimary }}>
              {activeTenant.customerCode}
            </Tag>
            {user?.isSessionAdmin && (
              <Tag icon={<CrownOutlined />} color="gold" style={{ fontSize: 10, margin: 0 }}>
                SUPERUSER ACTIVE
              </Tag>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.2 }}>
            Welcome to E-COM PORTAL ({activeTenant.id})
          </Text>
        </div>
      </div>



      {/* Right side: Multi-Customer Selector + Multi-Tenant Switcher + Fullscreen + User Profile Stack */}
      <Space size={token.marginMD} align="center">
        {/* Multi-Customer Account Selector for Superusers */}
        {(user?.isSessionAdmin || (user?.subCustomerAccounts && user.subCustomerAccounts.length > 0)) && (
          <Space size={4} align="center">
            <TeamOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Select
              value={user?.activeSubCustomer || subCustomerAccounts[0]?.custCode}
              onChange={(val) => {
                setActiveSubCustomer(val);
                const match = subCustomerAccounts.find((a) => a.custCode === val);
                toast.success(`Switched Customer Scope to ${match ? match.compName : val}`);
              }}
              style={{ width: 220 }}
              options={subCustomerAccounts.map((a) => ({
                value: a.custCode,
                label: `${a.custCode} - ${a.compName}`,
              }))}
            />
          </Space>
        )}

        {/* Admin Multi-Tenant Switcher */}
        {user?.role === 'ADMIN' && (
          <Space size={4} align="center">
            <ShopOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
            <Select
              value={activeTenant.id}
              onChange={(val) => {
                setTenant(val);
                toast.info(`Switched active tenant to ${PRECONFIGURED_TENANTS[val]?.name}`);
              }}
              style={{ width: 200 }}
              options={Object.values(PRECONFIGURED_TENANTS).map((t) => ({
                value: t.id,
                label: `${t.customerCode} - ${t.name}`,
              }))}
            />
          </Space>
        )}

        {/* Fullscreen Expand/Compress */}
        <AppButton
          type="text"
          shape="circle"
          icon={isFullscreen ? <CompressOutlined style={{ fontSize: 16 }} /> : <ExpandOutlined style={{ fontSize: 16 }} />}
          onClick={toggleFullscreen}
          style={{ color: token.colorTextSecondary }}
        />

        {/* User Info & Avatar Stack - Click Trigger */}
        <Dropdown
          trigger={['click']}
          menu={{ items: profileMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: token.marginXS, cursor: 'pointer', padding: `0 ${token.paddingXS}px` }}>
            <Avatar
              style={{
                backgroundColor: token.colorPrimary,
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
              size="default"
            >
              {initials}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <Text strong style={{ fontSize: 13, color: token.colorText }}>
                {userNameDisplay}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {userRoleDisplay}
              </Text>
            </div>
          </div>
        </Dropdown>
      </Space>

      {/* Account Profile Drawer */}
      <ProfileView open={profileDrawerOpen} onClose={() => setProfileDrawerOpen(false)} />

      {/* Change Password Modal */}
      <AppModal
        open={changePasswordDrawerOpen}
        onCancel={() => setChangePasswordDrawerOpen(false)}
        footer={null}
        destroyOnClose
        width={500}
      >
        <ChangePasswordView onSuccess={() => setChangePasswordDrawerOpen(false)} />
      </AppModal>

      {/* My Alert Preferences Modal */}
      <AppModal
        open={myAlertDrawerOpen}
        onCancel={() => setMyAlertDrawerOpen(false)}
        footer={null}
        destroyOnClose
        width={650}
      >
        <MyAlertsView />
      </AppModal>

      {/* Global Contact Us Drawer */}
      <ContactUsDrawer open={contactUsDrawerOpen} onClose={() => setContactUsDrawerOpen(false)} />

      {/* Theme & Appearance Customization Panel */}
      <AccountPreferencesDrawer
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        preferencesController={preferencesController}
      />
    </Header>
  );
}
