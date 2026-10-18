// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * Write-back of wizard payloads into the fixture tables, so SI / B/L mutations stay visible for the
 * browser session: header columns on ecomSI, parties → ecomSI_cust, containers → ecomSI_cargo /
 * _commodity / _dg / _oog / _reefer, charges → ecomSI_charges. Also clones an SI into a new B/L
 * amendment version (editbl ≥ 1, blversion + 1) the way the legacy "Edit B/L" action does, and
 * creates an SI from a confirmed booking ("Create SI").
 */
import type { BLPreviewFields } from '../../../features/bill-of-lading/types/bl.types';
import type { SIChargeLine, SIContainer, SIParty, SIPreviewFields } from '../../../features/shipping-instruction/types/si.types';
import { ciRow, db, eq, nextRef, nowIso, type Row } from '../db';
import { bookingLegs, mainLeg, num, partyTypeCode, str } from './si-common.bridge';
import { PREPAID_COLLECT_CODE } from './si-detail.bridge';

/** Child tables of ecomSI and the name each uses for the SI key column. */
export const SI_CHILD_KEY = {
  siCust: 'eSINo',
  siCargo: 'eSINo',
  siCommodity: 'eSINo',
  siDg: 'eSIno',
  siOog: 'eSIno',
  siReefer: 'eSIno',
  siCharges: 'esino',
  siPayers: 'esino',
  siFiles: 'eSINo',
  siIcs: 'eSINo',
  siReference: 'esino',
} as const;
export type SiChildTable = keyof typeof SI_CHILD_KEY;

let seq = 0;
const nextId = () => 900000 + ++seq;

function replaceChildren(table: SiChildTable, eSINo: string, rows: Row[]) {
  const key = SI_CHILD_KEY[table];
  db[table] = [...db[table].filter(r => !eq(r[key], eSINo)), ...rows.map(r => ciRow({ ...r, [key]: eSINo }))];
}

/** SIParty / BLParty share the columns that are written back (BLParty says zipCode, SIParty zip). */
type PartyLike = Partial<SIParty> & { toOrder?: boolean; zipCode?: string };
const isParty = (v: unknown): v is PartyLike => typeof v === 'object' && v !== null && typeof (v as PartyLike).name === 'string';

/** The sections of an SI or B/L wizard payload (Partial<SIDTO> and Partial<BLDTO> both fit). */
export interface WizardBody {
  blType?: 'Original' | 'Seaway';
  releaseType?: 'O' | 'T';
  freightOption?: 'PREPAID' | 'COLLECT';
  nvocc?: boolean;
  t2lFiling?: boolean;
  ensFiling?: string;
  ensFilingHint?: string;
  preview?: Partial<SIPreviewFields & BLPreviewFields>;
  routing?: { originPrint: string; polPrint: string; podPrint: string; deliveryPrint: string };
  parties?: Record<string, unknown>;
  containers?: SIContainer[];
  charges?: SIChargeLine[];
}

const PARTY_TYPES: Record<string, string> = {
  shipper: 'SH',
  consignee: 'CN',
  notify: 'NT',
  notify2: 'N1',
  notify3: 'N2',
  forwarder: 'FW',
  warehouse: 'WH',
  agreementParty: 'AP',
};

export function partyToRow(eSINo: string, custTypeId: string, p: PartyLike): Row {
  return {
    id: String(nextId()),
    eSINo,
    custTypeId,
    custId: p.customerCode ?? '',
    countryId: p.country ?? '',
    name: p.name ?? '',
    address1: p.address ?? '',
    address2: p.address2 ?? null,
    city: p.city ?? '',
    zipCode: p.zip ?? p.zipCode ?? '',
    telephone: p.phone ?? '',
    fax: p.fax ?? null,
    email: p.email ?? '',
    flag: null,
    toorder: custTypeId === 'CN' ? (p.toOrder ? 'Y' : 'N') : null,
    stateId: p.state ?? '',
    eori: p.eori ?? null,
    persontype: p.personType ?? null,
  };
}

