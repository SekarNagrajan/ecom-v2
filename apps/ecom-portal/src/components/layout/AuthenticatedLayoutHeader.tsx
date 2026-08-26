// Modified by Sekar Nagarajan (2026-08-25 17:25)

import {
  PRECONFIGURED_TENANTS,
  useAuthStore,
  useTenantStore,
} from "@solverminds/auth";
import { AppButton } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import {
  Avatar,
  Dropdown,
  Layout,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { ContactUsDrawer } from "../../features/contact-us/components/ContactUsDrawer";
import { useThemePreferences } from "../../features/theme/providers/theme-preferences-provider";
import { ChangePasswordView } from "../../features/user-modules/components/ChangePasswordView";
import { MyAlertsView } from "../../features/user-modules/components/MyAlertsView";
import { ProfileView } from "../../features/user-modules/components/ProfileView";
import { AppIcon, Icons } from "../icons";
import { AccountPreferencesDrawer } from "./account-preferences-drawer";
import { HeaderThemeToggle } from "./header-theme-toggle";

const { Header } = Layout;
const { Text } = Typography;

interface AuthenticatedLayoutHeaderProps {
  onLogout: () => void;
  compactHeader?: boolean;
  onMobileMenuOpen?: () => void;
  showMobileMenu?: boolean;
  /** Guest browsing public /app search modules (schedules/tracking/rates). */
  isGuest?: boolean;
  onLoginClick?: () => void;
}

export function AuthenticatedLayoutHeader({
  onLogout,
  compactHeader = false,
  onMobileMenuOpen,
  showMobileMenu = false,
  isGuest = false,
  onLoginClick,
}: AuthenticatedLayoutHeaderProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const user = useAuthStore((state) => state.user);
  const setActiveSubCustomer = useAuthStore(
    (state) => state.setActiveSubCustomer,
  );

  const { activeTenant, setTenant } = useTenantStore();

  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [changePasswordDrawerOpen, setChangePasswordDrawerOpen] =
    useState(false);
  const [myAlertDrawerOpen, setMyAlertDrawerOpen] = useState(false);
  const [contactUsDrawerOpen, setContactUsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goHome = () => {
    navigate({ to: "/" });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleLogoutConfirm = () => {
    confirm.danger({
      title: "Confirm Portal Logout",
      icon: <AppIcon icon={Icons.logOut} size={16} />,
      content:
        "Are you sure you want to terminate your current portal session and log out?",
      okText: "Confirm Logout",
      cancelText: "Cancel",
      onOk: () => {
        onLogout();
      },
    });
  };

  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const preferencesController = useThemePreferences();

  // Guest on public search modules: Login/Register chrome — not a fake logged-in user bar
  if (isGuest || !user) {
    return (
      <Header className="app-layout-header">
        <div className="app-layout-header__left">
          {showMobileMenu ? (
            <Tooltip title="Open Navigation Menu">
              <AppButton
                type="text"
                icon={<AppIcon icon={Icons.menu} size={18} />}
                onClick={onMobileMenuOpen}
                aria-label="Open navigation menu"
              />
            </Tooltip>
          ) : null}
          <Tooltip title="Go To Home">
            <button
              type="button"
              className="app-header-brand-home"
              onClick={goHome}
              aria-label="Go to home"
            >
              <div className="app-header-brand-detail">
                <div className="app-layout-header__brand-row">
                  <Text strong className="app-layout-header__tenant-name">
                    E-Com Portal
                  </Text>
                </div>
                <Text type="secondary" className="app-layout-header__welcome">
                  Browse schedules, tracking, and rates — sign in for more
                  modules
                </Text>
              </div>
            </button>
          </Tooltip>
        </div>

        <div className="app-header-actions">
          <Tooltip title="Go To Home">
            <AppButton
              type="text"
              className="app-header-action"
              icon={<AppIcon icon={Icons.home} size={16} />}
              onClick={goHome}
              aria-label="Home"
            >
              Home
            </AppButton>
          </Tooltip>
          <Tooltip title="Contact Us">
            <AppButton
              type="text"
              className="app-header-action"
              icon={<AppIcon icon={Icons.headphones} size={16} />}
              onClick={() => navigate({ to: "/contact-us" })}
              aria-label="Contact Us"
            >
              Contact Us
            </AppButton>
          </Tooltip>
          <Tooltip title="Register">
            <AppButton
              type="text"
              className="app-header-action"
              icon={<AppIcon icon={Icons.userPlus} size={16} />}
              onClick={() => navigate({ to: "/register" })}
              aria-label="Register"
            >
              Register
            </AppButton>
          </Tooltip>
          <HeaderThemeToggle />
          <Tooltip title="Login">
            <AppButton
              type="primary"
              className="app-header-action app-header-action--primary"
              icon={<AppIcon icon={Icons.logIn} size={16} />}
              onClick={onLoginClick}
              aria-label="Login"
            >
              Login
            </AppButton>
          </Tooltip>
        </div>
      </Header>
    );
  }

  const handleMenuClick: MenuProps["onClick"] = (info) => {
    switch (info.key) {
      case "profile":
        setProfileDrawerOpen(true);
        break;
      case "appearance":
      case "preferences":
        setPreferencesOpen(true);
        break;
      case "change-password":
        setChangePasswordDrawerOpen(true);
        break;
      case "contact-us":
        setContactUsDrawerOpen(true);
        break;
      case "quote":
        navigate({ to: "/app/quotes" as any });
        break;
      case "my-alert":
        setMyAlertDrawerOpen(true);
        break;
      case "payment-history":
        navigate({ to: "/app/payments" as any });
        break;
      case "user-creation":
        navigate({ to: "/app/sub-users" as any });
        break;
      case "logout":
        handleLogoutConfirm();
        break;
      default:
        break;
    }
  };

  const userNameDisplay = user?.name || user?.email || "";
  const userRoleDisplay = user?.isSessionAdmin
    ? "Superuser (Customer Admin)"
    : user?.role === "ADMIN"
    ? "System Administrator"
    : "Customer Account";
  const initials = userNameDisplay
    ? userNameDisplay
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const subCustomerAccounts = user?.subCustomerAccounts || [
    { custCode: "CUST-001", compName: "Apex Logistics Global" },
    { custCode: "CUST-002", compName: "Atlantic Freight LLC" },
    { custCode: "CUST-003", compName: "Pacific Maritime Corp" },
  ];

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <AppIcon icon={Icons.user} size={16} />,
    },
    {
      key: "appearance",
      label: "Appearance & Theme Settings",
      icon: <AppIcon icon={Icons.palette} size={16} />,
    },
    {
      key: "change-password",
      label: "Change Password",
      icon: <AppIcon icon={Icons.key} size={16} />,
    },
    {
      key: "contact-us",
      label: "Contact Us",
      icon: <AppIcon icon={Icons.headphones} size={16} />,
    },
    {
      key: "quote",
      label: "Quote (Rate Request)",
      icon: <AppIcon icon={Icons.dollarSign} size={16} />,
    },
    {
      key: "my-alert",
      label: "My Alert",
      icon: <AppIcon icon={Icons.bell} size={16} />,
    },
    {
      key: "payment-history",
      label: "Payment History",
      icon: <AppIcon icon={Icons.landmark} size={16} />,
    },
    ...(user?.isSessionAdmin || user?.role === "ADMIN"
      ? [
          {
            key: "user-creation",
            label: "Sub-User Creation",
            icon: <AppIcon icon={Icons.userPlus} size={16} />,
          },
        ]
      : []),
    { type: "divider" },
    {
      key: "logout",
      label: "Log-Out",
      icon: <AppIcon icon={Icons.logOut} size={16} />,
      danger: true,
    },
  ];

  return (
    <Header className="app-layout-header">
      <div className="app-layout-header__left">
        {showMobileMenu ? (
          <Tooltip title="Open Navigation Menu">
            <AppButton
              type="text"
              icon={<AppIcon icon={Icons.menu} size={18} />}
              onClick={onMobileMenuOpen}
              aria-label="Open navigation menu"
            />
          </Tooltip>
        ) : null}
        <div className="app-header-brand-detail">
          <div className="app-layout-header__brand-row">
            <Text strong className="app-layout-header__tenant-name">
              {activeTenant.name}
            </Text>
            <Tag color="blue" className="app-header-tag">
              {activeTenant.customerCode}
            </Tag>
            {user?.isSessionAdmin ? (
              <Tag
                icon={<AppIcon icon={Icons.crown} size={16} />}
                color="gold"
                className="app-header-tag"
              >
                SUPERUSER ACTIVE
              </Tag>
            ) : null}
          </div>
          <Text type="secondary" className="app-layout-header__welcome">
            Welcome to E-COM PORTAL ({activeTenant.id})
          </Text>
        </div>
      </div>

      <div className="app-header-actions">
        {(user?.isSessionAdmin ||
          (user?.subCustomerAccounts && user.subCustomerAccounts.length > 0)) &&
        !compactHeader ? (
          <Space size={4} align="center">
            <AppIcon icon={Icons.users} size={16} />
            <Select
              value={
                user?.activeSubCustomer || subCustomerAccounts[0]?.custCode
              }
              onChange={(val) => {
                setActiveSubCustomer(val);
                const match = subCustomerAccounts.find(
                  (a) => a.custCode === val,
                );
                toast.success(
                  `Switched Customer Scope to ${match ? match.compName : val}`,
                );
              }}
              className="app-header-select"
              options={subCustomerAccounts.map((a) => ({
                value: a.custCode,
                label: `${a.custCode} - ${a.compName}`,
              }))}
            />
          </Space>
        ) : null}

        {user?.role === "ADMIN" && !compactHeader ? (
          <Space size={4} align="center">
            <AppIcon icon={Icons.layoutGrid} size={16} />
            <Select
              value={activeTenant.id}
              onChange={(val) => {
                setTenant(val);
                toast.info(
                  `Switched active tenant to ${PRECONFIGURED_TENANTS[val]?.name}`,
                );
              }}
              className="app-header-select"
              options={Object.values(PRECONFIGURED_TENANTS).map((t) => ({
                value: t.id,
                label: `${t.customerCode} - ${t.name}`,
              }))}
            />
          </Space>
        ) : null}

        <HeaderThemeToggle />

        <Tooltip
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <AppButton
            type="text"
            shape="circle"
            icon={
              isFullscreen ? (
                <AppIcon icon={Icons.minimize} size={16} />
              ) : (
                <AppIcon icon={Icons.expand} size={16} />
              )
            }
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          />
        </Tooltip>

        <Dropdown
          trigger={["click"]}
          menu={{ items: profileMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
        >
          <div className="app-header-user-trigger">
            <Avatar className="app-header-avatar" size="default">
              {initials}
            </Avatar>
            <div className="app-header-user-meta">
              <Text strong className="app-header-user-name">
                {userNameDisplay}
              </Text>
              <Text type="secondary" className="app-header-user-role">
                {userRoleDisplay}
              </Text>
            </div>
          </div>
        </Dropdown>
      </div>

      {/* Account Profile Drawer */}
      <ProfileView
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />

      {/* Change Password Drawer */}
      <ChangePasswordView
        open={changePasswordDrawerOpen}
        onClose={() => setChangePasswordDrawerOpen(false)}
      />

      {/* My Alert Preferences Drawer */}
      <MyAlertsView
        open={myAlertDrawerOpen}
        onClose={() => setMyAlertDrawerOpen(false)}
      />

      {/* Global Contact Us Drawer */}
      <ContactUsDrawer
        open={contactUsDrawerOpen}
        onClose={() => setContactUsDrawerOpen(false)}
      />

      {/* Theme & Appearance Customization Panel */}
      <AccountPreferencesDrawer
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        preferencesController={preferencesController}
      />
    </Header>
  );
}
