// Modified by Sekar Nagarajan (2026-10-17 00:40)
import { describe, expect, it } from 'vitest';

import { ciRow, type Row } from '../db';
import { formatListDate } from './format';
import {
  buildMilestones,
  buildMovements,
  buildRouteMap,
  buildTrackingResult,
  collectContainers,
  cutoffHours,
  emptyTrackingTables,
  fillLegDatesFromSchedules,
  fixtureTrackingResult,
  progressPercent,
  resolveTrackingReference,
  shipmentFacts,
  shipmentLegs,
  trackingSampleReferences,
  vesselPosition,
  type TrackingTables,
} from './tracking.bridge';

/** Saturday 17 Oct 2026, noon local time — the clock every assertion below assumes. */
const NOW = new Date(2026, 9, 17, 12, 0);
const iso = (m: number, d: number, h = 10) => new Date(2026, m - 1, d, h, 0).toISOString();
const local = (m: number, d: number, h = 10) => formatListDate(new Date(2026, m - 1, d, h, 0));

/**
 * One e-commerce booking (BKON7312 / SVMDMU2694105) sailing INNSA → AEJEA on 29 Oct with an SI + B/L and two
 * units in operationDetail, one transhipment booking (SVM2) INNSA → SGSIN → AEJEA that sailed in January, and
 * one agency-only booking (AE1) whose unit DV20TNB1 is re-used by the newer SVMDMU2694105.
 */
