// Dashboard API types and service
// Business parity with: enhancedDashboard.jsp, dashboard.jsp, DashBoardCharts.jsp

import type {
  DashboardCounts,
  DashboardShipment,
  BookingStatusChartItem,
  TopDestinationItem,
  PortPairChartItem,
  UnclearedCargoItem,
} from '../mocks/dashboard.mock';
import {
  MOCK_DASHBOARD_COUNTS,
  MOCK_DASHBOARD_SHIPMENTS,
  MOCK_BOOKING_CHART_DATA,
  MOCK_BL_CHART_DATA,
  MOCK_SI_CHART_DATA,
  MOCK_TOP_DESTINATIONS,
  MOCK_PORT_PAIRS,
  MOCK_UNCLEARED_CARGO,
  MOCK_UNCLEARED_DELIVERED,
  MOCK_UNCLEARED_REMAINING,
  MOCK_OUTSTANDING_BALANCE,
} from '../mocks/dashboard.mock';

export type { DashboardCounts, DashboardShipment, BookingStatusChartItem, TopDestinationItem, PortPairChartItem, UnclearedCargoItem };

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
};
