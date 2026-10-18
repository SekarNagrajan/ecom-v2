// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { afterEach, describe, expect, it } from 'vitest';

import type { BookingPayload } from '../../../features/booking/types/booking.types';
import { db, resetDb, type Row } from '../db';
import { activityFromRows, cancelRowsFor } from './booking-activity.bridge';
import {
  childrenOf,
  deleteBooking,
  insertBooking,
  payloadFromRows,
  replaceBooking,
  rowsFromPayload,
  type BookingChildren,
} from './booking-detail.bridge';
import { BOOKING_LIST_STATUS, findBookingRow, fixtureBookingList, fixtureBookingTemplateRows } from './booking-list.bridge';
import {
  carriageTerm,
  customerOptionsFromRows,
  equipmentLabel,
  hsCodeOptionsFromRows,
  lookupOptionsFromRows,
  searchCustomerOptions,
  searchHsCodeOptions,
  splitEquipmentCode,
  unNumberOptionsFromRows,
  type LookupSources,
} from './booking-lookups.bridge';
import { placeholderAmount, ratesFromRows, selectRates } from './booking-rates.bridge';
import { buildRoute, routesFromLegs, selectRoutes } from './booking-routing.bridge';
import { daysBetween, extractPortCode, mostCommon, toDateOnly, toDateTimeMinute } from './booking-shared.bridge';

// ---------------------------------------------------------------------------------------------
// Inline sample rows (column names exactly as the SQL dump writes them)
// ---------------------------------------------------------------------------------------------

const header: Row = {
  ebookno: 'BKON9001', agencyid: 'INDMUM', originPortId: 'INNSA', finalPortId: 'AEJEA', loadPortId: 'INNSA', dischargePortId: 'AEJEA',
  bookDate: '2026-10-10T10:00:00.000Z', bookReady: '2026-10-12T10:00:00.000Z', preCarriage: 'M', onCarriage: 'C', remarks: 'Handle with care',
  usercr: 'baylee.howe87@example.com', datecr: '2026-10-10T10:00:00.000Z', userup: 'SUPERUSER', dateup: '2026-10-11T08:00:00.000Z',
  ebook_status: 'A', extBookNo: 'SVMDMU2699001', cust_code: '20001374', templatename: '', shipTerms: null, rateno: 'RT-77',
  submitted_date: '2026-10-10T11:00:00.000Z', declined_remarks: 'Accepted', routeId: '17649', agencyRefNo: 'AGY-1', oceanfreight: 'P',
  trptsvccode: 'MM', emptypickup: 'INNSABMCT0', emptypickupdate: '2026-10-13T00:00:00.000Z', version: 2, isAmendment: null, nat_code: 'NAT1',
  pickup_point: 'T', salesagreedrate: '1250', haulercode: 'HAU-1', haulagetype: 'Live Load', pickupdate: null, dropdate: null, exportRef: 'EXP-9',
  releasetype: 'Normal', custPO: 'PO-1', customerreference: 'CR-1', ACID: 'ACID-1', cargoprotectid: null, ShipperReference: 'SHP-1',
  ensfiling: 'Y', sisubmitparty: '', ensType: 'S',
};

const parties: Row[] = [
  { cid: '1', ebookno: 'BKON9001', custTypeId: 'BP', custId: '20001374', countryId: 'IN', name: 'Schultz - Romaguera', address1: '2301 Church Close', address2: 'Apt. 580', city: 'Mumbai', zipCode: '400001', telephone: '+91 22 1234', email: 'bp@example.com', persontype: 'Tony' },
  { cid: '2', ebookno: 'BKON9001', custTypeId: 'AP', custId: '20001374', countryId: 'IN', name: 'Schultz - Romaguera', address1: '2301 Church Close', city: 'Mumbai', telephone: '+91 22 1234', email: 'ap@example.com' },
  { cid: '3', ebookno: 'BKON9001', custTypeId: 'CN', custId: '2021000073', countryId: 'AE', name: 'Quigley, Kulas and Schultz', address1: '173 Durgan Green', address2: 'Suite 444', city: 'Dubai', telephone: '+971 4 999', email: 'cn@example.com' },
  { cid: '4', ebookno: 'BKON9001', custTypeId: 'NT', custId: '', countryId: 'AE', name: 'Notify Co', address1: 'Street 1', city: 'Sharjah', telephone: '', email: '' },
];

