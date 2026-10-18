// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { beforeEach, describe, expect, it } from 'vitest';

import { siCargoStepSchema, siChargesStepSchema, siPartiesSchema } from '../../../features/shipping-instruction/types/si.types';
import { db, eq, resetDb } from '../db';
import { findBlRow, findSiRow, latestVersion, mapRoutingLeg, portLabel, voyageClosed } from './si-common.bridge';
import {
  blTypeOf,
  buildSiDetail,
  fixtureSiDetail,
  freightOptionOf,
  mapReferenceFields,
  mapSiCargoLine,
  mapSiCharge,
  mapSiContainer,
  mapSiEns,
  mapSiInsurance,
  mapSiParties,
  mapSiParty,
  mapSiPayer,
  mapSiRouting,
  releaseTypeOf,
  type SiContext,
} from './si-detail.bridge';
import { bookingsWithoutSi, fixtureSiList, mapCreateSiRow } from './si-list.bridge';

const si = {
  eSINo: 'SIREQ1', blno: 'EPIRINDMUM1', bookno: 'SVMDMU1', Vessel: 'RNR', Voyage: 'EVER GREEN 4422W', pol: 'INNSA', pod: 'AEJEA', pla: 'INNSA', pld: 'AEJEA',
  plaHeaderName: 'NHAVA SHEVA,MUMBAI', polHeaderName: 'NHAVA SHEVA,MUMBAI', podHeaderName: 'JEBEL ALI, UAE', pldHeaderName: 'JEBEL ALI, UAE',
  status: 'A', editbl: 0, blversion: 1, appversion: 2, CrDate: '2026-10-10T10:00:00Z', ChgDate: '2026-10-11T10:00:00Z',
  shippername: 'Header Shipper', shipper: 'Line 1\r\nLine 2', consigeename: '', consigee: '', notifyname: '', notify: '',
  blType: 'COMBINED TRANSPORT B/L', telexrls: 'O', Freight: '', nvocc: 'Y', t2lfiling: 'N', ensType: ' ',
  declaredvalue: '1000', custremarks: 'Handle with care', AESNumber: null, AESDiscliamer: null, bltype_UAE: 'Direct BL', mpci_id: '', ACID: '', cargoprotectid: 0,
};
const booking = { ebookno: 'BKON1', extBookNo: 'SVMDMU1', agencyRefNo: 'AG-9', agencyid: 'INDMUM', ebook_status: 'A', datecr: '2026-10-09T10:00:00Z', rateno: 'RR0001', oceanfreight: 'P', nat_code: '', emptypickup: '', haulercode: '', finalPortId: 'AEJEA' };
const cust = (custTypeId: string, extra: Record<string, unknown> = {}) => ({
  id: `1-${custTypeId}`, eSINo: 'SIREQ1', custTypeId, custId: '2021', countryId: 'IN', name: `${custTypeId} Co`, address1: '1 Main St', address2: 'Suite 4', city: 'Mumbai', zipCode: '400001', telephone: '+91', fax: '', email: 'a@b.c', toorder: null, stateId: 'MH', eori: '', persontype: 'Legal', ...extra,
});
const cargo = { id: 1, eSINo: 'SIREQ1', conId: 1, eqpSize: '20RE', containerno: 'DETS0001702', shipperOwn: 'Y', carrierSeal: '258633', ShipperSeal: '', tareWeight: 5200, cargoWeight: 2400, grossweight: 7600, weightUnit: 'K', ref_nor: 'N', eqpType: 'R', oog: null, dgflag: 'N' };
const commodity = { id: 1, eSINo: 'SIREQ1', conId: 1, containerno: 'DETS0001702', itemno: 1, commodity: '05', package: 'CMPK', packageQty: 10, itemWeight: 2400, itemVolume: 4, marksNo: 'MM1', marksDesc: 'TEXTILES', HSCommodity: '8714940000', hazardous: 'N', nettwt: null };
const reefer = { Id: 1, eSIno: 'SIREQ1', conId: 1, containerno: 'DETS0001702', ref_setTemp: 4, ref_tempUnit: 'C', VentPercentage: '6' };
const dg = { Id: 1, eSIno: 'SIREQ1', conId: 1, containerno: 'DETS0001702', itemno: '1', MarinePollutant: 'Y', unNo: '1234', class: '3', FlashPt: 23, FlashPtUnit: 'C' };
const oog = { Id: 1, eSIno: 'SIREQ1', conId: 1, containerno: 'DETS0001702', leftft: 2, rightft: 4, forward: 6, Alt: 8, topft: 10, Unit: 'M' };
const charge = { id: 2952, esino: 'SIREQ1', chargeid: 'OFR', payagencyid: 'INNSA', custtypeid: 'AP', prepaidcollect: 'C', eqpTypeId: '20DC' };
const leg = { id: 25624, ebookno: 'BKON1', leg_no: 1, vesselCode: 'RNR', voyageCode: '4422', legTypeId: 'M', loadPortId: 'INNSA', dischargePortId: 'AEJEA', etdDate: '2026-10-29T22:15:04Z', etaDate: '2026-11-03T22:15:04Z' };

