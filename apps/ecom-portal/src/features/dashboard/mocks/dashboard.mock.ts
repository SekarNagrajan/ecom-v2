// Extended mock data for the rich logistics dashboard design
// Parity: enhancedDashboard.jsp + Rocket dashboard reference layout
// Modified by Sekar Nagarajan (2026-08-24 15:35)

export interface VolumeKpi {
  label: string;
  period: string;
  value: number;
  unit: string;
  change: number;        // percentage vs prev period
  changePrev: number;    // absolute prev value
  sparkline: number[];
}

export interface VolumeTrendPoint {
  month: string;
  feus: number;
}

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
  suggestion: 'High Potential' | 'Medium Potential';
}

export interface PlanningKpi {
  bookingsNext7Days: number;
  feusNext7Days: number;
  missingSI: number;
  atRisk: number;
}

export interface CalendarWeek {
  week: string;
  dateRange: string;
  days: { mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number; total: number };
}

export interface IntelligenceBreakdown {
  name: string;
  feus: number;
  pctOfTotal: number;
  /** Semantic tone — resolved via tokens at render time */
  tone: 'primary' | 'success' | 'warning' | 'error' | 'purple' | 'neutral';
}

export interface TopConsignee {
  name: string;
  feus: number;
  pctOfTotal: number;
  tone: 'primary' | 'success' | 'warning' | 'error' | 'purple' | 'neutral';
}

// ─── Volume KPI Cards ────────────────────────────────────────────
export const MOCK_VOLUME_KPIS: VolumeKpi[] = [
  {
    label: 'This Week',
    period: 'W22, 2025',
    value: 142,
    unit: 'FEUs',
    change: 18,
    changePrev: 125,
    sparkline: [80, 95, 88, 102, 98, 115, 125, 118, 130, 142],
  },
  {
    label: 'This Month',
    period: 'Month (May 2025)',
    value: 612,
    unit: 'FEUs',
    change: 14,
    changePrev: 538,
    sparkline: [400, 420, 450, 480, 460, 500, 520, 540, 570, 612],
  },
  {
    label: 'This Quarter',
    period: 'Q2, 2025',
    value: 1986,
    unit: 'FEUs',
    change: 9,
    changePrev: 1824,
    sparkline: [1600, 1650, 1700, 1720, 1780, 1820, 1850, 1900, 1950, 1986],
  },
  {
    label: 'This Year',
    period: 'Year (2025)',
    value: 7842,
    unit: 'FEUs',
    change: 11,
    changePrev: 7071,
    sparkline: [6000, 6200, 6500, 6700, 6900, 7100, 7250, 7400, 7620, 7842],
  },
];

// ─── Volume Trend (line chart) ───────────────────────────────────
export const MOCK_VOLUME_TREND: VolumeTrendPoint[] = [
  { month: 'Jun 2024', feus: 610 },
  { month: 'Jul 2024', feus: 720 },
  { month: 'Aug 2024', feus: 680 },
  { month: 'Sep 2024', feus: 790 },
  { month: 'Oct 2024', feus: 840 },
  { month: 'Nov 2024', feus: 780 },
  { month: 'Dec 2024', feus: 920 },
  { month: 'Jan 2025', feus: 860 },
  { month: 'Feb 2025', feus: 950 },
  { month: 'Mar 2025', feus: 1050 },
  { month: 'Apr 2025', feus: 1020 },
  { month: 'May 2025', feus: 1180 },
];

// ─── Top Active Lanes ────────────────────────────────────────────
export const MOCK_TOP_LANES: TopLane[] = [
  { rank: 1, pol: 'BDCGP', pod: 'LKCMB', feus: 512, pctOfTotal: 25.8 },
  { rank: 2, pol: 'CNYTN', pod: 'LKCMB', feus: 398, pctOfTotal: 20.0 },
  { rank: 3, pol: 'INNSA', pod: 'AEDXB', feus: 342, pctOfTotal: 17.2 },
  { rank: 4, pol: 'SGSIN', pod: 'LKCMB', feus: 268, pctOfTotal: 13.5 },
  { rank: 5, pol: 'CNSHA', pod: 'LKCMB', feus: 235, pctOfTotal: 11.8 },
];

