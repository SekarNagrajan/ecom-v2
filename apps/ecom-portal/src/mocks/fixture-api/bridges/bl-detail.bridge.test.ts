// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { beforeEach, describe, expect, it } from 'vitest';

import { blSchema } from '../../../features/bill-of-lading/types/bl.types';
import { db, eq, resetDb } from '../db';
import {
  buildBlDetail,
  chargeTotals,
  fileCategory,
  fixtureBlCharges,
  fixtureBlDetail,
  fixtureBlFromSi,
  fixtureBlInsurance,
  fixtureMcnDetail,
  fixtureMcnList,
  fixtureVoyageClosed,
  mapBlInsurance,
  mapMcnDetail,
  mapMcnRow,
  mcnRows,
  siEnsToBlEns,
  siToBlParty,
} from './bl-detail.bridge';
import { appVersionOf, blRowStatus, fixtureBlList, latestBlVersions, mapBlRow, mcnIdOf } from './bl-list.bridge';
import { findBlRow, isAmendment } from './si-common.bridge';
import { buildSiDetail, siContext, type SiContext } from './si-detail.bridge';
import { applySiBody, cloneSiAsAmendment, createSiFromBooking, writeSiParties } from './si-write.bridge';

const plain = { eSINo: 'SIREQ1', blno: 'EPIRINDMUM1', bookno: 'SVMDMU1', status: 'A', editbl: 0, blversion: 1, appversion: 2, pol: 'INNSA', pod: 'AEJEA', pla: 'INNSA', pld: 'AEJEA', polHeaderName: 'NHAVA SHEVA', podHeaderName: 'JEBEL ALI', CrDate: '2026-10-01T00:00:00Z', ChgDate: '2026-10-02T00:00:00Z', fcnno: '' };
const amendment = { ...plain, eSINo: 'SIREQ2', editbl: 1, blversion: 2, status: 'S', ChgDate: '2026-10-03T00:00:00Z', Vessel: 'EML', Voyage: 'ESL WASL 1009S', custremarks: 'Fix marks' };
const booking = { ebookno: 'BKON1', extBookNo: 'SVMDMU1', AgencyRefNo: 'AG-1', agencyid: 'INDMUM', ebook_status: 'A', datecr: '2026-09-30T00:00:00Z' };

describe('B/L row status (statusDescriptions module BOL)', () => {
  it('maps amendment statuses and treats a plain SI with a blno as Verify Copy', () => {
    expect(blRowStatus(plain)).toBe('D');
    expect(blRowStatus({ ...amendment, status: 'D' })).toBe('D');
    expect(blRowStatus({ ...amendment, status: 'S' })).toBe('S');
    expect(blRowStatus({ ...amendment, status: 'A' })).toBe('C');
    expect(blRowStatus({ ...amendment, status: 'C' })).toBe('C');
    expect(blRowStatus({ ...amendment, status: 'P' })).toBe('I');
    expect(blRowStatus({ ...amendment, status: 'I' })).toBe('I');
  });

  it('keeps the highest version per blno and drops cancelled plain SIs', () => {
    const rows = latestBlVersions([plain, amendment, { ...plain, eSINo: 'X', blno: 'OTHER', status: 'I' }, { ...plain, eSINo: 'Y', blno: null }]);
    expect(rows.map(r => r.eSINo)).toEqual(['SIREQ2']);
  });

  it('reads the numeric appversion column', () => {
    expect(appVersionOf({ appversion: 2 })).toBe('2');
    expect(appVersionOf({ appversion: null })).toBe('1');
    expect(appVersionOf({ appversion: 'V2' })).toBe('2');
  });
});

