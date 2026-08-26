// Modified by Sekar Nagarajan (2026-08-25 19:00)
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import type { MenuProps } from "antd";
import { Card, Drawer, Layout, Menu, Tooltip, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useLoginController } from "../../features/auth/hooks/use-login-controller";
import { usePostLoginRedirectStore } from "../../features/auth/stores/use-post-login-redirect-store";
import {
  appPathnameToMenuKey,
  isPublicMenuKey,
  menuKeyToAppPath,
} from "../../features/auth/utils/public-menu-access";
import { HeroSearchPanel } from "../../features/landing/components/HeroSearchPanel";
import { PublicLoginPanel } from "../../features/landing/components/PublicLoginPanel";
import { useLandingController } from "../../features/landing/hooks/use-landing-controller";
import { useResponsiveLayout } from "../../hooks/use-responsive-layout";
import { AppIcon, Icons } from "../icons";
import { AppFooter } from "./AppFooter";
import { PublicLayoutHeader } from "./PublicLayoutHeader";

const { Sider, Content } = Layout;
const { Text } = Typography;

function navIcon(Icon: LucideIcon, size = 18, locked = false) {
  return (
    <AppIcon
      icon={Icon}
      size={size}
      variant={locked ? "navLocked" : "nav"}
    />
  );
}

function menuLabel(text: string, locked: boolean) {
  if (!locked) return text;
  return <Tooltip title="Sign In Required">{text}</Tooltip>;
}