const cargo: Row[] = [
  { id: 1, ebookno: 'BKON9001', conid: 1, containerno: 'RE20TNB1', eqpType: 'R', eqpSize: 'RE20', soc: 'Y', ref_nor: 'N', quantity: 2, dgFlag: 'N', tareWeight: 3200, cargoWeight: 2546, grossWeight: 5746, weightUnit: 'K', eqpstatus: 'F', oog: 'N', ctFlag: 'N' },
  { id: 2, ebookno: 'BKON9001', conid: 2, containerno: '20DVTNB2', eqpType: null, eqpSize: '20DV', soc: 'N', ref_nor: 'N', quantity: 1, dgFlag: 'Y', tareWeight: 2301, cargoWeight: 500, grossWeight: 2801, weightUnit: 'K', eqpstatus: 'M', oog: 'Y', ctFlag: 'N' },
];

const commodities: Row[] = [
  { id: 1, ebookno: 'BKON9001', conid: 1, containerno: 'RE20TNB1', itemno: 1, commodityFlag: 'N', commodity: '01', HSCommodity: '0102100000', package: 'DRUM', packageQty: 4, cargoVolume: 12.5, volumnUnit: 'M', marksNo: 'MK-1', descr: 'Animal Products', itemWeight: 2546, itemWeightUnit: 'K' },
  { id: 2, ebookno: 'BKON9001', conid: 2, containerno: '20DVTNB2', itemno: 1, commodityFlag: 'Y', commodity: '06', HSCommodity: '2800000000', package: 'BAGS', packageQty: 10, cargoVolume: null, marksNo: null, descr: 'Miscellaneous chemical products', itemWeight: 500, itemWeightUnit: 'K' },
];

const dg: Row[] = [{ id: 1, ebookno: 'BKON9001', conid: 2, containerno: null, itemno: 1, MarinePollutant: 'Y', unNo: '1038', class: '2.1', FlashPt: 34, FlashPtUnit: 'F' }];
const oog: Row[] = [{ id: 1, ebookno: 'BKON9001', conid: 2, containerno: '20DVTNB2', comItemNo: 1, leftft: 4, rightft: 5, forward: 2, alt: 4, topft: 6, unit: 'C' }];
const reefer: Row[] = [{ id: 1, ebookno: 'BKON9001', conid: 1, itemno: 2, containerno: null, ref_setTemp: 4, ref_minTemp: 2, ref_maxTemp: 34, ref_tempUnit: 'C' }];