export const MOCK_LAST_USED_LANES: LastUsedLane[] = [
  { pol: 'BDCGP', pod: 'LKCMB', date: 'May 25, 2025' },
  { pol: 'INNSA', pod: 'JEBEL', date: 'May 24, 2025' },
  { pol: 'SGSIN', pod: 'SYDNEY', date: 'May 20, 2025' },
];

// ─── Lane Opportunity Visibility ─────────────────────────────────
export const MOCK_CONTRACTED_LANES: ContractedLane[] = [
  { pol: 'BDCGP', pod: 'ROTRD', lastActivity: null },
  { pol: 'CNSHA', pod: 'HAMBURG', lastActivity: null },
  { pol: 'INMUN', pod: 'JEDDAH', lastActivity: null },
];

export const MOCK_OPPORTUNITY_LANES: OpportunityLane[] = [
  { pol: 'BDCGP', pod: 'SYDNEY', suggestion: 'High Potential' },
  { pol: 'INNSA', pod: 'DURBAN', suggestion: 'Medium Potential' },
  { pol: 'SGSIN', pod: 'AUCKLAND', suggestion: 'Medium Potential' },
];

// ─── Upcoming Shipment Planning ──────────────────────────────────
export const MOCK_PLANNING_KPIS: PlanningKpi = {
  bookingsNext7Days: 26,
  feusNext7Days: 184,
  missingSI: 6,
  atRisk: 3,
};

export const MOCK_CALENDAR_WEEKS: CalendarWeek[] = [
  {
    week: 'W22',
    dateRange: '19–25 May',
    days: { mon: 3, tue: 1, wed: 4, thu: 2, fri: 4, sat: 2, sun: 3, total: 19 },
  },
  {
    week: 'W23',
    dateRange: '26 May–1 Jun',
    days: { mon: 4, tue: 1, wed: 5, thu: 2, fri: 4, sat: 1, sun: 3, total: 20 },
  },
  {
    week: 'W24',
    dateRange: '2–8 Jun',
    days: { mon: 2, tue: 1, wed: 3, thu: 1, fri: 2, sat: 1, sun: 2, total: 12 },
  },
];

// ─── Shipment Intelligence Breakdown ─────────────────────────────
export const MOCK_INTELLIGENCE_BY_ORIGIN: IntelligenceBreakdown[] = [
  { name: 'BDCGP – Chittagong', feus: 512, pctOfTotal: 25.8, tone: 'primary' },
  { name: 'INNSA – Nhava Sheva', feus: 358, pctOfTotal: 18.0, tone: 'success' },
  { name: 'CNSHA – Shanghai', feus: 298, pctOfTotal: 15.0, tone: 'warning' },
  { name: 'SGSIN – Singapore', feus: 238, pctOfTotal: 12.0, tone: 'error' },
  { name: 'CNYTN – Yantian', feus: 198, pctOfTotal: 10.0, tone: 'purple' },
  { name: 'Others', feus: 382, pctOfTotal: 19.2, tone: 'neutral' },
];

export const MOCK_INTELLIGENCE_BY_POL: IntelligenceBreakdown[] = [
  { name: 'BDCGP – Chittagong', feus: 490, pctOfTotal: 24.7, tone: 'primary' },
  { name: 'CNSHA – Shanghai', feus: 380, pctOfTotal: 19.1, tone: 'success' },
  { name: 'SGSIN – Singapore', feus: 310, pctOfTotal: 15.6, tone: 'warning' },
  { name: 'NLRTM – Rotterdam', feus: 215, pctOfTotal: 10.8, tone: 'error' },
  { name: 'Others', feus: 591, pctOfTotal: 29.8, tone: 'neutral' },
];