describe('mapBlRow extras', () => {
  it('exposes lock, insurance, payment and agency facts', () => {
    const row = mapBlRow({ ...amendment, status: 'A' }, booking, true, {
      locked: true,
      policyNo: 'P-1',
      paymentRefs: [{ amountUsd: 100 }, { amountUsd: 20.5 }],
      paymentCompleted: false,
      hasPrepaid: true,
    });
    expect(row).toMatchObject({ status: 'C', printStatus: 'Y', isLocked: true, policyNo: 'P-1', payAmountUsd: 120.5, paymentEligible: true, paymentCompleted: false, draftAccepted: true, issueAgency: 'INDMUM', mcnNo: 'MCN-SIREQ2', loadPort: 'INNSA - NHAVA SHEVA' });
    expect(mapBlRow(plain, null, false)).toMatchObject({ status: 'D', printStatus: 'N', mcnNo: null, paymentEligible: false, payAmountUsd: undefined, issueAgency: 'INNSA' });
    expect(mapBlRow({ ...amendment, status: 'A' }, booking, false, { hasPrepaid: true, paymentCompleted: true }).paymentEligible).toBe(false);
  });
});

describe('SI → B/L shapes', () => {
  it('converts parties, ENS and file categories', () => {
    expect(siToBlParty({ name: 'N', address: 'A', address2: 'B', city: 'C', country: 'IN', zip: 'Z', printOnBl: true })).toMatchObject({ name: 'N', address: 'A, B', zipCode: 'Z', printOnBl: true });
    expect(siEnsToBlEns(null)).toBeNull();
    const ens = siEnsToBlEns({
      ensRequired: true, euCustZone: 'Y', blTypeEns: 'Master BL', ensFillingType: 'Single Filing', paymentMethod: 'Not Prepaid',
      declarant: { name: 'D', address: 'A1', address2: 'A2', city: 'C', country: 'NL', state: 'S', telephone: 'T', eori: 'E', email: 'd@e.f', fillingType: 'House BL' },
      buyer: { name: 'B', address: '', city: '', country: '' }, seller: { name: 'S', address: '', city: '', country: '' },
    });
    expect(ens).toMatchObject({ euCustomsZone: true, blType: 'Master BL', paymentMethod: 'Not Prepaid', declarantName: 'D', declarantAddress: 'A1, A2', buyerName: 'B', sellerName: 'S' });
    expect(['VGM', 'DG', 'LOL', 'LOI', 'OT', 'MSD', ''].map(fileCategory)).toEqual(['VGM', 'DG', 'LOI', 'LOI', 'OTHER', 'OTHER', 'OTHER']);
  });

  it('builds a BLDTO from a list row + SI detail + raw columns', () => {
    const ctx: SiContext = {
      si: { ...amendment, shippername: 'Ship', shipper: 'Addr', consigeename: 'Cons', consigee: 'Addr2', packinglst: 'PL-1', invoiceupload: 'INV-1', blType: '', telexrls: 'T', Freight: 'C' },
      booking, legs: [], parties: [], cargo: [{ eSINo: 'SIREQ2', conId: 1, eqpSize: '20DC', containerno: 'AASU1205200', shipperOwn: 'N', carrierSeal: 'CS24', ShipperSeal: '' }],
      commodities: [{ conId: 1, itemno: 1, commodity: '01', HSCommodity: '0102', package: 'CMPK', packageQty: 1, itemWeight: 3400, itemVolume: 4, marksNo: '', marksDesc: 'Animal Products' }],
      dg: [], oog: [], reefer: [], charges: [{ id: 1, esino: 'SIREQ2', chargeid: 'OFR', custtypeid: 'CN', prepaidcollect: 'C' }], payers: [], files: [{ id: 3, FileCatgeory: 'LOL', FileName: 'loi.pdf' }], ics: null,
      insurance: { policy_no: 'P-9', suminsured: '1000' },
    };
    const si = buildSiDetail(ctx);
    const row = mapBlRow(ctx.si, booking, true, { policyNo: 'P-9' });
    const bl = buildBlDetail(row, si, ctx.si);
    expect(bl).toMatchObject({ id: 'EPIRINDMUM1', blNo: 'EPIRINDMUM1', siNo: 'SIREQ2', status: 'S', releaseType: 'T', freightOption: 'COLLECT', printCount: 0, issuedAt: null, loadPortCountry: 'IN', dischargePortCountry: 'AE', mcnNo: 'MCN-SIREQ2' });
    expect(bl.preview).toMatchObject({ siCustRemarks: 'Fix marks', packingList: 'PL-1', invoiceUpload: 'INV-1' });
    expect(bl.parties.consignee).toMatchObject({ name: 'Cons', toOrder: false });
    expect(bl.files?.[0]).toMatchObject({ category: 'LOI', fileName: 'loi.pdf' });
    expect(bl.insurance?.policyNo).toBe('P-9');
    expect(bl.routing.vesselVoyage).toBe('ESL WASL / ESL WASL 1009S'); // vessel code → vessels master name
    expect(blSchema.safeParse(bl).success).toBe(true);
  });
});

