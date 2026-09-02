// Modified by Sekar Nagarajan (2026-09-02 10:38)
import { useAuthStore } from "@solverminds/auth";
import { Layout } from "antd";
import { useState } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";

import { useLoginController } from "../../features/auth/hooks/use-login-controller";
import { usePostLoginRedirectStore } from "../../features/auth/stores/use-post-login-redirect-store";
import { PublicLoginPanel } from "../../features/landing/components/PublicLoginPanel";
import { useResponsiveLayout } from "../../hooks/use-responsive-layout";
import { AppFooter } from "./AppFooter";
import { AuthenticatedLayoutHeader } from "./AuthenticatedLayoutHeader";
import { AuthenticatedSidebar } from "./AuthenticatedSidebar";

const { Content } = Layout;

export function AuthenticatedLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loginPanelOpen, setLoginPanelOpen] = useState(false);
  const navigate = useNavigate();
  const { useMobileNav, compactHeader, tier } = useResponsiveLayout();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setIntendedPath = usePostLoginRedirectStore((s) => s.setIntendedPath);
  const clearIntendedPath = usePostLoginRedirectStore(
    (s) => s.clearIntendedPath
  );
  const consumeIntendedPath = usePostLoginRedirectStore(
    (s) => s.consumeIntendedPath
  );

  const openLoginPanel = (intendedPath?: string | null) => {
    if (intendedPath) {
      setIntendedPath(intendedPath);
    } else {
      clearIntendedPath();
    }
    setLoginPanelOpen(true);
  };

  const loginController = useLoginController({
    onSuccess: () => {
      setLoginPanelOpen(false);
      const path = consumeIntendedPath();
      if (path) {
        navigate({ to: path as never });
      }
      // If already on a public /app module with no intent, stay put after login.
    },
  });

  const onLogout = () => {
    useAuthStore.getState().logout();
    navigate({ to: "/" });
  };

  return (
    <Layout
      className="app-layout-root"
      data-viewport-tier={tier}
      data-sidebar-collapsed={collapsed ? "true" : "false"}
      data-sidebar-mobile={useMobileNav ? "true" : "false"}
    >
      <AuthenticatedSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        isMobile={useMobileNav}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        isGuest={!isAuthenticated}
        onLoginRequired={openLoginPanel}
      />
      <Layout className="app-layout-main">
        <AuthenticatedLayoutHeader
          onLogout={onLogout}
          compactHeader={compactHeader}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
          showMobileMenu={useMobileNav}
          isGuest={!isAuthenticated}
          onLoginClick={() => openLoginPanel(null)}
        />
        <Content className="app-layout-content">
          <div className="app-content-inner">
            <main className="app-content-main custom-scroll">
              <Outlet />
            </main>
          </div>
        </Content>
        <AppFooter />
      </Layout>

      {!isAuthenticated ? (
        <PublicLoginPanel
          open={loginPanelOpen}
          onClose={() => {
            setLoginPanelOpen(false);
            clearIntendedPath();
          }}
          controller={loginController}
        />
      ) : null}
    </Layout>
  );
}