const legs: Row[] = [
  { id: 2, ebookno: 'BKON9001', leg_no: 2, bound: 'W', serviceCode: 'EMLV', vesselCode: 'sv u', voyageCode: '20228', legTypeId: 'F', loadPortId: 'SGSIN', loadTerminal: '108', dischargePortId: 'AEJEA', dischargeTerminal: 'AEJEAT2', etdDate: '2026-11-06T10:00:00.000Z', etaDate: '2026-11-11T06:00:00.000Z' },
  { id: 1, ebookno: 'BKON9001', leg_no: 1, bound: 'E', serviceCode: 'AEX', vesselCode: 'HC7', voyageCode: '7474', legTypeId: 'M', loadPortId: 'INNSA', loadTerminal: 'INNSABMCT0', dischargePortId: 'SGSIN', dischargeTerminal: '108', etdDate: '2026-10-31T10:00:00.000Z', etaDate: '2026-11-03T06:00:00.000Z' },
];
const cutoffs: Row[] = [{ cid: '1', ebookno: 'BKON9001', bkgCutoff: '2026-10-29T08:15:00.000Z', docCutoff: '2026-10-30T09:15:00.000Z', vgmCutoff: '2026-10-30T12:15:00.000Z' }];
const files: Row[] = [{ ebookno: 'BKON9001', FileCatgeory: 'DGC', FileName: 'BKON9001_DGC_msds.pdf' }];
const ens: Row[] = [{ id: '1', ebookno: 'BKON9001', eucustom: 'Y', bill_type: 'Master BL', ens_type: 'Multiple Filing', payment_mode: 'Wire Transfer', cust_name: 'Witting - Spencer', address: '73387 Selina Causeway', address1: '73387 Selina Causeway', country: 'Netherlands', city: 'Caldwell', email: 'alfonso49@example.com', enseori: 'E224466' }];
const insurance: Row[] = [{ id: 1, book_no: 'BKON9001', lrpbook_no: null, suminsured: '40000.00', insurance_amount: 50, status: 'C' }];
const references: Row[] = [{ id: '1', ebookno: 'BKON9001', refid: 'SHR', refval: 'PO-44871' }, { id: '2', ebookno: 'BKON9001', refid: 'UCR', refval: 'UCR-1' }];

const children: BookingChildren = { parties, cargo, commodities, dg, oog, reefer, legs, haulage: [], cutoffs, files, ens, insurance, references };

const lookupSources: LookupSources = {
  bookings: [header, { ...header, ebookno: 'BKON9002', preCarriage: 'N', onCarriage: 'N' }],
  cargo,
  commodities,
  dg,
  legs,
  haulage: [{ ebookno: 'BKON9001', eqptypeid: '20DC', loadLocation: '20001374', loadlocationname: 'ECOM TESTING' }],
  files,
  users: [{ Comp_Name: 'Hyatt and Sons', Cust_Code: null, reg_no: 'REG709', City: 'Chennai', Country: 'IN', User_Email: 'k@example.com', Comp_Phone: '+91', agencycode: 'INDMUM', control_location: 'INNSA', Business_Type: 'NVOCC' }],
  lookups: [
    { lookupType: 'EQUIPMENT_TYPE', optionKey: 'DV', optionText: 'Dry Van (DV)', status: 'A', displayOrder: 1 },
    { lookupType: 'EQUIPMENT_TYPE', optionKey: 'RF', optionText: 'Reefer (RF)', status: 'A', displayOrder: 2 },
    { lookupType: 'BUSINESS_TYPE', optionKey: 'Freight Forwarder', optionText: 'Freight Forwarder', status: 'A', displayOrder: 1 },
  ],
};

afterEach(() => resetDb());

// ---------------------------------------------------------------------------------------------

describe('booking shared helpers', () => {
  it('extracts port codes and formats dates', () => {
    expect(extractPortCode('INNSA - Nhava Sheva, India')).toBe('INNSA');
    expect(extractPortCode(' aejea ')).toBe('AEJEA');
    expect(toDateOnly(new Date(2026, 9, 12, 8, 0))).toBe('2026-10-12');
    expect(toDateTimeMinute(new Date(2026, 9, 12, 8, 5))).toBe('2026-10-12 08:05');
    expect(toDateOnly('nope')).toBe('');
    expect(daysBetween('2026-10-31 10:00', '2026-11-11 06:00')).toBe(11);
    expect(mostCommon(commodities, 'package')).toBe('DRUM');
  });
});

