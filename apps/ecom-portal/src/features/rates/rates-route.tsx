// Modified by Antigravity (2026-08-21 23:54)
// Rates Feature Main Route View Component
// Parity with SchedulesRoute main layout standard (<Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>)
// Parity with agenct.md and UserCreationView layout design standards

import {
  AppstoreOutlined,
  DollarOutlined,
  DownloadOutlined,
  MailOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { useToast } from '@solverminds/shared-ui/hooks';
import { Badge, Card, Segmented, Space, theme, Typography } from 'antd';
import React from 'react';
import { ContractSurchargeModal } from './components/ContractSurchargeModal';
import { RateCardList } from './components/RateCardList';
import { RateDataView } from './components/RateDataView';
import { RateSearchFilter } from './components/RateSearchFilter';
import { useRatesController } from './hooks/useRatesController';

const { Title, Text } = Typography;

export const RatesRoute: React.FC = () => {
  const { token } = theme.useToken();
  const toast = useToast();
  const {
    viewMode,
    setViewMode,
    searchMode,
    setSearchMode,
    cardRates,
    isLoading,
    handleSearch,
    handleBookNow,
    handleViewSurcharges,
    handleShareRate,
    selectedContract,
    isSurchargeModalOpen,
    handleCloseSurchargeModal,
  } = useRatesController();

  const handleExportExcel = () => {
    toast.success('Exporting rate search results to Excel...');
  };

  const handleSendEmail = () => {
    toast.info('Opening freight rate quote email share dialog...');
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      {/* 1. Feature Page Header (Matching SchedulesRoute & UserCreationView) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space align="center" size={10}>
            <DollarOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Freight Rates, Line Tariffs & Contracts
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 13 }}>
            Search published line tariffs, view itemized surcharge breakdowns, manage Service Contracts, and request spot rate quotes.
          </Text>
        </div>

        <Space align="center" size={12}>
          <AppButton icon={<DownloadOutlined />} onClick={handleExportExcel}>
            Export Excel
          </AppButton>
          <AppButton icon={<MailOutlined />} onClick={handleSendEmail}>
            Share via Mail
          </AppButton>
        </Space>
      </div>

      {/* 2. Search Filter Section */}
      <RateSearchFilter onSearch={handleSearch} isLoading={isLoading} />

      {/* 3. Available Rate Options Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
          marginBottom: 16,
          padding: '10px 16px',
          borderRadius: 12,
          background: token.colorFillAlter,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Space align="center" size={10}>
          <DollarOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
          <Text strong style={{ fontSize: 15 }}>
            Published Freight Rates & Contracts
          </Text>
          <Badge count={cardRates.length} style={{ backgroundColor: token.colorError }} />
        </Space>

        <Segmented
          value={viewMode}
          onChange={(val) => setViewMode(val as 'CARD' | 'DATAVIEW')}
          options={[
            { label: 'Card List View', value: 'CARD', icon: <AppstoreOutlined /> },
            { label: 'AG-Grid DataView', value: 'DATAVIEW', icon: <UnorderedListOutlined /> },
          ]}
        />
      </div>

      {/* 4. Results Card List / AG-Grid DataView */}
      {viewMode === 'CARD' ? (
        <RateCardList
          rates={cardRates}
          isLoading={isLoading}
          onBookNow={handleBookNow}
          onViewSurcharges={handleViewSurcharges}
          onShareRate={handleShareRate}
        />
      ) : (
        <RateDataView activeMode={searchMode} onModeChange={setSearchMode} />
      )}

      {/* 5. Drawers / Modals */}
      <ContractSurchargeModal
        contract={selectedContract}
        open={isSurchargeModalOpen}
        onClose={handleCloseSurchargeModal}
      />
    </Card>
  );
};