const ctx = (over: Partial<SiContext> = {}): SiContext => ({
  si, booking, legs: [leg], parties: [cust('SH'), cust('CN', { toorder: 'Y' }), cust('NT')], cargo: [cargo], commodities: [commodity], dg: [], oog: [], reefer: [reefer],
  charges: [charge], payers: [], files: [{ id: 7, eSINo: 'SIREQ1', FileCatgeory: 'VGM', FileName: 'vgm.pdf' }], ics: null, insurance: null, ...over,
});

describe('si-common helpers', () => {
  it('builds "CODE - NAME" port labels and tolerates missing parts', () => {
    expect(portLabel('INNSA', 'NHAVA SHEVA,MUMBAI')).toBe('INNSA - NHAVA SHEVA,MUMBAI');
    expect(portLabel('INNSA', null)).toBe('INNSA - NHAVA SHEVA,MUMBAI'); // no header name → ports master
    expect(portLabel('ZZZZZ', null)).toBe('ZZZZZ'); // unknown port → code
    expect(portLabel(null, 'JEBEL ALI')).toBe('JEBEL ALI');
    expect(portLabel('', '')).toBe('');
  });

  it('maps booking legs and detects a sailed main leg', () => {
    const mapped = mapRoutingLeg(leg);
    expect(mapped).toMatchObject({ legType: 'Main', vesselName: 'EVER GREEN', voyage: '4422', polPortName: 'NHAVA SHEVA,MUMBAI', podPortName: 'JEBEL ALI, UAE' }); // vessels / ports masters
    expect(mapped.etd).toBe('2026-10-29T22:15:04.000Z');
    expect(voyageClosed([leg], +new Date('2026-10-16'))).toBe(false);
    expect(voyageClosed([leg], +new Date('2026-11-16'))).toBe(true);
    expect(voyageClosed([], +new Date('2026-11-16'))).toBe(false);
  });

  it('picks the highest blversion, newest ChgDate on ties', () => {
    const v = latestVersion([{ blversion: 1, ChgDate: '2026-01-01' }, { blversion: 2, ChgDate: '2026-01-01' }, { blversion: 2, ChgDate: '2026-02-01', tag: 'x' }]);
    expect(v?.tag).toBe('x');
  });
});

describe('SI header enums', () => {
  it('derives B/L type, release type and freight option from the header, else from the OFR line', () => {
    expect(blTypeOf(si)).toBe('Original');
    expect(blTypeOf({ ...si, blType: 'SEA WAYBILL' })).toBe('Seaway');
    expect(releaseTypeOf(si)).toBe('O');
    expect(releaseTypeOf({ ...si, telexrls: 'T' })).toBe('T');
    expect(freightOptionOf(si, [mapSiCharge(charge)])).toBe('COLLECT');
    expect(freightOptionOf({ ...si, Freight: 'P' }, [mapSiCharge(charge)])).toBe('PREPAID');
    expect(freightOptionOf(si, [])).toBe('PREPAID');
  });
});