function tables(): TrackingTables {
  const t = emptyTrackingTables();
  t.bookings = [
    ciRow({ ebookno: 'BKON7312', extBookNo: 'SVMDMU2694105', ebook_status: 'A', originPortId: 'INNSA', loadPortId: 'INNSA', dischargePortId: 'AEJEA', finalPortId: 'AEJEA', submitted_date: iso(10, 16, 18), datecr: iso(10, 16, 18), dateup: iso(10, 16, 19), pickup_point: ' ' }),
    ciRow({ ebookno: 'BKON7313', extBookNo: null, ebook_status: 'S', originPortId: 'INNSA', loadPortId: 'INNSA', dischargePortId: 'AEJEA', finalPortId: 'AEJEA', submitted_date: iso(10, 16, 23), datecr: iso(10, 16, 23), dateup: iso(10, 16, 23) }),
  ];
  t.bookingCargo = [
    ciRow({ ebookno: 'BKON7312', conid: 1, containerno: null, eqpSize: '20RE', tareWeight: 5200 }),
    ciRow({ ebookno: 'BKON7313', conid: 1, containerno: 'RE20TNB1', eqpSize: 'RE20', tareWeight: 3200, cargoWeight: 2546 }),
  ];
  t.bookingLeg = [
    ciRow({ ebookno: 'BKON7313', leg_no: 1, bound: 'W', serviceCode: '8072', vesselCode: 'RNR', voyageCode: '4422', legTypeId: 'F', loadPortId: 'INNSA', loadTerminal: 'INNSABMCT0', dischargePortId: 'AEJEA', dischargeTerminal: 'AEJEA01', etdDate: iso(10, 29), etaDate: iso(11, 3) }),
  ];
  t.shippingInstructions = [
    ciRow({ eSINo: 'SIREQ3095', blno: 'EPIRINDMUM69602', bookno: 'SVMDMU2694105', Vessel: 'RNR', Voyage: 'EVER GREEN 4422W', bound: 'W', pol: 'INNSA', pod: 'AEJEA', blversion: 1, ChgDate: iso(10, 16, 13) }),
  ];
  t.siCargo = [
    ciRow({ eSINo: 'SIREQ3095', containerno: 'DETS0001702', eqpSize: '20RE', carrierSeal: 'SI-SEAL', tareWeight: 5200, cargoWeight: 2400 }),
    ciRow({ eSINo: 'SIREQ3095', containerno: 'AASU1205200', eqpSize: '20DC', tareWeight: 2301, cargoWeight: 3400 }),
  ];
  t.vgm = [ciRow({ book_no: 'SVMDMU2694105', bl_no: null, eqpid: 'DETS0001702', eqptype: '20RE', Datecr: iso(10, 17, 9) })];
  t.lrpBookings = [
    ciRow({ book_no: 'SVMDMU2694105', status: 'C', serviceCode: '8072', vesselCode: 'RNR', voyageCode: '4422', bound: 'W', originPortId: 'INNSA', finalPortId: 'AEJEA', loadPortId: 'INNSA', dischargePortId: 'AEJEA', polTerminal: 'INNSABMCT0', podTerminal: 'AEJEA01', polAt: iso(10, 29), podAt: iso(11, 3), bookDate: iso(10, 16, 18), datecr: iso(10, 16, 18) }),
    ciRow({ book_no: 'SVM2', status: 'C', serviceCode: '8072', vesselCode: 'SIXT', voyageCode: '54356', bound: 'W', originPortId: 'INNSA', finalPortId: 'AEJEA', loadPortId: 'INNSA', dischargePortId: 'AEJEA', polTerminal: 'INNSABMCT0', podTerminal: 'AEJEADPA00', polAt: iso(1, 21), podAt: iso(1, 27), bookDate: iso(1, 21, 9), datecr: iso(1, 21, 9) }),
    ciRow({ book_no: 'AE1', status: 'C', serviceCode: 'AEX', vesselCode: 'WEWE', voyageCode: '122', bound: 'S', originPortId: 'AEJEA', finalPortId: 'SGSIN', loadPortId: 'AEJEA', dischargePortId: 'SGSIN', polTerminal: 'AEJEA03', podTerminal: 'SGSIN02', polAt: iso(8, 11), podAt: iso(8, 19), bookDate: iso(8, 11, 9), datecr: iso(8, 11, 9) }),
  ];
  t.lrpBookingLegs = [
    ciRow({ book_no: 'SVMDMU2694105', leg_no: 1, bound: 'W', serviceCode: '8072', vesselCode: 'RNR', voyageCode: '4422', legTypeId: 'F', loadPortId: 'INNSA', dischargePortId: 'AEJEA', polTerminal: 'INNSABMCT0', podTerminal: 'AEJEA01', etdDate: iso(10, 29), etaDate: iso(11, 3) }),
    ciRow({ book_no: 'SVM2', leg_no: 2, bound: 'W', serviceCode: '8072', vesselCode: 'PGFV', voyageCode: '76556', legTypeId: 'F', loadPortId: 'SGSIN', dischargePortId: 'AEJEA', polTerminal: 'N', podTerminal: 'N', etdDate: iso(1, 26), etaDate: iso(1, 27) }),
    ciRow({ book_no: 'SVM2', leg_no: 1, bound: 'W', serviceCode: '8072', vesselCode: 'SIXT', voyageCode: '54356', legTypeId: 'F', loadPortId: 'INNSA', dischargePortId: 'SGSIN', polTerminal: 'N', podTerminal: 'N', etdDate: iso(1, 21), etaDate: iso(1, 22) }),
  ];
  t.lrpBookingCargo = [
    ciRow({ book_no: 'SVMDMU2694105', eqpId: 'AASU1205200', eqpTypeId: '20DC', seal1No: 'CS24', tareWeight: 2301, cargoWeight: 3400, pickupDate: null, GateInClearanceDate: null }),
    ciRow({ book_no: 'SVMDMU2694105', eqpId: 'DETS0001702', eqpTypeId: '20RE', seal1No: '258633', tareWeight: 5200, cargoWeight: 2400, pickupDate: iso(10, 14, 8), GateInClearanceDate: null }),
    ciRow({ book_no: 'SVMDMU2694105', eqpId: 'DV20TNB1', eqpTypeId: 'DV20', seal1No: '', tareWeight: 2300, cargoWeight: 1000 }),
    ciRow({ book_no: 'SVM2', eqpId: '20DCTNB1', eqpTypeId: '20DC', seal1No: '', tareWeight: 2301, cargoWeight: 26400 }),
    ciRow({ book_no: 'AE1', eqpId: 'DV20TNB1', eqpTypeId: '20DC', seal1No: '12344', tareWeight: 2500, cargoWeight: 678 }),
  ];
  t.lrpBl = [
    ciRow({ bl_no: 'EPIRINDMUM69602', book_no: 'SVMDMU2694105', status: 'D', vesselCode: 'RNR', voyageCode: '4422', bound: 'W', loadPortId: 'INNSA', dischargePortId: 'AEJEA', polAt: iso(10, 29), podAt: iso(11, 3), OnboardDate: iso(10, 29), printedOriginals: 0, isvoyageclosed: 'N', datecr: iso(10, 16, 20), dateup: iso(10, 16, 20) }),
    ciRow({ bl_no: 'AE1', book_no: 'AE1', status: 'C', vesselCode: 'WEWE', voyageCode: '122', bound: 'S', loadPortId: 'AEJEA', dischargePortId: 'SGSIN', polAt: iso(8, 11), podAt: iso(8, 19), OnboardDate: iso(8, 11), printedOriginals: 3, isvoyageclosed: 'Y', datecr: iso(8, 11, 10), dateup: iso(8, 20) }),
  ];
  t.lrpBlCargo = [
    ciRow({ bl_no: 'EPIRINDMUM69602', eqpId: 'AASU1205200', eqpTypeId: '20DC', seal1No: 'CS24', tareWeight: 2301, cargoWeight: 3400 }),
    ciRow({ bl_no: 'AE1', eqpId: 'DV20TNB1', eqpTypeId: '20DC', seal1No: '12344', tareWeight: 2500, cargoWeight: 678 }),
  ];
  t.containerMoves = [
    ciRow({ OperationDNo: 1, ContainerNo: 'AASU1205200', EquipmentType: '20DC', containerStatus: 'F', bookNo: 'SVMDMU2694105', opspol: 'INNSA', opspolTerminal: 'INNSABMCT0', opspod: 'AEJEA', opspodTerminal: 'AEJEA01', VesselCode: 'RNR', Voyage: '4422', ServiceCode: '8072', Bound: 'W', SealNo: null, Wt: null, OprType: 'Export', status: 'O', nxtStatus: 'O', mode: 'F', actDate: null, datecr: iso(10, 16, 19), dateup: iso(10, 16, 19) }),
    ciRow({ OperationDNo: 2, ContainerNo: 'DETS0001702', EquipmentType: '20RE', containerStatus: 'F', bookNo: 'SVMDMU2694105', opspol: 'INNSA', opspolTerminal: 'INNSABMCT0', opspod: 'AEJEA', opspodTerminal: 'AEJEA01', VesselCode: 'RNR', Voyage: '4422', ServiceCode: '8072', Bound: 'W', SealNo: null, Wt: null, OprType: 'Export', status: 'O', nxtStatus: 'O', mode: 'M', actDate: iso(10, 15, 9), datecr: iso(10, 16, 19), dateup: iso(10, 16, 19) }),
    ciRow({ OperationDNo: 3, ContainerNo: 'DETS0001702', EquipmentType: '20RE', containerStatus: 'F', bookNo: 'SVMDMU2694105', opspol: 'INNSA', opspolTerminal: 'INNSABMCT0', opspod: 'AEJEA', opspodTerminal: 'AEJEA01', VesselCode: 'RNR', Voyage: '4422', ServiceCode: '8072', Bound: 'W', SealNo: null, Wt: null, OprType: 'Export', status: 'O', nxtStatus: 'O', mode: 'F', actDate: null, datecr: iso(10, 16, 20), dateup: iso(10, 16, 20) }),
  ];
  t.schedules = [
    ciRow({ vessel: 'RNR', voyage: '4422-W', service: '8072', bound: 'W', port: 'INNSA', terminal: 'INNSABMCT0', callorder: 1, arrdate: iso(10, 28), depdate: iso(10, 29, 14) }),
    ciRow({ vessel: 'RNR', voyage: '4422-W', service: '8072', bound: 'W', port: 'AEJEA', terminal: 'AEJEA01', callorder: 2, arrdate: iso(11, 3, 16), depdate: iso(11, 4) }),
  ];
  t.portCalls = [
    ciRow({ vesselcode: 'SIXT', voyage: '54356-W', portcode: 'INNSA', callorder: 1, eosp: iso(1, 20), allfastfwe: iso(1, 20, 14), etd: iso(1, 21), pulloutfromberth: iso(1, 21, 13) }),
    ciRow({ vesselcode: 'PGFV', voyage: '76556-W', portcode: 'AEJEA', callorder: 2, eosp: iso(1, 27, 6), allfastfwe: iso(1, 27, 9), etd: iso(1, 28), pulloutfromberth: null }),
  ];
  t.cutoffConfig = [
    ciRow({ port: 'INNSA', terminal: 'INNSABMCT0', fullcntrclosing: 72, docclosing: 24, vgmclosing: 48, status: null }),
    ciRow({ port: 'INNSA', terminal: 'All', fullcntrclosing: 72, docclosing: 72, vgmclosing: 72, status: null }),
    ciRow({ port: 'All', terminal: 'All', fullcntrclosing: 48, docclosing: 24, vgmclosing: 48, status: null }),
  ];
  t.trackingMovementCodes = [
    ciRow({ ecomcode: 'STS  ', activitycode: 'DSM  ' }),
    ciRow({ ecomcode: 'RFS  ', activitycode: 'OBF  ' }),
    ciRow({ ecomcode: 'LOF  ', activitycode: 'LDF  ' }),
    ciRow({ ecomcode: 'DIF  ', activitycode: 'DIF  ' }),
    ciRow({ ecomcode: 'LOT  ', activitycode: 'DTE  ' }),
    ciRow({ ecomcode: 'DIT  ', activitycode: 'LTF  ' }),
  ];
  return t;
}

