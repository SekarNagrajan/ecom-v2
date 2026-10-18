// Modified by Sekar Nagarajan (2026-10-17 00:45)
import { describe, expect, it } from 'vitest';

import type { Row } from '../db';
import {
  buildDeadlines,
  buildVoyages,
  clockOffsetMs,
  cutoffFor,
  getVesselDetails,
  haversineKm,
  markDefaultRoute,
  previousWorkingDay,
  searchSchedules,
  type ScheduleTables,
} from './schedules.bridge';

/** Friday 16 Oct 2026, 09:00 local time — the clock every assertion below assumes. */
const NOW = new Date(2026, 9, 16, 9, 0);
const at = (d: number, h = 10, m = 10) => new Date(2026, m - 1, d, h, 0).toISOString();
const WEEK = 7 * 86_400_000;

const call = (vessel: string, voyage: string, service: string, type: string, port: string, terminal: string, callorder: number, arrdate: string, depdate: string, bound = 'W'): Row => ({
  header: '0', vessel, voyage, service, bound, port, terminal, callorder, arrdate, depdate, type, groupcallid: `GrpCall-${vessel}${callorder}`, status: 'N',
});

function sampleTables(): ScheduleTables {
  return {
    schedules: [
      // V1 SNA/FMSA06 mainline: INMUN → INNSA (in port now) → AEJEA → IQUQR; INNSA repeated under bound E (extract artefact)
      call('SNA', 'FMSA06', 'FMS', 'M', 'INMUN', 'INMUNTER01', 1, at(12), at(13)),
      call('SNA', 'FMSA06', 'FMS', 'M', 'INNSA', 'INNSABMCT0', 2, at(16, 6), at(17, 18)),
      call('SNA', 'FMSA06', 'FMS', 'M', 'INNSA', 'INNSABMCT0', 2, at(16, 6), at(17, 18), 'E'),
      call('SNA', 'FMSA06', 'FMS', 'M', 'AEJEA', 'AEJEA01', 3, at(20, 8), at(21, 20)),
      call('SNA', 'FMSA06', 'FMS', 'M', 'IQUQR', 'IQUQRTER1', 4, at(24), at(25)),
      // V2 RNR/4422 feeder: INNSA → SGSIN
      call('RNR', '4422', '8072', 'F', 'INNSA', 'INNSAGTI01', 1, at(18), at(19)),
      call('RNR', '4422', '8072', 'F', 'SGSIN', 'SGSINPSA01', 2, at(25), at(26)),
      // V3 KCA/K01 mainline: SGSIN → AEJEA (connects with V2 at SGSIN)
      call('KCA', 'K01', 'KCS', 'M', 'SGSIN', 'SGSINPSA01', 1, at(28), at(29, 12)),
      call('KCA', 'K01', 'KCS', 'M', 'AEJEA', 'AEJEA01', 2, at(3, 10, 11), at(4, 10, 11)),
      // V4 ACH/AP04 mainline, already sailed: INNSA → AEJEA
      call('ACH', 'AP04', 'EARC', 'M', 'INNSA', 'INNSABMCT0', 1, at(10), at(11, 9)),
      call('ACH', 'AP04', 'EARC', 'M', 'AEJEA', 'AEJEA01', 2, at(16, 8), at(17, 8)),
    ],
    portCalls: [
      { groupcallid: '1', servicecode: 'FMS', vesselcode: 'SNA', voyage: 'FMSA06', portcode: 'INMUN', callorder: 1, eosp: at(12, 9), pob: at(12, 9), allfastfwe: at(12, 11), startcargoops: at(12, 12), etd: at(13), pulloutfromberth: null },
      { groupcallid: '2', servicecode: 'FMS', vesselcode: 'SNA', voyage: 'FMSA06', portcode: 'INNSA', callorder: 2, eosp: at(16, 5), pob: at(16, 6), allfastfwe: at(16, 7), startcargoops: at(16, 8), etd: at(17, 18), pulloutfromberth: null },
    ],
    routes: [
      { routeid: 'R1', origin: 'INNSA', orgMode: '', BLPOL: 'INNSA', BLPOLSvc: 'FMS', OpsPol1: '', OpsPOLSVC1: '', OpsPol2: '', BlPod: 'AEJEA', delivery: 'AEJEA', DelMode: '', DefRoute: 'Y', MainSvc: 'FMS', priority1: 'N' },
      { routeid: 'R2', origin: 'INNSA', orgMode: '', BLPOL: 'INNSA', BLPOLSvc: '8072', OpsPol1: 'SGSIN', OpsPOLSVC1: 'KCS', OpsPol2: '', BlPod: 'AEJEA', delivery: 'AEJEA', DelMode: '', DefRoute: 'Y', MainSvc: 'KCS', priority1: 'N' },
      { routeid: 'R3', origin: 'INAMD', orgMode: 'T', BLPOL: 'INNSA', BLPOLSvc: 'FMS', OpsPol1: '', OpsPOLSVC1: '', OpsPol2: '', BlPod: 'AEJEA', delivery: 'AEJEA', DelMode: '', DefRoute: 'Y', MainSvc: 'FMS', priority1: 'N' },
    ],
    cutoffConfig: [
      { port: 'INNSA', terminal: 'INNSABMCT0', cfsclosing: 24, vgmclosing: 48, docclosing: 24, ediclosing: 24, fullcntrclosing: 72, excludeweekend: 'N' },
      { port: 'All', terminal: 'All', cfsclosing: 24, vgmclosing: 48, docclosing: 24, ediclosing: 24, fullcntrclosing: 24, excludeweekend: 'Y' },
    ],
    bookingLeg: [
      { ebookno: 'BKON1', leg_no: 1, bound: 'W', serviceCode: '8072', vesselCode: 'RNR', voyageCode: '4422', legTypeId: 'F', loadPortId: 'EGALY', loadTerminal: 'EGALYTER01', dischargePortId: 'AEJEA', dischargeTerminal: 'AEJEA01', etdDate: at(29), etaDate: at(3, 10, 11) },
    ],
  };
}

