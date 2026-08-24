// Modified by Sekar Nagarajan (2026-08-22 00:06)
import { Flex, Layout, Typography, theme, Card, Menu, Grid } from 'antd';
import type { MenuProps } from 'antd';
import { useState, useEffect } from 'react';
import {
  HomeOutlined,
  CalendarOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  TagOutlined,
  DollarOutlined,
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
} from '@ant-design/icons';

import { useLoginController } from '../../features/auth/hooks/use-login-controller';
import { useLandingController } from '../../features/landing/hooks/use-landing-controller';
import { HeroSearchPanel } from '../../features/landing/components/HeroSearchPanel';
import { PublicLoginPanel } from '../../features/landing/components/PublicLoginPanel';
import { AppFooter } from './AppFooter';
import { PublicLayoutHeader } from './PublicLayoutHeader';

import { Outlet, useNavigate, useSearch, useLocation } from '@tanstack/react-router';

const { Sider, Content } = Layout;
const { Text } = Typography;

export function PublicLayout() {
  const { token } = theme.useToken();
  const search = useSearch({ strict: false }) as any;
  const navigate = useNavigate();
  const location = useLocation();
  const [loginPanelOpen, setLoginPanelOpen] = useState(!!search.login);
  const [collapsed, setCollapsed] = useState(true);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md; // < 768px
  const isStacked = !screens.xl; // < 1200px

  useEffect(() => {
    if (search.login) {
      setLoginPanelOpen(true);
    }
  }, [search.login]);

  const loginController = useLoginController({
    onSuccess: () => {
      setLoginPanelOpen(false);
      navigate({ to: '/app/dashboard' });
    },
  });

  const landingController = useLandingController({
    onLoginRequired: () => setLoginPanelOpen(true),
  });

  const activeRouteKey = 
    location.pathname === '/' ? 'home' :
    location.pathname.startsWith('/schedules') ? 'schedules' :
    location.pathname.startsWith('/tracking') ? 'tracking' :
    location.pathname.startsWith('/contact-us') ? 'contact-us' : 'home';

  const menuItems: MenuProps['items'] = [
    {
      key: 'home',
      icon: <HomeOutlined style={{ fontSize: 18 }} />,
      label: 'Home',
    },
    {
      key: 'schedules-group',
      icon: <CalendarOutlined style={{ fontSize: 18 }} />,
      label: 'Schedules',
      children: [
        { key: 'schedules', icon: <CalendarOutlined />, label: 'Schedules' },
        { key: 'tracking', icon: <CompassOutlined />, label: 'Tracking' },
      ],
    },
    {
      key: 'rates-group',
      icon: <DollarOutlined style={{ fontSize: 18 }} />,
      label: 'Rates',
      children: [
        { key: 'rates', icon: <DollarOutlined />, label: 'Rates' },
        { key: 'tariff', icon: <TagOutlined />, label: 'Tariff' },
      ],
    },
    {
      key: 'booking',
      icon: <BookOutlined style={{ fontSize: 18 }} />,
      label: 'Booking',
    },
    {
      key: 'si',
      icon: <AuditOutlined style={{ fontSize: 18 }} />,
      label: 'Shipping Instruction',
    },
    {
      key: 'vgm',
      icon: <SafetyCertificateOutlined style={{ fontSize: 18 }} />,
      label: 'VGM',
    },
    {
      key: 'bl',
      icon: <FileProtectOutlined style={{ fontSize: 18 }} />,
      label: 'Bill of Lading',
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
      key: 'more-group',
      icon: <EllipsisOutlined style={{ fontSize: 20 }} />,
      label: 'More',
      children: [
        { key: 'payments', icon: <BankOutlined />, label: 'Payment History' },
        { key: 'customer-stmt', icon: <SolutionOutlined />, label: 'Customer Statement' },
        { key: 'carbon', icon: <CloudOutlined />, label: 'Carbon Calculator' },
        { key: 'contact-us', icon: <CustomerServiceOutlined />, label: 'Contact Us' },
      ],
    },
  ];

  const onMenuSelect: MenuProps['onSelect'] = ({ key }) => {
    if (key === 'home') {
      navigate({ to: '/' });
    } else if (key === 'schedules') {
      navigate({ to: '/app/schedules' as any });
    } else if (key === 'tracking') {
      navigate({ to: '/app/tracking' as any });
    } else if (key === 'rates') {
      navigate({ to: '/app/rates' as any });
    } else if (key === 'contact-us') {
      navigate({ to: '/contact-us' });
    } else {
      // Protected features prompt guest users to login
      setLoginPanelOpen(true);
    }
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #d9d9d9;
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #bfbfbf;
        }
      `}</style>
      <PublicLayoutHeader
        logoUrl="/logo.png"
        portalName="E-Com Portal"
        onLoginClick={() => setLoginPanelOpen(true)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <Layout style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {/* Floating Overlay Sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={240}
          collapsedWidth={80}
          theme="light"
          className="custom-scroll"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            background: '#fff',
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
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[activeRouteKey]}
            items={menuItems}
            onSelect={onMenuSelect}
            style={{ borderRight: 0, paddingTop: 16 }}
          />
        </Sider>

        <Content style={{ position: 'relative', display: 'flex', flexDirection: 'column', marginLeft: 80, height: '100%' }}>
          {/* Background Image Layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(/hero_bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.8,
              zIndex: 0,
            }}
          />
          {/* Subtle overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
              zIndex: 1,
            }}
          />

          {location.pathname !== '/' ? (
            <div style={{ flex: 1, zIndex: 2, padding: '24px 40px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Outlet />
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: isStacked ? 'column' : 'row',
                zIndex: 2,
                padding: isMobile ? '24px 16px' : isStacked ? '32px 32px' : '40px 60px',
                gap: 40,
                overflowY: 'auto'
              }}
            >
              <Outlet />
              {/* Left side text and cards (Landing page content) */}
              <Flex vertical justify="center" style={{ flex: 1, paddingRight: isStacked ? 0 : 40, maxWidth: isStacked ? '100%' : 650 }}>
                  <div
                    style={{
                    display: 'inline-block',
                    padding: '6px 20px',
                    borderRadius: 24,
                    border: `1px solid ${token.colorPrimary}`,
                    color: token.colorPrimary,
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: 1,
                    marginBottom: 24,
                    alignSelf: 'flex-start',
                    background: '#fff'
                  }}
                >
                  E-COMMERCE ONLINE PORTAL
                </div>
                <h1 style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.1, color: '#1a1a1a' }}>
                  SCHEDULES, TRACKING & RATES
                </h1>
                <Text style={{ fontSize: '1.25rem', color: '#444', marginBottom: 40, lineHeight: 1.6, maxWidth: 550 }}>
                  Search sailings, track shipments, and request rates in seconds — all from one quick-action workspace in the Carrier Portal.
                </Text>
                <Flex gap={16} wrap="wrap">
                  <Card 
                    size="small" 
                    style={{ borderRadius: 16, flex: '1 1 140px', minWidth: 140, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: `1px solid ${token.colorPrimary}`, cursor: 'pointer' }} 
                    styles={{ body: { padding: '16px', display: 'flex', alignItems: 'center', gap: 12 } }}
                    onClick={() => landingController.handleTabChange('schedules')}
                  >
                    <div style={{ background: token.colorPrimaryBg, padding: 8, borderRadius: 8, color: token.colorPrimary }}>
                      <CalendarOutlined style={{ fontSize: 20 }} />
                    </div>
                    <Text strong style={{ fontSize: 13, lineHeight: 1.2 }}>Live sailing<br/>schedules</Text>
                  </Card>
                  <Card 
                    size="small" 
                    style={{ borderRadius: 16, flex: '1 1 140px', minWidth: 140, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }} 
                    styles={{ body: { padding: '16px', display: 'flex', alignItems: 'center', gap: 12 } }}
                    onClick={() => landingController.handleTabChange('tracking')}
                  >
                    <div style={{ background: token.colorPrimaryBg, padding: 8, borderRadius: 8, color: token.colorPrimary }}>
                      <EnvironmentOutlined style={{ fontSize: 20 }} />
                    </div>
                    <Text strong style={{ fontSize: 13, lineHeight: 1.2 }}>Real-time<br/>tracking</Text>
                  </Card>
                  <Card 
                    size="small" 
                    style={{ borderRadius: 16, flex: '1 1 140px', minWidth: 140, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }} 
                    styles={{ body: { padding: '16px', display: 'flex', alignItems: 'center', gap: 12 } }}
                    onClick={() => landingController.handleTabChange('rates')}
                  >
                    <div style={{ background: token.colorPrimaryBg, padding: 8, borderRadius: 8, color: token.colorPrimary }}>
                      <DollarOutlined style={{ fontSize: 20 }} />
                    </div>
                    <Text strong style={{ fontSize: 13, lineHeight: 1.2 }}>Instant spot-<br/>rate quotes</Text>
                  </Card>
                </Flex>
              </Flex>

                {/* Right side search panel */}
                <Flex align={isStacked ? "stretch" : "center"} justify={isStacked ? "center" : "flex-end"} style={{ width: isStacked ? '100%' : 600, minWidth: isStacked ? 0 : 550 }}>
                  <HeroSearchPanel controller={landingController} />
                </Flex>
            </div>
          )}

          <AppFooter />
        </Content>
      </Layout>

      <PublicLoginPanel
        open={loginPanelOpen}
        onClose={() => setLoginPanelOpen(false)}
        controller={loginController}
      />
    </Layout>
  );
}
