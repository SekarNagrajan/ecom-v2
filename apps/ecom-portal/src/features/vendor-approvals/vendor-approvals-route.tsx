// Modified by Sekar Nagarajan (2026-08-26 16:25)
import { createRoute } from "@tanstack/react-router";
import { Card } from "antd";

import { appRoute } from "../../app/router";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { VendorApprovalsView } from "./components/VendorApprovalsView";
import { VendorApprovalsModuleStyles } from "./components/vendor-approvals-module-styles";

function VendorApprovalsPage() {
  return (
    <FeaturePageShell>
      <VendorApprovalsModuleStyles />
      <Card className="feature-page-card va-page-card" bordered={false}>
        <VendorApprovalsView />
      </Card>
    </FeaturePageShell>
  );
}

export const vendorApprovalsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "vendor-approvals",
  component: VendorApprovalsPage,
});