describe('tracking bridge — reference resolution', () => {
  it('finds a booking by agency number, online reference or B/L and lands on the same shipment', () => {
    const t = tables();
    const byAgency = resolveTrackingReference('BOOKING', 'svmdmu2694105', t)!;
    const byOnline = resolveTrackingReference('BOOKING', 'BKON7312', t)!;
    const byBl = resolveTrackingReference('BL', 'EPIRINDMUM69602', t)!;
    for (const ref of [byAgency, byOnline, byBl]) {
      expect(ref.bookingNos).toEqual(['SVMDMU2694105', 'BKON7312']);
      expect(ref.lrpBooking?.book_no).toBe('SVMDMU2694105');
      expect(ref.si?.eSINo).toBe('SIREQ3095');
      expect(ref.lrpBl?.bl_no).toBe('EPIRINDMUM69602');
      expect(ref.blNo).toBe('EPIRINDMUM69602');
    }
    expect(byOnline.searchKey).toBe('BKON7312');
    expect(byBl.containerNo).toBeNull();
  });

  it('resolves an e-commerce booking that has no agency number yet', () => {
    const ref = resolveTrackingReference('BOOKING', 'BKON7313', tables())!;
    expect(ref.bookingNos).toEqual(['BKON7313']);
    expect(ref.lrpBooking).toBeNull();
    expect(ref.booking?.ebookno).toBe('BKON7313');
  });

  it('resolves an agency B/L whose number equals the booking number', () => {
    const ref = resolveTrackingReference('BL', 'AE1', tables())!;
    expect(ref.bookingNos).toEqual(['AE1']);
    expect(ref.lrpBl?.status).toBe('C');
  });

  it('picks the most recent shipment for a re-used container and filters to that unit', () => {
    const ref = resolveTrackingReference('CONTAINER', 'dv20tnb1', tables())!;
    expect(ref.bookingNos[0]).toBe('SVMDMU2694105');
    expect(ref.containerNo).toBe('DV20TNB1');
    const only = collectContainers(ref, tables());
    expect(only.map(c => c.containerNo)).toEqual(['DV20TNB1']);
  });

  it('finds a container known only through the SI / VGM tables', () => {
    const t = tables();
    t.lrpBookingCargo = t.lrpBookingCargo.filter(c => c.eqpId !== 'DETS0001702');
    t.containerMoves = [];
    expect(resolveTrackingReference('CONTAINER', 'DETS0001702', t)?.bookingNos[0]).toBe('SVMDMU2694105');
  });

  it('returns null for unknown or blank references', () => {
    expect(resolveTrackingReference('BOOKING', 'BKG-2026-9901', tables())).toBeNull();
    expect(resolveTrackingReference('BL', 'BL-SHA-88401', tables())).toBeNull();
    expect(resolveTrackingReference('CONTAINER', 'SMLU8829102', tables())).toBeNull();
    expect(resolveTrackingReference('CONTAINER', '   ', tables())).toBeNull();
  });
});

