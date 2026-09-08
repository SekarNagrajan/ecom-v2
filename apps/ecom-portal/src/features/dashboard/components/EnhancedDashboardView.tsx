// Modified by Sekar Nagarajan (2026-09-08 16:10)
/**
 * Enhanced Dashboard — JSP parity with enhancedDashboard.jsp:
 * KPI filter cards → Upcoming Shipment Planning → Ongoing Transactions, plus analytics sections.
 */
import { AppButton } from "@solverminds/shared-ui";
import { Col, Row, Space, Spin } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { NavDashboardIcon } from "../../../components/icons/nav-svg-icons";
import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { BlModuleStyles } from "../../bill-of-lading/components/bl-module-styles";
import { BlViewDrawer } from "../../bill-of-lading/components/view/BlViewDrawer";
import { BookingModuleStyles } from "../../booking/components/booking-module-styles";
import { BookingViewDrawer } from "../../booking/components/view/BookingViewDrawer";
import { useDashboardController } from "../hooks/use-dashboard-controller";
import {
  MOCK_CALENDAR_WEEKS,
  MOCK_CONTRACTED_LANES,
  MOCK_LAST_USED_LANES,
  MOCK_OPPORTUNITY_LANES,
  MOCK_PLANNING_KPIS,
  MOCK_TOP_CONSIGNEES,
  MOCK_TOP_LANES,
  MOCK_VOLUME_KPIS,
  MOCK_VOLUME_TREND,
} from "../mocks/dashboard.mock";
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

export function EnhancedDashboardView() {
  const controller = useDashboardController();
  const counts = controller.summary?.counts;
  const shipments = controller.summary?.shipments ?? [];
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
        title={MODULE_TITLES.dashboard}
        subtitle="Shipment KPIs, ongoing transactions, and operational analytics — parity with the legacy enhanced dashboard."
        extra={
          <Space wrap>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.plus} size={16} tone="create" />}
              onClick={controller.handleCreateBooking}
            >
              Create Booking
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
              Refresh
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
              title="Dashboard summary unavailable"
              message="Refresh the dashboard to try loading the summary again."
              artSize="md"
            />
          ) : null}
        </Spin>

        <Spin spinning={controller.isLoading}>
          <ShipmentPlanningSection
            kpis={MOCK_PLANNING_KPIS}
            calendar={MOCK_CALENDAR_WEEKS}
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

        <Spin spinning={controller.isLoading}>
          <VolumeAnalyticsSection
            kpis={MOCK_VOLUME_KPIS}
            trend={MOCK_VOLUME_TREND}
            trendPeriod={controller.trendPeriod}
            onTrendPeriodChange={controller.setTrendPeriod}
          />
        </Spin>

        <div className="dashboard-twin-sections">
          <Spin spinning={controller.isLoading}>
            <Row gutter={[16, 16]} className="dashboard-equal-row">
              <Col xs={24} lg={12}>
                <TopActiveLanesSection
                  lanes={MOCK_TOP_LANES}
                  lastUsed={MOCK_LAST_USED_LANES}
                />
              </Col>
              <Col xs={24} lg={12}>
                <LaneOpportunitySection
                  contracted={MOCK_CONTRACTED_LANES}
                  opportunities={MOCK_OPPORTUNITY_LANES}
                />
              </Col>
            </Row>
          </Spin>

          <Spin spinning={controller.isLoading}>
            <ShipmentIntelligenceSection consignees={MOCK_TOP_CONSIGNEES} />
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
    </FeaturePageShell>
  );
}
