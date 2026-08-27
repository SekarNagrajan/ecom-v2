// Modified by Sekar Nagarajan (2026-08-27 11:50)
import { useAuthStore } from "@solverminds/auth";
import { createRoute, redirect } from "@tanstack/react-router";
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
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({ to: "/", search: { login: true } as never });
    }
    if (user.role !== "VENDOR" && user.role !== "ADMIN") {
      throw redirect({ to: "/app/dashboard" });
    }
  },
  component: VendorApprovalsPage,
});