describe('tracking bridge — legs, timings and deadlines', () => {
  it('orders LRP legs by leg_no and maps R/T legs to rail/truck', () => {
    const t = tables();
    t.lrpBookingLegs.push(ciRow({ book_no: 'SVM2', leg_no: 0, legTypeId: 'R', vesselCode: '', voyageCode: '', loadPortId: 'INHYD', dischargePortId: 'INNSA', etdDate: iso(1, 19), etaDate: iso(1, 20) }));
    const legs = shipmentLegs(resolveTrackingReference('BOOKING', 'SVM2', t)!, t);
    expect(legs.map(l => [l.legNo, l.mode, l.pol, l.pod])).toEqual([
      [0, 'RAIL', 'INHYD', 'INNSA'], [1, 'VESSEL', 'INNSA', 'SGSIN'], [2, 'VESSEL', 'SGSIN', 'AEJEA'],
    ]);
  });

  it('falls back to the e-commerce booking legs, then to the booking header', () => {
    const t = tables();
    const ecom = shipmentLegs(resolveTrackingReference('BOOKING', 'BKON7313', t)!, t);
    expect(ecom).toHaveLength(1);
    expect(ecom[0]).toMatchObject({ vesselCode: 'RNR', voyage: '4422', pol: 'INNSA', polTerminal: 'INNSABMCT0', pod: 'AEJEA' });
    t.lrpBookingLegs = [];
    const header = shipmentLegs(resolveTrackingReference('BOOKING', 'AE1', t)!, t);
    expect(header[0]).toMatchObject({ legType: 'M', vesselCode: 'WEWE', pol: 'AEJEA', pod: 'SGSIN' });
    expect(header[0].etd?.toISOString()).toBe(iso(8, 11));
  });

  it('fills missing leg dates from the proforma schedule (voyage 4422 ↔ 4422-W)', () => {
    const t = tables();
    const leg = { ...shipmentLegs(resolveTrackingReference('BOOKING', 'BKON7313', t)!, t)[0], etd: null, eta: null };
    const filled = fillLegDatesFromSchedules(leg, t.schedules);
    expect(filled.etd?.toISOString()).toBe(iso(10, 29, 14));
    expect(filled.eta?.toISOString()).toBe(iso(11, 3, 16));
  });

  it('takes actual departure / arrival from arrival_master only once they are in the past', () => {
    const t = tables();
    const f = shipmentFacts(resolveTrackingReference('BOOKING', 'SVM2', t)!, t, NOW);
    expect(f.actualEtd?.toISOString()).toBe(iso(1, 21, 13));
    expect(f.actualEta?.toISOString()).toBe(iso(1, 27, 9));
    const future = shipmentFacts(resolveTrackingReference('BOOKING', 'SVM2', t)!, t, new Date(2026, 0, 10));
    expect(future.actualEtd).toBeNull();
    expect(future.actualEta).toBeNull();
  });

  it('uses the shipped-on-board date as actual ETD after sailing when there is no port call', () => {
    const t = tables();
    const f = shipmentFacts(resolveTrackingReference('BOOKING', 'SVMDMU2694105', t)!, t, new Date(2026, 9, 30));
    expect(f.actualEtd?.toISOString()).toBe(iso(10, 29));
  });

  it('resolves cut-off hours terminal → port → global → default', () => {
    const cfg = tables().cutoffConfig;
    expect(cutoffHours(cfg, 'INNSA', 'INNSABMCT0')).toEqual({ gateIn: 72, doc: 24, vgm: 48 });
    expect(cutoffHours(cfg, 'INNSA', 'INNSAGTI01')).toEqual({ gateIn: 72, doc: 72, vgm: 72 });
    expect(cutoffHours(cfg, 'AEJEA', '')).toEqual({ gateIn: 48, doc: 24, vgm: 48 });
    expect(cutoffHours([], 'AEJEA', '')).toEqual({ gateIn: 48, doc: 24, vgm: 48 });
  });
});