export const MOCK_INTELLIGENCE_BY_POD: IntelligenceBreakdown[] = [
  { name: 'LKCMB – Colombo', feus: 620, pctOfTotal: 31.2, tone: 'primary' },
  { name: 'AEDXB – Dubai', feus: 420, pctOfTotal: 21.1, tone: 'success' },
  { name: 'SGSIN – Singapore', feus: 320, pctOfTotal: 16.1, tone: 'warning' },
  { name: 'USNYC – New York', feus: 240, pctOfTotal: 12.1, tone: 'error' },
  { name: 'Others', feus: 386, pctOfTotal: 19.5, tone: 'neutral' },
];

// ─── Top Consignees ──────────────────────────────────────────────
export const MOCK_TOP_CONSIGNEES: TopConsignee[] = [
  { name: 'ABC Importers Pvt Ltd', feus: 412, pctOfTotal: 20.7, tone: 'primary' },
  { name: 'Global Traders Inc.', feus: 365, pctOfTotal: 18.4, tone: 'success' },
  { name: 'Oceanic Logistics Ltd.', feus: 298, pctOfTotal: 15.0, tone: 'warning' },
  { name: 'Sunrise Exports', feus: 265, pctOfTotal: 13.4, tone: 'purple' },
  { name: 'Blue Sea Shipping Co.', feus: 233, pctOfTotal: 11.7, tone: 'error' },
];

// ─── Legacy dashboard API types (enhancedDashboard.jsp parity) ─────
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
  status: 'C' | 'D' | 'V' | 'I';
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

export const MOCK_DASHBOARD_COUNTS: DashboardCounts = {
  totCou: 8,
  bkConfirmed: 6,
  siPending: 2,
  payPending: 3,
  pendingAmount: 48320,
  orgCou: 1,
  inTransitCou: 2,
  delCou: 2,
};

export const MOCK_DASHBOARD_SHIPMENTS: DashboardShipment[] = [
  {
    id: '1', bookNo: 'LNRSG0082341', blNo: 'APLA20262341', onlineRefNo: 'ORN-2026-001',
    originPortId: 'SGSIN', originPortDesc: 'Singapore', finalPortId: 'NLRTM', finalPortDesc: 'Rotterdam',
    polAt: '2026-08-28', status: 'C', siNo: 'SI-001', containerNo: 'MSKU1234567', teus: '2', amtBal: 0, invNo: '', invAgency: '', filterKey: 'origin',
  },
  {
    id: '2', bookNo: 'LNRSG0082198', blNo: '', onlineRefNo: 'ORN-2026-002',
    originPortId: 'MYPKG', originPortDesc: 'Port Klang', finalPortId: 'DEHAM', finalPortDesc: 'Hamburg',
    polAt: '2026-08-27', status: 'C', siNo: '', containerNo: 'TCKU5678901', teus: '1', amtBal: 18500, invNo: 'INV-2026-002', invAgency: 'SMA01', filterKey: 'siPending',
  },
  {
    id: '3', bookNo: 'LNRSG0081977', blNo: 'APLA20261977', onlineRefNo: 'ORN-2026-003',
    originPortId: 'TWKHH', originPortDesc: 'Kaohsiung', finalPortId: 'USLAX', finalPortDesc: 'Los Angeles',
    polAt: '2026-08-10', status: 'I', siNo: 'SI-003', containerNo: 'CMAU7654321', teus: '4', amtBal: 0, invNo: '', invAgency: '', filterKey: 'inTransit',
  },
  {
    id: '4', bookNo: 'LNRSG0081854', blNo: 'APLA20261854', onlineRefNo: 'ORN-2026-004',
    originPortId: 'CNSHA', originPortDesc: 'Shanghai', finalPortId: 'GBFXT', finalPortDesc: 'Felixstowe',
    polAt: '2026-07-20', status: 'I', siNo: 'SI-004', containerNo: 'OOLU9988776', teus: '2', amtBal: 12400, invNo: 'INV-2026-004', invAgency: 'SMA01', filterKey: 'payPending',
  },
  {
    id: '5', bookNo: 'LNRSG0081702', blNo: 'APLA20261702', onlineRefNo: 'ORN-2026-005',
    originPortId: 'SGSIN', originPortDesc: 'Singapore', finalPortId: 'SAJED', finalPortDesc: 'Jeddah',
    polAt: '2026-06-15', status: 'C', siNo: 'SI-005', containerNo: 'TEMU1122334', teus: '3', amtBal: 0, invNo: '', invAgency: '', filterKey: 'delivered',
  },
  {
    id: '6', bookNo: 'LNRSG0081553', blNo: '', onlineRefNo: 'ORN-2026-006',
    originPortId: 'KRPUS', originPortDesc: 'Busan', finalPortId: 'USLGB', finalPortDesc: 'Long Beach',
    polAt: '2026-08-30', status: 'C', siNo: '', containerNo: 'HLXU4455667', teus: '1', amtBal: 17420, invNo: 'INV-2026-006', invAgency: 'SMA02', filterKey: 'siPending',
  },
  {
    id: '7', bookNo: 'LNRSG0081401', blNo: 'APLA20261401', onlineRefNo: 'ORN-2026-007',
    originPortId: 'LKCMB', originPortDesc: 'Colombo', finalPortId: 'BEANR', finalPortDesc: 'Antwerp',
    polAt: '2026-08-05', status: 'C', siNo: 'SI-007', containerNo: 'GESU7788990', teus: '2', amtBal: 0, invNo: '', invAgency: '', filterKey: 'inTransit',
  },
  {
    id: '8', bookNo: 'LNRSG0081299', blNo: 'APLA20261299', onlineRefNo: 'ORN-2026-008',
    originPortId: 'INNSA', originPortDesc: 'Nhava Sheva', finalPortId: 'AEDXB', finalPortDesc: 'Dubai',
    polAt: '2026-05-01', status: 'I', siNo: 'SI-008', containerNo: 'TCNU3344556', teus: '2', amtBal: 0, invNo: '', invAgency: '', filterKey: 'delivered',
  },
];