describe('booking status mapping', () => {
  it('covers every BKG status code in statusDescriptions', () => {
    const codes = db.statusDescriptions.filter(s => String(s.module).toUpperCase() === 'BKG').map(s => String(s.status).toUpperCase());
    expect(codes.length).toBeGreaterThan(0);
    for (const code of codes) expect(BOOKING_LIST_STATUS[code], `status ${code}`).toBeDefined();
    expect(BOOKING_LIST_STATUS.A).toBe('Confirmed');
    expect(BOOKING_LIST_STATUS.I).toBe('Cancelled');
    expect(BOOKING_LIST_STATUS.V).toBe('Rejected');
  });

  it('finds rows by online reference or agency booking number and separates templates', () => {
    const first = db.bookings.find(b => b.extBookNo);
    expect(first).toBeDefined();
    expect(findBookingRow(String(first!.ebookno).toLowerCase())).toBe(first);
    expect(findBookingRow(String(first!.extBookNo))).toBe(first);
    expect(findBookingRow('nope')).toBeUndefined();
    const templates = fixtureBookingTemplateRows();
    expect(templates.every(t => t.ebook_status === 'T')).toBe(true);
    expect(fixtureBookingList()!.some(b => templates.some(t => t.ebookno === b.id))).toBe(false);
  });
});

describe('booking lookups bridge', () => {
  it('labels equipment codes written either way round', () => {
    expect(splitEquipmentCode('RE20')).toEqual({ size: '20', type: 'RE' });
    expect(splitEquipmentCode('20DV')).toEqual({ size: '20', type: 'DV' });
    expect(equipmentLabel('RE20', lookupSources.lookups)).toBe('REEFER 20 CONTAINER (RE20)'); // equipments master
    expect(equipmentLabel('20DV', lookupSources.lookups)).toBe('STANDARD 20 CONTAINER (20DV)'); // 20DV → DV20 master row
    expect(equipmentLabel('99ZZ', lookupSources.lookups)).toBe("99' ZZ (99ZZ)"); // unknown → lookups wording / code
    expect(carriageTerm('M', 'C')).toBe('CY/DOOR');
    expect(carriageTerm('N', 'N')).toBe('CY/CY');
  });

  it('derives every lookup kind from fixture columns', () => {
    const opt = (kind: Parameters<typeof lookupOptionsFromRows>[0]) => lookupOptionsFromRows(kind, lookupSources);
    expect(opt('containerTypes').map(o => o.value)).toEqual(['20DC', '20DV', 'RE20']);
    expect(opt('commodities')).toEqual([
      { value: '01', label: '01 - Animal Products or Feed€ Š š ª º Ê Ú ê ú Check' }, // commodities master name
      { value: '06', label: '06 - Aviation NOS (Aircrafts, parts, gliders, etc.)' },
    ]);
    expect(opt('packageTypes').map(o => o.value)).toEqual(['BAGS', 'DRUM']);
    expect(opt('dgClasses')).toEqual([{ value: '2.1', label: 'Class 2.1' }]);
    expect(opt('carriageContracts').map(o => o.value)).toEqual(['CY/CY', 'CY/DOOR']);
    expect(opt('agencies')).toEqual([{ value: 'INDMUM', label: 'INDMUM - NHAVA SHEVA,MUMBAI' }]); // control location → ports master
    expect(opt('placesOfReceipt')[0]).toEqual({ value: '20001374', label: 'ECOM TESTING (20001374)' });
    expect(opt('emptyPickupFacilities').map(o => o.value)).toEqual(['108', 'INNSABMCT0']);
    expect(opt('dpwShipperTypes').map(o => o.value)).toEqual(['Freight Forwarder', 'NVOCC']);
    expect(opt('documentTypes')).toEqual([{ value: 'DGC', label: 'DGC' }]);
  });

  it('searches customers, HS codes and UN numbers', () => {
    const customers = customerOptionsFromRows(parties, lookupSources.users);
    expect(customers.map(c => c.customerName)).toEqual(['Schultz - Romaguera', 'Quigley, Kulas and Schultz', 'Notify Co', 'Hyatt and Sons']);
    expect(searchCustomerOptions(customers, '')).toEqual([]);
    expect(searchCustomerOptions(customers, 'hyatt')[0].customerCode).toBe('REG709');
    expect(searchCustomerOptions(customers, '2021000073')[0].city).toBe('Dubai');

    const hs = hsCodeOptionsFromRows(commodities);
    expect(hs).toEqual([
      { code: '0102100000', desc: 'Animal Products' },
      { code: '2800000000', desc: 'Miscellaneous chemical products' },
    ]);
    expect(searchHsCodeOptions(hs, 'chem')).toHaveLength(1);

    expect(unNumberOptionsFromRows(dg)).toEqual([{ un: '1038', name: 'IMDG class 2.1', dgClass: '2.1' }]);
  });
});