describe('tracking bridge — milestones and progress', () => {
  it('marks past steps achieved, future ones estimated and the next one current', () => {
    const t = tables();
    const f = shipmentFacts(resolveTrackingReference('BOOKING', 'SVMDMU2694105', t)!, t, NOW);
    const ms = buildMilestones(f, NOW);
    expect(ms.map(m => [m.stepName, m.isCompleted, m.isCurrent])).toEqual([
      ['Booking Confirmed', true, false],
      ['Empty Pick-up', true, false],
      ['Gate In', true, false],
      ['Loaded on Board', false, true],
      ['Discharged', false, false],
      ['Delivered', false, false],
    ]);
    expect(ms[1].timestamp).toBe(local(10, 14, 8)); // lrpBookingCargo.pickupDate
    expect(ms[1].transportMode).toBe('TRUCK');
    expect(ms[2].timestamp).toBe(local(10, 16, 19)); // operationDetail full receive
    expect(ms[3].timestamp).toBe(`Est. ${local(10, 29)}`);
    expect(ms[4].timestamp).toBe(`Est. ${local(11, 3)}`);
    expect(ms[5].timestamp).toBeUndefined();
    expect(progressPercent(ms, f, NOW)).toBe(50);
  });

  it('cascades completion from a later achieved step and adds transhipment / delivery', () => {
    const t = tables();
    const f = shipmentFacts(resolveTrackingReference('BOOKING', 'SVM2', t)!, t, NOW);
    const ms = buildMilestones(f, NOW);
    expect(ms.map(m => m.stepName)).toEqual(['Booking Confirmed', 'Empty Pick-up', 'Gate In', 'Loaded on Board', 'Transhipment', 'Discharged', 'Delivered']);
    expect(ms.slice(0, 6).every(m => m.isCompleted)).toBe(true);
    expect(ms[4].location).toBe('SINGAPORE');
    expect(ms[6]).toMatchObject({ isCompleted: false, isCurrent: true }); // no B/L released yet
    expect(progressPercent(ms, f, NOW)).toBe(86);
  });

  it('completes Delivered once the vessel arrived and the B/L is released', () => {
    const t = tables();
    const f = shipmentFacts(resolveTrackingReference('BOOKING', 'AE1', t)!, t, NOW);
    const ms = buildMilestones(f, NOW);
    expect(ms.every(m => m.isCompleted)).toBe(true);
    expect(ms.some(m => m.isCurrent)).toBe(false);
    expect(progressPercent(ms, f, NOW)).toBe(100);
  });

  it('adds the sailing time fraction to the progress while under way', () => {
    const t = tables();
    const midVoyage = new Date(2026, 10, 1, 10);
    const f = shipmentFacts(resolveTrackingReference('BOOKING', 'SVMDMU2694105', t)!, t, midVoyage);
    const ms = buildMilestones(f, midVoyage);
    expect(ms[3]).toMatchObject({ stepName: 'Loaded on Board', isCompleted: true, timestamp: local(10, 29) });
    expect(ms[4]).toMatchObject({ stepName: 'Discharged', isCurrent: true });
    expect(progressPercent(ms, f, midVoyage)).toBe(77); // 4 done + 3/5 of the passage, over 6 steps
  });
});

