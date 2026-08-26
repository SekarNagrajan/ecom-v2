// Modified by Sekar Nagarajan (2026-08-26 14:26)
import { Card } from "antd";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { DeliveryOrderListing } from "./components/DeliveryOrderListing";
import { DoModuleStyles } from "./components/do-module-styles";

export function DeliveryOrderRoute() {
  return (
    <FeaturePageShell>
      <DoModuleStyles />
      <Card className="feature-page-card do-page-card" bordered={false}>
        <DeliveryOrderListing />
      </Card>
    </FeaturePageShell>
  );
}