const run = (params: Parameters<typeof searchSchedules>[0], tables = sampleTables()) => searchSchedules(params, { now: NOW, tables });

describe('clockOffsetMs', () => {
  it('leaves a window that already covers today + 14 days alone', () => {
    expect(clockOffsetMs(sampleTables().schedules, NOW)).toBe(0);
  });

  it('moves a stale window forward by whole weeks so it starts shortly before today', () => {
    const stale = [call('X', '1', 'S', 'M', 'INNSA', 'T', 1, at(2, 10, 9), at(3, 10, 9)), call('X', '1', 'S', 'M', 'AEJEA', 'T', 2, at(8, 10, 10), at(9, 10, 10))];
    const offset = clockOffsetMs(stale, NOW);
    expect(offset % WEEK).toBe(0);
    const shiftedStart = +new Date(at(2, 10, 9)) + offset;
    expect(shiftedStart).toBeGreaterThanOrEqual(+new Date(2026, 9, 2));
    expect(shiftedStart).toBeLessThanOrEqual(+new Date(2026, 9, 10));
  });
});

describe('buildVoyages', () => {
  it('groups calls by vessel + voyage and drops the per-bound duplicates', () => {
    const voyages = buildVoyages(sampleTables().schedules, 0);
    expect([...voyages.keys()].sort()).toEqual(['ACH|AP04', 'KCA|K01', 'RNR|4422', 'SNA|FMSA06']);
    const v1 = voyages.get('SNA|FMSA06')!;
    expect(v1.map(c => c.port)).toEqual(['INMUN', 'INNSA', 'AEJEA', 'IQUQR']);
    expect(v1[1].bound).toBe('W');
  });
});

