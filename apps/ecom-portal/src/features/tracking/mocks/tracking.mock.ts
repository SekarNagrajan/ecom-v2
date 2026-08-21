// Container & Cargo Tracking Mock Data Service
// Parity with Tracking.jsp and TrackingDetails.jsp backend logic
// Modified by Antigravity (2026-08-21)

import type { TrackingSearchResult } from '../types/tracking.types';

export const MOCK_TRACKING_RESULTS: Record<string, TrackingSearchResult> = {
  // Mock Result 1: Container Search
  SMLU8829102: {
    searchKey: 'SMLU8829102',
    bookingNo: 'BKG-2026-9901',
    blNo: 'BL-NYC-88401',
    polPortCode: 'USNYC',
    polPortName: 'New York (Port of NY & NJ)',
    polTerminal: 'APM Terminals Port Elizabeth',
    podPortCode: 'SGSIN',
    podPortName: 'Singapore (Port of Singapore)',
    podTerminal: 'PSA Pasir Panjang Terminal',
    vesselCode: 'AGEX',
    vesselName: 'ANTIGRAVITY EXPRESS',
    voyage: '024E',
    bound: 'East',
    etd: '2026-09-02 18:00',
    eta: '2026-09-24 06:00',
    actualEtd: '2026-09-02 19:15',
    progressPercent: 65,
    deadlines: {
      containerGateIn: '2026-09-01 17:00',
      siDocClosing: '2026-08-31 12:00',
      vgmClosing: '2026-09-01 12:00',
    },
    milestones: [
      { id: 'm1', stepName: 'Gate In (POL)', location: 'New York, USNYC', timestamp: '2026-08-31 14:30', isCompleted: true, isCurrent: false, transportMode: 'TRUCK' },
      { id: 'm2', stepName: 'Loaded on Vessel', location: 'New York, USNYC', timestamp: '2026-09-02 10:15', isCompleted: true, isCurrent: false, transportMode: 'VESSEL' },
      { id: 'm3', stepName: 'Vessel Departure', location: 'New York, USNYC', timestamp: '2026-09-02 19:15', isCompleted: true, isCurrent: false, transportMode: 'VESSEL' },
      { id: 'm4', stepName: 'Ocean Transport', location: 'North Atlantic / Suez Canal', timestamp: 'In Transit', isCompleted: true, isCurrent: true, transportMode: 'VESSEL' },
      { id: 'm5', stepName: 'Discharge at POD', location: 'Singapore, SGSIN', timestamp: 'Est. 2026-09-24 06:00', isCompleted: false, isCurrent: false, transportMode: 'VESSEL' },
      { id: 'm6', stepName: 'Gate Out / Delivered', location: 'Singapore, SGSIN', timestamp: 'Pending', isCompleted: false, isCurrent: false, transportMode: 'TRUCK' },
    ],
    containers: [
      {
        containerNo: 'SMLU8829102',
        containerType: '40FT High Cube Dry',
        sealNo: 'SLM-991823',
        tareWeightKg: 3820,
        payloadKg: 24500,
        latestActivity: 'Ocean Vessel In-Transit',
        activityLocation: 'Suez Maritime Transit Zone',
        activityDate: '2026-09-14 08:30',
        status: 'IN_TRANSIT',
        movements: [
          { id: 'ev1', eventCode: 'GTIN', eventName: 'Gate In Full Container', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-08-31 14:30', transportMode: 'TRUCK', isActual: true },
          { id: 'ev2', eventCode: 'LOAD', eventName: 'Loaded Container on Board', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-09-02 10:15', vesselName: 'ANTIGRAVITY EXPRESS', voyage: '024E', transportMode: 'VESSEL', isActual: true },
          { id: 'ev3', eventCode: 'VDPT', eventName: 'Vessel Departed Origin Port', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-09-02 19:15', vesselName: 'ANTIGRAVITY EXPRESS', voyage: '024E', transportMode: 'VESSEL', isActual: true },
          { id: 'ev4', eventCode: 'POSN', eventName: 'AIS Satellite Position Ping', locationCode: 'EGSUE', locationName: 'Suez Maritime Transit Zone', facility: 'Suez Canal Transit', eventDate: '2026-09-14 08:30', vesselName: 'ANTIGRAVITY EXPRESS', voyage: '024E', transportMode: 'VESSEL', isActual: true },
        ],
      },
      {
        containerNo: 'SMLU4019283',
        containerType: '20FT Standard Dry',
        sealNo: 'SLM-991824',
        tareWeightKg: 2200,
        payloadKg: 18200,
        latestActivity: 'Ocean Vessel In-Transit',
        activityLocation: 'Suez Maritime Transit Zone',
        activityDate: '2026-09-14 08:30',
        status: 'IN_TRANSIT',
        movements: [
          { id: 'ev11', eventCode: 'GTIN', eventName: 'Gate In Full Container', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-08-31 15:10', transportMode: 'TRUCK', isActual: true },
          { id: 'ev12', eventCode: 'LOAD', eventName: 'Loaded Container on Board', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-09-02 11:00', vesselName: 'ANTIGRAVITY EXPRESS', voyage: '024E', transportMode: 'VESSEL', isActual: true },
          { id: 'ev13', eventCode: 'VDPT', eventName: 'Vessel Departed Origin Port', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-09-02 19:15', vesselName: 'ANTIGRAVITY EXPRESS', voyage: '024E', transportMode: 'VESSEL', isActual: true },
        ],
      },
    ],
  },

  // Mock Result 2: Booking / BL Search
  'BKG-2026-9901': {
    searchKey: 'BKG-2026-9901',
    bookingNo: 'BKG-2026-9901',
    blNo: 'BL-NYC-88401',
    polPortCode: 'USNYC',
    polPortName: 'New York (Port of NY & NJ)',
    polTerminal: 'APM Terminals Port Elizabeth',
    podPortCode: 'SGSIN',
    podPortName: 'Singapore (Port of Singapore)',
    podTerminal: 'PSA Pasir Panjang Terminal',
    vesselCode: 'AGEX',
    vesselName: 'ANTIGRAVITY EXPRESS',
    voyage: '024E',
    bound: 'East',
    etd: '2026-09-02 18:00',
    eta: '2026-09-24 06:00',
    actualEtd: '2026-09-02 19:15',
    progressPercent: 65,
    deadlines: {
      containerGateIn: '2026-09-01 17:00',
      siDocClosing: '2026-08-31 12:00',
      vgmClosing: '2026-09-01 12:00',
    },
    milestones: [
      { id: 'm1', stepName: 'Gate In (POL)', location: 'New York, USNYC', timestamp: '2026-08-31 14:30', isCompleted: true, isCurrent: false, transportMode: 'TRUCK' },
      { id: 'm2', stepName: 'Loaded on Vessel', location: 'New York, USNYC', timestamp: '2026-09-02 10:15', isCompleted: true, isCurrent: false, transportMode: 'VESSEL' },
      { id: 'm3', stepName: 'Vessel Departure', location: 'New York, USNYC', timestamp: '2026-09-02 19:15', isCompleted: true, isCurrent: false, transportMode: 'VESSEL' },
      { id: 'm4', stepName: 'Ocean Transport', location: 'North Atlantic / Suez Canal', timestamp: 'In Transit', isCompleted: true, isCurrent: true, transportMode: 'VESSEL' },
      { id: 'm5', stepName: 'Discharge at POD', location: 'Singapore, SGSIN', timestamp: 'Est. 2026-09-24 06:00', isCompleted: false, isCurrent: false, transportMode: 'VESSEL' },
      { id: 'm6', stepName: 'Gate Out / Delivered', location: 'Singapore, SGSIN', timestamp: 'Pending', isCompleted: false, isCurrent: false, transportMode: 'TRUCK' },
    ],
    containers: [
      {
        containerNo: 'SMLU8829102',
        containerType: '40FT High Cube Dry',
        sealNo: 'SLM-991823',
        tareWeightKg: 3820,
        payloadKg: 24500,
        latestActivity: 'Ocean Vessel In-Transit',
        activityLocation: 'Suez Maritime Transit Zone',
        activityDate: '2026-09-14 08:30',
        status: 'IN_TRANSIT',
        movements: [
          { id: 'ev1', eventCode: 'GTIN', eventName: 'Gate In Full Container', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-08-31 14:30', transportMode: 'TRUCK', isActual: true },
          { id: 'ev2', eventCode: 'LOAD', eventName: 'Loaded Container on Board', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-09-02 10:15', vesselName: 'ANTIGRAVITY EXPRESS', voyage: '024E', transportMode: 'VESSEL', isActual: true },
          { id: 'ev3', eventCode: 'VDPT', eventName: 'Vessel Departed Origin Port', locationCode: 'USNYC', locationName: 'New York Port Terminal', facility: 'APM Terminals', eventDate: '2026-09-02 19:15', vesselName: 'ANTIGRAVITY EXPRESS', voyage: '024E', transportMode: 'VESSEL', isActual: true },
        ],
      },
    ],
  },
};

export async function fetchTrackingDetails(searchValue: string): Promise<TrackingSearchResult | null> {
  await new Promise((res) => setTimeout(res, 400));
  const key = searchValue.trim().toUpperCase();
  return MOCK_TRACKING_RESULTS[key] || MOCK_TRACKING_RESULTS['SMLU8829102'];
}