describe('booking routing bridge', () => {
  it('builds a transshipment route from legs ordered by leg_no', () => {
    const route = buildRoute('BKON9001', legs, cutoffs[0])!;
    expect(route.routeId).toBe('RT-BKON9001');
    expect(route.polPortId).toBe('INNSA');
    expect(route.podPortId).toBe('AEJEA');
    expect(route.isDirect).toBe(false);
    expect(route.shipmentKind).toBe('Transshipment');
    expect(route.transshipmentCount).toBe(1);
    expect(route.vesselCode).toBe('HC7'); // mainline leg drives the headline vessel
    expect(route.legs!.map(l => l.legType)).toEqual(['Mainline', 'Feeder']);
    expect(route.transitTimeDays).toBe(daysBetween(route.etd, route.eta));
    expect(route.gateInCutoff).toBe(toDateTimeMinute(cutoffs[0].bkgCutoff));
    expect(route.podTerminal).toBe('AEJEAT2');
  });

  it('flags a single leg as direct and treats truck/rail legs as multimodal', () => {
    const direct = buildRoute('X', [legs[1]], undefined)!;
    expect(direct.isDirect).toBe(true);
    expect(direct.shipmentKind).toBe('Direct');
    expect(direct.gateInCutoff).toBeUndefined();
    const multimodal = buildRoute('Y', [{ ...legs[1], leg_no: 2 }, { ebookno: 'Y', leg_no: 1, legTypeId: 'T', loadPortId: 'INBLR', dischargePortId: 'INNSA', etdDate: '2026-10-27T00:00:00Z', etaDate: '2026-10-28T00:00:00Z' }], undefined)!;
    expect(multimodal.shipmentKind).toBe('Multimodal');
    expect(multimodal.legs![0].vesselName).toBe('Truck / Rail haul');
  });

  it('collapses identical itineraries and matches the requested lane with fallbacks', () => {
    const twice = [...legs, ...legs.map(l => ({ ...l, ebookno: 'BKON9002' }))];
    const all = routesFromLegs(twice, cutoffs);
    expect(all).toHaveLength(1);
    const exact = selectRoutes(all, { origin: 'INNSA - Nhava Sheva', delivery: 'AEJEA', cargoReadyDate: '2026-10-01' });
    expect(exact).toHaveLength(1);
    expect(exact[0].isDefaultRoute).toBe(true);
    expect(selectRoutes(all, { origin: 'SGSIN', delivery: 'NLRTM', cargoReadyDate: '' })).toHaveLength(1); // touches SGSIN
    expect(selectRoutes(all, { origin: 'CNSHA', delivery: 'USLAX', cargoReadyDate: '' })).toHaveLength(1); // nothing matches → all
  });
});

