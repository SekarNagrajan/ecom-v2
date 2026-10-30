// Modified by Sekar Nagarajan (2026-10-16 23:25)
/**
 * Dashboard API types and service.
 * Business parity with: enhancedDashboard.jsp, dashboard.jsp, DashBoardCharts.jsp.
 *
 * Every figure is computed from the extracted database fixtures by
 * src/mocks/fixture-api/bridges/dashboard.bridge.ts until a REST facade exists.
 * The types below are the single source of truth for the dashboard DTOs; the bridge
 * imports them type-only, so there is no runtime cycle.
 */
import {
  fixtureDashboardSummary,
  fixtureVolumeAnalytics,
  fixtureVolumeTrendRecords,
} from "../../../mocks/fixture-api/bridges/dashboard.bridge";
import type { BookingListDTO } from "../../booking/types/booking-list.types";

// ─── Volume analytics ────────────────────────────────────────────
export interface VolumeKpi {
  label: string;
  period: string;
  value: number;
  unit: string;
  change: number; // percentage vs prev period
  changePrev: number; // absolute prev value
  sparkline: number[];
}

export interface VolumeTrendPoint {
  /** Display label (e.g. "Oct 2026", "W42", "Q4 2026"). */
  month: string;
  feus: number;
  /** Period start as local ISO date (YYYY-MM-DD) — used for TEU drill-down. */
  periodKey: string;
}

/** One shipment contributing TEUs to a volume-trend bucket. */
export interface VolumeTrendRecord {
  id: string;
  bookingNo: string;
  blNo: string;
  origin: string;
  destination: string;
  teus: number;
  volumeDate: string;
  status: string;
  consignee: string;
}

/** Shipment lifecycle stage for volume analytics. */
export type VolumeAnalyticsStage =
  | "all"
  | "booking"
  | "si"
  | "bl"
  | "inTransit";

export type VolumeTrendPeriod = "Weekly" | "Monthly" | "Quarterly";

export interface VolumeAnalyticsResponse {
  stage: VolumeAnalyticsStage;
  period: VolumeTrendPeriod;
  kpis: VolumeKpi[];
  trend: VolumeTrendPoint[];
}

export const VOLUME_ANALYTICS_STAGE_OPTIONS: ReadonlyArray<{
  value: VolumeAnalyticsStage;
  label: string;
}> = [
  { value: "all", label: "All Volume" },
  { value: "booking", label: "Booking" },
  { value: "si", label: "SI" },
  { value: "bl", label: "B/L" },
  { value: "inTransit", label: "In Transit" },
];

export const VOLUME_TREND_PERIOD_OPTIONS: ReadonlyArray<{
  value: VolumeTrendPeriod;
  label: string;
}> = [
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
];

// ─── Lanes ───────────────────────────────────────────────────────
export interface TopLane {
  rank: number;
  pol: string;
  pod: string;
  feus: number;
  pctOfTotal: number;
}

export interface LastUsedLane {
  pol: string;
  pod: string;
  date: string;
}

export interface ContractedLane {
  pol: string;
  pod: string;
  lastActivity: string | null;
}

export interface OpportunityLane {
  pol: string;
  pod: string;
  suggestion: "High Potential" | "Medium Potential";
}

export interface DashboardLanes {
  top: TopLane[];
  lastUsed: LastUsedLane[];
  contracted: ContractedLane[];
  opportunities: OpportunityLane[];
}

// ─── Upcoming shipment planning ──────────────────────────────────
export interface PlanningKpi {
  bookingsNext7Days: number;
  feusNext7Days: number;
  /** Pending SI count — parity with JSP planningMissingSITotal */
  missingSI: number;
  /** Payment pending count — parity with JSP planningPendingPaymentTotal */
  atRisk: number;
}

export type CalendarWeekday =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

/** Planning calendar booking with SI / payment flags (JSP missingSIFlag / pendingPaymentFlag). */
export interface PlanningBookingDTO extends BookingListDTO {
  missingSIFlag?: boolean;
  pendingPaymentFlag?: boolean;
}

export interface CalendarDayCell {
  count: number;
  /** Bookings awaiting SI on this day */
  missingSI: number;
  /** Bookings with payment pending on this day */
  pendingPayment: number;
  bookings: PlanningBookingDTO[];
}

export interface CalendarWeek {
  week: string;
  dateRange: string;
  days: Record<CalendarWeekday, CalendarDayCell> & {
    total: number;
    totalMissingSI: number;
    totalPendingPayment: number;
  };
}

/** Day selection payload when a calendar count is clicked. */
export interface PlanningDaySelection {
  week: string;
  day: CalendarWeekday;
  dayLabel: string;
  dateRange: string;
  bookings: PlanningBookingDTO[];
}

export interface DashboardPlanning {
  kpis: PlanningKpi;
  calendar: CalendarWeek[];
}

// ─── Shipment intelligence ───────────────────────────────────────
export type DashboardBreakdownTone =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "purple"
  | "neutral";

export interface IntelligenceBreakdown {
  name: string;
  feus: number;
  pctOfTotal: number;
  /** Semantic tone — resolved via tokens at render time */
  tone: DashboardBreakdownTone;
}

export interface TopConsignee {
  name: string;
  feus: number;
  pctOfTotal: number;
  tone: DashboardBreakdownTone;
}

