// Modified by Sekar Nagarajan (2026-08-26 14:57)
import { Card } from "antd";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { CROListing } from "./components/CROListing";
import { CroModuleStyles } from "./components/cro-module-styles";

export function ContainerReleaseOrderRoute() {
  return (
    <FeaturePageShell>
      <CroModuleStyles />
      <Card className="feature-page-card cro-page-card" bordered={false}>
        <CROListing />
      </Card>
    </FeaturePageShell>
  );
}
