// Created by Sekar Nagarajan (2026-11-12 23:50)
import { Card } from "antd";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { VendorApprovalsView } from "./components/VendorApprovalsView";
import { VendorApprovalsModuleStyles } from "./components/vendor-approvals-module-styles";

/** Lazy-loaded page body for `/app/vendor-approvals` (route guard lives in vendor-approvals-route.tsx). */
export function VendorApprovalsPage() {
  return (
    <FeaturePageShell>
      <VendorApprovalsModuleStyles />
      <Card className="feature-page-card va-page-card" bordered={false}>
        <VendorApprovalsView />
      </Card>
    </FeaturePageShell>
  );
}