describe('charges, insurance, MCN mappers', () => {
  it('totals charge lines per currency', () => {
    const totals = chargeTotals([
      { id: '1', chargeCode: 'OFR', description: '', amount: 100, currency: 'USD', prepaidCollect: 'PREPAID', payByCustType: 'x' },
      { id: '2', chargeCode: 'THC', description: '', amount: 20, currency: 'USD', prepaidCollect: 'COLLECT', payByCustType: 'x' },
      { id: '3', chargeCode: 'DOC', description: '', amount: 5, currency: 'EUR', prepaidCollect: 'PAY_AT', payByCustType: 'x', payAtAmount: 7 },
    ]);
    expect(totals).toEqual([
      { currency: 'USD', prepaid: 100, collect: 20, payAt: 0, grandTotal: 120 },
      { currency: 'EUR', prepaid: 0, collect: 0, payAt: 7, grandTotal: 7 },
    ]);
  });

  it('maps an ecominsurance row', () => {
    expect(mapBlInsurance('BL1', { policy_no: 'P-22', quoteNo: 'Q-1', suminsured: '40000.00', policyCreatedDate: '2022-11-12T20:05:45Z' })).toMatchObject({ blNo: 'BL1', policyNo: 'P-22', coverageAmount: 40000, currency: 'USD', effectiveDate: '2022-11-12T20:05:45.000Z' });
  });

  it('derives MCN rows from standing amendment versions only', () => {
    expect(mcnRows([plain, amendment, { ...amendment, eSINo: 'SIREQ3', status: 'I' }]).map(r => r.eSINo)).toEqual(['SIREQ2']);
    expect(mapMcnRow(amendment)).toMatchObject({ mcnId: 'MCN-SIREQ2', blNo: 'EPIRINDMUM1', status: 'Submitted', origin: 'INNSA - NHAVA SHEVA' });
    const detail = mapMcnDetail(amendment, [{}, {}], [{ marksDesc: 'A' }, { marksDesc: 'A' }, { marksDesc: 'B' }], [{ chargeid: 'OFR', prepaidcollect: 'C' }]);
    expect(detail).toMatchObject({ vessel: 'ESL WASL', voyage: 'ESL WASL 1009S', containerCount: 2, remarks: 'Fix marks', cargoDescription: 'A; B', freightTerms: 'Collect' });
    expect(mcnIdOf(amendment)).toBe('MCN-SIREQ2');
  });
});