describe('tracking bridge — containers and movements', () => {
  it('unions equipment from LRP cargo, B/L cargo, moves, SI and VGM without duplicates', () => {
    const t = tables();
    const ref = resolveTrackingReference('BOOKING', 'SVMDMU2694105', t)!;
    const units = collectContainers(ref, t);
    expect(units.map(c => c.containerNo)).toEqual(['AASU1205200', 'DETS0001702', 'DV20TNB1']);
    expect(units[0]).toMatchObject({ type: '20DC', seal: 'CS24', tare: 2301, payload: 3400 });
    expect(units[1].seal).toBe('258633'); // LRP seal wins over the SI carrier seal
    expect(units[1].moves).toHaveLength(2);
  });

  it('builds the movement log: operationDetail rows then leg events, future ones flagged', () => {
    const t = tables();
    const ref = resolveTrackingReference('CONTAINER', 'DETS0001702', t)!;
    const f = shipmentFacts(ref, t, NOW);
    const [unit] = collectContainers(ref, t);
    const events = buildMovements(unit, f, t, NOW);
    expect(events.map(e => [e.eventCode, e.eventName, e.locationCode, e.isActual])).toEqual([
      ['DSM', 'SENT TO SHIPPER', 'INNSA', true],
      ['OBF', 'RECEIVED FROM SHIPPER', 'INNSA', true],
      ['LDF', 'LOAD FULL (EST.)', 'INNSA', false],
      ['DIF', 'DISCHARGE FULL (EST.)', 'AEJEA', false],
    ]);
    expect(events[0].eventDate).toBe(local(10, 15, 9)); // actDate beats datecr
    expect(events[0].transportMode).toBe('TRUCK');
    expect(events[2]).toMatchObject({ vesselCode: 'RNR', voyage: '4422', bound: 'W', transportMode: 'VESSEL' });
    expect(events[2].lat).toBeCloseTo(18.57, 1);
  });

  it('derives tranship load/discharge events and the container status from the clock', () => {
    const t = tables();
    const ref = resolveTrackingReference('BOOKING', 'SVM2', t)!;
    const result = buildTrackingResult(ref, t, NOW);
    const [unit] = result.containers;
    expect(unit.movements.map(e => e.eventCode)).toEqual(['LDF', 'LTF', 'DTE', 'DIF']);
    expect(unit.movements[0].eventDate).toBe(local(1, 21, 13)); // actual pull-out from berth
    expect(unit).toMatchObject({ status: 'DISCHARGED', latestActivity: 'DISCHARGE FULL', activityLocation: 'JEBEL ALI, UAE' });
    expect(result.actualEtd).toBe(local(1, 21, 13));
    expect(result.actualEta).toBe(local(1, 27, 9));
  });

  it('reports GATE_IN before sailing, IN_TRANSIT at sea and DELIVERED after release', () => {
    const t = tables();
    const status = (ref: string, now: Date) => buildTrackingResult(resolveTrackingReference('BOOKING', ref, t)!, t, now).containers[0].status;
    expect(status('SVMDMU2694105', NOW)).toBe('GATE_IN');
    expect(status('SVMDMU2694105', new Date(2026, 10, 1))).toBe('IN_TRANSIT');
    expect(status('SVMDMU2694105', new Date(2026, 11, 1))).toBe('DISCHARGED');
    expect(status('AE1', NOW)).toBe('DELIVERED');
  });
});