export type IntelligenceDimension =
  | "origin"
  | "pol"
  | "pod"
  | "pickup"
  | "consignee"
  | "destination";

export type IntelligenceBreakdowns = Record<
  IntelligenceDimension,
  IntelligenceBreakdown[]
>;

/** Derived shipment statistics (transit time, cargo mix, commodities). */
export interface ShipmentIntelligenceStats {
  shipments: number;
  containers: number;
  teus: number;
  avgTransitDays: number;
  dgSharePct: number;
  reeferSharePct: number;
  vgmPending: number;
  topCommodities: { name: string; teus: number }[];
}

export interface DashboardIntelligence {
  breakdowns: IntelligenceBreakdowns;
  consignees: TopConsignee[];
  stats: ShipmentIntelligenceStats;
}

// ─── Legacy dashboard API types (enhancedDashboard.jsp parity) ───
export interface DashboardCounts {
  totCou: number;
  bkConfirmed: number;
  siPending: number;
  payPending: number;
  pendingAmount: number;
  orgCou: number;
  inTransitCou: number;
  delCou: number;
}

export interface DashboardShipment {
  id: string;
  bookNo: string;
  blNo: string;
  onlineRefNo: string;
  originPortId: string;
  originPortDesc: string;
  finalPortId: string;
  finalPortDesc: string;
  polAt: string;
  status: "C" | "D" | "V" | "I";
  siNo: string;
  containerNo: string;
  teus: string;
  amtBal: number;
  invNo: string;
  invAgency: string;
  filterKey: string;
}

export interface BookingStatusChartItem {
  name: string;
  value: number;
  status: string;
  count: number;
  color: string;
}

export interface TopDestinationItem {
  port: string;
  count: number;
}

export interface PortPairChartItem {
  pol: string;
  pod: string;
  count: number;
}

export interface UnclearedCargoItem {
  port: string;
  count: number;
}

// ─── Rocket dashboard layout data ────────────────────────────────
export interface DashboardStatCard {
  key: "activeBookings" | "inTransit" | "pendingSiBl" | "outstanding";
  label: string;
  value: string;
  subtitle: string;
}

export interface DashboardQuickAction {
  key: string;
  title: string;
  description: string;
  route: string;
  /** Fixture-derived badge count (drafts, in-transit, SI pending, …). */
  count?: number;
}

/** Static UI configuration of the quick-action tiles; counts are added by the bridge. */
export const DASHBOARD_QUICK_ACTIONS: ReadonlyArray<DashboardQuickAction> = [
  {
    key: "newBooking",
    title: "New Booking",
    description: "Create a cargo booking",
    route: "/app/booking/new",
  },
  {
    key: "trackShipment",
    title: "Track a Shipment",
    description: "Search by container or B/L",
    route: "/app/tracking",
  },
  {
    key: "requestRate",
    title: "Request a Rate",
    description: "Get a freight quotation",
    route: "/app/rates",
  },
  {
    key: "submitSi",
    title: "Submit Shipping Instruction",
    description: "File SI for confirmed booking",
    route: "/app/shipping-instruction",
  },
];

export type RecentBookingStatus =
  | "Confirmed"
  | "SI Pending"
  | "In Transit"
  | "Pending"
  | "B/L Issued"
  | "Completed";

export interface RecentBookingRow {
  id: string;
  bookingNo: string;
  vessel: string;
  voyage: string;
  pol: string;
  polName: string;
  pod: string;
  podName: string;
  etd: string;
  status: RecentBookingStatus;
}

export interface UpcomingScheduleItem {
  id: string;
  vessel: string;
  voyage: string;
  service: string;
  pol: string;
  pod: string;
  etd: string;
  cutoff: string;
  cutoffOverdue?: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  body: string;
  date: string;
}

// ─── Service contract ────────────────────────────────────────────
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
  planning: DashboardPlanning;
  lanes: DashboardLanes;
  intelligence: DashboardIntelligence;
  stats: DashboardStatCard[];
  quickActions: DashboardQuickAction[];
  recentBookings: RecentBookingRow[];
  upcomingSchedules: UpcomingScheduleItem[];
  notices: NoticeItem[];
}

export interface VolumeAnalyticsQuery {
  stage?: VolumeAnalyticsStage;
  period?: VolumeTrendPeriod;
}

export interface VolumeTrendRecordsQuery {
  stage?: VolumeAnalyticsStage;
  period: VolumeTrendPeriod;
  /** Matches `VolumeTrendPoint.periodKey`. */
  periodKey: string;
}

const simulateDelay = (ms = 400) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    await simulateDelay();
    return fixtureDashboardSummary({ quickActions: DASHBOARD_QUICK_ACTIONS });
  },

  /** Volume KPIs + trend for a lifecycle stage and trend granularity. */
  async getVolumeAnalytics(
    query: VolumeAnalyticsQuery = {},
  ): Promise<VolumeAnalyticsResponse> {
    await simulateDelay(220);
    return fixtureVolumeAnalytics(query.stage ?? "all", query.period ?? "Monthly");
  },

  /** Shipment rows that contribute TEUs to one volume-trend point. */
  async getVolumeTrendRecords(
    query: VolumeTrendRecordsQuery,
  ): Promise<VolumeTrendRecord[]> {
    await simulateDelay(180);
    return fixtureVolumeTrendRecords(
      query.stage ?? "all",
      query.period,
      query.periodKey,
    );
  },
};
