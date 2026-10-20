// Modified by Sekar Nagarajan (2026-10-16 23:40)
import { describe, expect, it } from 'vitest';

import type { VgmSubmitPayload } from '../../../features/vgm/types/vgm.types';
import { ciRow, type Row } from '../db';
import {
  applyVgmSubmission,
  buildVgmDeclaration,
  latestActiveVgm,
  mapVgmContainer,
  mapVgmDeclarant,
  resolveVgmReference,
  vgmContainers,
  type VgmSources,
} from './vgm.bridge';

const vgmRow = (over: Row): Row =>
  ciRow({
    id: 1, book_no: 'SVMDMU2694105', bl_no: null, eqptype: '20RE', eqpid: 'DETS0001702', vgm_type: 'bookno',
    VGM_Obtained_Date: '2026-10-16T22:15:04.472Z', VGM_Weight: 10000, VGM_unit: 'K', VGM_Obtained_Method: 'SM1',
    VGM_Company_Name: 'Schultz - Romaguera', VGM_Address1: null, VGM_City: null, VGM_Country: null,
    VGM_Authorized_Person: 'Mack Oberbrunner', Telephone: null, Email: null, status: 'A', Version_no: 1,
    Datecr: '2026-10-17T15:40:49.459Z', DateUp: '2026-10-17T15:40:49.459Z', ...over,
  });

function sources(): VgmSources {
  return {
    bookings: [ciRow({ ebookno: 'BKON7312', extBookNo: 'SVMDMU2694105', originPortId: 'INNSA', loadPortId: 'INNSA', dischargePortId: 'AEJEA', finalPortId: 'AEJEA', cust_code: '20001374' })],
    bookingCargo: [
      ciRow({ ebookno: 'BKON7312', containerno: null, eqpSize: 'RE20', tareWeight: 3200 }),
      ciRow({ ebookno: 'BKON7312', containerno: null, eqpSize: '20DC', tareWeight: 2300 }),
    ],
    bookingCust: [
      ciRow({ ebookno: 'BKON7312', custTypeId: 'AP', name: 'Schultz - Romaguera', address1: '2301 Church Close', city: 'Terrenceport', countryId: 'CN', telephone: '+13872760384', email: 'ap@example.com' }),
      ciRow({ ebookno: 'BKON7312', custTypeId: 'SH', name: "O'Kon - Barrows" }),
    ],
    bookingLeg: [ciRow({ ebookno: 'BKON7312', leg_no: 1, etdDate: '2026-10-29T22:15:04.472Z', etaDate: '2026-11-03T22:15:04.472Z' })],
    shippingInstructions: [ciRow({ eSINo: 'SIREQ3095', blno: 'EPIRINDMUM69602', bookno: 'SVMDMU2694105', pol: 'INNSA', pod: 'AEJEA', pla: 'INNSA', pld: 'AEJEA', polHeaderName: 'NHAVA SHEVA,MUMBAI', podHeaderName: 'JEBEL ALI, UAE', plaHeaderName: 'NHAVA SHEVA,MUMBAI', pldHeaderName: 'JEBEL ALI, UAE', shippername: "O'Kon - Barrows", blversion: 1, ChgDate: '2026-10-16T13:29:49.982Z' })],
    siCargo: [
      ciRow({ eSINo: 'SIREQ3095', containerno: 'DETS0001702', eqpSize: '20RE', tareWeight: 5200 }),
      ciRow({ eSINo: 'SIREQ3095', containerno: 'AASU1205200', eqpSize: '20DC', tareWeight: 2301 }),
    ],
    siCust: [ciRow({ eSINo: 'SIREQ3095', custTypeId: 'SH', name: "O'Kon - Barrows", address1: 'NO. 1 BALABAC ST.', city: 'Manila', countryId: 'PH' })],
    vgm: [
      vgmRow({ id: 2401 }),
      vgmRow({ id: 2400, eqptype: '20DC', eqpid: 'AASU1205200', VGM_Weight: 5000, Datecr: '2026-10-17T15:40:33.939Z' }),
      vgmRow({ id: 2399, eqpid: 'DETS0001702', VGM_Weight: 9000, status: 'I', Version_no: 0, Datecr: '2026-10-10T10:00:00.000Z' }),
      vgmRow({ id: 2300, book_no: 'AE01379500', eqpid: 'TALU4773228', eqptype: '20DC', VGM_Weight: 24433, Version_no: 2, VGM_Address1: '7502 Kunze Loaf', VGM_City: 'Cleocester', VGM_Country: 'IN', VGM_Zipcode: '22206', Telephone: '+15709275695', Email: 'charles9@example.com', VGM_Authorized_Person: 'Iris Grimes', VGM_Company_Name: 'Kling - Dietrich', Datecr: '2026-04-27T13:20:08.632Z' }),
    ],
  };
}