describe('booking rates bridge', () => {
  it('derives one rate per lane + equipment from the sampled bookings', () => {
    const rates = ratesFromRows([header], cargo, parties);
    expect(rates.map(r => r.rate.eqpType)).toEqual(['RE20', '20DV']);
    expect(rates[0].rate.amount).toBe(1250); // salesagreedrate wins when populated
    expect(rates[0].rate.customer).toBe('Schultz - Romaguera');
    expect(rates[0].rate.rateNo).toBe('RT-77');
    expect(selectRates(rates, { origin: 'INNSA', delivery: 'AEJEA' })).toHaveLength(2);
    expect(selectRates(rates, { origin: 'INNSA', delivery: 'SGSIN' })).toHaveLength(0);
  });

  it('uses a deterministic placeholder when salesagreedrate is blank', () => {
    const rates = ratesFromRows([{ ...header, salesagreedrate: '', rateno: '' }], cargo, parties);
    expect(rates[0].rate.rateNo).toBe('RT-INNSAAEJEA-RE20');
    expect(rates[0].rate.amount).toBe(placeholderAmount('RE20'));
    expect(placeholderAmount('40DV')).toBe(1800);
    expect(placeholderAmount('RE20')).toBe(1500);
  });
});

describe('booking detail bridge', () => {
  it('assembles the BookingPayload from the header and child rows', () => {
    const p = payloadFromRows(header, children);
    const m = p.masterDetails!;
    expect(m.origin).toBe('INNSA - NHAVA SHEVA,MUMBAI'); // wizard port fields hold "CODE - NAME"
    expect(m.delivery).toBe('AEJEA - JEBEL ALI, UAE');
    expect(m.cargoReadyDate).toBe(toDateOnly(header.bookReady));
    expect(m.haulageOriginType).toBe('Merchant');
    expect(m.haulageDestinationType).toBe('Carrier');
    expect(m.onlineBookingNo).toBe('BKON9001');
    expect(m.oceanFreight).toBe('Prepaid');
    expect(m.emptyPickupPoint).toBe('Terminal');
    expect(m.haulageType).toBe('Live Load');
    expect(m.selectedRoute?.routeId).toBe('RT-BKON9001');
    expect(m.selectedRate?.amount).toBe(1250);

    const parties = p.parties!;
    expect(parties.shipperName).toBe('Schultz - Romaguera');
    expect(parties.shipperAddress).toBe('2301 Church Close, Apt. 580');
    expect(parties.shipperReference).toBe('SHP-1');
    expect(parties.consigneeName).toBe('Quigley, Kulas and Schultz');
    expect(parties.notifyPartyCity).toBe('Sharjah');
    expect(parties.agreementParty).toBe('Schultz - Romaguera');
    expect(parties.siSubmittingParty).toBe('Schultz - Romaguera');

    const [c1, c2] = p.cargo!.containers;
    expect(c1.containerType).toBe('RE20');
    expect(c1.containerNo).toBe('RE20TNB1');
    expect(c1.quantity).toBe(2);
    expect(c1.isSoc).toBe(true);
    expect(c1.reeferMode).toBe('operating');
    expect(c1.setTemp).toBe(4);
    expect(c1.tempUnit).toBe('Celsius');
    expect(c1.commodities[0]).toMatchObject({ hsCode: '0102100000', weight: 2546, volume: 12.5, packageType: 'DRUM', packageQuantity: 4, description: 'Animal Products', isDangerousGoods: false });
    expect(c2.eqpStatus).toBe('EMPTY');
    expect(c2.reeferMode).toBe('none');
    expect(c2.isOog).toBe(true);
    // a stray refer row on a dry box must not turn it into a reefer
    const stray = payloadFromRows(header, { ...children, reefer: [{ ...reefer[0], conid: 2 }] }).cargo!.containers[1];
    expect(stray.reeferMode).toBe('none');
    expect(stray.setTemp).toBeUndefined();
    expect(c2).toMatchObject({ olForward: 2, olAft: 4, owLeft: 4, owRight: 5, oh: 6, dimensionUnit: 'CM' });
    expect(c2.commodities[0]).toMatchObject({ isDangerousGoods: true, unNumber: '1038', dgClass: '2.1', flashPoint: '34F', marinePollutant: true });

    expect(p.ens).toMatchObject({ euCustomsZone: true, blType: 'Master BL', ensFilingType: 'Multiple Filing', declarantEori: 'E224466' });
    expect(p.insurance).toEqual({ isInsuranceRequired: true, currency: 'USD', cargoValue: 40000, termsAccepted: true });
    expect(p.documents).toEqual([{ id: 'BKON9001-doc-1', type: 'DGC', fileName: 'BKON9001_DGC_msds.pdf', uploadedAt: header.dateup }]);
    expect(p.referenceFields!.map(f => [f.key, f.value])).toEqual([
      ['rateRefNo', 'RT-77'], ['agencyRefNo', 'AGY-1'], ['oceanFreightTerms', 'Prepaid'], ['natCode', 'NAT1'], ['emptyPickupLocation', 'INNSABMCT0'], ['haulierCode', 'HAU-1'],
    ]);
    expect(p.draftId).toBeUndefined();
  });

  it('never leaves a required container / commodity field undefined', () => {
    const p = payloadFromRows({ ...header, ebook_status: 'D' }, { ...children, parties: [], cargo: [cargo[1]], commodities: [], dg: [], oog: [], reefer: [], legs: [], cutoffs: [], files: [], ens: [], insurance: [], references: [] });
    expect(p.draftId).toBe('BKON9001');
    expect(p.masterDetails!.selectedRoute).toBeNull();
    expect(p.ens).toBeNull();
    expect(p.insurance!.isInsuranceRequired).toBe(false);
    const c = p.cargo!.containers[0];
    expect(c.commodities).toHaveLength(1); // createEmptyCommodity fallback
    // Required (non-optional) fields of ContainerItem / CommodityItem are always populated.
    const requiredContainer = [c.id, c.containerType, c.containerNo, c.quantity, c.eqpStatus, c.isSoc, c.reeferMode, c.isLcl, c.isOog, c.tempUnit, c.dimensionUnit, c.tareWeight];
    expect(requiredContainer.some(v => v === undefined)).toBe(false);
    const m = c.commodities[0];
    const requiredCommodity = [m.id, m.commodity, m.hsCode, m.weight, m.volume, m.packageType, m.packageQuantity, m.description, m.marksAndNumbers, m.isDangerousGoods, m.unNumber, m.dgClass, m.flashPoint, m.marinePollutant, m.shippingName];
    expect(requiredCommodity.some(v => v === undefined)).toBe(false);
    expect(Object.values(p.parties!).some(v => v === undefined)).toBe(false);
    expect(Object.values({ ...p.masterDetails!, selectedRoute: null, selectedRate: null }).some(v => v === undefined)).toBe(false);
  });

  it('round-trips a wizard payload through rows and back and keeps the store consistent', () => {
    const source = payloadFromRows(header, children);
    const opts = { ebookno: 'BKON9100', status: 'S' as const, custCode: '20001374', agencyId: 'INDMUM', userEmail: 'demo@example.com' };
    const { header: h, children: ch } = rowsFromPayload(source, opts);
    expect(h).toMatchObject({ ebookno: 'BKON9100', ebook_status: 'S', originPortId: 'INNSA', finalPortId: 'AEJEA', preCarriage: 'M', onCarriage: 'C', oceanfreight: 'P', pickup_point: 'T', ensfiling: 'Y' });
    expect(h.submitted_date).toBeTruthy();
    expect(ch.parties.map(r => r.custTypeId)).toEqual(['BP', 'CN', 'NT', 'AP']);
    expect(ch.cargo).toHaveLength(2);
    expect(ch.cargo[1]).toMatchObject({ conid: 2, eqpSize: '20DV', dgFlag: 'Y', oog: 'Y', eqpstatus: 'M' });
    expect(ch.dg[0]).toMatchObject({ conid: 2, unNo: '1038', class: '2.1', FlashPt: 34, FlashPtUnit: 'F' });
    expect(ch.reefer[0]).toMatchObject({ conid: 1, ref_setTemp: 4, ref_tempUnit: 'C' });
    expect(ch.legs.map(l => [l.leg_no, l.legTypeId, l.loadPortId])).toEqual([[1, 'M', 'INNSA'], [2, 'F', 'SGSIN']]);
    expect(ch.cutoffs).toHaveLength(1);
    expect(ch.ens[0].bill_type).toBe('Master BL');
    expect(ch.insurance[0].suminsured).toBe('40000');
    expect(ch.references.map(r => r.refid)).toContain('rateRefNo');

    const before = fixtureBookingList()!.length;
    insertBooking(h, ch);
    const list = fixtureBookingList()!;
    expect(list).toHaveLength(before + 1);
    expect(list[0]).toMatchObject({ id: 'BKON9100', onlineRefNo: 'BKON9100', status: 'Submitted', origin: 'INNSA - NHAVA SHEVA,MUMBAI', delivery: 'AEJEA - JEBEL ALI, UAE', dgStatus: 'Y', teusCount: 3 });

    const row = findBookingRow('bkon9100')!;
    const back = payloadFromRows(row, childrenOf(row));
    expect(back.parties!.shipperName).toBe(source.parties!.shipperName);
    expect(back.cargo!.containers.map(c => c.containerType)).toEqual(['RE20', '20DV']);
    expect(back.cargo!.containers[1].commodities[0].unNumber).toBe('1038');
    expect(back.masterDetails!.selectedRoute?.legs).toHaveLength(2);
    expect(back.ens?.blType).toBe('Master BL');
    expect(back.insurance?.cargoValue).toBe(40000);

    // amend: fewer containers, bumped version
    const amended: BookingPayload = { ...back, cargo: { containers: [back.cargo!.containers[0]] } };
    const next = rowsFromPayload(amended, { ...opts, existing: row });
    expect(next.header.version).toBe(1);
    expect(next.header.isAmendment).toBe('Y');
    replaceBooking(row, next.header, next.children);
    expect(childrenOf(row).cargo).toHaveLength(1);
    expect(childrenOf(row).dg).toHaveLength(0);

    deleteBooking('BKON9100');
    expect(findBookingRow('BKON9100')).toBeUndefined();
    expect(db.bookingCargo.some(c => c.ebookno === 'BKON9100')).toBe(false);
  });
});