describe('cut-offs', () => {
  it('resolves port + terminal, then port + All, then All + All', () => {
    const cutoffs: Row[] = [...sampleTables().cutoffConfig, { port: 'INNSA', terminal: 'All', fullcntrclosing: 10, docclosing: 10, vgmclosing: 10, excludeweekend: 'N' }];
    expect(cutoffFor(cutoffs, 'INNSA', 'INNSABMCT0')?.fullcntrclosing).toBe(72);
    expect(cutoffFor(cutoffs, 'innsa', 'OTHER')?.fullcntrclosing).toBe(10);
    expect(cutoffFor(cutoffs, 'AEJEA', 'AEJEA01')?.terminal).toBe('All');
    expect(cutoffFor([], 'AEJEA', 'AEJEA01')).toBeUndefined();
  });

  it('subtracts the configured hours from ETD and moves weekend deadlines to Friday when excludeweekend = Y', () => {
    const etd = new Date(2026, 9, 19, 10, 0).getTime(); // Monday
    const plain = buildDeadlines(sampleTables().cutoffConfig[0], etd);
    expect(plain).toMatchObject({ containerGateIn: '2026-10-16 10:00', siDocClosing: '2026-10-18 10:00', vgmClosing: '2026-10-17 10:00' });
    const weekend = buildDeadlines(sampleTables().cutoffConfig[1], etd);
    expect(weekend).toMatchObject({ containerGateIn: '2026-10-16 10:00', siDocClosing: '2026-10-16 10:00', vgmClosing: '2026-10-16 10:00' });
    const fallback = buildDeadlines(undefined, etd);
    expect(fallback.containerGateIn).toBe('2026-10-17 10:00');
    expect(previousWorkingDay(new Date(2026, 9, 18, 10).getTime())).toBe(new Date(2026, 9, 16, 10).getTime());
    expect(previousWorkingDay(new Date(2026, 9, 14, 10).getTime())).toBe(new Date(2026, 9, 14, 10).getTime());
  });
});

describe('haversineKm', () => {
  it('measures the great-circle distance', () => {
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })).toBe(0);
    expect(Math.round(haversineKm({ lat: 18.57, lng: 72.58 }, { lat: 25, lng: 55.02 }))).toBeGreaterThan(1800);
    expect(Math.round(haversineKm({ lat: 18.57, lng: 72.58 }, { lat: 25, lng: 55.02 }))).toBeLessThan(2100);
  });
});

