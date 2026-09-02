// Modified by Sekar Nagarajan (2026-09-02 10:53)
import { useAuthStore, usePermission, useTenantStore } from "@solverminds/auth";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import { Drawer, Layout, Menu, Tooltip } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import {
  adminSectionToMenuKey,
  isAdminSectionKey,
  menuKeyToAdminSection,
  resolveAllowedAdminSections,
  resolveDefaultAdminSection,
} from "../../features/admin/utils/admin-menu-access";
import { buildAdminSectionNavItems } from "../../features/admin/utils/admin-section-nav";
import { useMenuCategories } from "../../features/auth/api/menu-access.queries";
import {
  appPathnameToMenuKey,
  isPublicMenuKey,
  menuKeyToAppPath,
  menuKeyToOpenGroupKeys,
} from "../../features/auth/utils/public-menu-access";
import { AppIcon, Icons, NavIcons } from "../icons";

const { Sider } = Layout;

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 80;
const SOLVERMINDS_LOGO_URL = "/logo.png";
const SOLVERMINDS_MARK_URL = "/solverminds-mark.png";

function SidebarBrandBlock({
  collapsed,
  isMobile,
}: {
  collapsed: boolean;
  isMobile: boolean;
}) {
  const showFullLogo = !collapsed || isMobile;

  return (
    <div className="app-sidebar-brand">
      <img
        src={showFullLogo ? SOLVERMINDS_LOGO_URL : SOLVERMINDS_MARK_URL}
        alt="Solverminds"
        className={
          showFullLogo
            ? "app-sidebar-brand__logo app-sidebar-brand__logo--solverminds"
            : "app-sidebar-brand__logo app-sidebar-brand__logo--mark"
        }
      />
    </div>
  );
}

function navIcon(Icon: LucideIcon, size = 18, locked = false) {
  return (
    <AppIcon icon={Icon} size={size} variant={locked ? "navLocked" : "nav"} />
  );
}

/** Label + tooltip title for expanded vs icon-rail collapsed menu. */
function sidebarMenuLabel(text: string, locked: boolean) {
  return {
    title: locked ? "Sign In Required" : text,
    label: locked ? <Tooltip title="Sign In Required">{text}</Tooltip> : text,
  };
}

interface SidebarDesktopShellProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  brandBlock: ReactNode;
  menuBlock: ReactNode;
}