export function writeSiParties(eSINo: string, parties: Record<string, unknown>) {
  const rows: Row[] = [];
  for (const [role, type] of Object.entries(PARTY_TYPES)) {
    const p = parties[role];
    if (isParty(p) && str(p.name)) rows.push(partyToRow(eSINo, type, p));
  }
  replaceChildren('siCust', eSINo, rows);
}

export function writeSiContainers(eSINo: string, containers: SIContainer[]) {
  const cargo: Row[] = [];
  const commodity: Row[] = [];
  const dg: Row[] = [];
  const oog: Row[] = [];
  const reefer: Row[] = [];
  containers.forEach((c, i) => {
    const conId = i + 1;
    const cargoWeight = c.cargoLines.reduce((s, l) => s + num(l.grossWeight), 0);
    const hasDg = c.cargoLines.some(l => l.isDangerousGoods);
    const isReefer = (c.reeferMode ?? 'none') !== 'none';
    cargo.push({
      id: nextId(),
      eSINo,
      conId,
      eqpSize: c.eqpSize,
      containerno: c.containerNo,
      shipperOwn: c.isSoc ? 'Y' : 'N',
      carrierSeal: c.carrierSeal ?? '',
      ShipperSeal: c.shipperSeal ?? '',
      tareWeight: c.tareWeight ?? 0,
      cargoWeight,
      grossweight: cargoWeight + num(c.tareWeight),
      weightUnit: 'K',
      ref_nor: c.reeferMode === 'nor' ? 'Y' : 'N',
      eqpType: isReefer ? 'R' : 'N',
      eqpstatus: 'F',
      oog: c.isOog ? 'Y' : 'N',
      dgflag: hasDg ? 'Y' : 'N',
    });
    c.cargoLines.forEach((l, j) => {
      const itemno = j + 1;
      commodity.push({
        id: nextId(),
        eSINo,
        conId,
        containerno: c.containerNo,
        itemno,
        commodity: l.commodityCode ?? '',
        package: l.packageType,
        packageQty: l.packageCount,
        itemWeight: l.grossWeight,
        itemWeightUnit: 'K',
        itemVolume: l.volume,
        itemVolumeUnit: 'M',
        marksNo: l.marksAndNumbers ?? '',
        marksDesc: l.description,
        HSCommodity: l.hsCode,
        hazardous: l.isDangerousGoods ? 'Y' : 'N',
        nettwt: l.netWeight ?? null,
      });
      if (l.isDangerousGoods) {
        dg.push({
          Id: nextId(),
          eSIno: eSINo,
          conId,
          containerno: c.containerNo,
          itemno: String(itemno),
          MarinePollutant: l.marinePollutant ? 'Y' : 'N',
          unNo: l.unNumber ?? null,
          class: l.dgClass ?? null,
          FlashPt: l.flashPoint ?? null,
          FlashPtUnit: null,
        });
      }
    });
    if (c.isOog) {
      oog.push({
        Id: nextId(),
        eSIno: eSINo,
        conId,
        comItemNo: 1,
        containerno: c.containerNo,
        leftft: c.owLeft ?? 0,
        rightft: c.owRight ?? 0,
        forward: c.olForward ?? 0,
        Alt: c.olAft ?? 0,
        topft: c.oh ?? 0,
        Unit: c.dimensionUnit ?? 'M',
      });
    }
    if (isReefer) {
      reefer.push({
        Id: nextId(),
        eSIno: eSINo,
        conId,
        containerno: c.containerNo,
        ref_setTemp: c.setTemp ?? null,
        ref_tempUnit: c.tempUnit ?? 'C',
        VentPercentage: c.ventilation ?? null,
      });
    }
  });
  replaceChildren('siCargo', eSINo, cargo);
  replaceChildren('siCommodity', eSINo, commodity);
  replaceChildren('siDg', eSINo, dg);
  replaceChildren('siOog', eSINo, oog);
  replaceChildren('siReefer', eSINo, reefer);
}

