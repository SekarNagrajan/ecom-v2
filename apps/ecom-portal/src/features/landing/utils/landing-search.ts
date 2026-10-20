// Modified by Sekar Nagarajan (2026-10-18 10:25)
/**
 * Pure helpers behind the three hero search tabs (schedules, tracking, rates): default lane and
 * equipment, label → code extraction, and the URL search parameters each module page consumes.
 *
 * Defaults follow the extracted data: INNSA → AEJEA is the lane the sampled bookings, schedules,
 * tariffs and contracts all cover, and 20DC is an active code in the equipment master.
 */
import dayjs from "dayjs";

import type { EquipmentType, PortOption } from "../types/landing.types";

export const DEFAULT_LANE = { pol: "INNSA", pod: "AEJEA" } as const;
export const DEFAULT_EQUIPMENT_CODE = "20DC";
export const SCHEDULE_WINDOW_DAYS = 14;
export const RATES_SHIPMENT_LEAD_DAYS = 7;

/**
 * Shared origin/delivery suggestions for landing Schedule tab + Schedules module.
 * Same lane family as DEFAULT_LANE and the VSS/Commercial showcase ports (not a separate CNSHA list).
 */
export const SCHEDULE_PORT_CODES = [
  "INNSA",
  "AEJEA",
  "INMUN",
  "SGSIN",
  "INMAA",
  "MYPKG",
  "AEDXB",
  "SADMM",
] as const;

/** "INNSA - NHAVA SHEVA,MUMBAI" → "INNSA"; a bare code passes through; blank → fallback. */
export function portCodeOf(value: string | null | undefined, fallback: string): string {
  const code = String(value ?? "").split(" - ")[0].trim().toUpperCase();
  return code || fallback;
}

/** Typeahead label for a port option. */
export const portLabelOf = (port: PortOption): string => port.label || `${port.portCode} - ${port.portName}`;

/** Option label for an equipment code: "20DC - STANDARD 20DC CONTAINER". */
export const equipmentLabelOf = (eqp: EquipmentType): string =>
  eqp.name && eqp.name.toUpperCase() !== eqp.code.toUpperCase() ? `${eqp.code} - ${eqp.name}` : eqp.code;

/** Picks the exact code match out of a typeahead result (the search also returns name matches). */
export function pickPortByCode(ports: PortOption[], code: string): PortOption | undefined {
  const wanted = code.trim().toUpperCase();
  return ports.find((p) => p.portCode.trim().toUpperCase() === wanted);
}

export interface ScheduleSearchInput {
  pol?: string;
  pod?: string;
  fromDate?: string;
  toDate?: string;
}

/** Parameters read by useSchedulesController (POINT_TO_POINT deep link). */
export function buildScheduleSearchParams(values: ScheduleSearchInput, today = dayjs()): Record<string, string> {
  const fromDate = values.fromDate || today.format("YYYY-MM-DD");
  const toDate = values.toDate || dayjs(fromDate).add(SCHEDULE_WINDOW_DAYS, "day").format("YYYY-MM-DD");
  return {
    pol: portCodeOf(values.pol, DEFAULT_LANE.pol),
    pod: portCodeOf(values.pod, DEFAULT_LANE.pod),
    fromDate,
    toDate: toDate < fromDate ? fromDate : toDate,
    schetype: "loginschedule",
  };
}

export interface TrackingSearchInput {
  searchType: "CONTAINER" | "BOOKING" | "BL";
  trackingNumber: string;
}

/** Parameters read by useTrackingController's deep-link bootstrap. */
export function buildTrackingSearchParams(values: TrackingSearchInput): Record<string, string> {
  const trackNo = values.trackingNumber.trim().toUpperCase();
  return {
    trackingNumber: trackNo,
    logintracno: trackNo,
    searchType: values.searchType,
    tracktype: "logintracking",
  };
}

export interface RatesSearchInput {
  pol?: string;
  pod?: string;
  equipmentType?: string;
  shipmentDate?: string;
}

/** Parameters read by useRatesController's deep-link bootstrap (equipment travels as the master code). */
export function buildRatesSearchParams(values: RatesSearchInput, today = dayjs()): Record<string, string> {
  const pol = portCodeOf(values.pol, DEFAULT_LANE.pol);
  const pod = portCodeOf(values.pod, DEFAULT_LANE.pod);
  const eqp = (values.equipmentType || DEFAULT_EQUIPMENT_CODE).trim();
  const shipmentDate = values.shipmentDate || today.add(RATES_SHIPMENT_LEAD_DAYS, "day").format("YYYY-MM-DD");
  return {
    pol,
    pod,
    ratepol: pol,
    ratepod: pod,
    eqpType: eqp,
    rateseqp: eqp,
    shipmentdate: shipmentDate,
    loginratetype: "loginratetype",
  };
}
