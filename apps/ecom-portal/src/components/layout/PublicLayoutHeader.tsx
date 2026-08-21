import {
  GlobalOutlined,
  LoginOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Flex, Layout, Space, Typography, theme } from 'antd';
import { Link } from '@tanstack/react-router';

const { Header } = Layout;
const { Text } = Typography;

interface PublicLayoutHeaderProps {
  /** Company logo URL — loaded from config / static asset */
  logoUrl?: string;
  /** Carrier / portal name e.g. "Oceanic Express Lines" */
  portalName?: string;
  onLoginClick: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * PublicLayoutHeader — unauthenticated app header.
 *
 * Parity: JSP `MainLoginLayout.jsp` navbar when `isViaLogin !== 'Yes'`.
 * Shows: Hamburger menu · Logo · Portal name | Contact Us · Register · Login
 */
export function PublicLayoutHeader({
  logoUrl,
  portalName = 'E-Commerce Portal',
  onLoginClick,
  collapsed,
  onToggleCollapse,
}: PublicLayoutHeaderProps) {
  const { token } = theme.useToken();

  const languageItems: MenuProps['items'] = [
    { key: 'en', label: 'English' },
    { key: 'zh', label: 'Chinese' },
    { key: 'ma', label: 'Malay' },
    { key: 'es', label: 'Spanish' },
  ];

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: token.zIndexBase + 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: token.paddingLG,
        height: 48,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadow,
      }}
    >
      {/* Left: Hamburger + Logo + portal name */}
      <Flex align="center" gap={token.marginSM}>
        {onToggleCollapse ? (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleCollapse}
            style={{ fontSize: 18, padding: '0 8px' }}
          />
        ) : null}
        <Link to="/" style={{ textDecoration: 'none' }}>
        <Flex align="center" gap={token.marginSM}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ maxHeight: 40, objectFit: 'contain' }}
            />
          ) : (
            <Flex align="center" gap={token.marginXS}>
              <GlobalOutlined
                style={{
                  fontSize: token.fontSizeXL + 4,
                  color: token.colorPrimary,
                }}
              />
              <Flex vertical style={{ lineHeight: 1.2 }}>
                <Text
                  strong
                  style={{
                    fontSize: token.fontSizeLG,
                    color: token.colorText,
                    lineHeight: 1.2,
                  }}
                >
                  SOLVERMINDS
                </Text>
                <Text
                  style={{
                    fontSize: token.fontSizeSM,
                    color: token.colorPrimary,
                    lineHeight: 1.2,
                    letterSpacing: '0.5px',
                  }}
                >
                  {portalName}
                </Text>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Link>
      </Flex>

      {/* Right: Contact Us · Register · Login */}
      <Space size={token.marginSM}>
        <Link to="/contact-us">
          <Button
            icon={<MailOutlined />}
            size="middle"
            type="text"
            id="nav-contact-us"
            style={{ color: token.colorText }}
          >
            Contact Us
          </Button>
        </Link>
        <Link to="/register">
          <Button
            icon={<UserAddOutlined />}
            size="middle"
            type="text"
            id="nav-register"
            style={{ color: token.colorText }}
          >
            Register
          </Button>
        </Link>
        <Button
          icon={<LoginOutlined />}
          id="nav-login-btn"
          onClick={onLoginClick}
          size="middle"
          type="primary"
        >
          Login
        </Button>
        <Dropdown menu={{ items: languageItems }} placement="bottomRight">
          <Button type="text" style={{ color: token.colorPrimary, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <GlobalOutlined style={{ fontSize: 16 }} />
            Language
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
}
