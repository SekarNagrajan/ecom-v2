// Modified by Sekar Nagarajan (2026-09-08 16:25)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Segmented, Space, Spin, Typography } from "antd";
import React from "react";

import { AppIcon, Icons } from "../../components/icons";
import { NavSchedulesIcon } from "../../components/icons/nav-svg-icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleEmptyState } from "../../components/shared/module-empty-state";
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
    hasSearched,
    handleSearch,
    handleResetSearch,
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
          icon={NavSchedulesIcon}
          title={MODULE_TITLES.schedules}
          subtitle="Search sailings by route, vessel, or port — compare transit times, cut-offs, and book directly."
          extra={
            <Space align="center" size={12} wrap>
              <AppButton
                icon={
                  <AppIcon icon={Icons.download} size={16} tone="download" />
                }
                onClick={() => toast.success("Exporting schedule results…")}
                disabled={!hasSearched || schedules.length === 0}
              >
                Export
              </AppButton>
              <AppButton
                icon={<AppIcon icon={Icons.mail} size={16} tone="navigate" />}
                onClick={() => toast.info("Opening share dialog…")}
                disabled={!hasSearched || schedules.length === 0}
              >
                Share
              </AppButton>
            </Space>
          }
        />

        <ScheduleSearchFilter
          onSearch={handleSearch}
          onReset={handleResetSearch}
          isLoading={isLoading}
        />

        {!hasSearched && !isLoading ? (
          <div className="schedule-empty">
            <ModuleEmptyState
              variant="blank"
              title="Search for sailings"
              message="Choose your search criteria and click Search Schedules to view available departures."
              artSize="md"
            />
          </div>
        ) : (
          <>
            <div className="schedule-results-bar">
              <Space align="center" size={10} wrap>
                <AppIcon icon={Icons.calendar} size={18} />
                <Text className="schedule-results-bar__title">
                  Available Sailings
                </Text>
                <span className="schedule-results-bar__count">
                  {schedules.length}
                </span>
                {isLoading ? (
                  <span
                    className="module-loading-center"
                    role="status"
                    aria-label="Loading"
                  >
                    <Spin size="small" />
                  </span>
                ) : null}
              </Space>

              <Segmented
                value={viewMode}
                onChange={(value) => setViewMode(value as "LIST" | "CALENDAR")}
                className="schedule-results-tabs"
                options={[
                  {
                    value: "LIST",
                    label: (
                      <span className="schedule-tab-label">
                        <AppIcon icon={Icons.list} size={14} />
                        List
                      </span>
                    ),
                  },
                  {
                    value: "CALENDAR",
                    label: (
                      <span className="schedule-tab-label">
                        <AppIcon icon={Icons.calendar} size={14} />
                        Calendar
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            {isLoading ? (
              <div
                className="schedule-empty module-loading-center"
                role="status"
                aria-label="Loading"
              >
                <Spin size="medium" />
              </div>
            ) : viewMode === "LIST" ? (
              <ScheduleCardList
                schedules={schedules}
                isLoading={false}
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
          </>
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
