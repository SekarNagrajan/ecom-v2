// Modified by Sekar Nagarajan (2026-08-26 18:43)
/**
 * Mock sailings for booking Select Vessel/Route popup.
 * Parity: ebookRoutingDetails / eBookingRouteDetails (incl. TS / multimodal module details).
 */
import type { BookingRouteLeg, SelectedRoute } from "../types/booking.types";

export interface BookingRoutingSearchParams {
  origin: string;
  delivery: string;
  cargoReadyDate: string;
}

/** Pull UN/LOCODE-style port code from "USNYC" or "USNYC - New York, USA". */
export function extractPortCode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const code = trimmed.split(/[\s-]/)[0] ?? trimmed;
  return code.trim().toUpperCase();
}

function addDays(isoDate: string, days: number): string {
  const base = isoDate ? new Date(`${isoDate}T12:00:00Z`) : new Date();
  base.setUTCDate(base.getUTCDate() + days);
  const y = base.getUTCFullYear();
  const m = String(base.getUTCMonth() + 1).padStart(2, "0");
  const d = String(base.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateTime(isoDate: string, time: string): string {
  return `${isoDate} ${time}`;
}

/** Pick a plausible TS hub that is neither POL nor POD. */
function pickTsHub(pol: string, pod: string): string {
  const hubs = ["NLRTM", "SGSIN", "AEJEA", "CNSHA", "DEHAM"];
  return hubs.find((h) => h !== pol && h !== pod) ?? "NLRTM";
}

export function buildMockBookingRoutes(
  params: BookingRoutingSearchParams,
): SelectedRoute[] {
  const pol = extractPortCode(params.origin) || "USNYC";
  const pod = extractPortCode(params.delivery) || "SGSIN";
  const ready = params.cargoReadyDate || new Date().toISOString().slice(0, 10);
  const tsHub = pickTsHub(pol, pod);

  const etd1 = addDays(ready, 4);
  const eta1 = addDays(ready, 26);
  const etd2 = addDays(ready, 7);
  const eta2Ts = addDays(ready, 16);
  const etd2b = addDays(ready, 18);
  const eta2 = addDays(ready, 32);
  const etd3Inland = addDays(ready, 9);
  const eta3Inland = addDays(ready, 10);
  const etd3a = addDays(ready, 11);
  const eta3a = addDays(ready, 20);
  const etd3b = addDays(ready, 22);
  const eta3 = addDays(ready, 38);

  const directLegs: BookingRouteLeg[] = [
    {
      id: `LEG-${pol}-${pod}-D1`,
      legType: "Mainline",
      vesselName: "ANTIGRAVITY EXPRESS",
      vesselCode: "AGEX",
      voyage: "024",
      bound: "E",
      serviceName: "Far East Express 1",
      serviceCode: "FE1",
      polPortId: pol,
      polPortName: pol,
      podPortId: pod,
      podPortName: pod,
      etd: formatDateTime(etd1, "18:00"),
      eta: formatDateTime(eta1, "06:00"),
      terminal: `${pol} Main Terminal`,
    },
  ];

  const tsLegs: BookingRouteLeg[] = [
    {
      id: `LEG-${pol}-${tsHub}-T1`,
      legType: "Mainline",
      vesselName: "SOLVERMINDS VOYAGER",
      vesselCode: "SMVY",
      voyage: "109",
      bound: "W",
      serviceName: "Atlantic Connect",
      serviceCode: "AUE",
      polPortId: pol,
      polPortName: pol,
      podPortId: tsHub,
      podPortName: tsHub,
      etd: formatDateTime(etd2, "14:00"),
      eta: formatDateTime(eta2Ts, "08:00"),
      terminal: `${pol} East Berth`,
    },
    {
      id: `LEG-${tsHub}-${pod}-T2`,
      legType: "Feeder",
      vesselName: "PACIFIC HARBOR II",
      vesselCode: "PH02",
      voyage: "044",
      bound: "E",
      serviceName: "Euro-Asia Shuttle",
      serviceCode: "EAS",
      polPortId: tsHub,
      polPortName: tsHub,
      podPortId: pod,
      podPortName: pod,
      etd: formatDateTime(etd2b, "12:00"),
      eta: formatDateTime(eta2, "10:00"),
      terminal: `${tsHub} Transshipment Yard`,
    },
  ];

  const multimodalLegs: BookingRouteLeg[] = [
    {
      id: `LEG-${pol}-INL-M1`,
      legType: "Inland",
      vesselName: "Truck / Rail haul",
      vesselCode: "INL",
      voyage: "",
      bound: "",
      serviceName: "Inland haulage",
      serviceCode: "",
      polPortId: pol,
      polPortName: `${pol} Inland depot`,
      podPortId: pol,
      podPortName: pol,
      etd: formatDateTime(etd3Inland, "08:00"),
      eta: formatDateTime(eta3Inland, "18:00"),
      terminal: `${pol} Inland depot`,
    },
    {
      id: `LEG-${pol}-${tsHub}-M2`,
      legType: "Mainline",
      vesselName: "INDIAN GULF LINER",
      vesselCode: "IGLN",
      voyage: "051",
      bound: "E",
      serviceName: "India Gulf Link",
      serviceCode: "IND",
      polPortId: pol,
      polPortName: pol,
      podPortId: tsHub,
      podPortName: tsHub,
      etd: formatDateTime(etd3a, "09:00"),
      eta: formatDateTime(eta3a, "16:00"),
      terminal: `${pol} Feeder Yard`,
    },
    {
      id: `LEG-${tsHub}-${pod}-M3`,
      legType: "Feeder",
      vesselName: "Feeder",
      vesselCode: "FDR1",
      voyage: "012",
      bound: "E",
      serviceName: "Coastal Feeder",
      serviceCode: "CF1",
      polPortId: tsHub,
      polPortName: tsHub,
      podPortId: pod,
      podPortName: pod,
      etd: formatDateTime(etd3b, "10:00"),
      eta: formatDateTime(eta3, "12:00"),
      terminal: `${tsHub} Feeder berth`,
    },
  ];

  return [
    {
      routeId: `RT-${pol}-${pod}-001`,
      serviceCode: "FE1",
      serviceName: "Far East Express 1",
      vesselCode: "AGEX",
      vesselName: "ANTIGRAVITY EXPRESS",
      voyage: "024",
      bound: "E",
      polPortId: pol,
      polPortName: pol,
      podPortId: pod,
      podPortName: pod,
      polTerminal: `${pol} Main Terminal`,
      podTerminal: `${pod} Main Terminal`,
      etd: formatDateTime(etd1, "18:00"),
      eta: formatDateTime(eta1, "06:00"),
      transitTimeDays: 22,
      isDirect: true,
      isDefaultRoute: true,
      transshipmentCount: 0,
      shipmentKind: "Direct",
      gateInCutoff: formatDateTime(addDays(etd1, -2), "22:00"),
      siDocCutoff: formatDateTime(addDays(etd1, -2), "16:00"),
      vgmCutoff: formatDateTime(addDays(etd1, -2), "18:00"),
      legs: directLegs,
    },
    {
      routeId: `RT-${pol}-${pod}-002`,
      serviceCode: "AUE",
      serviceName: "Atlantic Connect",
      vesselCode: "SMVY",
      vesselName: "SOLVERMINDS VOYAGER",
      voyage: "109",
      bound: "W",
      polPortId: pol,
      polPortName: pol,
      podPortId: pod,
      podPortName: pod,
      polTerminal: `${pol} East Berth`,
      podTerminal: `${pod} West Berth`,
      etd: formatDateTime(etd2, "14:00"),
      eta: formatDateTime(eta2, "10:00"),
      transitTimeDays: 25,
      isDirect: false,
      isDefaultRoute: false,
      transshipmentCount: 1,
      shipmentKind: "Transshipment",
      gateInCutoff: formatDateTime(addDays(etd2, -2), "20:00"),
      siDocCutoff: formatDateTime(addDays(etd2, -2), "14:00"),
      vgmCutoff: formatDateTime(addDays(etd2, -2), "16:00"),
      legs: tsLegs,
    },
    {
      routeId: `RT-${pol}-${pod}-003`,
      serviceCode: "IND",
      serviceName: "India Gulf Link",
      vesselCode: "IGLN",
      vesselName: "INDIAN GULF LINER",
      voyage: "051",
      bound: "E",
      polPortId: pol,
      polPortName: pol,
      podPortId: pod,
      podPortName: pod,
      polTerminal: `${pol} Feeder Yard`,
      podTerminal: `${pod} PSA Terminal`,
      etd: formatDateTime(etd3a, "09:00"),
      eta: formatDateTime(eta3, "12:00"),
      transitTimeDays: 27,
      isDirect: false,
      isDefaultRoute: false,
      transshipmentCount: 2,
      shipmentKind: "Multimodal",
      gateInCutoff: formatDateTime(addDays(etd3a, -3), "18:00"),
      siDocCutoff: formatDateTime(addDays(etd3a, -3), "12:00"),
      vgmCutoff: formatDateTime(addDays(etd3a, -3), "15:00"),
      legs: multimodalLegs,
    },
  ];
}
