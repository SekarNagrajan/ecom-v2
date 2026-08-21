// Modified by sekar nagarajan (2026-08-21 23:42)

import { AppTabs } from '@solverminds/shared-ui';
import { Card, Space, theme, Typography } from 'antd';
import { useState } from 'react';
import { ContractView } from './components/ContractView';
import { QuotesView } from './components/QuotesView';
import { SurchargeView } from './components/SurchargeView';
import { TariffView } from './components/TariffView';

const { Title, Text } = Typography;

export function RatesRoute() {
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState('tariff');

  const tabItems = [
    {
      key: 'tariff',
      label: 'Published Tariff',
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
      label: 'Spot Quotes',
      children: <QuotesView />,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #d9d9d9;
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #bfbfbf;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Page Header Card */}
        <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
          <Space direction="vertical" size={4}>
            <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>
              Rate Engine & Freight Inquiries
            </Title>
            <Text type="secondary">
              Search line tariffs, view surcharge breakdowns, manage Service Contracts, and submit spot quotation requests.
            </Text>
          </Space>
        </Card>

        {/* Tabbed Navigation */}
        <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
          <AppTabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>
      </Space>
    </div>
  );
}
