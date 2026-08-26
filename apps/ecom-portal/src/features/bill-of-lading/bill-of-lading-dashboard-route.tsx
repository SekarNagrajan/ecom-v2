// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { Card } from 'antd';

import { FeaturePageShell } from '../../components/shared/feature-page-shell';
import { BillOfLadingListing } from './components/BillOfLadingListing';
import { BlModuleStyles } from './components/bl-module-styles';

export function BillOfLadingDashboardRoute() {
  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="feature-page-card bl-page-card" bordered={false}>
        <BillOfLadingListing />
      </Card>
    </FeaturePageShell>
  );
}