const user = ciRow({ loginname: 'guillermo.thompson@example.com', First_Name: 'Gage', Last_Name: 'Keeling', Comp_Name: 'Schultz - Romaguera', User_Email: 'guillermo.thompson@example.com', Country: 'CN', City: 'Terrenceport' });

describe('vgm bridge — reference resolution', () => {
  it('finds a booking by agency booking number (extBookNo) with its SI and VGM rows', () => {
    const ref = resolveVgmReference('bookno', 'svmdmu2694105', sources());
    expect(ref?.booking?.ebookno).toBe('BKON7312');
    expect(ref?.si?.eSINo).toBe('SIREQ3095');
    expect(ref?.vgmRows).toHaveLength(3);
  });

  it('finds a booking by online reference (ebookno) too', () => {
    expect(resolveVgmReference('bookno', 'BKON7312', sources())?.booking?.extBookNo).toBe('SVMDMU2694105');
  });

  it('resolves a B/L through the SI and pulls the VGM rows of its booking', () => {
    const ref = resolveVgmReference('blno', 'EPIRINDMUM69602', sources());
    expect(ref?.si?.bookno).toBe('SVMDMU2694105');
    expect(ref?.booking?.ebookno).toBe('BKON7312');
    expect(ref?.vgmRows.map(v => v.id)).toEqual([2401, 2400, 2399]);
  });

  it('accepts a booking that exists only in ecom_vgmsolas', () => {
    const ref = resolveVgmReference('bookno', 'AE01379500', sources());
    expect(ref?.booking).toBeNull();
    expect(ref?.vgmRows).toHaveLength(1);
  });

  it('returns null when nothing matches', () => {
    expect(resolveVgmReference('bookno', 'BKG-123456', sources())).toBeNull();
    expect(resolveVgmReference('blno', '', sources())).toBeNull();
  });
});

describe('vgm bridge — containers', () => {
  it('uses the newest active row per container and ignores superseded (I) rows', () => {
    const rows = sources().vgm;
    expect(latestActiveVgm(rows, 'dets0001702')?.id).toBe(2401);
    expect(latestActiveVgm(rows, 'UNKNOWN')).toBeNull();
  });

  it('maps SI cargo + current VGM onto VgmContainerDTO', () => {
    const ref = resolveVgmReference('bookno', 'SVMDMU2694105', sources())!;
    const containers = vgmContainers(ref, sources());
    expect(containers.map(c => c.containerNo)).toEqual(['DETS0001702', 'AASU1205200']);
    expect(containers[0]).toMatchObject({ eqpType: '20RE', tareWeight: 5200, vgmWeight: 10000, vgmUnit: 'K', method: 'SM1', date: '2026-10-16T22:15:04.472Z' });
  });

  it('falls back to the booking cargo tare of the same equipment size for VGM-only containers', () => {
    const src = sources();
    src.shippingInstructions = [];
    src.siCargo = [];
    const ref = resolveVgmReference('bookno', 'SVMDMU2694105', src)!;
    const [first] = vgmContainers(ref, src);
    expect(first.containerNo).toBe('DETS0001702');
    expect(first.tareWeight).toBe(3200); // RE20 ≡ 20RE
  });

  it('gives an undeclared container empty VGM values', () => {
    expect(mapVgmContainer('X', '20DC', 2300, null)).toEqual({ containerNo: 'X', eqpType: '20DC', tareWeight: 2300, vgmWeight: null, vgmUnit: 'K', method: 'SM1', date: null });
  });
});

