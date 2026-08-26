// Modified by Sekar Nagarajan (2026-08-26 14:50)
import { Card } from "antd";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ArrivalNoticeListing } from "./components/ArrivalNoticeListing";
import { ArrivalNoticeModuleStyles } from "./components/arrival-notice-module-styles";

export function ArrivalNoticeRoute() {
  return (
    <FeaturePageShell>
      <ArrivalNoticeModuleStyles />
      <Card className="feature-page-card arn-page-card" bordered={false}>
        <ArrivalNoticeListing />
      </Card>
    </FeaturePageShell>
  );
}