function SidebarDesktopShell({
  collapsed,
  onCollapse,
  brandBlock,
  menuBlock,
}: SidebarDesktopShellProps) {
  const collapseLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={SIDEBAR_WIDTH}
      collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
      theme="light"
      className="custom-scroll app-sidebar-sider"
    >
      <div className="app-sidebar-shell">
        {brandBlock}
        <div className="app-sidebar-shell__menu custom-scroll">{menuBlock}</div>
        <div className="app-sidebar-shell__footer">
          <Tooltip title={collapseLabel} placement="right">
            <button
              type="button"
              className="app-sidebar-collapse-trigger"
              onClick={() => onCollapse(!collapsed)}
              aria-label={collapseLabel}
              aria-expanded={!collapsed}
            >
              <AppIcon
                icon={collapsed ? Icons.panelLeftOpen : Icons.panelLeftClose}
                size={18}
              />
              {!collapsed ? (
                <span className="app-sidebar-collapse-trigger__label">
                  Collapse
                </span>
              ) : null}
            </button>
          </Tooltip>
        </div>
      </div>
    </Sider>
  );
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
  const { can, isAdmin, isVendor, isSuperuser } = usePermission();
  const user = useAuthStore((state) => state.user);
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const { data: menuCategories } = useMenuCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = appPathnameToMenuKey(location.pathname);
  const requiredOpenKeys = menuKeyToOpenGroupKeys(selectedKey);
  const [userOpenKeys, setUserOpenKeys] = useState<string[]>([]);
  const openKeys = Array.from(new Set([...requiredOpenKeys, ...userOpenKeys]));

  const isSuperUser = isSuperuser();
  const isAdminUser = isAdmin();
  const isVendorUser = isVendor();
  // Cpanel system admin (legacy SESSION_LOGIN_TYPE=V + usertype A) —
  // modules listed in vendorMenuList as the primary sidebar.
  const isCpanelAdmin = user?.adminUserType === "A" && user?.loginType === "V";
  const tenantModules = [
    ...(activeTenant.features.allowedModules || []),
    "admin",
    "user-creation",
    "vendor-approvals",
    "tracking",
  ];

  const lock = (key: string) =>
    isGuest && !isPublicMenuKey(key, menuCategories);

  // Cpanel: Module Mapping / Email Config / Cutoff as sidebar modules
  if (isCpanelAdmin && !isGuest) {
    const allowedSections = resolveAllowedAdminSections(user?.vendorMenuList);
    const sectionNavItems = buildAdminSectionNavItems(allowedSections);
    const searchSection = (location.search as { section?: string } | undefined)
      ?.section;
    const activeSection = isAdminSectionKey(searchSection)
      ? searchSection
      : resolveDefaultAdminSection(allowedSections);
    const selectedAdminKey = adminSectionToMenuKey(activeSection);

    const cpanelMenuItems: MenuProps["items"] = sectionNavItems.map((item) => ({
      key: adminSectionToMenuKey(item.key),
      icon: navIcon(item.icon, 20),
      title: item.label,
      label: item.label,
    }));

    const onCpanelMenuSelect: MenuProps["onSelect"] = ({ key }) => {
      onMobileClose?.();
      const section = menuKeyToAdminSection(key);
      if (section) {
        navigate({
          to: "/app/admin",
          search: { section },
        } as never);
      }
    };

    const brandBlock = (
      <SidebarBrandBlock collapsed={collapsed} isMobile={isMobile} />
    );

    const isIconRail = collapsed && !isMobile;
    const menuBlock = (
      <Menu
        theme="light"
        mode="inline"
        inlineCollapsed={isIconRail}
        selectedKeys={[selectedAdminKey]}
        {...(isIconRail
          ? {}
          : {
              openKeys,
              onOpenChange: (keys: string[]) => {
                setUserOpenKeys(keys);
              },
            })}
        items={cpanelMenuItems}
        onSelect={onCpanelMenuSelect}
        className="app-sidebar-menu"
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
      <SidebarDesktopShell
        collapsed={collapsed}
        onCollapse={onCollapse}
        brandBlock={brandBlock}
        menuBlock={menuBlock}
      />
    );
  }

  const rawMenuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: navIcon(NavIcons.dashboard, 20, lock("dashboard")),
      ...sidebarMenuLabel("Dashboard", lock("dashboard")),
      className: lock("dashboard") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "schedules-group",
      icon: navIcon(NavIcons.schedules),
      title: "Schedules",
      label: "Schedules",
      children: [
        {
          key: "schedules",
          icon: navIcon(NavIcons.schedules, 20),
          ...sidebarMenuLabel("Schedules", false),
          disabled: !isGuest && !can("SCH"),
        },
        {
          key: "tracking",
          icon: navIcon(NavIcons.tracking, 20),
          ...sidebarMenuLabel("Tracking", false),
          disabled: !isGuest && !can("TRK"),
        },
      ].filter(
        (child) => isGuest || isSuperUser || tenantModules.includes(child.key),
      ),
    },
    {
      key: "rates-group",
      icon: navIcon(NavIcons.rates),
      title: "Rates",
      label: "Rates",
      children: [
        {
          key: "rates",
          icon: navIcon(NavIcons.rates, 20),
          ...sidebarMenuLabel("Rates", false),
          disabled: !isGuest && !can("SCH"),
        },
        {
          key: "tariff",
          icon: navIcon(NavIcons.tariff, 20),
          ...sidebarMenuLabel("Tariff", false),
          disabled: !isGuest && !can("SCH"),
        },
      ].filter(
        (child) => isGuest || isSuperUser || tenantModules.includes(child.key),
      ),
    },
    {
      key: "booking",
      icon: navIcon(NavIcons.booking, 20, lock("booking")),
      ...sidebarMenuLabel("Booking", lock("booking")),
      disabled: !isGuest && !can("BKG"),
      className: lock("booking") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "si",
      icon: navIcon(NavIcons.shippingInstruction, 20, lock("si")),
      ...sidebarMenuLabel("Shipping Instruction", lock("si")),
      disabled: !isGuest && !can("SI"),
      className: lock("si") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "vgm",
      icon: navIcon(NavIcons.vgm, 20, lock("vgm")),
      ...sidebarMenuLabel("VGM", lock("vgm")),
      disabled: !isGuest && !can("VGM"),
      className: lock("vgm") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "bl",
      icon: navIcon(NavIcons.billOfLading, 20, lock("bl")),
      ...sidebarMenuLabel("Bill of Lading", lock("bl")),
      disabled: !isGuest && !can("BL"),
      className: lock("bl") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "do",
      icon: navIcon(NavIcons.deliveryOrder, 20, lock("do")),
      ...sidebarMenuLabel("Delivery Order", lock("do")),
      className: lock("do") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "arrival-notice",
      icon: navIcon(NavIcons.arrivalNotice, 20, lock("arrival-notice")),
      ...sidebarMenuLabel("Arrival Notice", lock("arrival-notice")),
      className: lock("arrival-notice") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "cro",
      icon: navIcon(NavIcons.containerRelease, 20, lock("cro")),
      ...sidebarMenuLabel("Container Release Order", lock("cro")),
      disabled: !isGuest && !can("CRO"),
      className: lock("cro") ? "ant-menu-item-locked" : undefined,
    },
    {
      key: "customer-stmt",
      icon: navIcon(NavIcons.customerStatement, 20, lock("customer-stmt")),
      ...sidebarMenuLabel("Customer Statement", lock("customer-stmt")),
      disabled: !isGuest && !can("STMT"),
      className: lock("customer-stmt") ? "ant-menu-item-locked" : undefined,
    },

    {
      key: "more-group",
      icon: navIcon(NavIcons.more, 20),
      title: "More",
      label: "More",
      children: [
        isAdminUser
          ? {
              key: "admin-group",
              icon: navIcon(NavIcons.admin, 20, lock("admin")),
              title: "Control Panel Admin",
              ...sidebarMenuLabel("Control Panel Admin", lock("admin")),
              className: lock("admin") ? "ant-menu-item-locked" : undefined,
              children: buildAdminSectionNavItems(
                resolveAllowedAdminSections(user?.vendorMenuList),
              ).map((item) => ({
                key: adminSectionToMenuKey(item.key),
                icon: navIcon(item.icon, 18, lock("admin")),
                title: item.label,
                ...sidebarMenuLabel(item.label, lock("admin")),
                className: lock("admin") ? "ant-menu-item-locked" : undefined,
              })),
            }
          : null,
        {
          key: "payments",
          icon: navIcon(NavIcons.payments, 20, lock("payments")),
          ...sidebarMenuLabel("Payment History", lock("payments")),
          disabled: !isGuest && !can("PAY"),
          className: lock("payments") ? "ant-menu-item-locked" : undefined,
        },
        {
          key: "carbon",
          icon: navIcon(NavIcons.carbon, 20, lock("carbon")),
          ...sidebarMenuLabel("Carbon Calculator", lock("carbon")),
          disabled: !isGuest && !can("CO2"),
          className: lock("carbon") ? "ant-menu-item-locked" : undefined,
        },
        isSuperUser
          ? {
              key: "user-creation",
              icon: navIcon(NavIcons.userCreation, 20, lock("user-creation")),
              ...sidebarMenuLabel("User Creation (USC)", lock("user-creation")),
              className: lock("user-creation")
                ? "ant-menu-item-locked"
                : undefined,
            }
          : null,
        isVendorUser
          ? {
              key: "vendor-approvals",
              icon: navIcon(
                NavIcons.vendorApprovals,
                20,
                lock("vendor-approvals"),
              ),
              ...sidebarMenuLabel("Agency Approvals", lock("vendor-approvals")),
              className: lock("vendor-approvals")
                ? "ant-menu-item-locked"
                : undefined,
            }
          : null,
      ]
        .filter(Boolean)
        .filter(
          (child) =>
            isGuest || isSuperUser || tenantModules.includes(child!.key),
        ) as NonNullable<MenuProps["items"]>,
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

  // Highlight active admin section under More when on /app/admin
  const searchSection = (location.search as { section?: string } | undefined)
    ?.section;
  const adminSelectedKey =
    selectedKey === "admin" && isAdminSectionKey(searchSection)
      ? adminSectionToMenuKey(searchSection)
      : selectedKey === "admin"
      ? adminSectionToMenuKey(
          resolveDefaultAdminSection(
            resolveAllowedAdminSections(user?.vendorMenuList),
          ),
        )
      : selectedKey;

  const onMenuSelect: MenuProps["onSelect"] = ({ key }) => {
    onMobileClose?.();

    if (isGuest && !isPublicMenuKey(key, menuCategories)) {
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
      const adminSection = menuKeyToAdminSection(key);
      if (adminSection) {
        navigate({
          to: "/app/admin",
          search: { section: adminSection },
        } as never);
        return;
      }
      if (key === "admin") {
        navigate({
          to: "/app/admin",
          search: {
            section: resolveDefaultAdminSection(
              resolveAllowedAdminSections(user?.vendorMenuList),
            ),
          },
        } as never);
        return;
      }
      navigate({ to: `/app/${key}` });
    }
  };

  const brandBlock = (
    <SidebarBrandBlock collapsed={collapsed} isMobile={isMobile} />
  );

  /** Icon-rail (collapsed): leave openKeys uncontrolled so AntD popup submenus work.
   *  Expanded: keep parent groups open for the active module. */
  const isIconRail = collapsed && !isMobile;
  const menuBlock = (
    <Menu
      theme="light"
      mode="inline"
      inlineCollapsed={isIconRail}
      selectedKeys={[adminSelectedKey]}
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
    <SidebarDesktopShell
      collapsed={collapsed}
      onCollapse={onCollapse}
      brandBlock={brandBlock}
      menuBlock={menuBlock}
    />
  );
}