describe('booking activity bridge', () => {
  it('derives the timeline from audit columns and cancel rows', () => {
    const cancels: Row[] = [
      { id: '1', eBookNo: '', extBookNo: 'SVMDMU2699001', reason: 'Product not ready', remarks: 'Test', status: 'S', usercr: 'baylee.howe87@example.com', datecr: '2026-10-12T09:00:00.000Z' },
      { id: '2', eBookNo: 'BKON0000', extBookNo: 'OTHER', reason: 'x', status: 'S', usercr: 'u', datecr: '2026-10-12T09:00:00.000Z' },
    ];
    const matched = cancelRowsFor(header, cancels);
    expect(matched).toHaveLength(1);
    const events = activityFromRows(header, matched);
    expect(events.map(e => e.action)).toEqual(['Booking Created', 'Submitted', 'Confirmed', 'Cancellation Requested']);
    expect(events[2].note).toBe('Booking No. SVMDMU2699001');
    expect(events[3].note).toBe('Product not ready — Test');
    expect(events.every(e => /^\d{2}-[A-Z][a-z]{2}-\d{4} \d{2}:\d{2}$/.test(e.at))).toBe(true);
  });

  it('handles drafts, rejections and voided bookings without cancel rows', () => {
    expect(activityFromRows({ ...header, ebook_status: 'D' }, []).map(e => e.action)).toEqual(['Booking Created']);
    expect(activityFromRows({ ...header, ebook_status: 'V', declined_remarks: 'No space' }, []).at(-1)).toMatchObject({ action: 'Rejected', note: 'No space' });
    expect(activityFromRows({ ...header, ebook_status: 'I' }, []).at(-1)!.action).toBe('Cancelled');
  });
});
