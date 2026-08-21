// Schedules Feature Main Route View Component
// Parity with UserCreationView main layout standard (<Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>)
// Parity with eCommSchedules.jsp, SchedulebetweenlocationView.jsp & VesselDetails.jsp
// Modified by Antigravity (2026-08-21)

import {
  CalendarOutlined,
  CompassOutlined,
  DownloadOutlined,
  MailOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Badge, Card, message, Segmented, Space, theme, Typography } from 'antd';
import React from 'react';
import { ScheduleCalendarView } from './components/ScheduleCalendarView';
import { ScheduleCarbonModal } from './components/ScheduleCarbonModal';
import { ScheduleCardList } from './components/ScheduleCardList';
import { ScheduleRatesModal } from './components/ScheduleRatesModal';
import { ScheduleSearchFilter } from './components/ScheduleSearchFilter';
import { VesselDetailsModal } from './components/VesselDetailsModal';
import { useSchedulesController } from './hooks/useSchedulesController';

const { Title, Text } = Typography;

export const SchedulesRoute: React.FC = () => {
  const { token } = theme.useToken();
  const {
    viewMode,
    setViewMode,
    schedules,
    isLoading,
    handleSearch,
    handleViewVessel,
    selectedVessel,
    isVesselModalOpen,
    handleCloseVesselModal,
    ratesSchedule,
    isRatesModalOpen,
    handleOpenRates,
    handleCloseRates,
    carbonSchedule,
    isCarbonModalOpen,
    handleOpenCarbon,
    handleCloseCarbon,
    handleBookNow,
  } = useSchedulesController();

  const handleExportExcel = () => {
    message.success('Exporting schedule search results to Excel...');
  };

  const handleSendEmail = () => {
    message.info('Opening schedule email share dialog...');
  };

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      {/* 1. Feature Page Header (Matching UserCreationView) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space align="center" size={10}>
            <CompassOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Vessel Schedules & Global Routes
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 13 }}>
            Search real-time vessel schedules, port cut-offs, transit times, and eco-emissions across global liner trade lanes.
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
      <ScheduleSearchFilter onSearch={handleSearch} isLoading={isLoading} />

      {/* 3. Available Sailing Options Header Bar */}
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
          <CompassOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
          <Text strong style={{ fontSize: 15 }}>
            Available Sailing Options
          </Text>
          <Badge count={schedules.length} style={{ backgroundColor: token.colorError }} />

        </Space>

        <Segmented
          value={viewMode}
          onChange={(val) => setViewMode(val as 'LIST' | 'CALENDAR')}
          options={[
            { label: 'List View', value: 'LIST', icon: <UnorderedListOutlined /> },
            { label: 'Calendar View', value: 'CALENDAR', icon: <CalendarOutlined /> },
          ]}
        />
      </div>

      {/* 4. Results List / Calendar View */}
      {viewMode === 'LIST' ? (
        <ScheduleCardList
          schedules={schedules}
          isLoading={isLoading}
          onBookNow={handleBookNow}
          onViewVessel={handleViewVessel}
          onViewRates={handleOpenRates}
          onOpenCarbonModal={handleOpenCarbon}
        />
      ) : (
        <ScheduleCalendarView
          schedules={schedules}
          onSelectSchedule={(sch) => handleBookNow(sch)}
        />
      )}

      {/* 5. Drawers */}
      <VesselDetailsModal
        vessel={selectedVessel}
        open={isVesselModalOpen}
        onClose={handleCloseVesselModal}
      />

      <ScheduleRatesModal
        schedule={ratesSchedule}
        open={isRatesModalOpen}
        onClose={handleCloseRates}
        onProceedBooking={handleBookNow}
      />

      <ScheduleCarbonModal
        schedule={carbonSchedule}
        open={isCarbonModalOpen}
        onClose={handleCloseCarbon}
      />
    </Card>
  );
};
