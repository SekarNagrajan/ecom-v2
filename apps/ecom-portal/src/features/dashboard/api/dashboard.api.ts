// Dashboard API types and service
// Business parity with: enhancedDashboard.jsp, dashboard.jsp, DashBoardCharts.jsp
// Modified by Sekar Nagarajan (2026-09-16 17:07)

import type {
  BookingStatusChartItem,
  DashboardCounts,
  DashboardShipment,
  PortPairChartItem,
  TopDestinationItem,
  UnclearedCargoItem,
  VolumeAnalyticsResponse,
  VolumeAnalyticsStage,
  VolumeTrendPeriod,
} from "../mocks/dashboard.mock";
import {
  getMockVolumeAnalytics,
  MOCK_BL_CHART_DATA,
  MOCK_BOOKING_CHART_DATA,
  MOCK_DASHBOARD_COUNTS,
  MOCK_DASHBOARD_SHIPMENTS,
  MOCK_OUTSTANDING_BALANCE,
  MOCK_PORT_PAIRS,
  MOCK_SI_CHART_DATA,
  MOCK_TOP_DESTINATIONS,
  MOCK_UNCLEARED_CARGO,
  MOCK_UNCLEARED_DELIVERED,
  MOCK_UNCLEARED_REMAINING,
} from "../mocks/dashboard.mock";

export type {
  BookingStatusChartItem,
  DashboardCounts,
  DashboardShipment,
  PortPairChartItem,
  TopDestinationItem,
  UnclearedCargoItem,
  VolumeAnalyticsResponse,
  VolumeAnalyticsStage,
  VolumeTrendPeriod,
};

export interface DashboardSummaryResponse {
  counts: DashboardCounts;
  shipments: DashboardShipment[];
  bookingChart: BookingStatusChartItem[];
  blChart: BookingStatusChartItem[];
  siChart: BookingStatusChartItem[];
  topDestinations: TopDestinationItem[];
  portPairs: PortPairChartItem[];
  unclearedCargo: UnclearedCargoItem[];
  unclearedDelivered: number;
  unclearedRemaining: number;
  outstandingBalance: number;
}

export interface VolumeAnalyticsQuery {
  stage?: VolumeAnalyticsStage;
  period?: VolumeTrendPeriod;
}

const simulateDelay = (ms = 400) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    await simulateDelay();
    return {
      counts: MOCK_DASHBOARD_COUNTS,
      shipments: MOCK_DASHBOARD_SHIPMENTS,
      bookingChart: MOCK_BOOKING_CHART_DATA,
      blChart: MOCK_BL_CHART_DATA,
      siChart: MOCK_SI_CHART_DATA,
      topDestinations: MOCK_TOP_DESTINATIONS,
      portPairs: MOCK_PORT_PAIRS,
      unclearedCargo: MOCK_UNCLEARED_CARGO,
      unclearedDelivered: MOCK_UNCLEARED_DELIVERED,
      unclearedRemaining: MOCK_UNCLEARED_REMAINING,
      outstandingBalance: MOCK_OUTSTANDING_BALANCE,
    };
  },

  /** Volume KPIs + trend for a lifecycle stage and trend granularity. */
  async getVolumeAnalytics(
    query: VolumeAnalyticsQuery = {},
  ): Promise<VolumeAnalyticsResponse> {
    await simulateDelay(220);
    return getMockVolumeAnalytics(query.stage ?? "all", query.period ?? "Monthly");
  },
};
