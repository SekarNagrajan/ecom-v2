// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Segmented, Space, Spin, Typography } from "antd";
import React from "react";
import { AppIcon, Icons } from "../../components/icons";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import { ScheduleModuleStyles } from "./components/schedule-module-styles";
import { ScheduleCalendarView } from "./components/ScheduleCalendarView";
import { ScheduleCarbonModal } from "./components/ScheduleCarbonModal";
import { ScheduleCardList } from "./components/ScheduleCardList";
import { ScheduleRatesModal } from "./components/ScheduleRatesModal";
import { ScheduleSearchFilter } from "./components/ScheduleSearchFilter";
import { VesselDetailsModal } from "./components/VesselDetailsModal";
import { useSchedulesController } from "./hooks/useSchedulesController";

const { Text } = Typography;

export const SchedulesRoute: React.FC = () => {
  const toast = useToast();
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

  return (
    <FeaturePageShell>
      <ScheduleModuleStyles />

      <Card className="feature-page-card" bordered={false}>
        <ModuleScreenHeader
          icon={Icons.calendar}
          title={MODULE_TITLES.schedules}
          subtitle="Search sailings by route, vessel, or port — compare transit times, cut-offs, and book directly."
          extra={
            <Space align="center" size={12} wrap>
              <AppButton
                icon={
                  <AppIcon icon={Icons.download} size={16} tone="download" />
                }
                onClick={() => toast.success("Exporting schedule results…")}
              >
                Export
              </AppButton>
              <AppButton
                icon={<AppIcon icon={Icons.mail} size={16} tone="navigate" />}
                onClick={() => toast.info("Opening share dialog…")}
              >
                Share
              </AppButton>
            </Space>
          }
        />

        <ScheduleSearchFilter onSearch={handleSearch} isLoading={isLoading} />

        <div className="schedule-results-bar">
          <Space align="center" size={10} wrap>
            <AppIcon icon={Icons.calendar} size={18} />
            <Text className="schedule-results-bar__title">
              Available Sailings
            </Text>
            <span className="schedule-results-bar__count">
              {schedules.length}
            </span>
            {isLoading ? <Spin size="small" /> : null}
          </Space>

          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as "LIST" | "CALENDAR")}
            options={[
              {
                label: "List",
                value: "LIST",
                icon: <AppIcon icon={Icons.list} size={14} />,
              },
              {
                label: "Calendar",
                value: "CALENDAR",
                icon: <AppIcon icon={Icons.calendar} size={14} />,
              },
            ]}
          />
        </div>

        {viewMode === "LIST" ? (
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
            onSelectSchedule={handleBookNow}
          />
        )}

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
    </FeaturePageShell>
  );
};
