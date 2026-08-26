// Modified by Sekar Nagarajan (2026-08-25 17:25)
import { AppButton } from '@solverminds/shared-ui';
import { Link } from '@tanstack/react-router';
import type { MenuProps } from 'antd';
import { Dropdown, Layout } from 'antd';
import { useState } from 'react';

import { AppIcon, Icons } from '../icons';
import { HeaderThemeToggle } from './header-theme-toggle';

const { Header } = Layout;

export type PublicLanguageCode = 'en' | 'zh' | 'ma' | 'es';

const PUBLIC_LANGUAGES: Array<{
  key: PublicLanguageCode;
  label: string;
  nativeName: string;
  detail: string;
  shortCode: string;
}> = [
  {
    key: 'en',
    label: 'English',
    nativeName: 'English',
    detail: 'Default portal language',
    shortCode: 'EN',
  },
  {
    key: 'zh',
    label: 'Chinese',
    nativeName: '中文',
    detail: 'Simplified Chinese (中文)',
    shortCode: 'ZH',
  },
  {
    key: 'ma',
    label: 'Malay',
    nativeName: 'Bahasa Melayu',
    detail: 'Bahasa Melayu',
    shortCode: 'MS',
  },
  {
    key: 'es',
    label: 'Spanish',
    nativeName: 'Español',
    detail: 'Español (Spanish)',
    shortCode: 'ES',
  },
];

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
 * Shows: Hamburger · Logo · Portal name | Contact Us · Register · Login · Language
 */
export function PublicLayoutHeader({
  logoUrl,
  portalName = 'E-Commerce Portal',
  onLoginClick,
  collapsed,
  onToggleCollapse,
}: PublicLayoutHeaderProps) {
  const [language, setLanguage] = useState<PublicLanguageCode>('en');
  const selectedLanguage =
    PUBLIC_LANGUAGES.find((item) => item.key === language) ?? PUBLIC_LANGUAGES[0];

  const languageItems: MenuProps['items'] = PUBLIC_LANGUAGES.map((item) => ({
    key: item.key,
    label: (
      <div className="pub-header-lang-item">
        <span className="pub-header-lang-item__name">
          {item.nativeName}
          {item.nativeName !== item.label ? ` · ${item.label}` : ''}
        </span>
        <span className="pub-header-lang-item__detail">{item.detail}</span>
      </div>
    ),
  }));

  const onLanguageClick: MenuProps['onClick'] = ({ key }) => {
    setLanguage(key as PublicLanguageCode);
  };

  return (
    <Header className="pub-layout-header">
      <div className="pub-layout-header__left">
        {onToggleCollapse ? (
          <AppButton
            type="text"
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            icon={<AppIcon icon={Icons.menu} size={18} />}
            onClick={onToggleCollapse}
          />
        ) : null}
        <Link to="/" className="pub-layout-header__brand-link">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="pub-layout-header__logo"
            />
          ) : (
            <div className="pub-layout-header__brand">
              <AppIcon icon={Icons.globe} size={18} />
              <div className="pub-layout-header__brand-text">
                <span className="pub-layout-header__brand-name">SOLVERMINDS</span>
                <span className="pub-layout-header__brand-portal">{portalName}</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      <div className="pub-header-actions">
        <Link to="/contact-us">
          <AppButton
            type="text"
            className="pub-header-action"
            id="nav-contact-us"
            icon={<AppIcon icon={Icons.headphones} size={16} />}
            aria-label="Contact Us"
          >
            <span className="pub-header-action__label">Contact Us</span>
          </AppButton>
        </Link>

        <Link to="/register">
          <AppButton
            type="text"
            className="pub-header-action"
            id="nav-register"
            icon={<AppIcon icon={Icons.userPlus} size={16} />}
            aria-label="Register"
          >
            <span className="pub-header-action__label">Register</span>
          </AppButton>
        </Link>

        <AppButton
          type="primary"
          className="pub-header-action pub-header-action--primary"
          id="nav-login-btn"
          icon={<AppIcon icon={Icons.logIn} size={16} />}
          onClick={onLoginClick}
          aria-label="Login"
        >
          <span className="pub-header-action__label">Login</span>
        </AppButton>

        <HeaderThemeToggle />

        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: languageItems,
            selectable: true,
            selectedKeys: [language],
            onClick: onLanguageClick,
          }}
        >
          <AppButton
            type="text"
            className="pub-header-action"
            aria-label={`Language: ${selectedLanguage.label}`}
            aria-haspopup="menu"
          >
            <span className="pub-header-lang-trigger">
              <AppIcon icon={Icons.globe} size={16} />
              <span className="pub-header-lang-trigger__code">
                {selectedLanguage.shortCode}
              </span>
              <span className="pub-header-action__label">
                {selectedLanguage.label}
              </span>
              <AppIcon icon={Icons.chevronDown} size={14} />
            </span>
          </AppButton>
        </Dropdown>
      </div>
    </Header>
  );
}
