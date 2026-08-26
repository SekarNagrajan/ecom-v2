// Modified by Sekar Nagarajan (2026-08-26 17:15)
import { useAuthStore, usePermission, useTenantStore } from "@solverminds/auth";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import { Drawer, Layout, Menu, Tooltip } from "antd";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import {
  appPathnameToMenuKey,
  isPublicMenuKey,
  menuKeyToAppPath,
  menuKeyToOpenGroupKeys,
} from "../../features/auth/utils/public-menu-access";
import { AppIcon, NavIcons } from "../icons";

const { Sider } = Layout;

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

interface AuthenticatedSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  /** Guest browsing public search modules — lock privileged items. */
  isGuest?: boolean;
  onLoginRequired?: (intendedPath?: string | null) => void;
}

export function AuthenticatedSidebar({
  collapsed,
  onCollapse,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
  isGuest = false,
  onLoginRequired,
}: AuthenticatedSidebarProps) {
  const { can } = usePermission();
  const user = useAuthStore((state) => state.user);
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = appPathnameToMenuKey(location.pathname);
  const requiredOpenKeys = menuKeyToOpenGroupKeys(selectedKey);
  const [userOpenKeys, setUserOpenKeys] = useState<string[]>([]);
  const openKeys = Array.from(new Set([...requiredOpenKeys, ...userOpenKeys]));

  const isSuperUser = Boolean(user?.isSessionAdmin || user?.role === "ADMIN");
  const tenantModules = [
    ...(activeTenant.features.allowedModules || []),
    "admin",
    "user-creation",
    "vendor-approvals",
    "tracking",
  ];

  const lock = (key: string) => isGuest && !isPublicMenuKey(key);

  const rawMenuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: navIcon(NavIcons.dashboard, 18, lock("dashboard")),
      label: menuLabel("Dashboard", lock("dashboard")),
      className: lock("dashboard") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "schedules-group",
      icon: navIcon(NavIcons.schedules),
      label: "Schedules",
      children: [
        {
          key: "schedules",
          icon: navIcon(NavIcons.schedules, 16),
          label: menuLabel("Schedules", false),
          disabled: !isGuest && !can("SCH"),
        },
        {
          key: "tracking",
          icon: navIcon(NavIcons.tracking, 16),
          label: menuLabel("Tracking", false),
          disabled: !isGuest && !can("TRK"),
        },
      ].filter((child) => isGuest || isSuperUser || tenantModules.includes(child.key)),
    },
    {
      key: "rates-group",
      icon: navIcon(NavIcons.rates),
      label: "Rates",
      children: [
        {
          key: "rates",
          icon: navIcon(NavIcons.rates, 16),
          label: menuLabel("Rates", false),
          disabled: !isGuest && !can("SCH"),
        },
        {
          key: "tariff",
          icon: navIcon(NavIcons.tariff, 16),
          label: menuLabel("Tariff", false),
          disabled: !isGuest && !can("SCH"),
        },
      ].filter((child) => isGuest || isSuperUser || tenantModules.includes(child.key)),
    },
    {
      key: "booking",
      icon: navIcon(NavIcons.booking, 18, lock("booking")),
      label: menuLabel("Booking", lock("booking")),
      disabled: !isGuest && !can("BKG"),
      className: lock("booking") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "si",
      icon: navIcon(NavIcons.shippingInstruction, 18, lock("si")),
      label: menuLabel("Shipping Instruction", lock("si")),
      disabled: !isGuest && !can("SI"),
      className: lock("si") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "vgm",
      icon: navIcon(NavIcons.vgm, 18, lock("vgm")),
      label: menuLabel("VGM", lock("vgm")),
      disabled: !isGuest && !can("BL"),
      className: lock("vgm") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "bl",
      icon: navIcon(NavIcons.billOfLading, 18, lock("bl")),
      label: menuLabel("Bill of Lading", lock("bl")),
      disabled: !isGuest && !can("BL"),
      className: lock("bl") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "do",
      icon: navIcon(NavIcons.deliveryOrder, 18, lock("do")),
      label: menuLabel("Delivery Order", lock("do")),
      className: lock("do") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "arrival-notice",
      icon: navIcon(NavIcons.arrivalNotice, 18, lock("arrival-notice")),
      label: menuLabel("Arrival Notice", lock("arrival-notice")),
      className: lock("arrival-notice") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "cro",
      icon: navIcon(NavIcons.containerRelease, 18, lock("cro")),
      label: menuLabel("Container Release Order", lock("cro")),
      disabled: !isGuest && !can("CRO"),
      className: lock("cro") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "user-creation",
      icon: navIcon(NavIcons.userCreation, 18, lock("user-creation")),
      label: menuLabel("User Creation (USC)", lock("user-creation")),
      className: lock("user-creation") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "vendor-approvals",
      icon: navIcon(NavIcons.vendorApprovals, 18, lock("vendor-approvals")),
      label: menuLabel("Agency Approvals", lock("vendor-approvals")),
      className: lock("vendor-approvals") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "more-group",
      icon: navIcon(NavIcons.more, 20),
      label: "More",
      children: [
        {
          key: "admin",
          icon: navIcon(NavIcons.admin, 16, lock("admin")),
          label: menuLabel("Control Panel Admin", lock("admin")),
          className: lock("admin") ? "ant-menu-item-locked" : undefined,
        },
        {
          key: "payments",
          icon: navIcon(NavIcons.payments, 16, lock("payments")),
          label: menuLabel("Payment History", lock("payments")),
          disabled: !isGuest && !can("PAY"),
          className: lock("payments") ? "ant-menu-item-locked" : undefined,
        },
        {
          key: "customer-stmt",
          icon: navIcon(NavIcons.customerStatement, 16, lock("customer-stmt")),
          label: menuLabel("Customer Statement", lock("customer-stmt")),
          disabled: !isGuest && !can("STMT"),
          className: lock("customer-stmt") ? "ant-menu-item-locked" : undefined,
        },
        {
          key: "carbon",
          icon: navIcon(NavIcons.carbon, 16, lock("carbon")),
          label: menuLabel("Carbon Calculator", lock("carbon")),
          disabled: !isGuest && !can("CO2"),
          className: lock("carbon") ? "ant-menu-item-locked" : undefined,
        },
      ].filter((child) => isGuest || isSuperUser || tenantModules.includes(child.key)),
    },
  ];

  const menuItems = rawMenuItems.filter((item) => {
    if (!item) return false;
    if (isGuest || isSuperUser) return true;
    const key = item.key as string;
    if (key.endsWith("-group")) {
      const groupItem = item as { children?: unknown[] };
      return Array.isArray(groupItem.children) && groupItem.children.length > 0;
    }
    return tenantModules.includes(key);
  });

  const onMenuSelect: MenuProps["onSelect"] = ({ key }) => {
    onMobileClose?.();

    if (isGuest && !isPublicMenuKey(key)) {
      onLoginRequired?.(menuKeyToAppPath(key));
      return;
    }

    if (key === "rates" || key === "tariff") {
      navigate({ to: "/app/rates" });
    } else if (key === "si") {
      navigate({ to: "/app/shipping-instruction" });
    } else if (key === "do") {
      navigate({ to: "/app/delivery-order" });
    } else {
      navigate({ to: `/app/${key}` });
    }
  };

  const brandBlock = (
    <div className="app-sidebar-brand">
      <img
        src={activeTenant.logoUrl || "/logo.png"}
        alt={activeTenant.name}
        className="app-sidebar-brand__logo"
      />
    </div>
  );

  /** Icon-rail (collapsed): leave openKeys uncontrolled so AntD popup submenus work.
   *  Expanded: keep parent groups open for the active module. */
  const isIconRail = collapsed && !isMobile;
  const menuBlock = (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[selectedKey]}
      {...(isIconRail
        ? {}
        : {
            openKeys,
            onOpenChange: (keys: string[]) => {
              setUserOpenKeys(keys);
            },
          })}
      items={menuItems}
      onSelect={onMenuSelect}
      className="app-sidebar-menu"
      // Collapsed "More" flyout renders in a portal — keep icon contrast there too
      classNames={{ popup: { root: "app-sidebar-menu-popup" } }}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        title={activeTenant.name}
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        size={280}
        classNames={{ body: "app-sidebar-drawer-body custom-scroll" }}
      >
        {brandBlock}
        {menuBlock}
      </Drawer>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={250}
      collapsedWidth={80}
      theme="light"
      className="custom-scroll app-sidebar-sider"
    >
      {brandBlock}
      {menuBlock}
    </Sider>
  );
}
