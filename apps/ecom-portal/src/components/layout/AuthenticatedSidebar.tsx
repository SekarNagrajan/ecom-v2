// Modified by Antigravity (2026-08-21)
import {
  DashboardOutlined,
  CalendarOutlined,
  CompassOutlined,
  DollarOutlined,
  TagOutlined,
  BookOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  DeliveredProcedureOutlined,
  NotificationOutlined,
  BarcodeOutlined,
  BankOutlined,
  SolutionOutlined,
  CloudOutlined,
  CustomerServiceOutlined,
  EllipsisOutlined,
  SettingOutlined,
  UserAddOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import type { MenuProps } from 'antd';
import { usePermission, useTenantStore, useAuthStore } from '@solverminds/auth';
import { useNavigate, useLocation } from '@tanstack/react-router';

const { Sider } = Layout;

interface AuthenticatedSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function AuthenticatedSidebar({ collapsed, onCollapse }: AuthenticatedSidebarProps) {
  const { token } = theme.useToken();
  const { can } = usePermission();
  const user = useAuthStore((state) => state.user);
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname.split('/').pop() || 'dashboard';

  const isSuperUser = Boolean(user?.isSessionAdmin || user?.role === 'ADMIN');
  const tenantModules = [...(activeTenant.features.allowedModules || []), 'admin', 'user-creation', 'vendor-approvals', 'tracking'];

  const rawMenuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: 'Dashboard',
    },
    {
      key: 'schedules-group',
      icon: <CalendarOutlined style={{ fontSize: 18 }} />,
      label: 'Schedules',
      children: [
        { key: 'schedules', icon: <CalendarOutlined />, label: 'Schedules', disabled: !can('SCH') },
        { key: 'tracking', icon: <CompassOutlined />, label: 'Tracking', disabled: !can('TRK') },
      ].filter((child) => isSuperUser || tenantModules.includes(child.key)),
    },
    {
      key: 'rates-group',
      icon: <DollarOutlined style={{ fontSize: 18 }} />,
      label: 'Rates',
      children: [
        { key: 'rates', icon: <DollarOutlined />, label: 'Rates', disabled: !can('SCH') },
        { key: 'tariff', icon: <TagOutlined />, label: 'Tariff', disabled: !can('SCH') },
      ].filter((child) => isSuperUser || tenantModules.includes(child.key)),
    },
    {
      key: 'booking',
      icon: <BookOutlined style={{ fontSize: 18 }} />,
      label: 'Booking',
      disabled: !can('BKG'),
    },
    {
      key: 'si',
      icon: <AuditOutlined style={{ fontSize: 18 }} />,
      label: 'Shipping Instruction',
      disabled: !can('SI'),
    },
    {
      key: 'vgm',
      icon: <SafetyCertificateOutlined style={{ fontSize: 18 }} />,
      label: 'VGM',
      disabled: !can('BL'),
    },
    {
      key: 'bl',
      icon: <FileProtectOutlined style={{ fontSize: 18 }} />,
      label: 'Bill of Lading',
      disabled: !can('BL'),
    },
    {
      key: 'do',
      icon: <DeliveredProcedureOutlined style={{ fontSize: 18 }} />,
      label: 'Delivery Order',
    },
    {
      key: 'arrival-notice',
      icon: <NotificationOutlined style={{ fontSize: 18 }} />,
      label: 'Arrival Notice',
    },
    {
      key: 'cro',
      icon: <BarcodeOutlined style={{ fontSize: 18 }} />,
      label: 'Container Release Order',
    },
    {
      key: 'user-creation',
      icon: <UserAddOutlined style={{ fontSize: 18 }} />,
      label: 'User Creation (USC)',
    },
    {
      key: 'vendor-approvals',
      icon: <CheckSquareOutlined style={{ fontSize: 18 }} />,
      label: 'Agency Approvals',
    },
    {
      key: 'more-group',
      icon: <EllipsisOutlined style={{ fontSize: 20 }} />,
      label: 'More',
      children: [
        { key: 'admin', icon: <SettingOutlined />, label: 'Control Panel Admin' },
        { key: 'payments', icon: <BankOutlined />, label: 'Payment History', disabled: !can('PAY') },
        { key: 'customer-stmt', icon: <SolutionOutlined />, label: 'Customer Statement' },
        { key: 'carbon', icon: <CloudOutlined />, label: 'Carbon Calculator' },
        { key: 'contact-us', icon: <CustomerServiceOutlined />, label: 'Contact Us' },
      ].filter((child) => isSuperUser || tenantModules.includes(child.key)),
    },
  ];

  // Filter items: Superusers see all modules bypassing RegMenus restriction
  const menuItems = rawMenuItems.filter((item) => {
    if (!item) return false;
    if (isSuperUser) return true; // Superuser sees all menus!
    const key = item.key as string;
    if (key.endsWith('-group')) {
      const groupItem = item as { children?: unknown[] };
      return Array.isArray(groupItem.children) && groupItem.children.length > 0;
    }
    return tenantModules.includes(key);
  });

  const onMenuSelect: MenuProps['onSelect'] = ({ key }) => {
    if (key === 'contact-us') {
      navigate({ to: '/contact-us' });
    } else {
      navigate({ to: `/app/${key}` });
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={250}
      collapsedWidth={80}
      theme="light"
      className="custom-scroll"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: collapsed
          ? '2px 0 8px 0 rgba(29,35,41,.05)'
          : '8px 0 28px 0 rgba(0,0,0,.15)',
        transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: ${token.colorBorder};
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: ${token.colorTextQuaternary};
        }
      `}</style>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          borderTop: `3px solid ${token.colorPrimary}`,
          overflow: 'hidden',
          padding: '12px 16px',
          background: token.colorBgContainer,
          gap: 10,
        }}
      >
        <img src={activeTenant.logoUrl || '/logo.png'} alt={activeTenant.name} style={{ height: 38, maxWidth: '100%', objectFit: 'contain' }} />
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[currentRoute]}
        items={menuItems}
        onSelect={onMenuSelect}
        style={{ borderRight: 0, paddingTop: 8 }}
      />
    </Sider>
  );
}