describe('vgm bridge — declaration', () => {
  it('builds reference details with SI port names, parties and leg ETD/ETA', () => {
    const dto = buildVgmDeclaration('bookno', 'SVMDMU2694105', sources(), user)!;
    expect(dto.referenceDetails).toMatchObject({
      referenceNo: 'SVMDMU2694105', type: 'bookno', shipperName: "O'Kon - Barrows", apName: 'Schultz - Romaguera',
      pol: 'INNSA - NHAVA SHEVA,MUMBAI', pod: 'AEJEA - JEBEL ALI, UAE',
    });
    expect(dto.referenceDetails.etd).toMatch(/^2026-10-(29|30) \d{2}:\d{2}$/);
    expect(dto.referenceDetails.eta).toMatch(/^2026-11-0[34] \d{2}:\d{2}$/);
    expect(dto.companyName).toBe('Schultz - Romaguera');
    expect(dto.authPerson).toBe('Mack Oberbrunner');
    expect(dto.obtainMethod).toBe('SM1');
  });

  it('takes the declarant from the latest VGM row, filling gaps from the party then the user', () => {
    const d = mapVgmDeclarant(sources().vgm[3], null, user);
    expect(d).toMatchObject({ companyName: 'Kling - Dietrich', addr1: '7502 Kunze Loaf', city: 'Cleocester', country: 'IN', phone: '+15709275695', email: 'charles9@example.com', zipcode: '22206', authPerson: 'Iris Grimes' });
    const fromUser = mapVgmDeclarant(null, null, user);
    expect(fromUser).toMatchObject({ companyName: 'Schultz - Romaguera', authPerson: 'Gage Keeling', country: 'CN' });
    expect(fromUser.addr1).toBeUndefined();
  });

  it('returns null for an unknown reference', () => {
    expect(buildVgmDeclaration('blno', 'BL-987654', sources(), user)).toBeNull();
  });
});

describe('vgm bridge — submission', () => {
  const payload: VgmSubmitPayload = {
    referenceNo: 'BKON7312',
    type: 'bookno',
    partyDetails: { companyName: 'Schultz - Romaguera', authPerson: 'Gage Keeling', obtainMethod: 'SM2', obtainDate: '2026-10-18T08:00:00.000Z', email: 'ops@example.com' },
    containers: [
      { containerNo: 'DETS0001702', vgmWeight: 12000, vgmUnit: 'K', method: 'SM2', date: '2026-10-18T08:00:00.000Z' },
      { containerNo: 'NEWU0000001', vgmWeight: 8000, vgmUnit: 'T', method: 'SM1', date: '2026-10-18T08:00:00.000Z' },
    ],
    sendEmailId: 'ops@example.com',
  };

  it('supersedes the active row and inserts Version_no + 1 under the agency booking number', () => {
    const src = sources();
    const created = applyVgmSubmission(payload, 'guillermo.thompson@example.com', src);
    expect(created).toHaveLength(2);
    expect(created[0]).toMatchObject({ book_no: 'SVMDMU2694105', bl_no: 'EPIRINDMUM69602', eqpid: 'DETS0001702', eqptype: '20RE', VGM_Weight: 12000, VGM_Obtained_Method: 'SM2', status: 'A', Version_no: 2, usercr: 'guillermo.thompson@example.com' });
    expect(created[1]).toMatchObject({ eqpid: 'NEWU0000001', Version_no: 1, VGM_unit: 'T' });
    expect(src.vgm.find(v => v.id === 2401)?.status).toBe('I');
    expect(latestActiveVgm(src.vgm, 'DETS0001702')?.VGM_Weight).toBe(12000);
    expect(src.vgm).toHaveLength(6);
  });

  it('keeps the B/L number when submitting by B/L', () => {
    const src = sources();
    const [row] = applyVgmSubmission({ ...payload, type: 'blno', referenceNo: 'EPIRINDMUM69602', containers: payload.containers.slice(0, 1) }, 'u', src);
    expect(row.book_no).toBe('SVMDMU2694105');
    expect(row.bl_no).toBe('EPIRINDMUM69602');
    expect(row.vgm_type).toBe('blno');
  });
});