describe('SI parties', () => {
  it('maps an ecomSI_cust row onto SIParty', () => {
    expect(mapSiParty(cust('SH'))).toMatchObject({ name: 'SH Co', address: '1 Main St', address2: 'Suite 4', city: 'Mumbai', state: 'MH', country: 'IN', zip: '400001', personType: 'Legal', customerCode: '2021', printOnBl: true });
    expect(mapSiParty(cust('SH', { fax: '', eori: null })).fax).toBeUndefined();
  });

  it('assigns parties by custTypeId, reads toorder and keeps the step schema happy', () => {
    const p = mapSiParties(si, [cust('SH'), cust('CN', { toorder: 'Y' }), cust('NT'), cust('N1'), cust('FW'), cust('AP')]);
    expect(p.shipper.name).toBe('SH Co');
    expect(p.consignee?.toOrder).toBe(true);
    expect(p.notify.name).toBe('NT Co');
    expect(p.notify2?.name).toBe('N1 Co');
    expect(p.forwarder?.name).toBe('FW Co');
    expect(p.agreementParty?.name).toBe('AP Co');
    expect(p.warehouse).toBeUndefined();
    const form = siPartiesSchema.safeParse({
      shipperName: p.shipper.name, shipperAddress: p.shipper.address, shipperPrint: true,
      consigneeName: p.consignee!.name, consigneeAddress: p.consignee!.address, consigneePrint: true, consigneeToOrder: p.consignee!.toOrder,
      notifyName: p.notify.name, notifyAddress: p.notify.address, notifyPrint: true,
    });
    expect(form.success).toBe(true);
  });

  it('falls back to the header name / address blob and to the consignee as notify', () => {
    const p = mapSiParties({ ...si, consigeename: 'Blob Consignee', consigee: 'Street 1\r\nCity' }, []);
    expect(p.shipper).toMatchObject({ name: 'Header Shipper', address: 'Line 1, Line 2' });
    expect(p.consignee).toMatchObject({ name: 'Blob Consignee', address: 'Street 1, City', toOrder: false });
    expect(p.notify.name).toBe('Blob Consignee');
    expect('toOrder' in p.notify).toBe(false);
  });
});

describe('SI routing', () => {
  it('uses the header print names and the booking legs', () => {
    const r = mapSiRouting(si, [leg]);
    expect(r.originPrint).toBe('NHAVA SHEVA,MUMBAI');
    expect(r.deliveryPrint).toBe('JEBEL ALI, UAE');
    expect(r.vesselVoyage).toBe('EVER GREEN / EVER GREEN 4422W'); // RNR → vessels master name
    expect(r.scheduleLegs).toHaveLength(1);
    expect(mapSiRouting({ ...si, plaHeaderName: null }, []).originPrint).toBe('NHAVA SHEVA,MUMBAI'); // header missing → ports master
  });
});

describe('SI cargo', () => {
  it('maps a reefer SOC container with its commodity', () => {
    const c = mapSiContainer(cargo, [commodity], [], [], reefer);
    expect(c).toMatchObject({ id: 'SIREQ1-1', containerNo: 'DETS0001702', eqpSize: '20RE', carrierSeal: '258633', isSoc: true, tareWeight: 5200, reeferMode: 'operating', setTemp: 4, tempUnit: 'C', ventilation: '6', isOog: false });
    expect(c.cargoLines[0]).toMatchObject({ id: 'SIREQ1-1-1', marksAndNumbers: 'MM1', description: 'TEXTILES', commodityCode: '05', hsCode: '8714940000', packageCount: 10, packageType: 'CMPK', grossWeight: 2400, volume: 4, isDangerousGoods: false });
  });

  it('marks NOR reefers, dangerous goods and out-of-gauge dimensions', () => {
    const c = mapSiContainer({ ...cargo, ref_nor: 'Y' }, [commodity], [dg], [oog], null);
    expect(c.reeferMode).toBe('nor');
    expect(c.isOog).toBe(true);
    expect(c).toMatchObject({ olForward: 6, olAft: 8, owLeft: 2, owRight: 4, oh: 10, dimensionUnit: 'M' });
    expect(c.cargoLines[0]).toMatchObject({ isDangerousGoods: true, unNumber: '1234', dgClass: '3', flashPoint: '23C', marinePollutant: true });
    expect(mapSiContainer({ ...cargo, eqpType: 'N', eqpSize: 'DV20' }, [], [], [], null).reeferMode).toBe('none');
  });

  it('gives a container without commodity rows one empty line and validates against the cargo step schema', () => {
    const empty = mapSiContainer({ ...cargo, eqpType: 'N', eqpSize: '20DC' }, [], [], [], null);
    expect(empty.cargoLines).toHaveLength(1);
    expect(empty.cargoLines[0].id).toBe('SIREQ1-1-1');
    const full = mapSiContainer(cargo, [commodity], [], [], reefer);
    expect(siCargoStepSchema.safeParse({ containers: [full] }).success).toBe(true);
    expect(mapSiCargoLine({ ...commodity, packageQty: 0, nettwt: 12 }, null, 'X', 0)).toMatchObject({ packageCount: 1, netWeight: 12 });
  });
});

