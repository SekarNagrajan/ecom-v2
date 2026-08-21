// Tracking Feature Main Route View Component
// Parity with UserCreationView layout standard (<Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>)
// Parity with Tracking.jsp, TrackingDetails.jsp, and TrackingAllMovement.jsp
// Modified by Antigravity (2026-08-21)

import {
  DownloadOutlined,
  EnvironmentOutlined,
  MailOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, message, Space, theme, Typography } from 'antd';
import React from 'react';
import { TrackingContainersTable } from './components/TrackingContainersTable';
import { TrackingMovementDrawer } from './components/TrackingMovementDrawer';
import { TrackingOverview } from './components/TrackingOverview';
import { TrackingSearchFilter } from './components/TrackingSearchFilter';
import { useTrackingController } from './hooks/useTrackingController';

const { Title, Text } = Typography;

export const TrackingRoute: React.FC = () => {
  const { token } = theme.useToken();
  const {
    isLoading,
    trackingResult,
    executeSearch,
    selectedContainer,
    isMovementDrawerOpen,
    handleOpenMovements,
    handleCloseMovements,
  } = useTrackingController();

  const handleExportExcel = () => {
    message.success('Exporting container tracking trace history to Excel...');
  };

  const handleSendEmail = () => {
    message.info('Opening tracking status email share dialog...');
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      {/* 1. Feature Page Header (Matching UserCreationView standard) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space align="center" size={10}>
            <EnvironmentOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Cargo Tracking & Container Traceability
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 13 }}>
            Track real-time container movements, vessel voyage milestones, port cut-offs, and transport event logs.
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
      <TrackingSearchFilter onSearch={executeSearch} isLoading={isLoading} />

      {/* 3. Results Section */}
      {trackingResult && (
        <>
          <TrackingOverview data={trackingResult} />
          <TrackingContainersTable
            containers={trackingResult.containers}
            onViewMovements={handleOpenMovements}
          />
        </>
      )}

      {/* 4. Drawers */}
      <TrackingMovementDrawer
        container={selectedContainer}
        open={isMovementDrawerOpen}
        onClose={handleCloseMovements}
      />
    </Card>
  );
};
