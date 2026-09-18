// Modified by Sekar Nagarajan (2026-09-17 23:50)
// Container & Cargo Tracking Mock Data Service
// Parity with Tracking.jsp / TrackingDetails.jsp — container vs booking/BL result shape

import type {
  ContainerEquipment,
  ContainerMovementEvent,
  TrackingSearchResult,
  TrackingSearchType,
} from "../types/tracking.types";

/** China (Nansha / Xiamen) → Djibouti TS → onward lane waypoints for live map. */
const SHA_DJI_ROUTE = {
  pol: { lat: 22.65, lng: 113.68, label: "CNNAN" },
  waypoints: [
    { lat: 20.0, lng: 115.0, label: "S. China Sea" },
    { lat: 10.0, lng: 110.0, label: "Approaches" },
    { lat: 5.0, lng: 95.0, label: "Malacca" },
    { lat: 5.0, lng: 80.0, label: "Indian Ocean" },
    { lat: 8.0, lng: 60.0, label: "Arabian Sea" },
    { lat: 12.0, lng: 48.0, label: "Gulf of Aden" },
  ],
  pod: { lat: 11.61, lng: 43.14, label: "DJDJJ" },
} as const;

const LIVE_AIS = {
  lat: 12.0,
  lng: 48.0,
  speedKn: 12.4,
  headingDeg: 265,
  lastUpdate: "06-Aug-2026 03:00",
  locationLabel: "DJIBOUTI — Transshipment",
  source: "Satellite AIS (mock)",
} as const;

const BOOKING_NO = "BKG-2026-9901";
const BL_NO = "BL-SHA-88401";

function vesselEvent(
  partial: Omit<ContainerMovementEvent, "transportMode" | "isActual"> & {
    transportMode?: ContainerMovementEvent["transportMode"];
    isActual?: boolean;
  },
): ContainerMovementEvent {
  return {
    transportMode: "VESSEL",
    isActual: true,
    facility: "",
    ...partial,
  };
}

/** Primary container timeline — matches JSP-style event log sample. */
function buildPrimaryMovements(prefix: string): ContainerMovementEvent[] {
  return [
    vesselEvent({
      id: `${prefix}-ev5`,
      eventCode: "LOAD-TS",
      eventName: "LOAD TRANSHIPMENT",
      locationCode: "DJDJJ",
      locationName: "DJIBOUTI",
      facility: "Doraleh Multipurpose Port",
      eventDate: "06-Aug-2026 03:00",
      vesselCode: "FIRX",
      vesselName: "NEAPOLI",
      voyage: "02602",
      bound: "W",
      lat: 11.61,
      lng: 43.14,
    }),
    vesselEvent({
      id: `${prefix}-ev4`,
      eventCode: "DISC-TS",
      eventName: "DISCHARGE TRANSHIPMENT",
      locationCode: "DJDJJ",
      locationName: "DJIBOUTI",
      facility: "Doraleh Multipurpose Port",
      eventDate: "06-Aug-2026 00:00",
      vesselCode: "ARX",
      vesselName: "ZHENOVA",
      voyage: "02614",
      bound: "W",
      lat: 11.61,
      lng: 43.14,
    }),
    vesselEvent({
      id: `${prefix}-ev3`,
      eventCode: "LOAD",
      eventName: "LOAD FULL",
      locationCode: "CNNAN",
      locationName: "NANSHA, CHINA",
      facility: "Nansha Phase IV Terminal",
      eventDate: "06-Jun-2026 04:00",
      vesselCode: "ARX",
      vesselName: "ZHENOVA",
      voyage: "02614",
      bound: "W",
      lat: 22.65,
      lng: 113.68,
    }),
    {
      id: `${prefix}-ev2`,
      eventCode: "RECV",
      eventName: "RECEIVED FROM SHIPPER",
      locationCode: "CNNAN",
      locationName: "NANSHA, CHINA",
      facility: "Nansha Inland Depot",
      eventDate: "30-May-2026 00:01",
      vesselCode: "ARX",
      vesselName: "ZHENOVA",
      voyage: "02614",
      bound: "W",
      transportMode: "TRUCK",
      isActual: true,
      lat: 22.65,
      lng: 113.68,
    },
    {
      id: `${prefix}-ev1`,
      eventCode: "SENT",
      eventName: "SENT TO SHIPPER",
      locationCode: "CNXMN",
      locationName: "XIAMEN, CHINA",
      facility: "Xiamen Haicang Terminal",
      eventDate: "27-May-2026 00:01",
      vesselCode: "ARX",
      vesselName: "ZHENOVA",
      voyage: "02614",
      bound: "W",
      transportMode: "TRUCK",
      isActual: true,
      lat: 24.48,
      lng: 118.08,
    },
  ];
}