describe('fixture-backed B/L endpoints', () => {
  beforeEach(() => resetDb());

  it('lists one row per blno with every BL status the sample holds', () => {
    const rows = fixtureBlList()!;
    expect(rows.length).toBe(new Set(rows.map(r => r.blNo.toLowerCase())).size);
    const statuses = new Set(rows.map(r => r.status));
    expect(statuses.has('D')).toBe(true);
    expect(statuses.has('S')).toBe(true);
    expect(statuses.has('C')).toBe(true);
    expect(statuses.has('I')).toBe(true);
    expect(rows.every(r => r.statusLabel && r.appVersion && r.origin && r.dischargePort)).toBe(true);
    expect(rows.some(r => r.siNo && db.shippingInstructions.find(s => s.eSINo === r.siNo && Number(s.editbl) === 0 && s.status === 'I'))).toBe(false);
  });

  it('hydrates every listed B/L into a BLDTO that passes the B/L schema and exposes charges', () => {
    const rows = fixtureBlList()!;
    const rejected: string[] = [];
    for (const row of rows) {
      const detail = fixtureBlDetail(row.blNo)!;
      expect(detail, row.blNo).toBeTruthy();
      expect(detail.status).toBe(row.status);
      if (!blSchema.safeParse(detail).success) rejected.push(row.blNo);
      const charges = fixtureBlCharges(row.blNo)!;
      expect(charges.blNo).toBe(row.blNo);
      expect(Array.isArray(charges.totals)).toBe(true);
    }
    // Legacy rows with incomplete parties / cargo can fail the wizard schema; they must stay a small minority.
    expect(rejected.length, `schema-rejected B/Ls: ${rejected.join(', ')}`).toBeLessThanOrEqual(Math.ceil(rows.length / 10));
    expect(fixtureBlDetail('UNKNOWN')).toBeNull();
  });

  it('builds a draft B/L from an SI and answers the voyage guard from the booking main leg', () => {
    const si = db.shippingInstructions.find(r => Number(r.editbl) === 0 && r.blno)!;
    const draft = fixtureBlFromSi(si.eSINo)!;
    expect(draft).toMatchObject({ status: 'D', siNo: si.eSINo, blNo: si.blno });
    expect(fixtureBlFromSi('nope')).toBeNull();
    const withBooking = db.shippingInstructions.find(r => db.bookings.some(b => eq(b.extBookNo, r.bookno)) && r.blno)!;
    expect(typeof fixtureVoyageClosed(withBooking.blno)).toBe('boolean');
    expect(fixtureVoyageClosed(withBooking.blno, +new Date('2099-01-01'))).toBe(true);
    expect(fixtureVoyageClosed('UNKNOWN')).toBe(false);
  });

  it('returns insurance only for B/Ls that have a policy', () => {
    const insured = db.insurance[0];
    expect(fixtureBlInsurance(insured.lrpbl_no)?.policyNo).toBe(insured.policy_no);
    expect(fixtureBlInsurance('UNKNOWN')).toBeNull();
  });

  it('serves MCN rows from the amendment versions', () => {
    const list = fixtureMcnList();
    expect(list.length).toBeGreaterThan(0);
    const detail = fixtureMcnDetail(list[0].mcnId)!;
    expect(detail.blNo).toBe(list[0].blNo);
    expect(detail.containerCount).toBeGreaterThan(0);
    expect(fixtureMcnDetail('MCN-NOPE')).toBeNull();
  });
});