describe('SI charges / insurance / ENS / references', () => {
  it('maps ecomSI_charges and ecomSI_payers onto charge lines accepted by the charges step', () => {
    const line = mapSiCharge(charge);
    expect(line).toMatchObject({ id: '2952', chargeCode: 'OFR', description: 'OCEAN FREIGHT', amount: 0, currency: 'USD', prepaidCollect: 'COLLECT', payByCustType: 'Agreement Party' }); // charges master chargename
    const payer = mapSiPayer({ id: 51, esino: 'SIREQ1', chargeType: 'DST', Paymentterms: 'E', InvoiceParty: 'Braun - Gerhold', PaidAt: 'SGSIN' });
    expect(payer).toMatchObject({ chargeCode: 'DST', description: 'DUBAI STOPPAGE ADVICE CHARGES', prepaidCollect: 'PAY_AT', payByCustType: 'Braun - Gerhold' });
    expect(mapSiCharge({ ...charge, chargeid: 'THC', prepaidcollect: '' }).prepaidCollect).toBe('COLLECT'); // blank flag → charges master defpaymode C
    expect(mapSiCharge({ ...charge, chargeid: 'ORG', prepaidcollect: '' })).toMatchObject({ description: 'ORG', prepaidCollect: 'PREPAID' }); // not in master → code
    expect(siChargesStepSchema.safeParse({ charges: [line, payer] }).success).toBe(true);
  });

  it('maps insurance and ENS rows', () => {
    expect(mapSiInsurance(null)).toBeNull();
    expect(mapSiInsurance({ policy_no: 'P-1', suminsured: '40000.00', insurance_amount: 50 })).toMatchObject({ isInsuranceRequired: true, cargoValue: 40000, policyNo: 'P-1', optOut: false });
    const ens = mapSiEns({ eucustom: 'Y', bill_type: 'Master BL', ens_type: 'Multiple Filing', payment_mode: 'Wire Transfer', cust_name: 'Decl', address: 'A', address1: 'B', country: 'NL', state: 'ZH', telephone: '+1', email: 'd@e.f', enseori: 'E1', filing_type: 'House BL', city: 'C', zipcode: 'Z' });
    expect(ens).toMatchObject({ ensRequired: true, euCustZone: 'Y', blTypeEns: 'Master BL', ensFillingType: 'Multiple Filing' });
    expect(ens?.declarant).toMatchObject({ name: 'Decl', address2: 'B', eori: 'E1', fillingType: 'House BL' });
    expect(mapSiEns(null)).toBeNull();
  });

  it('derives reference fields from the booking reference columns only when filled', () => {
    const fields = mapReferenceFields(booking, 'SIREQ1');
    expect(fields.map(f => [f.key, f.value])).toEqual([['rateRefNo', 'RR0001'], ['agencyRefNo', 'AG-9'], ['oceanFreightTerms', 'Prepaid'], ['finalReceiptPlace', 'AEJEA']]);
    expect(fields.every(f => f.id.startsWith('SIREQ1-'))).toBe(true);
    expect(mapReferenceFields(null, 'x')).toEqual([]);
  });
});

