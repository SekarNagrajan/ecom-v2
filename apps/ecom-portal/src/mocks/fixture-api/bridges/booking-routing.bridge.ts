// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Sailings for the Select Vessel/Route popup:
 *  1. ecombooking_leg itineraries (when the sample booked that lane)
 *  2. VSS allschedules_ecom via searchSchedules (Commercial / Rates showcase port pairs)
 *
 * Vessel, service and port names resolve through the vessels / services / ports masters.
 */
import type { BookingRouteLeg, SelectedRoute } from '../../../features/booking/types/booking.types';
import { mapScheduleToSelectedRoute } from '../../../features/booking/utils/map-schedule-to-master-details';
import { db, type Row } from '../db';
import { groupBy } from './booking-list.bridge';
import { daysBetween, extractPortCode, str, toDateTimeMinute } from './booking-shared.bridge';
import { portName, serviceName, vesselName } from './masters.bridge';
import { searchSchedules } from './schedules.bridge';

export interface BookingRoutingSearchParams {
  origin: string;
  delivery: string;
  cargoReadyDate: string;
}

/** ecombooking_leg.legTypeId → wizard leg type. */
export const LEG_TYPE: Record<string, BookingRouteLeg['legType']> = {
  M: 'Mainline',
  F: 'Feeder',
  T: 'Inland', // truck
  R: 'Inland', // rail
  B: 'Inland', // barge
};

const legType = (code: unknown): BookingRouteLeg['legType'] => LEG_TYPE[str(code).toUpperCase()] ?? 'Vessel';

const INLAND_VESSEL_NAME = 'Truck / Rail haul';

export function mapLeg(l: Row): BookingRouteLeg {
  const type = legType(l.legTypeId);
  const vesselCode = str(l.vesselCode);
  const pol = str(l.loadPortId).toUpperCase();
  const pod = str(l.dischargePortId).toUpperCase();
  return {
    id: `LEG-${str(l.ebookno)}-${str(l.leg_no) || '1'}`,
    legType: type,
    vesselName: (vesselCode && vesselName(vesselCode)) || (type === 'Inland' ? INLAND_VESSEL_NAME : 'TBN'),
    vesselCode,
    voyage: str(l.voyageCode),
    bound: str(l.bound) || str(l.dbound),
    serviceName: serviceName(str(l.serviceCode)),
    serviceCode: str(l.serviceCode),
    polPortId: pol,
    polPortName: portName(pol),
    podPortId: pod,
    podPortName: portName(pod),
    etd: toDateTimeMinute(l.etdDate),
    eta: toDateTimeMinute(l.etaDate),
    terminal: str(l.loadTerminal),
  };
}

const byLegNo = (a: Row, b: Row) => Number(a.leg_no ?? 0) - Number(b.leg_no ?? 0);

/** One SelectedRoute from the legs of a single booking (sorted by leg_no) and its cut-off row. */
export function buildRoute(ebookno: string, legRows: Row[], cutoff: Row | null | undefined): SelectedRoute | null {
  const sorted = [...legRows].sort(byLegNo);
  const legs = sorted.map(mapLeg);
  if (legs.length === 0) return null;
  const first = legs[0];
  const last = legs[legs.length - 1];
  const sea = legs.filter(l => l.legType !== 'Inland');
  const main = sea.find(l => l.legType === 'Mainline') ?? sea[0] ?? first;
  const hasInland = legs.some(l => l.legType === 'Inland');
  const shipmentKind: SelectedRoute['shipmentKind'] =
    legs.length === 1 ? 'Direct' : hasInland ? 'Multimodal' : 'Transshipment';
  const transshipmentCount = Math.max(0, sea.length - 1);
  return {
    routeId: `RT-${ebookno}`,
    serviceCode: main.serviceCode || 'N/A',
    serviceName: main.serviceName || main.serviceCode || 'N/A',
    vesselCode: main.vesselCode || 'TBN',
    vesselName: main.vesselName,
    voyage: main.voyage || 'N/A',
    bound: main.bound || 'N/A',
    polPortId: first.polPortId,
    polPortName: first.polPortName,
    podPortId: last.podPortId,
    podPortName: last.podPortName,
    polTerminal: first.terminal,
    podTerminal: str(sorted[sorted.length - 1]?.dischargeTerminal),
    etd: first.etd,
    eta: last.eta,
    transitTimeDays: daysBetween(first.etd, last.eta),
    isDirect: legs.length === 1,
    isDefaultRoute: false,
    transshipmentCount,
    shipmentKind,
    gateInCutoff: toDateTimeMinute(cutoff?.bkgCutoff) || undefined,
    siDocCutoff: toDateTimeMinute(cutoff?.docCutoff) || undefined,
    vgmCutoff: toDateTimeMinute(cutoff?.vgmCutoff) || undefined,
    legs,
  };
}

