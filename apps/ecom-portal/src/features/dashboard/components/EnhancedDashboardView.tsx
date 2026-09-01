// Modified by Sekar Nagarajan (2026-09-01 12:52)
/**
 * Enhanced Dashboard — JSP parity with enhancedDashboard.jsp:
 * KPI filter cards → Upcoming Shipment Planning → Ongoing Transactions, plus analytics sections.
 */
import { AppButton } from "@solverminds/shared-ui";
import { Col, Empty, Row, Space, Spin } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
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
import { DashboardModuleStyles } from "./dashboard-module-styles";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { DashboardOngoingTable } from "./DashboardOngoingTable";
import { LaneOpportunitySection, TopActiveLanesSection } from "./LanesSection";
import { ShipmentIntelligenceSection } from "./ShipmentIntelligenceSection";
import { ShipmentPlanningSection } from "./ShipmentPlanningSection";
import { VolumeAnalyticsSection } from "./VolumeAnalyticsSection";

export function EnhancedDashboardView() {
  const controller = useDashboardController();
  const counts = controller.summary?.counts;
  const shipments = controller.summary?.shipments ?? [];

  return (
    <FeaturePageShell>
      <DashboardModuleStyles />
      <BookingModuleStyles />
      <BlModuleStyles />
      <ModuleScreenHeader
        icon={Icons.layoutDashboard}
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
            />
          ) : !controller.isLoading ? (
            <Empty description="Dashboard summary unavailable" />
          ) : null}
        </Spin>

        <Spin spinning={controller.isLoading}>
          <ShipmentPlanningSection
            kpis={MOCK_PLANNING_KPIS}
            calendar={MOCK_CALENDAR_WEEKS}
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