describe('buildSiDetail', () => {
  it('assembles a complete SIDTO from the context', () => {
    const dto = buildSiDetail(ctx());
    expect(dto).toMatchObject({ id: 'SIREQ1', siNo: 'SIREQ1', bookingNo: 'SVMDMU1', blNo: 'EPIRINDMUM1', agencyRefNo: 'AG-9', blType: 'Original', releaseType: 'O', freightOption: 'COLLECT', nvocc: true, t2lFiling: false, ensFilingHint: 'N', origin: 'INNSA - NHAVA SHEVA,MUMBAI', delivery: 'AEJEA - JEBEL ALI, UAE' });
    expect(dto.containers).toHaveLength(1);
    expect(dto.charges).toHaveLength(1);
    expect(dto.files?.[0]).toMatchObject({ fileName: 'vgm.pdf', fileType: 'VGM', uploadedAt: '2026-10-10T10:00:00.000Z' });
    expect(dto.preview).toMatchObject({ declaredValue: '1000', customerRemarks: 'Handle with care', blTypeUae: 'Direct BL' });
    expect(dto.insurance).toBeNull();
    expect(dto.ens).toBeNull();
    expect(dto.cargoProtect).toEqual([]);
  });

  it('uses payers when there are no charge rows and the SI request id for a draft without SI number', () => {
    const dto = buildSiDetail(ctx({ charges: [], payers: [{ id: 1, esino: 'SIREQ1', chargeType: 'ORG', Paymentterms: 'P', InvoiceParty: 'X', PaidAt: 'INNSA' }] }));
    expect(dto.charges?.[0].chargeCode).toBe('ORG');
    const draft = buildSiDetail(ctx({ si: { ...si, eSINo: null } }));
    expect(draft.siNo).toBeNull();
    expect(draft.id).toBe('SVMDMU1');
  });
});

describe('fixture-backed SI detail and list', () => {
  beforeEach(() => resetDb());

  it('finds SI rows by eSINo or booking number and B/L rows by blno', () => {
    const first = db.shippingInstructions.find(r => Number(r.editbl) === 0 && r.blno)!;
    expect(findSiRow(first.eSINo)?.eSINo).toBe(first.eSINo);
    expect(findSiRow(first.bookno)?.bookno).toBe(first.bookno);
    expect(findBlRow(first.blno)?.blno).toBe(first.blno);
    expect(findSiRow('nope')).toBeNull();
  });

  it('hydrates every extracted SI; only SIs whose DB commodity rows are incomplete fail the cargo schema', () => {
    const incomplete = (eSINo: unknown) =>
      db.siCommodity.some(c => eq(c.eSINo, eSINo) && (!c.package || !c.marksDesc || !c.HSCommodity || !Number(c.itemWeight)));
    let valid = 0;
    for (const row of db.shippingInstructions) {
      const dto = fixtureSiDetail(row.eSINo)!;
      expect(dto, row.eSINo).toBeTruthy();
      expect(dto.containers.length, row.eSINo).toBeGreaterThan(0);
      expect(dto.parties.shipper.name, row.eSINo).toBeTruthy();
      const ok = siCargoStepSchema.safeParse({ containers: dto.containers }).success;
      if (ok) valid += 1;
      else expect(incomplete(row.eSINo), `${row.eSINo} fails the cargo schema although its rows are complete`).toBe(true);
    }
    expect(valid).toBeGreaterThan(db.shippingInstructions.length / 2);
  });

  it('pre-fills an SI from a confirmed booking that has no SI yet', () => {
    const [candidate] = bookingsWithoutSi(db.bookings, db.shippingInstructions);
    expect(candidate).toBeTruthy();
    const dto = fixtureSiDetail(candidate.extBookNo)!;
    expect(dto.siNo).toBeNull();
    expect(dto.bookingNo).toBe(candidate.extBookNo);
    expect(dto.containers.length).toBeGreaterThan(0);
    expect(mapCreateSiRow(candidate)).toMatchObject({ id: candidate.extBookNo, status: 'Create SI', siNo: null });
  });

  it('lists plain SIs (no amendments, no cancelled) plus Create SI rows, newest first', () => {
    const rows = fixtureSiList()!;
    const statuses = new Set(rows.map(r => r.status));
    expect(statuses.has('Create SI')).toBe(true);
    expect(statuses.has('Accepted')).toBe(true);
    expect(rows.some(r => r.siNo && db.shippingInstructions.find(s => s.eSINo === r.siNo && (Number(s.editbl) > 0 || s.status === 'I')))).toBe(false);
    for (let i = 1; i < rows.length; i += 1) {
      expect(+new Date(rows[i - 1].createdDate ?? 0)).toBeGreaterThanOrEqual(+new Date(rows[i].createdDate ?? 0));
    }
    expect(rows.find(r => r.blNo)?.blStatus).toBe('Draft');
  });
});