export function writeSiCharges(eSINo: string, charges: SIChargeLine[]) {
  replaceChildren(
    'siCharges',
    eSINo,
    charges.map(c => ({
      id: nextId(),
      esino: eSINo,
      chargeid: c.chargeCode,
      payagencyid: '',
      custtypeid: partyTypeCode(c.payByCustType),
      prepaidcollect: PREPAID_COLLECT_CODE[c.prepaidCollect] ?? 'P',
      eqpTypeId: '',
    })),
  );
}

/** Header columns an SI / B/L wizard payload maps onto ecomSI. */
export function applySiHeader(si: Row, body: WizardBody) {
  if (body.blType) si.blType = body.blType === 'Seaway' ? 'SEA WAYBILL' : 'COMBINED TRANSPORT B/L';
  if (body.releaseType) si.telexrls = body.releaseType;
  if (body.freightOption) si.Freight = body.freightOption === 'COLLECT' ? 'C' : 'P';
  if (body.nvocc !== undefined) si.nvocc = body.nvocc ? 'Y' : 'N';
  if (body.t2lFiling !== undefined) si.t2lfiling = body.t2lFiling ? 'Y' : 'N';
  const ens = body.ensFiling ?? body.ensFilingHint;
  if (ens) si.ensType = ens;
  const p = body.preview;
  if (p) {
    if (p.declaredValue !== undefined) si.declaredvalue = p.declaredValue;
    const remarks = p.siCustRemarks ?? p.customerRemarks;
    if (remarks !== undefined) si.custremarks = remarks;
    const aes = p.siAesNumber ?? p.aesNumber;
    if (aes !== undefined) si.AESNumber = aes;
    if (p.aesDisclaimer) si.AESDiscliamer = p.aesDisclaimer === 'provided' ? 'Y' : 'N';
    if (p.blTypeUae) si.bltype_UAE = p.blTypeUae;
    if (p.mpciIdUae !== undefined) si.mpci_id = p.mpciIdUae;
    if (p.acidValue !== undefined) si.ACID = p.acidValue;
    if (p.packingList !== undefined) si.packinglst = p.packingList;
    if (p.invoiceUpload !== undefined) si.invoiceupload = p.invoiceUpload;
  }
  if (body.routing) {
    si.plaHeaderName = body.routing.originPrint;
    si.polHeaderName = body.routing.polPrint;
    si.podHeaderName = body.routing.podPrint;
    si.pldHeaderName = body.routing.deliveryPrint;
  }
  si.ChgDate = nowIso();
}

/** Writes every section of a wizard payload that is present. */
export function applySiBody(si: Row, body: WizardBody) {
  applySiHeader(si, body);
  const eSINo = str(si.eSINo);
  if (body.parties) writeSiParties(eSINo, body.parties);
  if (body.containers) writeSiContainers(eSINo, body.containers);
  if (body.charges) writeSiCharges(eSINo, body.charges);
}

/**
 * New B/L amendment version of an SI row: the header is copied with editbl ≥ 1 and the next
 * blversion, every child row is copied under the new eSINo (what "Edit B/L" does in the legacy app).
 */
export function cloneSiAsAmendment(si: Row): Row {
  const source = str(si.eSINo);
  const eSINo = nextRef('SIREQ');
  const ts = nowIso();
  const maxVersion = Math.max(0, ...db.shippingInstructions.filter(r => eq(r.blno, si.blno)).map(r => num(r.blversion)));
  const clone = ciRow({ ...si, eSINo, ID: nextId(), editbl: Math.max(1, num(si.editbl)), blversion: maxVersion + 1, CrDate: ts, ChgDate: ts });
  db.shippingInstructions.unshift(clone);
  for (const table of Object.keys(SI_CHILD_KEY) as SiChildTable[]) {
    const key = SI_CHILD_KEY[table];
    const rows = db[table].filter(r => eq(r[key], source));
    db[table].push(...rows.map(r => ciRow({ ...r, [key]: eSINo, id: r.id != null ? nextId() : undefined, Id: r.Id != null ? nextId() : undefined })));
  }
  return clone;
}

