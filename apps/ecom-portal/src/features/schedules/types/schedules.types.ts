// Domain definitions for Vessel Schedules & Routes
// Parity with legacy eCommSchedules.jsp & SchedulebetweenlocationView.jsp
// Modified by sekar nagarajan (2026-08-21)

export type ScheduleSearchType = 'POINT_TO_POINT' | 'VESSEL_SCHEDULE' | 'PORT_SCHEDULE';

export interface ScheduleSearchParams {
  searchType: ScheduleSearchType;
  polCode?: string;
  podCode?: string;
  vesselCode?: string;
  portCode?: string;
  fromDate?: string;
  toDate?: string;
  dateType?: 'DEPARTURE' | 'ARRIVAL';
}

export interface RouteLeg {
  id: string;
  legType: 'Mainline' | 'Feeder' | 'Inland';
  vesselName: string;
  vesselCode: string;
  voyage: string;
  bound: string;
  serviceName: string;
  serviceCode: string;
  polPortId: string;
  polPortName: string;
  podPortId: string;
  podPortName: string;
  etd: string;
  eta: string;
  terminal?: string;
}

export interface CutOffDeadlines {
  containerGateIn: string; // LCT or Gate-in closing
  siDocClosing: string;    // SI / Document cutoff
  vgmClosing: string;      // VGM cutoff
}

export interface ScheduleItem {
  id: string;
  serviceCode: string;
  serviceName: string;
  isDefaultRoute: boolean;
  polPortId: string;
  polPortName: string;
  podPortId: string;
  podPortName: string;
  polTerminal: string;
  podTerminal: string;
  etd: string;
  eta: string;
  transitTimeDays: number;
  isDirect: boolean;
  transshipmentCount: number;
  isMultimodal: boolean;
  vesselName: string;
  vesselCode: string;
  voyage: string;
  bound: string;
  deadlines: CutOffDeadlines;
  legs: RouteLeg[];
  distanceKm: number;
  bookingAllowed: boolean;
}

export interface VesselParticulars {
  vesselName: string;
  vesselCode: string;
  callSign: string;
  vesselOperator: string;
  vesselOwner: string;
  vesselType: string;
  flag: string;
  portOfRegistry: string;
  builtYear: string;
  imoNumber: string;
  lengthOverall: string;
  teuNominal: string;
  grossTonnage: string;
  netTonnage: string;
  portCalls?: {
    portCode: string;
    portName: string;
    terminal: string;
    eta: string;
    etd: string;
    status: 'COMPLETED' | 'IN_PORT' | 'EXPECTED';
  }[];
}

export interface EquipmentRateConfig {
  size20ftQty: number;
  size20ftReefer: boolean;
  size40ftQty: number;
  size40ftReefer: boolean;
  size40hcQty: number;
  size40hcReefer: boolean;
  commodity: string;
}

export interface RateBreakdown {
  freightRate20ft: number;
  freightRate40ft: number;
  freightRate40hc: number;
  surcharges: {
    code: string;
    description: string;
    amountPerCont: number;
  }[];
  currency: string;
}

export interface CarbonCalculationResult {
  routeLabel: string;
  containerQty: number;
  weightTons: number;
  distanceKm: number;
  totalCo2eTons: number;
  ttwCo2eTons: number; // Tank to Wheel
  wttCo2eTons: number; // Well to Tank
}
