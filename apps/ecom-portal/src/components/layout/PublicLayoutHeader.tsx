// Modified by Sekar Nagarajan (2026-09-17 11:56)
import { AppButton } from "@solverminds/shared-ui";
import { Link } from "@tanstack/react-router";
import { Layout } from "antd";

import { AppIcon, Icons } from "../icons";
import { HeaderLanguageSelect } from "./header-language-select";

const { Header } = Layout;

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
  portalName = "E-Commerce Portal",
  onLoginClick,
  collapsed,
  onToggleCollapse,
}: PublicLayoutHeaderProps) {
  return (
    <Header className="pub-layout-header">
      <div className="pub-layout-header__left">
        {onToggleCollapse ? (
          <AppButton
            type="text"
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            icon={<AppIcon icon={Icons.menu} size={25} />}
            onClick={onToggleCollapse}
          />
        ) : null}
        <Link to="/" className="pub-layout-header__brand-link">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="pub-layout-header__logo" />
          ) : (
            <div className="pub-layout-header__brand">
              <AppIcon icon={Icons.globe} size={18} />
              <div className="pub-layout-header__brand-text">
                <span className="pub-layout-header__brand-name">
                  SOLVERMINDS
                </span>
                <span className="pub-layout-header__brand-portal">
                  {portalName}
                </span>
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

        {/* <HeaderThemeToggle /> */}

        <HeaderLanguageSelect buttonClassName="pub-header-action" />
      </div>
    </Header>
  );
}
