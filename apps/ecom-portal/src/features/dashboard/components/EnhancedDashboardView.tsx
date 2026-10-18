// Modified by Sekar Nagarajan (2026-10-16 23:50)
/**
 * Enhanced Dashboard — JSP parity with enhancedDashboard.jsp:
 * KPI filter cards → Upcoming Shipment Planning → Ongoing Transactions, plus analytics sections.
 */
import { AppButton } from "@solverminds/shared-ui";
import { Col, Row, Space, Spin } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { NavDashboardIcon } from "../../../components/icons/nav-svg-icons";
import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { BlModuleStyles } from "../../bill-of-lading/components/bl-module-styles";
import { BlViewDrawer } from "../../bill-of-lading/components/view/BlViewDrawer";
import { BookingModuleStyles } from "../../booking/components/booking-module-styles";
import { BookingViewDrawer } from "../../booking/components/view/BookingViewDrawer";
import type {
  IntelligenceBreakdowns,
  PlanningKpi,
} from "../api/dashboard.api";
import { useDashboardController } from "../hooks/use-dashboard-controller";
import { filterDashboardShipments } from "../utils/filter-dashboard-shipments";
import { DashboardExportButton } from "./dashboard-export-button";
import { DashboardModuleStyles } from "./dashboard-module-styles";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { DashboardOngoingTable } from "./DashboardOngoingTable";
import { LaneOpportunitySection, TopActiveLanesSection } from "./LanesSection";
import { PlanningDayBookingsDrawer } from "./PlanningDayBookingsDrawer";
import { ShipmentIntelligenceSection } from "./ShipmentIntelligenceSection";
import { ShipmentPlanningSection } from "./ShipmentPlanningSection";
import { VolumeAnalyticsSection } from "./VolumeAnalyticsSection";

/** Zero-state props while the summary is loading or unavailable. */
const EMPTY_PLANNING_KPIS: PlanningKpi = {
  bookingsNext7Days: 0,
  feusNext7Days: 0,
  missingSI: 0,
  atRisk: 0,
};
const EMPTY_BREAKDOWNS: IntelligenceBreakdowns = {
  origin: [],
  pol: [],
  pod: [],
  pickup: [],
  consignee: [],
  destination: [],
};

export function EnhancedDashboardView() {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const controller = useDashboardController();
  const counts = controller.summary?.counts;
  const shipments = controller.summary?.shipments ?? [];
  const planning = controller.summary?.planning;
  const lanes = controller.summary?.lanes;
  const intelligence = controller.summary?.intelligence;
  // Modified by Sekar Nagarajan (2026-09-08 16:10)
  const filteredShipmentCount = filterDashboardShipments(
    shipments,
    controller.activeFilter,
  ).length;

  return (
    <FeaturePageShell>
      <DashboardModuleStyles />
      <BookingModuleStyles />
      <BlModuleStyles />
      <ModuleScreenHeader
        icon={NavDashboardIcon}
        title={t("title")}
        subtitle={t("subtitle")}
        extra={
          <Space wrap>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.plus} size={16} tone="create" />}
              onClick={controller.handleCreateBooking}
            >
              {t("createBooking")}
            </AppButton>
            <DashboardExportButton
              activeFilter={controller.activeFilter}
              filterLabel={controller.filterLabel}
              shipmentCount={filteredShipmentCount}
              totalShipmentCount={shipments.length}
              disabled={!controller.summary || controller.isLoading}
            />
            <AppButton
              danger
              icon={<AppIcon icon={Icons.refreshCw} size={16} tone="delete" />}
              onClick={() => void controller.loadSummary()}
              loading={controller.isLoading}
            >
              {t("refresh")}
            </AppButton>
          </Space>
        }
      />

      <Space direction="vertical" size={20} className="feature-page-stack">
        <Spin spinning={controller.isLoading}>
          {counts ? (
            <DashboardKpiCards
              counts={counts}
              activeFilter={controller.activeFilter}
              onFilterChange={controller.handleFilterChange}
              onViewShipments={controller.handleViewShipments}
            />
          ) : !controller.isLoading ? (
            <ModuleEmptyState
              variant="error"
              title={t("summaryUnavailableTitle")}
              message={t("summaryUnavailableMessage")}
              artSize="md"
            />
          ) : null}
        </Spin>

        <Spin spinning={controller.isLoading}>
          <ShipmentPlanningSection
            kpis={planning?.kpis ?? EMPTY_PLANNING_KPIS}
            calendar={planning?.calendar ?? []}
            onDayClick={controller.handlePlanningDayClick}
            onViewAll={controller.handleViewAllPlanning}
          />
        </Spin>

        <Spin spinning={controller.isLoading}>
          <DashboardOngoingTable
            shipments={shipments}
            activeFilter={controller.activeFilter}
            filterLabel={controller.filterLabel}
            onViewBooking={controller.handleViewBooking}
            onViewBl={controller.handleViewBl}
            onCreateSi={controller.handleCreateSi}
          />
        </Spin>

        <Spin spinning={controller.isVolumeLoading}>
          <VolumeAnalyticsSection
            kpis={controller.volumeAnalytics?.kpis ?? []}
            trend={controller.volumeAnalytics?.trend ?? []}
            trendPeriod={controller.trendPeriod}
            volumeStage={controller.volumeStage}
            onTrendPeriodChange={controller.handleTrendPeriodChange}
            onVolumeStageChange={controller.handleVolumeStageChange}
          />
        </Spin>

        <div className="dashboard-twin-sections">
          <Spin spinning={controller.isLoading}>
            <Row gutter={[16, 16]} className="dashboard-equal-row">
              <Col xs={24} lg={12}>
                <TopActiveLanesSection
                  lanes={lanes?.top ?? []}
                  lastUsed={lanes?.lastUsed ?? []}
                />
              </Col>
              <Col xs={24} lg={12}>
                <LaneOpportunitySection
                  contracted={lanes?.contracted ?? []}
                  opportunities={lanes?.opportunities ?? []}
                />
              </Col>
            </Row>
          </Spin>

          <Spin spinning={controller.isLoading}>
            <ShipmentIntelligenceSection
              consignees={intelligence?.consignees ?? []}
              breakdowns={intelligence?.breakdowns ?? EMPTY_BREAKDOWNS}
            />
          </Spin>
        </div>
      </Space>

      {controller.planningDay ? (
        <PlanningDayBookingsDrawer
          selection={controller.planningDay}
          onClose={controller.handleClosePlanningDayDrawer}
          onViewBooking={controller.handleViewPlanningBooking}
        />
      ) : null}

      {controller.selectedBooking ? (
        <BookingViewDrawer
          booking={controller.selectedBooking}
          onClose={controller.handleCloseBookingDrawer}
        />
      ) : null}

      {controller.selectedBl ? (
        <BlViewDrawer
          record={controller.selectedBl}
          onClose={controller.handleCloseBlDrawer}
        />
      ) : null}

      {/* <DashboardScrollTopButton /> */}
    </FeaturePageShell>
  );
}