describe('searchSchedules POINT_TO_POINT', () => {
  it('returns direct sailings plus one-transhipment combinations through a Routedetail hub', () => {
    const items = run({ searchType: 'POINT_TO_POINT', polCode: 'INNSA', podCode: 'AEJEA' });
    expect(items.map(i => `${i.vesselCode}/${i.voyage}:${i.transshipmentCount}`)).toEqual(['ACH/AP04:0', 'SNA/FMSA06:0', 'KCA/K01:1']);
    const direct = items[1];
    expect(direct).toMatchObject({ isDirect: true, etd: '2026-10-17 18:00', eta: '2026-10-20 08:00', transitTimeDays: 3, bound: 'W', serviceCode: 'FMS', polPortId: 'INNSA', podPortId: 'AEJEA', isMultimodal: false });
    expect(direct.legs).toHaveLength(1);
    expect(direct.legs[0]).toMatchObject({ legType: 'Mainline', vesselCode: 'SNA', polPortId: 'INNSA', podPortId: 'AEJEA' });
    const ts = items[2];
    expect(ts.legs.map(l => `${l.legType}:${l.polPortId}>${l.podPortId}`)).toEqual(['Feeder:INNSA>SGSIN', 'Mainline:SGSIN>AEJEA']);
    expect(ts).toMatchObject({ isDirect: false, vesselCode: 'KCA', serviceCode: 'KCS', etd: '2026-10-19 10:00', eta: '2026-11-03 10:00', transitTimeDays: 15 });
    expect(ts.distanceKm).toBeGreaterThan(0);
    expect(ts.id).not.toBe(direct.id);
  });

  it('flags one recommended itinerary (earliest direct sailing whose service is a default route)', () => {
    const items = run({ searchType: 'POINT_TO_POINT', polCode: 'INNSA', podCode: 'AEJEA' });
    expect(items.filter(i => i.isDefaultRoute).map(i => i.vesselCode)).toEqual(['SNA']);
    const priority = markDefaultRoute(items.map(i => ({ ...i, isDefaultRoute: false })), [{ BLPOL: 'INNSA', BlPod: 'AEJEA', BLPOLSvc: '8072', OpsPol1: 'SGSIN', priority1: 'Y', DefRoute: 'Y' }]);
    expect(priority.filter(i => i.isDefaultRoute).map(i => i.vesselCode)).toEqual(['KCA']);
  });

  it('applies cut-offs from ecom_cutoffconfig and allows booking only before ETD and the earliest deadline', () => {
    const items = run({ searchType: 'POINT_TO_POINT', polCode: 'INNSA', podCode: 'AEJEA' });
    const sailed = items[0];
    expect(sailed.bookingAllowed).toBe(false);
    const sna = items[1]; // INNSABMCT0 row: 72 h gate-in already passed
    expect(sna.deadlines).toEqual({ containerGateIn: '2026-10-14 18:00', siDocClosing: '2026-10-16 18:00', vgmClosing: '2026-10-15 18:00' });
    expect(sna.bookingAllowed).toBe(false);
    const rnr = items[2]; // INNSAGTI01 → All/All row with excludeweekend: Sat/Sun deadlines move to Friday
    expect(rnr.deadlines).toEqual({ containerGateIn: '2026-10-16 10:00', siDocClosing: '2026-10-16 10:00', vgmClosing: '2026-10-16 10:00' });
    expect(rnr.bookingAllowed).toBe(true);
  });

  it('honours the date window on departure or arrival', () => {
    expect(run({ searchType: 'POINT_TO_POINT', polCode: 'INNSA', podCode: 'AEJEA', fromDate: '2026-10-16', toDate: '2026-10-30' }).map(i => i.vesselCode)).toEqual(['SNA', 'KCA']);
    expect(run({ searchType: 'POINT_TO_POINT', polCode: 'INNSA', podCode: 'AEJEA', fromDate: '2026-10-19', toDate: '2026-10-20', dateType: 'ARRIVAL' }).map(i => i.vesselCode)).toEqual(['SNA']);
    expect(run({ searchType: 'POINT_TO_POINT', polCode: 'INNSA - NHAVA SHEVA', podCode: 'aejea' })).toHaveLength(3);
  });

  it('resolves an inland origin from Routedetail and prepends an inland leg', () => {
    const items = run({ searchType: 'POINT_TO_POINT', polCode: 'INAMD', podCode: 'AEJEA' });
    expect(items).toHaveLength(3);
    expect(items[1]).toMatchObject({ polPortId: 'INAMD', isMultimodal: true });
    expect(items[1].legs[0]).toMatchObject({ legType: 'Inland', vesselName: 'Truck', polPortId: 'INAMD', podPortId: 'INNSA' });
    expect(items[1].legs[1].legType).toBe('Mainline');
  });

  it('falls back to the sampled booking legs when the VSS sample has no sailing for the lane', () => {
    const items = run({ searchType: 'POINT_TO_POINT', polCode: 'EGALY', podCode: 'AEJEA' });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ vesselCode: 'RNR', voyage: '4422', polPortId: 'EGALY', podPortId: 'AEJEA', isDirect: true, isDefaultRoute: true });
    expect(items[0].legs[0].legType).toBe('Feeder');
    expect(run({ searchType: 'POINT_TO_POINT', polCode: 'XXXXX', podCode: 'YYYYY' })).toEqual([]);
  });
});