export const MOCK_BOOKING_CHART_DATA: BookingStatusChartItem[] = [];
export const MOCK_BL_CHART_DATA: BookingStatusChartItem[] = [];
export const MOCK_SI_CHART_DATA: BookingStatusChartItem[] = [];
export const MOCK_TOP_DESTINATIONS: TopDestinationItem[] = [];
export const MOCK_PORT_PAIRS: PortPairChartItem[] = [];
export const MOCK_UNCLEARED_CARGO: UnclearedCargoItem[] = [];
export const MOCK_UNCLEARED_DELIVERED = 0;
export const MOCK_UNCLEARED_REMAINING = 0;
export const MOCK_OUTSTANDING_BALANCE = 48320;

// ─── Rocket dashboard layout data ─────────────────────────────────
export interface DashboardStatCard {
  key: 'activeBookings' | 'inTransit' | 'pendingSiBl' | 'outstanding';
  label: string;
  value: string;
  subtitle: string;
}

export interface DashboardQuickAction {
  key: string;
  title: string;
  description: string;
  route: string;
}

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
  status: 'Confirmed' | 'SI Pending' | 'In Transit' | 'Pending' | 'B/L Issued' | 'Completed';
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

export const MOCK_DASHBOARD_STATS: DashboardStatCard[] = [
  { key: 'activeBookings', label: 'Active Bookings', value: '24', subtitle: '+3 this week' },
  { key: 'inTransit', label: 'Shipments In Transit', value: '11', subtitle: '2 arriving this week' },
  { key: 'pendingSiBl', label: 'Pending SI / BL', value: '5', subtitle: '2 overdue cutoff' },
  { key: 'outstanding', label: 'Outstanding Invoices', value: 'USD 48,320', subtitle: '3 invoices due' },
];

export const MOCK_DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [
  { key: 'newBooking', title: 'New Booking', description: 'Create a cargo booking', route: '/app/booking/new' },
  { key: 'trackShipment', title: 'Track a Shipment', description: 'Search by container or B/L', route: '/app/tracking' },
  { key: 'requestRate', title: 'Request a Rate', description: 'Get a freight quotation', route: '/app/rates' },
  { key: 'submitSi', title: 'Submit Shipping Instruction', description: 'File SI for confirmed booking', route: '/app/shipping-instruction' },
];