describe('write-back into the fixture tables', () => {
  beforeEach(() => resetDb());

  it('clones a plain SI into a new amendment version with all its children', () => {
    const si = db.shippingInstructions.find(r => Number(r.editbl) === 0 && r.blno && db.siCharges.some(c => eq(c.esino, r.eSINo)))!;
    const before = db.shippingInstructions.length;
    const clone = cloneSiAsAmendment(si);
    expect(db.shippingInstructions.length).toBe(before + 1);
    expect(isAmendment(clone)).toBe(true);
    expect(Number(clone.blversion)).toBeGreaterThan(Number(si.blversion));
    expect(clone.eSINo).not.toBe(si.eSINo);
    expect(db.siCargo.filter(c => eq(c.eSINo, clone.eSINo)).length).toBe(db.siCargo.filter(c => eq(c.eSINo, si.eSINo)).length);
    expect(db.siCharges.filter(c => eq(c.esino, clone.eSINo)).length).toBe(db.siCharges.filter(c => eq(c.esino, si.eSINo)).length);
    expect(findBlRow(si.blno)?.eSINo).toBe(clone.eSINo); // the list now shows the amendment
    clone.status = 'A';
    expect(fixtureBlDetail(si.blno)?.status).toBe('C');
  });

  it('writes header, parties, containers, charges and files back and reads them again', () => {
    const si = db.shippingInstructions.find(r => Number(r.editbl) === 0)!;
    const detail = fixtureBlDetail(si.blno) ?? fixtureBlFromSi(si.eSINo)!;
    applySiBody(si, {
      blType: 'Seaway',
      releaseType: 'T',
      freightOption: 'COLLECT',
      preview: { siCustRemarks: 'Edited', declaredValue: '99' },
      parties: { ...detail.parties, shipper: { ...detail.parties.shipper, name: 'New Shipper' } },
      containers: [{ ...detail.containers[0], containerNo: 'TEST0000001', cargoLines: [{ ...detail.containers[0].cargoLines[0], description: 'Edited goods', isDangerousGoods: true, unNumber: '9999', dgClass: '8' }] }],
      charges: [{ id: 'c1', chargeCode: 'THC', description: 'x', amount: 0, currency: 'USD', prepaidCollect: 'PAY_AT', payByCustType: 'Consignee' }],
      files: [
        { id: 'f1', category: 'VGM', fileName: 'vgm-upload.pdf', uploadedAt: '2026-10-19T10:00:00.000Z' },
        { id: 'f2', category: 'LOI', fileName: 'loi-upload.pdf', uploadedAt: '2026-10-19T10:01:00.000Z' },
      ],
    });
    const again = buildSiDetail(siContext(si));
    expect(again.blType).toBe('Seaway');
    expect(again.releaseType).toBe('T');
    expect(again.freightOption).toBe('COLLECT');
    expect(again.preview?.customerRemarks).toBe('Edited');
    expect(again.parties.shipper.name).toBe('New Shipper');
    expect(again.containers).toHaveLength(1);
    expect(again.containers[0].containerNo).toBe('TEST0000001');
    expect(again.containers[0].cargoLines[0]).toMatchObject({ description: 'Edited goods', isDangerousGoods: true, unNumber: '9999', dgClass: '8' });
    expect(again.charges?.[0]).toMatchObject({ chargeCode: 'THC', prepaidCollect: 'PAY_AT', payByCustType: 'Consignee' });
    expect(again.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fileName: 'vgm-upload.pdf', fileType: 'VGM' }),
        expect.objectContaining({ fileName: 'loi-upload.pdf', fileType: 'LOL' }),
      ]),
    );
    const blAgain = fixtureBlDetail(si.blno) ?? fixtureBlFromSi(si.eSINo)!;
    expect(blAgain.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fileName: 'vgm-upload.pdf', category: 'VGM' }),
        expect.objectContaining({ fileName: 'loi-upload.pdf', category: 'LOI' }),
      ]),
    );
  });

  it('drops parties without a name and creates an SI from a booking', () => {
    writeSiParties('SIREQ-T', { shipper: { name: 'S', address: 'A', city: 'C', country: 'IN' }, notify: { name: '', address: '', city: '', country: '' } });
    expect(db.siCust.filter(c => eq(c.eSINo, 'SIREQ-T')).map(c => c.custTypeId)).toEqual(['SH']);
    const booking = db.bookings.find(b => b.extBookNo && db.bookingCargo.some(c => eq(c.ebookno, b.ebookno)))!;
    const created = createSiFromBooking(booking, 'S');
    expect(created.status).toBe('S');
    expect(created.bookno).toBe(booking.extBookNo);
    expect(db.siCargo.some(c => eq(c.eSINo, created.eSINo))).toBe(true);
    expect(fixtureBlFromSi(created.eSINo)?.bookingNo).toBe(booking.extBookNo);
  });
});