/** Itinerary signature used to collapse identical sailings booked more than once. */
const routeKey = (r: SelectedRoute) =>
  (r.legs ?? []).map(l => `${l.polPortId}>${l.podPortId}:${l.vesselCode}/${l.voyage}@${l.etd}`).join('|');

/** Every distinct route in the leg rows, oldest ETD first. */
export function routesFromLegs(legs: Row[], cutoffs: Row[]): SelectedRoute[] {
  const legsByBooking = groupBy(legs, 'ebookno');
  const cutoffByBooking = groupBy(cutoffs, 'ebookno');
  const seen = new Set<string>();
  const out: SelectedRoute[] = [];
  for (const [key, rows] of legsByBooking) {
    const ebookno = str(rows[0]?.ebookno);
    const route = buildRoute(ebookno, rows, cutoffByBooking.get(key)?.[0]);
    if (!route) continue;
    const sig = routeKey(route);
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(route);
  }
  return out.sort((a, b) => a.etd.localeCompare(b.etd));
}

/**
 * Routes for a POL/POD search. Exact lane first; when the sample has none, routes touching either port;
 * when still none, every sampled route (legacy demo fallback).
 * Sailings departing on/after the cargo-ready date are preferred; the earliest is flagged as default.
 */
export function selectRoutes(all: SelectedRoute[], params: BookingRoutingSearchParams): SelectedRoute[] {
  const pol = extractPortCode(params.origin);
  const pod = extractPortCode(params.delivery);
  const exact = all.filter(r => r.polPortId === pol && r.podPortId === pod);
  const touching = all.filter(r => (r.legs ?? []).some(l => l.polPortId === pol || l.podPortId === pod));
  const candidates = exact.length ? exact : touching.length ? touching : all;
  const ready = params.cargoReadyDate?.trim();
  const upcoming = ready ? candidates.filter(r => r.etd.slice(0, 10) >= ready) : candidates;
  const chosen = upcoming.length ? upcoming : candidates;
  return chosen.map((r, i) => ({ ...r, isDefaultRoute: i === 0 }));
}

/** VSS point-to-point sailings for the lane, mapped into SelectedRoute (same shape as booking legs). */
export function routesFromSchedules(params: BookingRoutingSearchParams): SelectedRoute[] {
  const pol = extractPortCode(params.origin);
  const pod = extractPortCode(params.delivery);
  if (!pol || !pod) return [];
  const ready = params.cargoReadyDate?.trim();
  const items = searchSchedules({
    searchType: 'POINT_TO_POINT',
    polCode: pol,
    podCode: pod,
    fromDate: ready || undefined,
  });
  return items.map(mapScheduleToSelectedRoute);
}

/**
 * Prefer exact booking-leg itineraries for the lane; otherwise VSS schedules for that POL→POD.
 * Avoids showing unrelated sample routes when Commercial has a tariff but no ecom booking on the lane.
 */
export function fixtureBookingRoutes(params: BookingRoutingSearchParams): SelectedRoute[] {
  const pol = extractPortCode(params.origin);
  const pod = extractPortCode(params.delivery);
  const fromLegs = selectRoutes(routesFromLegs(db.bookingLeg, db.bookingConf), params);
  const exactLegs = fromLegs.filter(r => r.polPortId === pol && r.podPortId === pod);
  if (exactLegs.length) return exactLegs;

  const fromSchedules = routesFromSchedules(params);
  if (fromSchedules.length) {
    return fromSchedules.map((r, i) => ({ ...r, isDefaultRoute: i === 0 }));
  }

  return fromLegs;
}