/** ecomSI row (+ children) created from a confirmed booking, as "Create SI" does. */
export function createSiFromBooking(booking: Row, status: 'D' | 'S'): Row {
  const eSINo = nextRef('SIREQ');
  const ts = nowIso();
  const legs = bookingLegs(booking);
  const main = mainLeg(legs);
  const user = str(booking.usercr) || 'demo.user@example.com';
  const si = ciRow({
    eSINo,
    blno: null,
    bookno: booking.extBookNo ?? booking.ebookno,
    Vessel: main?.vesselCode ?? null,
    Voyage: main?.voyageCode ?? null,
    bound: main?.bound ?? null,
    pol: booking.loadPortId,
    pod: booking.dischargePortId,
    pla: booking.originPortId,
    pld: booking.finalPortId,
    custcode: booking.cust_code,
    CrUser: user,
    CrDate: ts,
    ChgUser: user,
    ChgDate: ts,
    editbl: 0,
    blversion: 0,
    status,
    declined_remarks: '',
    custremarks: '',
    ID: nextId(),
    appversion: 2,
    ccmailid: booking.ccmailid ?? '',
    shipper: '',
    shippername: '',
    consigee: '',
    consigeename: '',
    notify: '',
    notifyname: '',
    releasetype: booking.releasetype ?? 'Normal',
    declaredvalue: '',
    blType: '',
    fcnno: booking.fcnno ?? '',
    ACID: booking.ACID ?? '',
    Freight: '',
    cargoprotectid: booking.cargoprotectid ?? 0,
    t2lfiling: booking.t2lfiling ?? 'N',
    telexrls: 'O',
    ensType: booking.ensfiling ?? ' ',
    bltype_UAE: '',
    mpci_id: '',
    nvocc: 'N',
  });
  db.shippingInstructions.unshift(si);
  const ebookno = booking.ebookno;
  replaceChildren(
    'siCust',
    eSINo,
    db.bookingCust.filter(c => eq(c.ebookno, ebookno)).map(c => ({ ...c, id: String(nextId()) })),
  );
  const cargo = db.bookingCargo.filter(c => eq(c.ebookno, ebookno));
  replaceChildren(
    'siCargo',
    eSINo,
    cargo.map(c => ({
      id: nextId(),
      conId: c.conid,
      eqpSize: c.eqpSize,
      containerno: c.containerno ?? '',
      shipperOwn: c.soc ?? 'N',
      carrierSeal: '',
      ShipperSeal: '',
      tareWeight: c.tareWeight,
      cargoWeight: c.cargoWeight,
      grossweight: c.grossWeight,
      weightUnit: c.weightUnit ?? 'K',
      ref_nor: c.ref_nor ?? 'N',
      eqpType: c.eqpType,
      eqpstatus: c.eqpstatus ?? 'F',
      oog: c.oog ?? 'N',
      dgflag: c.dgFlag ?? 'N',
    })),
  );
  replaceChildren(
    'siCommodity',
    eSINo,
    db.bookingCommodity
      .filter(m => eq(m.ebookno, ebookno))
      .map(m => ({
        id: nextId(),
        conId: m.conid,
        containerno: m.containerno,
        itemno: m.itemno,
        commodity: m.commodity,
        package: m.package,
        packageQty: m.packageQty,
        itemWeight: m.itemWeight,
        itemWeightUnit: m.itemWeightUnit ?? 'K',
        itemVolume: m.cargoVolume,
        itemVolumeUnit: m.volumnUnit ?? 'M',
        marksNo: m.marksNo ?? '',
        marksDesc: m.descr ?? '',
        HSCommodity: m.HSCommodity,
        hazardous: m.commodityFlag ?? 'N',
        nettwt: m.nettwt,
      })),
  );
  const req = db.siRequestMaster.find(r => eq(r.bookno, si.bookno));
  if (req) req.createdSI = num(req.createdSI) + 1;
  return si;
}
