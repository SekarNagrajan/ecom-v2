// Modified by Sekar Nagarajan (2026-09-01 18:40)
// Container & Cargo Tracking Domain Types
// Parity with Struts TrackingVo, MovementDetailsVo, and TrackingActvityResult

export type TrackingSearchType = "CONTAINER" | "BOOKING" | "BL";

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
  transportMode?: "VESSEL" | "RAIL" | "TRUCK" | "BARGE";
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
  transportMode: "VESSEL" | "RAIL" | "TRUCK" | "BARGE";
  isActual: boolean;
  /** Optional mock coordinates for live-map event trail. */
  lat?: number;
  lng?: number;
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
  status: "IN_TRANSIT" | "DELIVERED" | "GATE_IN" | "LOADED" | "DISCHARGED";
  movements: ContainerMovementEvent[];
}

export interface TrackingRouteMapPoint {
  lat: number;
  lng: number;
  label?: string;
}

/** Mock-only POL → waypoints → POD geometry for the interactive live map. */
export interface TrackingRouteMap {
  pol: TrackingRouteMapPoint;
  pod: TrackingRouteMapPoint;
  waypoints?: TrackingRouteMapPoint[];
}

/** Mock AIS / satellite ping shown in the Live Map drawer. */
export interface TrackingLiveAisPosition {
  lat: number;
  lng: number;
  speedKn: number;
  headingDeg: number;
  lastUpdate: string;
  locationLabel: string;
  source: string;
}

export type TrackingAisStatus =
  | "underway"
  | "moored"
  | "anchored"
  | "restricted"
  | "arrived";

/** Shared mock + live AIS vessel payload for Leaflet map. */
export interface TrackingAisVessel {
  mmsi: string;
  name: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  status: TrackingAisStatus;
  dest: string;
  eta: string;
  type: string;
  trail?: [number, number][];
  /** True for the tracked shipment vessel (always kept from mock seed). */
  isPrimary?: boolean;
  from?: string;
  to?: string;
  /** Waypoints for great-circle densified path animation. */
  waypoints?: [number, number][];
  /** 0..1 progress along path at seed time. */
  progress?: number;
  /** Float index along densified path. */
  idx?: number;
  /** Fixed position for stationary vessels. */
  pos?: [number, number];
}

export interface TrackingAisPort {
  code: string;
  name: string;
  pos: [number, number];
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
  routeMap?: TrackingRouteMap;
  liveAis?: TrackingLiveAisPosition;
}
