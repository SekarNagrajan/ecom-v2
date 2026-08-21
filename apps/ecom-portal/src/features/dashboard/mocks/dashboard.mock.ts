// Extended mock data for the rich logistics dashboard design
// Parity: enhancedDashboard.jsp + shipping intelligence business logic
// Modified by sekar nagarajan (2026-08-21)

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
  color: string;
}

export interface TopConsignee {
  name: string;
  feus: number;
  pctOfTotal: number;
  color: string;
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
  { name: 'BDCGP – Chittagong', feus: 512, pctOfTotal: 25.8, color: '#1677ff' },
  { name: 'INNSA – Nhava Sheva', feus: 358, pctOfTotal: 18.0, color: '#52c41a' },
  { name: 'CNSHA – Shanghai', feus: 298, pctOfTotal: 15.0, color: '#faad14' },
  { name: 'SGSIN – Singapore', feus: 238, pctOfTotal: 12.0, color: '#f5222d' },
  { name: 'CNYTN – Yantian', feus: 198, pctOfTotal: 10.0, color: '#722ed1' },
  { name: 'Others', feus: 382, pctOfTotal: 19.2, color: '#d9d9d9' },
];

export const MOCK_INTELLIGENCE_BY_POL: IntelligenceBreakdown[] = [
  { name: 'BDCGP – Chittagong', feus: 490, pctOfTotal: 24.7, color: '#1677ff' },
  { name: 'CNSHA – Shanghai', feus: 380, pctOfTotal: 19.1, color: '#52c41a' },
  { name: 'SGSIN – Singapore', feus: 310, pctOfTotal: 15.6, color: '#faad14' },
  { name: 'NLRTM – Rotterdam', feus: 215, pctOfTotal: 10.8, color: '#f5222d' },
  { name: 'Others', feus: 591, pctOfTotal: 29.8, color: '#d9d9d9' },
];

export const MOCK_INTELLIGENCE_BY_POD: IntelligenceBreakdown[] = [
  { name: 'LKCMB – Colombo', feus: 620, pctOfTotal: 31.2, color: '#1677ff' },
  { name: 'AEDXB – Dubai', feus: 420, pctOfTotal: 21.1, color: '#52c41a' },
  { name: 'SGSIN – Singapore', feus: 320, pctOfTotal: 16.1, color: '#faad14' },
  { name: 'USNYC – New York', feus: 240, pctOfTotal: 12.1, color: '#f5222d' },
  { name: 'Others', feus: 386, pctOfTotal: 19.5, color: '#d9d9d9' },
];

// ─── Top Consignees ──────────────────────────────────────────────
export const MOCK_TOP_CONSIGNEES: TopConsignee[] = [
  { name: 'ABC Importers Pvt Ltd', feus: 412, pctOfTotal: 20.7, color: '#1677ff' },
  { name: 'Global Traders Inc.', feus: 365, pctOfTotal: 18.4, color: '#52c41a' },
  { name: 'Oceanic Logistics Ltd.', feus: 298, pctOfTotal: 15.0, color: '#faad14' },
  { name: 'Sunrise Exports', feus: 265, pctOfTotal: 13.4, color: '#722ed1' },
  { name: 'Blue Sea Shipping Co.', feus: 233, pctOfTotal: 11.7, color: '#f5222d' },
];