export const MOCK_RECENT_BOOKINGS: RecentBookingRow[] = [
  { id: '1', bookingNo: 'LNRSG0082341', vessel: 'MSC ANNA', voyage: '427E', pol: 'SGSIN', polName: 'Singapore', pod: 'NLRTM', podName: 'Rotterdam', etd: '25 Aug 2026', status: 'Confirmed' },
  { id: '2', bookingNo: 'LNRSG0082198', vessel: 'EVER GIVEN', voyage: '219W', pol: 'MYPKG', polName: 'Port Klang', pod: 'DEHAM', podName: 'Hamburg', etd: '27 Aug 2026', status: 'SI Pending' },
  { id: '3', bookingNo: 'LNRSG0081977', vessel: 'COSCO SHIPPING UNIVERSE', voyage: '304E', pol: 'TWKHH', polName: 'Kaohsiung', pod: 'USLAX', podName: 'Los Angeles', etd: '22 Aug 2026', status: 'In Transit' },
  { id: '4', bookingNo: 'LNRSG0081854', vessel: 'CMA CGM MARCO POLO', voyage: '118N', pol: 'CNSHA', polName: 'Shanghai', pod: 'GBFXT', podName: 'Felixstowe', etd: '19 Aug 2026', status: 'In Transit' },
  { id: '5', bookingNo: 'LNRSG0081702', vessel: 'MAERSK EINDHOVEN', voyage: '512W', pol: 'SGSIN', polName: 'Singapore', pod: 'SAJED', podName: 'Jeddah', etd: '30 Aug 2026', status: 'Pending' },
  { id: '6', bookingNo: 'LNRSG0081553', vessel: 'ONE COMMITMENT', voyage: '089E', pol: 'KRPUS', polName: 'Busan', pod: 'USLGB', podName: 'Long Beach', etd: '14 Aug 2026', status: 'B/L Issued' },
  { id: '7', bookingNo: 'LNRSG0081401', vessel: 'HAPAG LLOYD BERLIN', voyage: '231S', pol: 'LKCMB', polName: 'Colombo', pod: 'BEANR', podName: 'Antwerp', etd: '10 Aug 2026', status: 'Completed' },
];

export const MOCK_UPCOMING_SCHEDULES: UpcomingScheduleItem[] = [
  { id: '1', vessel: 'MSC ANNA', voyage: '427E', service: 'AEX-3', pol: 'SGSIN', pod: 'NLRTM', etd: '25 Aug 2026', cutoff: '23 Aug 2026' },
  { id: '2', vessel: 'EVER GIVEN', voyage: '219W', service: 'FEW-1', pol: 'MYPKG', pod: 'DEHAM', etd: '27 Aug 2026', cutoff: '24 Aug 2026', cutoffOverdue: true },
  { id: '3', vessel: 'MAERSK EINDHOVEN', voyage: '512W', service: 'ME-3', pol: 'SGSIN', pod: 'SAJED', etd: '30 Aug 2026', cutoff: '28 Aug 2026' },
  { id: '4', vessel: 'ONE COMMITMENT', voyage: '090E', service: 'PS-7', pol: 'KRPUS', pod: 'USLGB', etd: '02 Sep 2026', cutoff: '30 Aug 2026' },
];

export const MOCK_NOTICES: NoticeItem[] = [
  {
    id: '1',
    title: 'Port Congestion — Rotterdam (NLRTM)',
    body: 'Expected delays of 2–4 days for vessels arriving after 28 Aug. Plan SI submissions accordingly.',
    date: '20 Aug 2026',
  },
  {
    id: '2',
    title: 'Updated Hazmat Documentation Requirements',
    body: 'Effective 01 Sep 2026, all DG cargo requires pre-approval 72 hrs before cutoff.',
    date: '18 Aug 2026',
  },
  {
    id: '3',
    title: 'System Maintenance — 23 Aug 2026 02:00–04:00 SGT',
    body: 'Portal will be unavailable for scheduled maintenance. Please plan submissions in advance.',
    date: '15 Aug 2026',
  },
];
