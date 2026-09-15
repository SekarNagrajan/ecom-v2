// Modified by Sekar Nagarajan (2026-09-15 15:05)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Space, Spin, Typography } from "antd";
import React from "react";

import { AppIcon, Icons } from "../../components/icons";
import {
  NavRoutePinsIcon,
  NavSchedulesIcon,
} from "../../components/icons/nav-svg-icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleCardViewPanel } from "../../components/shared/module-card-view-panel";
import { ModuleEmptyState } from "../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import { ScheduleModuleStyles } from "./components/schedule-module-styles";
import { ScheduleSearchHost } from "./components/schedule-search-host";
import { ScheduleViewModeTabs } from "./components/schedule-view-mode-tabs";
import { ScheduleCalendarView } from "./components/ScheduleCalendarView";
import { ScheduleCarbonModal } from "./components/ScheduleCarbonModal";
import { ScheduleCardList } from "./components/ScheduleCardList";
import { ScheduleList } from "./components/ScheduleList";
import { ScheduleRatesModal } from "./components/ScheduleRatesModal";
import { ShareScheduleMailDrawer } from "./components/ShareScheduleMailDrawer";
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
    handleShareResultsViaMail,
    isShareMailOpen,
    handleCloseShareMail,
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
            <Space align="center" size={12} wrap className="custom-scroll">
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
                onClick={handleShareResultsViaMail}
                disabled={!hasSearched || schedules.length === 0}
              >
                Share via Mail
              </AppButton>
            </Space>
          }
        />

        <ScheduleSearchHost
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
                <AppIcon icon={NavRoutePinsIcon} size={18} />
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
              <ScheduleViewModeTabs value={viewMode} onChange={setViewMode} />
            </div>

            {isLoading ? (
              <div
                className="schedule-empty module-loading-center"
                role="status"
                aria-label="Loading"
              >
                <Spin size="medium" />
              </div>
            ) : viewMode === "list" ? (
              <ScheduleList
                schedules={schedules}
                isLoading={false}
                onBookNow={handleBookNow}
                onViewVessel={handleViewVessel}
                onViewRates={handleOpenRates}
                onOpenCarbonModal={handleOpenCarbon}
              />
            ) : viewMode === "card" ? (
              <ModuleCardViewPanel active className="schedule-card-view-panel">
                <ScheduleCardList
                  schedules={schedules}
                  isLoading={false}
                  onBookNow={handleBookNow}
                  onViewVessel={handleViewVessel}
                  onViewRates={handleOpenRates}
                  onOpenCarbonModal={handleOpenCarbon}
                />
              </ModuleCardViewPanel>
            ) : (
              <ScheduleCalendarView
                schedules={schedules}
                onBookNow={handleBookNow}
                onViewVessel={handleViewVessel}
                onViewRates={handleOpenRates}
                onOpenCarbonModal={handleOpenCarbon}
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

        <ShareScheduleMailDrawer
          open={isShareMailOpen}
          onClose={handleCloseShareMail}
          schedules={schedules}
        />
      </Card>
    </FeaturePageShell>
  );
};