describe('tracking bridge — map geometry', () => {
  it('builds the route from the sea legs with transhipment ports as waypoints', () => {
    const t = tables();
    const legs = shipmentLegs(resolveTrackingReference('BOOKING', 'SVM2', t)!, t);
    const map = buildRouteMap(legs, 'INNSA', 'AEJEA')!;
    expect(map.pol.label).toBe('INNSA');
    expect(map.waypoints?.map(w => w.label)).toEqual(['SGSIN']);
    expect(map.pod.label).toBe('AEJEA');
    expect(buildRouteMap([], 'XXXXX', 'AEJEA')).toBeUndefined();
  });

  it('places the vessel at POL, en route, at the transhipment port or at POD depending on the clock', () => {
    const t = tables();
    const legs = shipmentLegs(resolveTrackingReference('BOOKING', 'SVM2', t)!, t);
    const atPol = vesselPosition(legs, new Date(2026, 0, 10))!;
    expect(atPol).toMatchObject({ speedKn: 0, locationLabel: 'NHAVA SHEVA,MUMBAI — awaiting departure' });
    expect(atPol.lat).toBeCloseTo(18.57, 1);

    const enRoute = vesselPosition(legs, new Date(2026, 0, 21, 22))!;
    expect(enRoute.speedKn).toBeGreaterThan(0);
    expect(enRoute.locationLabel).toBe('En route NHAVA SHEVA,MUMBAI → SINGAPORE');
    expect(enRoute.lat).toBeLessThan(18.57);
    expect(enRoute.lng).toBeGreaterThan(72.58);

    const waiting = vesselPosition(legs, new Date(2026, 0, 24))!;
    expect(waiting.locationLabel).toBe('SINGAPORE — transhipment');
    expect(waiting.lat).toBeCloseTo(1.16, 1);

    const arrived = vesselPosition(legs, NOW)!;
    expect(arrived).toMatchObject({ speedKn: 0, headingDeg: 0, locationLabel: 'JEBEL ALI, UAE — arrived', lastUpdate: formatListDate(NOW) });
    expect(vesselPosition([], NOW)).toBeUndefined();
  });
});

