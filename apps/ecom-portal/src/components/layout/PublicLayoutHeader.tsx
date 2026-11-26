// Modified by Sekar Nagarajan (2026-09-17 11:56)
import { AppButton } from "@solverminds/shared-ui";
import { Link } from "@tanstack/react-router";
import { Layout } from "antd";
import { useTranslation } from "react-i18next";

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
  portalName,
  onLoginClick,
  collapsed,
  onToggleCollapse,
}: PublicLayoutHeaderProps) {
  const { t } = useTranslation("common");
  const resolvedPortalName = portalName ?? t("portalName");

  return (
    <Header className="pub-layout-header">
      <div className="pub-layout-header__left">
        {onToggleCollapse ? (
          <AppButton
            type="text"
            aria-label={collapsed ? t("nav.expandMenu") : t("nav.collapseMenu")}
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
                  {t("brand")}
                </span>
                <span className="pub-layout-header__brand-portal">
                  {resolvedPortalName}
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
            aria-label={t("header.contactUs")}
          >
            <span className="pub-header-action__label">
              {t("header.contactUs")}
            </span>
          </AppButton>
        </Link>

        <Link to="/register">
          <AppButton
            type="text"
            className="pub-header-action"
            id="nav-register"
            icon={<AppIcon icon={Icons.userPlus} size={16} />}
            aria-label={t("header.register")}
          >
            <span className="pub-header-action__label">
              {t("header.register")}
            </span>
          </AppButton>
        </Link>

        <AppButton
          type="primary"
          className="pub-header-action pub-header-action--primary"
          id="nav-login-btn"
          icon={<AppIcon icon={Icons.logIn} size={16} />}
          onClick={onLoginClick}
          aria-label={t("header.login")}
        >
          <span className="pub-header-action__label">{t("header.login")}</span>
        </AppButton>

        {/* <HeaderThemeToggle /> */}

        <HeaderLanguageSelect buttonClassName="pub-header-action" />
      </div>
    </Header>
  );
}