export function PublicLayout() {
  const search = useSearch({ strict: false }) as { login?: boolean };
  const navigate = useNavigate();
  const location = useLocation();
  const { useMobileNav, stackHero, tier } = useResponsiveLayout();
  const setIntendedPath = usePostLoginRedirectStore((s) => s.setIntendedPath);
  const clearIntendedPath = usePostLoginRedirectStore(
    (s) => s.clearIntendedPath
  );
  const consumeIntendedPath = usePostLoginRedirectStore(
    (s) => s.consumeIntendedPath
  );

  const [loginPanelOpen, setLoginPanelOpen] = useState(Boolean(search.login));
  const [collapsed, setCollapsed] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (search.login) {
      setLoginPanelOpen(true);
    }
  }, [search.login]);

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
      const path = consumeIntendedPath() ?? "/app/dashboard";
      navigate({ to: path as never });
    },
  });

  const landingController = useLandingController({
    onLoginRequired: (intendedPath?: string) => {
      openLoginPanel(intendedPath ?? null);
    },
  });

  const activeRouteKey = appPathnameToMenuKey(location.pathname);

  const menuItems: MenuProps["items"] = [
    {
      key: "home",
      icon: navIcon(Icons.home),
      label: menuLabel("Home", false),
    },
    {
      key: "schedules-group",
      icon: navIcon(Icons.calendar),
      label: "Schedules",
      children: [
        {
          key: "schedules",
          icon: navIcon(Icons.calendar, 16),
          label: menuLabel("Schedules", false),
        },
        {
          key: "tracking",
          icon: navIcon(Icons.mapPin, 16),
          label: menuLabel("Tracking", false),
        },
      ],
    },
    {
      key: "rates-group",
      icon: navIcon(Icons.dollarSign),
      label: "Rates",
      children: [
        {
          key: "rates",
          icon: navIcon(Icons.dollarSign, 16),
          label: menuLabel("Rates", false),
        },
        {
          key: "tariff",
          icon: navIcon(Icons.tag, 16),
          label: menuLabel("Tariff", false),
        },
      ],
    },
    {
      key: "booking",
      icon: navIcon(Icons.bookOpen, 18, true),
      label: menuLabel("Booking", true),
      className: "ant-menu-item-locked",
    },
    {
      key: "si",
      icon: navIcon(Icons.clipboardList, 18, true),
      label: menuLabel("Shipping Instruction", true),
      className: "ant-menu-item-locked",
    },
    {
      key: "vgm",
      icon: navIcon(Icons.shieldCheck, 18, true),
      label: menuLabel("VGM", true),
      className: "ant-menu-item-locked",
    },
    {
      key: "bl",
      icon: navIcon(Icons.shieldCheck, 18, true),
      label: menuLabel("Bill of Lading", true),
      className: "ant-menu-item-locked",
    },
    {
      key: "do",
      icon: navIcon(Icons.truck, 18, true),
      label: menuLabel("Delivery Order", true),
      className: "ant-menu-item-locked",
    },
    {
      key: "arrival-notice",
      icon: navIcon(Icons.bell, 18, true),
      label: menuLabel("Arrival Notice", true),
      className: "ant-menu-item-locked",
    },
    {
      key: "cro",
      icon: navIcon(Icons.barcode, 18, true),
      label: menuLabel("Container Release Order", true),
      className: "ant-menu-item-locked",
    },
    {
      key: "more-group",
      icon: navIcon(Icons.ellipsis, 20),
      label: "More",
      children: [
        {
          key: "payments",
          icon: navIcon(Icons.landmark, 16, true),
          label: menuLabel("Payment History", true),
          className: "ant-menu-item-locked",
        },
        {
          key: "customer-stmt",
          icon: navIcon(Icons.contact, 16, true),
          label: menuLabel("Customer Statement", true),
          className: "ant-menu-item-locked",
        },
        {
          key: "carbon",
          icon: navIcon(Icons.cloud, 16, true),
          label: menuLabel("Carbon Calculator", true),
          className: "ant-menu-item-locked",
        },
        {
          key: "contact-us",
          icon: navIcon(Icons.headphones, 16),
          label: menuLabel("Contact Us", false),
        },
      ],
    },
  ];

  const onMenuSelect: MenuProps["onSelect"] = ({ key }) => {
    setMobileNavOpen(false);
    if (isPublicMenuKey(key)) {
      clearIntendedPath();
      if (key === "home") {
        navigate({ to: "/" });
      } else if (key === "schedules") {
        navigate({ to: "/app/schedules" as never });
      } else if (key === "tracking") {
        navigate({ to: "/app/tracking" as never });
      } else if (key === "rates" || key === "tariff") {
        navigate({ to: "/app/rates" as never });
      } else if (key === "contact-us") {
        navigate({ to: "/contact-us" });
      }
      return;
    }

    openLoginPanel(menuKeyToAppPath(key));
  };

  const menuBlock = (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[activeRouteKey]}
      items={menuItems}
      onSelect={onMenuSelect}
      className="pub-layout-sider__menu"
    />
  );

  const handleMenuToggle = () => {
    if (useMobileNav) {
      setMobileNavOpen(true);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const mainClassName = useMobileNav
    ? "pub-layout-main"
    : "pub-layout-main pub-layout-main--with-rail";

  return (
    <Layout className="pub-layout-root" data-viewport-tier={tier}>
      <PublicLayoutHeader
        logoUrl="/logo.png"
        portalName="E-Com Portal"
        onLoginClick={() => openLoginPanel(null)}
        collapsed={collapsed}
        onToggleCollapse={handleMenuToggle}
      />

      <div className="pub-layout-shell">
        {useMobileNav ? (
          <Drawer
            title="E-Com Portal"
            placement="left"
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            size={280}
            classNames={{ body: "app-sidebar-drawer-body custom-scroll" }}
          >
            {menuBlock}
          </Drawer>
        ) : (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            width={240}
            collapsedWidth={80}
            theme="light"
            className="custom-scroll pub-layout-sider"
          >
            {menuBlock}
          </Sider>
        )}

        <Layout className={mainClassName}>
          <Content className="pub-layout-content">
            <div className="pub-layout-bg" aria-hidden />
            <div className="pub-layout-bg-overlay" aria-hidden />

            {location.pathname !== "/" ? (
              <div
                className={
                  location.pathname === "/register" ||
                  location.pathname === "/contact-us"
                    ? "pub-layout-page pub-layout-page--outlet pub-layout-page--outlet-locked"
                    : "pub-layout-page pub-layout-page--outlet custom-scroll"
                }
              >
                <Outlet />
              </div>
            ) : (
              <div
                className={
                  stackHero
                    ? "pub-landing custom-scroll"
                    : "pub-landing pub-landing--row custom-scroll"
                }
              >
                <div
                  className={
                    stackHero
                      ? "pub-landing__copy"
                      : "pub-landing__copy pub-landing__copy--narrow"
                  }
                >
                  <span className="pub-landing__eyebrow">
                    E-COMMERCE ONLINE PORTAL
                  </span>
                  <h1 className="pub-landing__title">
                    SCHEDULES, TRACKING &amp; RATES
                  </h1>
                  <Text className="pub-landing__subtitle">
                    Search sailings, track shipments, and request rates in
                    seconds — all from one quick-action workspace in the Carrier
                    Portal.
                  </Text>
                  <div className="pub-landing__cards">
                    <Card
                      size="small"
                      className={
                        landingController.activeTab === "schedules"
                          ? "pub-landing__card pub-landing__card--active"
                          : "pub-landing__card"
                      }
                      onClick={() =>
                        landingController.handleTabChange("schedules")
                      }
                    >
                      <span className="pub-landing__card-icon">
                        <AppIcon icon={Icons.calendar} size={20} />
                      </span>
                      <Text strong className="pub-landing__card-label">
                        Live sailing
                      </Text>
                    </Card>
                    <Card
                      size="small"
                      className={
                        landingController.activeTab === "tracking"
                          ? "pub-landing__card pub-landing__card--active"
                          : "pub-landing__card"
                      }
                      onClick={() =>
                        landingController.handleTabChange("tracking")
                      }
                    >
                      <span className="pub-landing__card-icon">
                        <AppIcon icon={Icons.mapPin} size={20} />
                      </span>
                      <Text strong className="pub-landing__card-label">
                        Real-time
                        <br />
                        tracking
                      </Text>
                    </Card>
                    <Card
                      size="small"
                      className={
                        landingController.activeTab === "rates"
                          ? "pub-landing__card pub-landing__card--active"
                          : "pub-landing__card"
                      }
                      onClick={() => landingController.handleTabChange("rates")}
                    >
                      <span className="pub-landing__card-icon">
                        <AppIcon icon={Icons.dollarSign} size={20} />
                      </span>
                      <Text strong className="pub-landing__card-label">
                        Instant spot-
                        <br />
                        rate quotes
                      </Text>
                    </Card>
                  </div>
                </div>

                <div
                  className={
                    stackHero
                      ? "pub-landing__panel"
                      : "pub-landing__panel pub-landing__panel--side"
                  }
                >
                  <HeroSearchPanel controller={landingController} />
                </div>
              </div>
            )}
          </Content>
          <AppFooter />
        </Layout>
      </div>

      <PublicLoginPanel
        open={loginPanelOpen}
        onClose={() => {
          setLoginPanelOpen(false);
          clearIntendedPath();
        }}
        controller={loginController}
      />
    </Layout>
  );
}