describe('tracking bridge — result header', () => {
  it('assembles names, terminals, deadlines and the vessel particulars', () => {
    const t = tables();
    const r = buildTrackingResult(resolveTrackingReference('BOOKING', 'BKON7312', t)!, t, NOW);
    expect(r).toMatchObject({
      searchKey: 'BKON7312', bookingNo: 'SVMDMU2694105', blNo: 'EPIRINDMUM69602',
      polPortCode: 'INNSA', polPortName: 'NHAVA SHEVA,MUMBAI', podPortCode: 'AEJEA', podPortName: 'JEBEL ALI, UAE',
      vesselCode: 'RNR', voyage: '4422', bound: 'W', etd: local(10, 29), eta: local(11, 3),
      deadlines: { containerGateIn: local(10, 26), siDocClosing: local(10, 28), vgmClosing: local(10, 27) },
    });
    expect(r.polTerminal).toMatch(/BHARAT MUMBAI/);
    expect(r.vesselName).not.toBe('');
    expect(r.vesselParticulars?.code).toBe('RNR');
    expect(r.routeMap?.pod.label).toBe('AEJEA');
    expect(r.liveAis?.locationLabel).toBe('NHAVA SHEVA,MUMBAI — awaiting departure');
    expect(r.actualEtd).toBeUndefined();
    expect(r.containers).toHaveLength(3);
  });

  it('serves an e-commerce booking that only has booking_leg rows', () => {
    const r = buildTrackingResult(resolveTrackingReference('BOOKING', 'BKON7313', tables())!, tables(), NOW);
    expect(r).toMatchObject({ bookingNo: 'BKON7313', blNo: '', vesselCode: 'RNR', etd: local(10, 29) });
    expect(r.containers.map(c => c.containerNo)).toEqual(['RE20TNB1']);
    expect(r.containers[0]).toMatchObject({ status: 'GATE_IN', latestActivity: 'BOOKING CONFIRMED', activityDate: local(10, 16, 23) });
  });
});

describe('tracking bridge — fixture-backed', () => {
  it('offers demo references that all resolve', () => {
    const s = trackingSampleReferences();
    expect(s.booking).toBe('SVMDMU2694105');
    expect(s.bl).toBe('EPIRINDMUM69602');
    expect(fixtureTrackingResult('BOOKING', s.booking, undefined, NOW)?.containers.length).toBeGreaterThan(0);
    expect(fixtureTrackingResult('CONTAINER', s.container, undefined, NOW)?.containers.map(c => c.containerNo)).toEqual([s.container]);
    expect(fixtureTrackingResult('BL', s.bl, undefined, NOW)?.blNo).toBe(s.bl);
  });

  it('reaches the same shipment via BKON7312, SVMDMU2694105 and EPIRINDMUM69602', () => {
    const a = fixtureTrackingResult('BOOKING', 'BKON7312', undefined, NOW)!;
    const b = fixtureTrackingResult('BOOKING', 'SVMDMU2694105', undefined, NOW)!;
    const c = fixtureTrackingResult('BL', 'EPIRINDMUM69602', undefined, NOW)!;
    expect(a.containers.map(x => x.containerNo)).toEqual(['AASU1205200', 'DETS0001702']);
    expect(b.milestones).toEqual(a.milestones);
    expect(c.vesselName).toBe('EVER GREEN');
    expect(a.polPortName).toBe('NHAVA SHEVA,MUMBAI');
  });

  it('renders pre-/on-carriage legs for the rail + truck booking and an unknown reference as null', () => {
    const r = fixtureTrackingResult('BOOKING', 'SVMDMU2691099', undefined, NOW)!;
    expect(r.milestones.map(m => m.stepName)).toEqual([
      'Booking Confirmed', 'Empty Pick-up', 'Pre-carriage (Rail)', 'Pre-carriage (Truck)', 'Gate In', 'Loaded on Board', 'Discharged', 'On-carriage (Rail)', 'On-carriage (Truck)', 'Delivered',
    ]);
    expect(r.containers[0].status).toBe('DELIVERED');
    expect(fixtureTrackingResult('BOOKING', 'BKG-2026-9901', undefined, NOW)).toBeNull();
  });
});
