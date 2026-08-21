// Container & Cargo Tracking Domain Types
// Parity with Struts TrackingVo, MovementDetailsVo, and TrackingActvityResult
// Modified by sekar nagarajan (2026-08-21)

export type TrackingSearchType = 'CONTAINER' | 'BOOKING' | 'BL';

export interface TrackingSearchParams {
  searchType: TrackingSearchType;
  searchValue: string;
}

export interface TrackingMilestone {
  id: string;
  stepName: string;
  location: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  transportMode?: 'VESSEL' | 'RAIL' | 'TRUCK' | 'BARGE';
}

export interface ContainerMovementEvent {
  id: string;
  eventCode: string;
  eventName: string;
  locationCode: string;
  locationName: string;
  facility: string;
  eventDate: string;
  vesselName?: string;
  voyage?: string;
  transportMode: 'VESSEL' | 'RAIL' | 'TRUCK' | 'BARGE';
  isActual: boolean;
}

export interface ContainerEquipment {
  containerNo: string;
  containerType: string;
  sealNo: string;
  tareWeightKg: number;
  payloadKg: number;
  latestActivity: string;
  activityLocation: string;
  activityDate: string;
  status: 'IN_TRANSIT' | 'DELIVERED' | 'GATE_IN' | 'LOADED' | 'DISCHARGED';
  movements: ContainerMovementEvent[];
}

export interface TrackingSearchResult {
  searchKey: string;
  bookingNo: string;
  blNo: string;
  polPortCode: string;
  polPortName: string;
  polTerminal: string;
  podPortCode: string;
  podPortName: string;
  podTerminal: string;
  vesselCode: string;
  vesselName: string;
  voyage: string;
  bound: string;
  etd: string;
  eta: string;
  actualEtd?: string;
  actualEta?: string;
  progressPercent: number;
  deadlines: {
    containerGateIn: string;
    siDocClosing: string;
    vgmClosing: string;
  };
  milestones: TrackingMilestone[];
  containers: ContainerEquipment[];
}
