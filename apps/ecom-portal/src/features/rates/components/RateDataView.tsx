// Modified by Antigravity (2026-08-21 23:52)
// Rate DataView Component — AG-Grid Enterprise tables for all Rate sub-modules
// Actions column positioned FIRST on the far left per agenct.md

import { AppTabs } from '@solverminds/shared-ui';
import { Card } from 'antd';
import { TariffView } from './TariffView';
import { SurchargeView } from './SurchargeView';
import { ContractView } from './ContractView';
import { QuotesView } from './QuotesView';
import { RateSearchMode } from './RateSearchFilter';

interface RateDataViewProps {
  activeMode: RateSearchMode;
  onModeChange: (mode: RateSearchMode) => void;
}

export function RateDataView({ activeMode, onModeChange }: RateDataViewProps) {
  const tabKeyMap: Record<RateSearchMode, string> = {
    PUBLISHED_TARIFF: 'tariff',
    SURCHARGES: 'surcharge',
    SERVICE_CONTRACTS: 'contract',
    SPOT_QUOTES: 'quotes',
  };

  const reverseTabKeyMap: Record<string, RateSearchMode> = {
    tariff: 'PUBLISHED_TARIFF',
    surcharge: 'SURCHARGES',
    contract: 'SERVICE_CONTRACTS',
    quotes: 'SPOT_QUOTES',
  };

  const items = [
    {
      key: 'tariff',
      label: 'Published Line Tariffs',
      children: <TariffView />,
    },
    {
      key: 'surcharge',
      label: 'Surcharges & Accessorials',
      children: <SurchargeView />,
    },
    {
      key: 'contract',
      label: 'Service Contracts',
      children: <ContractView />,
    },
    {
      key: 'quotes',
      label: 'Spot Rate Quotes',
      children: <QuotesView />,
    },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <AppTabs
        activeKey={tabKeyMap[activeMode] || 'tariff'}
        onChange={(key) => onModeChange(reverseTabKeyMap[key] || 'PUBLISHED_TARIFF')}
        items={items}
      />
    </Card>
  );
}