function buildSecondaryMovements(prefix: string): ContainerMovementEvent[] {
  return [
    vesselEvent({
      id: `${prefix}-ev3`,
      eventCode: "LOAD-TS",
      eventName: "LOAD TRANSHIPMENT",
      locationCode: "DJDJJ",
      locationName: "DJIBOUTI",
      facility: "Doraleh Multipurpose Port",
      eventDate: "06-Aug-2026 03:15",
      vesselCode: "FIRX",
      vesselName: "NEAPOLI",
      voyage: "02602",
      bound: "W",
      lat: 11.61,
      lng: 43.14,
    }),
    vesselEvent({
      id: `${prefix}-ev2`,
      eventCode: "DISC-TS",
      eventName: "DISCHARGE TRANSHIPMENT",
      locationCode: "DJDJJ",
      locationName: "DJIBOUTI",
      facility: "Doraleh Multipurpose Port",
      eventDate: "06-Aug-2026 00:20",
      vesselCode: "ARX",
      vesselName: "ZHENOVA",
      voyage: "02614",
      bound: "W",
      lat: 11.61,
      lng: 43.14,
    }),
    vesselEvent({
      id: `${prefix}-ev1`,
      eventCode: "LOAD",
      eventName: "LOAD FULL",
      locationCode: "CNNAN",
      locationName: "NANSHA, CHINA",
      facility: "Nansha Phase IV Terminal",
      eventDate: "06-Jun-2026 05:10",
      vesselCode: "ARX",
      vesselName: "ZHENOVA",
      voyage: "02614",
      bound: "W",
      lat: 22.65,
      lng: 113.68,
    }),
  ];
}

/** All containers on the shared booking / BL. */
const BOOKING_CONTAINERS: ContainerEquipment[] = [
  {
    containerNo: "SMLU8829102",
    containerType: "40HC",
    sealNo: "SLM-991823",
    tareWeightKg: 3900,
    payloadKg: 24500,
    latestActivity: "LOAD TRANSHIPMENT",
    activityLocation: "DJIBOUTI",
    activityDate: "06-Aug-2026 03:00",
    status: "IN_TRANSIT",
    movements: buildPrimaryMovements("c1"),
  },
  {
    containerNo: "SMLU4019283",
    containerType: "20DC",
    sealNo: "SLM-991824",
    tareWeightKg: 2300,
    payloadKg: 18200,
    latestActivity: "LOAD TRANSHIPMENT",
    activityLocation: "DJIBOUTI",
    activityDate: "06-Aug-2026 03:15",
    status: "IN_TRANSIT",
    movements: buildSecondaryMovements("c2"),
  },
  {
    containerNo: "SMLU5520199",
    containerType: "40HC",
    sealNo: "SLM-991825",
    tareWeightKg: 3900,
    payloadKg: 22100,
    latestActivity: "DISCHARGE TRANSHIPMENT",
    activityLocation: "DJIBOUTI",
    activityDate: "06-Aug-2026 00:20",
    status: "DISCHARGED",
    movements: buildSecondaryMovements("c3"),
  },
];