describe('searchSchedules VESSEL_SCHEDULE / PORT_SCHEDULE', () => {
  it('lists every consecutive port pair of the vessel', () => {
    const items = run({ searchType: 'VESSEL_SCHEDULE', vesselCode: 'sna' });
    expect(items.map(i => `${i.polPortId}>${i.podPortId}`)).toEqual(['INMUN>INNSA', 'INNSA>AEJEA', 'AEJEA>IQUQR']);
    expect(items.every(i => i.vesselCode === 'SNA' && i.isDirect)).toBe(true);
    expect(run({ searchType: 'VESSEL_SCHEDULE', vesselCode: 'ZZZZ9' })).toEqual([]);
  });

  it('lists the calls at a port with the onward (or arriving) sailing and filters on the call dates', () => {
    const items = run({ searchType: 'PORT_SCHEDULE', portCode: 'AEJEA' });
    expect(items.map(i => `${i.vesselCode}:${i.polPortId}>${i.podPortId}`)).toEqual(['ACH:INNSA>AEJEA', 'SNA:AEJEA>IQUQR', 'KCA:SGSIN>AEJEA']);
    expect(run({ searchType: 'PORT_SCHEDULE', portCode: 'AEJEA', fromDate: '2026-10-20', toDate: '2026-10-20', dateType: 'ARRIVAL' }).map(i => i.vesselCode)).toEqual(['SNA']);
  });
});

describe('getVesselDetails', () => {
  it('builds the port-call sequence with statuses from arrival_master actuals or the schedule clock', () => {
    const vessel = getVesselDetails('sna', { now: NOW, tables: sampleTables() });
    expect(vessel).not.toBeNull();
    expect(vessel!.vesselCode).toBe('SNA');
    expect(vessel!.portCalls!.map(c => `${c.portCode}:${c.status}`)).toEqual(['INMUN:COMPLETED', 'INNSA:IN_PORT', 'AEJEA:EXPECTED', 'IQUQR:EXPECTED']);
    expect(vessel!.portCalls![1]).toMatchObject({ eta: '2026-10-16 06:00', etd: '2026-10-17 18:00' });
  });

  it('returns null for a code unknown to the vessel master and the schedules', () => {
    expect(getVesselDetails('ZZZZ9', { now: NOW, tables: sampleTables() })).toBeNull();
    expect(getVesselDetails('', { now: NOW, tables: sampleTables() })).toBeNull();
  });
});

describe('real fixtures (src/mocks/fixtures)', () => {
  it('answers the demo lanes, a fixture vessel and a port schedule', () => {
    const lane = searchSchedules({ searchType: 'POINT_TO_POINT', polCode: 'INNSA', podCode: 'AEJEA' });
    expect(lane.length).toBeGreaterThan(0);
    expect(lane.some(i => i.isDirect)).toBe(true);
    expect(lane.filter(i => i.isDefaultRoute)).toHaveLength(1);
    expect(lane.every(i => i.polPortId === 'INNSA' && i.podPortId === 'AEJEA' && i.legs.length >= 1)).toBe(true);
    const bookable = lane.filter(i => i.bookingAllowed);
    expect(bookable.length).toBeGreaterThan(0);
    const today = new Date();
    const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const landing = searchSchedules({ searchType: 'POINT_TO_POINT', polCode: 'INNSA', podCode: 'AEJEA', fromDate: iso(today), toDate: iso(new Date(today.getTime() + 14 * 86_400_000)) });
    expect(landing.length).toBeGreaterThan(0);
    expect(searchSchedules({ searchType: 'VESSEL_SCHEDULE', vesselCode: 'SNA' }).length).toBeGreaterThan(0);
    expect(searchSchedules({ searchType: 'PORT_SCHEDULE', portCode: 'AEJEA' }).length).toBeGreaterThan(0);
    const vessel = getVesselDetails('SNA');
    expect(vessel?.vesselName).toBeTruthy();
    expect(vessel?.portCalls?.length).toBeGreaterThan(0);
  });
});
