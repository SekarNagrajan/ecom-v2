// Created by Sekar Nagarajan (2026-11-12 12:40)
/**
 * Tab strip listing every Control Panel section the user may open. The active tab mirrors
 * `?section=`; antd scrolls the strip when it overflows and labels collapse to icons on mobile.
 */
import { AppTabs } from "@solverminds/shared-ui";
import { Tooltip } from "antd";

import { AppIcon } from "../../../components/icons";
import { useResponsiveLayout } from "../../../hooks/use-responsive-layout";
import { useAdminLabels } from "../hooks/use-admin-labels";
import type { AdminSectionKey } from "../utils/admin-menu-access";
import { buildAdminSectionNavItems } from "../utils/admin-section-nav";

interface AdminSectionTabsProps {
  allowedSections: AdminSectionKey[];
  activeKey: AdminSectionKey;
  onChange: (section: AdminSectionKey) => void;
}

export function AdminSectionTabs({
  allowedSections,
  activeKey,
  onChange,
}: AdminSectionTabsProps) {
  const labels = useAdminLabels();
  const { isMobileTier } = useResponsiveLayout();

  const items = buildAdminSectionNavItems(allowedSections, labels.translate).map(
    (item) => ({
      key: item.key,
      label: (
        <Tooltip title={isMobileTier ? item.label : undefined}>
          <span className="admin-tab-label" aria-label={item.label}>
            <AppIcon icon={item.icon} size={16} className="admin-tab-label__icon" />
            <span className="admin-tab-label__text">{item.label}</span>
          </span>
        </Tooltip>
      ),
    }),
  );

  return (
    <nav className="admin-page-tabs" aria-label={labels.tabsLabel}>
      <AppTabs
        items={items}
        activeKey={activeKey}
        onChange={(key) => onChange(key as AdminSectionKey)}
        size="large"
        tabBarGutter={4}
        className="admin-page-tabs__tabs"
      />
    </nav>
  );
}