const SHARED_SHIPMENT: Omit<TrackingSearchResult, "searchKey" | "containers"> =
  {
    bookingNo: BOOKING_NO,
    blNo: BL_NO,
    polPortCode: "CNNAN",
    polPortName: "Nansha, China",
    polTerminal: "Nansha Phase IV Terminal",
    podPortCode: "DJDJJ",
    podPortName: "Djibouti",
    podTerminal: "Doraleh Multipurpose Port",
    vesselCode: "FIRX",
    vesselName: "NEAPOLI",
    voyage: "02602",
    bound: "W",
    etd: "06-Jun-2026 04:00",
    eta: "20-Aug-2026 08:00",
    actualEtd: "06-Jun-2026 04:00",
    progressPercent: 72,
    deadlines: {
      containerGateIn: "05-Jun-2026 18:00",
      siDocClosing: "04-Jun-2026 12:00",
      vgmClosing: "05-Jun-2026 12:00",
    },
    milestones: [
      {
        id: "m1",
        stepName: "Sent to Shipper",
        location: "Xiamen, China",
        timestamp: "27-May-2026 00:01",
        isCompleted: true,
        isCurrent: false,
        transportMode: "TRUCK",
      },
      {
        id: "m2",
        stepName: "Received from Shipper",
        location: "Nansha, China",
        timestamp: "30-May-2026 00:01",
        isCompleted: true,
        isCurrent: false,
        transportMode: "TRUCK",
      },
      {
        id: "m3",
        stepName: "Load Full",
        location: "Nansha, China",
        timestamp: "06-Jun-2026 04:00",
        isCompleted: true,
        isCurrent: false,
        transportMode: "VESSEL",
      },
      {
        id: "m4",
        stepName: "Discharge Transshipment",
        location: "Djibouti",
        timestamp: "06-Aug-2026 00:00",
        isCompleted: true,
        isCurrent: false,
        transportMode: "VESSEL",
      },
      {
        id: "m5",
        stepName: "Load Transshipment",
        location: "Djibouti",
        timestamp: "06-Aug-2026 03:00",
        isCompleted: true,
        isCurrent: true,
        transportMode: "VESSEL",
      },
      {
        id: "m6",
        stepName: "Arrival / Discharge",
        location: "Final POD",
        timestamp: "Est. 20-Aug-2026 08:00",
        isCompleted: false,
        isCurrent: false,
        transportMode: "VESSEL",
      },
    ],
    routeMap: {
      pol: { ...SHA_DJI_ROUTE.pol },
      waypoints: SHA_DJI_ROUTE.waypoints.map((w) => ({ ...w })),
      pod: { ...SHA_DJI_ROUTE.pod },
    },
    liveAis: { ...LIVE_AIS },
  };

function buildResult(
  searchKey: string,
  containers: ContainerEquipment[],
): TrackingSearchResult {
  return {
    ...SHARED_SHIPMENT,
    searchKey,
    containers: structuredClone(containers),
  };
}

function findContainer(containerNo: string): ContainerEquipment | undefined {
  const key = containerNo.trim().toUpperCase();
  return BOOKING_CONTAINERS.find((c) => c.containerNo.toUpperCase() === key);
}

/**
 * Mock tracking lookup.
 * - CONTAINER → single matching container
 * - BOOKING / BL → all containers on that shipment
 */
export async function fetchTrackingDetails(
  searchValue: string,
  searchType: TrackingSearchType = "CONTAINER",
): Promise<TrackingSearchResult | null> {
  await new Promise((res) => setTimeout(res, 350)); // simulated latency
  const key = searchValue.trim().toUpperCase();
  if (!key) return null;

  if (searchType === "CONTAINER") {
    const container = findContainer(key);
    if (!container) return null;
    return buildResult(container.containerNo, [container]);
  }

  if (searchType === "BOOKING") {
    if (key !== BOOKING_NO.toUpperCase()) return null;
    return buildResult(BOOKING_NO, BOOKING_CONTAINERS);
  }

  if (searchType === "BL") {
    if (key !== BL_NO.toUpperCase()) return null;
    return buildResult(BL_NO, BOOKING_CONTAINERS);
  }

  return null;
}

/** Quick-sample values for the search UI. */
export const TRACKING_MOCK_SAMPLES = {
  container: "SMLU8829102",
  booking: BOOKING_NO,
  bl: BL_NO,
} as const;
