// Created by Sekar Nagarajan (2026-11-12 12:40)
/**
 * Control Panel page: one module header, a tab strip of the allowed sections, and the active
 * section (lazy) in the body. Section state lives in `?section=` (see admin-route.tsx).
 */
import { Card } from "antd";
import { Suspense } from "react";

import { NavIcons } from "../../../components/icons";
import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { useAdminLabels } from "../hooks/use-admin-labels";
import { useAdminSection } from "../hooks/use-admin-section";
import { AdminModuleStyles } from "./admin-module-styles";
import { ADMIN_SECTIONS } from "./admin-section-registry";
import { AdminSectionTabs } from "./AdminSectionTabs";
import { AdminLoadingCenter } from "./shared/admin-loading-center";

export function AdminShell() {
  const { section, allowedSections, setSection } = useAdminSection();
  const labels = useAdminLabels();
  const SectionComponent = ADMIN_SECTIONS[section].Component;

  return (
    <FeaturePageShell>
      <AdminModuleStyles />
      <Card className="feature-page-card admin-page-card" variant="borderless">
        <div className="admin-page-layout">
          <div className="admin-page-header">
            <ModuleScreenHeader
              icon={NavIcons.admin}
              title={labels.moduleTitle}
              subtitle={labels.moduleSubtitle}
              marginBottom={0}
            />
          </div>
          <AdminSectionTabs
            allowedSections={allowedSections}
            activeKey={section}
            onChange={setSection}
          />
          {/* key resets per-section local state when the tab changes */}
          <div className="admin-page-body" key={section}>
            <Suspense fallback={<AdminLoadingCenter />}>
              <SectionComponent />
            </Suspense>
          </div>
        </div>
      </Card>
    </FeaturePageShell>
  );
}
