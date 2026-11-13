// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Assembles the SIDTO the SI wizard / viewer consume from the extracted ecomSI tables:
 * header (ecomSI) + parties (ecomSI_cust by custTypeId) + containers (ecomSI_cargo with
 * ecomSI_commodity / _dg / _oog / _reefer per conId) + charges (ecomSI_charges, else ecomSI_payers)
 * + files + ENS (ecomSI_ics_new) + insurance + the linked booking (ecombooking / ecombooking_leg).
 * The mappers are pure; `siContext` / `fixtureSiDetail` read from the fixture db.
 */
import {
  REFERENCE_FIELD_CATALOG,
  type ReferenceField,
  type ReferenceFieldKey,
} from '../../../features/booking/utils/reference-field.utils';
import type {
  SICargoLine,
  SICargoProtectLine,
  SIChargeLine,
  SIContainer,
  SIDTO,
  SIEnsInfo,
  SIFileItem,
  SIInsuranceInfo,
  SIParty,
  SIPrepaidCollect,
  SIPreviewFields,
  SIRouting,
} from '../../../features/shipping-instruction/types/si.types';
import { emptySiEnsParty } from '../../../features/shipping-instruction/types/si.types';
import { childRows, db, eq, type Row } from '../db';
import { toIsoOrNull } from './format';
import { chargeRow, portName, vesselName } from './masters.bridge';
import {
  bookingLegs,
  chargeLabel,
  findBooking,
  findSiRow,
  isPlainSi,
  mainLeg,
  mapRoutingLeg,
  num,
  partyTypeLabel,
  portLabel,
  str,
  yes,
} from './si-common.bridge';

/** Everything one SI needs, already filtered to the SI. */
export interface SiContext {
  si: Row;
  booking: Row | null;
  legs: Row[];
  parties: Row[];
  cargo: Row[];
  commodities: Row[];
  dg: Row[];
  oog: Row[];
  reefer: Row[];
  charges: Row[];
  payers: Row[];
  files: Row[];
  ics: Row | null;
  insurance: Row | null;
}

// ---------------------------------------------------------------- header enums

export const blTypeOf = (si: Row): SIDTO['blType'] => (/seaway|waybill|swb/i.test(str(si.blType)) ? 'Seaway' : 'Original');

export const releaseTypeOf = (si: Row): SIDTO['releaseType'] =>
  str(si.telexrls).toUpperCase() === 'T' || /telex/i.test(str(si.releasetype)) ? 'T' : 'O';

/** ecomSI.Freight when filled, otherwise the ocean freight line's payment term. */
export function freightOptionOf(si: Row, charges: SIChargeLine[]): SIDTO['freightOption'] {
  const f = str(si.Freight).toUpperCase();
  if (f.startsWith('C')) return 'COLLECT';
  if (f.startsWith('P')) return 'PREPAID';
  const ofr = charges.find(c => eq(c.chargeCode, 'OFR'));
  return ofr?.prepaidCollect === 'COLLECT' ? 'COLLECT' : 'PREPAID';
}

export function ensFilingHintOf(si: Row): NonNullable<SIDTO['ensFilingHint']> {
  const e = str(si.ensType).toUpperCase();
  return e === 'S' || e === 'P' ? e : 'N';
}

// ---------------------------------------------------------------- parties

export function mapSiParty(row: Row): SIParty {
  return {
    name: str(row.name),
    address: str(row.address1),
    address2: str(row.address2) || undefined,
    city: str(row.city),
    state: str(row.stateId) || undefined,
    country: str(row.countryId),
    zip: str(row.zipCode) || undefined,
    phone: str(row.telephone) || undefined,
    fax: str(row.fax) || undefined,
    email: str(row.email) || undefined,
    eori: str(row.eori) || undefined,
    personType: str(row.persontype) || undefined,
    customerCode: str(row.custId) || undefined,
    printOnBl: true,
  };
}

/** Header fall-back: ecomSI.shippername + the free-text address blob in ecomSI.shipper. */
export function partyFromHeader(name: unknown, addressBlob: unknown): SIParty {
  const lines = str(addressBlob).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return { name: str(name), address: lines.join(', '), city: '', country: '', printOnBl: true };
}

export function mapSiParties(si: Row, custRows: Row[]): SIDTO['parties'] {
  const ofType = (t: string) => custRows.find(r => eq(r.custTypeId, t)) ?? null;
  const optional = (t: string) => {
    const r = ofType(t);
    return r ? mapSiParty(r) : undefined;
  };
  const sh = ofType('SH');
  const cn = ofType('CN');
  const nt = ofType('NT');

  const shipper = sh ? mapSiParty(sh) : partyFromHeader(si.shippername, si.shipper);
  const consignee = cn
    ? { ...mapSiParty(cn), toOrder: yes(cn.toorder) }
    : str(si.consigeename)
      ? { ...partyFromHeader(si.consigeename, si.consigee), toOrder: false }
      : undefined;
  let notify: SIParty;
  if (nt) notify = mapSiParty(nt);
  else if (str(si.notifyname)) notify = partyFromHeader(si.notifyname, si.notify);
  else if (consignee) {
    notify = { ...consignee }; // legacy "notify same as consignee"
    delete (notify as Partial<typeof consignee>).toOrder;
  } else notify = partyFromHeader('', '');

  return {
    shipper,
    consignee,
    notify,
    notify2: optional('N1'),
    notify3: optional('N2'),
    forwarder: optional('FW'),
    warehouse: optional('WH'),
    agreementParty: optional('AP'),
  };
}

// ---------------------------------------------------------------- routing

/** Print texts default to the header names the SI stores, else to the port name of the vessels / ports masters. */
export function mapSiRouting(si: Row, legs: Row[]): SIRouting {
  const vessel = vesselName(str(si.Vessel));
  const voyage = str(si.Voyage);
  return {
    originPrint: str(si.plaHeaderName) || portName(str(si.pla)),
    polPrint: str(si.polHeaderName) || portName(str(si.pol)),
    podPrint: str(si.podHeaderName) || portName(str(si.pod)),
    deliveryPrint: str(si.pldHeaderName) || portName(str(si.pld)),
    vesselVoyage: [vessel, voyage].filter(Boolean).join(' / '),
    scheduleLegs: legs.map(mapRoutingLeg),
  };
}

// ---------------------------------------------------------------- cargo

function emptyCargoLine(id: string): SICargoLine {
  return {
    id,
    marksAndNumbers: '',
    description: '',
    commodityCode: '',
    hsCode: '',
    packageCount: 1,
    packageType: '',
    grossWeight: 1,
    volume: 0,
    isDangerousGoods: false,
    marinePollutant: false,
  };
}

export function mapSiCargoLine(c: Row, dg: Row | null, containerId: string, index: number): SICargoLine {
  const flash = dg && dg.FlashPt != null && dg.FlashPt !== '' ? `${str(dg.FlashPt)}${str(dg.FlashPtUnit)}` : undefined;
  return {
    id: `${containerId}-${str(c.itemno) || index + 1}`,
    marksAndNumbers: str(c.marksNo),
    description: str(c.marksDesc),
    commodityCode: str(c.commodity),
    hsCode: str(c.HSCommodity),
    packageCount: Math.max(1, num(c.packageQty, 1)),
    packageType: str(c.package),
    grossWeight: num(c.itemWeight),
    netWeight: c.nettwt == null || c.nettwt === '' ? undefined : num(c.nettwt),
    volume: num(c.itemVolume),
    isDangerousGoods: yes(c.hazardous) || !!dg,
    unNumber: str(dg?.unNo) || undefined,
    dgClass: str(dg?.class) || undefined,
    flashPoint: flash,
    marinePollutant: yes(dg?.MarinePollutant),
  };
}

/** Child rows of a container: same conId, or same container number when both carry one. */
export function forContainer(rows: Row[], cargo: Row): Row[] {
  const conId = str(cargo.conId);
  const no = str(cargo.containerno);
  return rows.filter(r => (conId && eq(r.conId, conId)) || (no && eq(r.containerno, no)));
}

export function mapSiContainer(cargo: Row, commodities: Row[], dg: Row[], oog: Row[], reefer: Row | null): SIContainer {
  const owner = str(cargo.eSINo) || str(cargo.ebookno);
  const id = `${owner}-${str(cargo.conId) || '1'}`;
  const lines = [...commodities]
    .sort((a, b) => num(a.itemno) - num(b.itemno))
    .map((c, i) => mapSiCargoLine(c, dg.find(d => eq(d.itemno, c.itemno)) ?? (dg.length === 1 ? dg[0] : null), id, i));
  const o = oog[0] ?? null;
  const isReefer = !!reefer || str(cargo.eqpType).toUpperCase() === 'R' || /R[EF]/i.test(str(cargo.eqpSize));
  return {
    id,
    containerNo: str(cargo.containerno),
    eqpSize: str(cargo.eqpSize),
    carrierSeal: str(cargo.carrierSeal),
    shipperSeal: str(cargo.ShipperSeal),
    cargoLines: lines.length ? lines : [emptyCargoLine(`${id}-1`)],
    isSoc: yes(cargo.shipperOwn),
    tareWeight: num(cargo.tareWeight) || undefined,
    reeferMode: isReefer ? (yes(cargo.ref_nor) ? 'nor' : 'operating') : 'none',
    setTemp: reefer ? num(reefer.ref_setTemp) : undefined,
    tempUnit: reefer ? str(reefer.ref_tempUnit) || undefined : undefined,
    ventilation: reefer ? str(reefer.VentPercentage) || undefined : undefined,
    isOog: yes(cargo.oog) || !!o,
    olForward: o ? num(o.forward) : undefined,
    olAft: o ? num(o.Alt) : undefined,
    owLeft: o ? num(o.leftft) : undefined,
    owRight: o ? num(o.rightft) : undefined,
    oh: o ? num(o.topft) : undefined,
    dimensionUnit: o ? str(o.Unit) || undefined : undefined,
  };
}

export function mapSiContainers(ctx: Pick<SiContext, 'cargo' | 'commodities' | 'dg' | 'oog' | 'reefer'>): SIContainer[] {
  return [...ctx.cargo]
    .sort((a, b) => num(a.conId) - num(b.conId))
    .map(c =>
      mapSiContainer(c, forContainer(ctx.commodities, c), forContainer(ctx.dg, c), forContainer(ctx.oog, c), forContainer(ctx.reefer, c)[0] ?? null),
    );
}

// ---------------------------------------------------------------- charges

export const PREPAID_COLLECT: Record<string, SIPrepaidCollect> = { P: 'PREPAID', C: 'COLLECT', E: 'PAY_AT' };
export const PREPAID_COLLECT_CODE: Record<SIPrepaidCollect, string> = { PREPAID: 'P', COLLECT: 'C', PAY_AT: 'E' };

/** Payment term of a charge line: the SI's own flag, else the charge master's default pay mode (defpaymode). */
export const prepaidCollectOf = (flag: unknown, chargeCode: unknown): SIPrepaidCollect =>
  PREPAID_COLLECT[str(flag).toUpperCase()] ?? PREPAID_COLLECT[str(chargeRow(chargeCode)?.defpaymode).toUpperCase()] ?? 'PREPAID';

/**
 * ecomSI_charges holds the charge code, payer type and prepaid/collect flag only; the description comes
 * from the charges master (chargename). Tariff amounts live in the agency system — the charges master has
 * no amount column. TODO(fixtures): no DB source — charge amounts (0 until the tariff API exists).
 */
export function mapSiCharge(row: Row): SIChargeLine {
  return {
    id: str(row.id) || `${str(row.esino)}-${str(row.chargeid)}`,
    chargeCode: str(row.chargeid),
    description: chargeLabel(row.chargeid),
    amount: 0,
    currency: 'USD',
    prepaidCollect: prepaidCollectOf(row.prepaidcollect, row.chargeid),
    payByCustType: partyTypeLabel(row.custtypeid),
    prepaidAmount: 0,
    collectAmount: 0,
    payAtAmount: 0,
  };
}

/** ecomSI_payers (charge group + payment term + invoice party) when the SI has no charge lines. */
export function mapSiPayer(row: Row): SIChargeLine {
  return {
    id: str(row.id) || `${str(row.esino)}-${str(row.chargeType)}`,
    chargeCode: str(row.chargeType),
    description: chargeLabel(row.chargeType),
    amount: 0,
    currency: 'USD',
    prepaidCollect: prepaidCollectOf(row.Paymentterms, row.chargeType),
    payByCustType: str(row.InvoiceParty) || partyTypeLabel('AP'),
    prepaidAmount: 0,
    collectAmount: 0,
    payAtAmount: 0,
  };
}

export const mapSiCharges = (charges: Row[], payers: Row[]): SIChargeLine[] =>
  charges.length ? charges.map(mapSiCharge) : payers.map(mapSiPayer);

// ---------------------------------------------------------------- insurance / ENS / files / references / preview

export function mapSiInsurance(row: Row | null): SIInsuranceInfo | null {
  if (!row) return null;
  return {
    isInsuranceRequired: true,
    currency: 'USD',
    cargoValue: num(row.suminsured) || num(row.insurance_amount) || undefined,
    termsAccepted: true,
    optOut: false,
    policyNo: str(row.policy_no) || undefined,
  };
}

/** Insurance row of an SI: by B/L number, agency booking number or the SI request id. */
export function findInsurance(si: Row): Row | null {
  const bl = str(si.blno);
  const book = str(si.bookno);
  const esi = str(si.eSINo);
  return (
    db.insurance.find(
      i => (bl && eq(i.lrpbl_no, bl)) || (book && (eq(i.lrpbook_no, book) || eq(i.book_no, book))) || (esi && eq(i.book_no, esi)),
    ) ?? null
  );
}

export function mapSiEns(ics: Row | null): SIEnsInfo | null {
  if (!ics) return null;
  return {
    ensRequired: true,
    euCustZone: yes(ics.eucustom) ? 'Y' : 'N',
    blTypeEns: str(ics.bill_type) === 'Master BL' ? 'Master BL' : 'Straight BL',
    ensFillingType: str(ics.ens_type) === 'Multiple Filing' ? 'Multiple Filing' : 'Single Filing',
    paymentMethod: str(ics.payment_mode) === 'Not Prepaid' ? 'Not Prepaid' : 'Wire Transfer',
    declarant: {
      name: str(ics.cust_name),
      address: str(ics.address),
      address2: str(ics.address1),
      city: str(ics.city),
      zip: str(ics.zipcode) || undefined,
      country: str(ics.country),
      state: str(ics.state),
      telephone: str(ics.telephone),
      eori: str(ics.enseori),
      email: str(ics.email),
      fillingType: str(ics.filing_type) === 'Sub-House BL' ? 'Sub-House BL' : 'House BL',
    },
    buyer: emptySiEnsParty(),
    seller: emptySiEnsParty(),
  };
}

/** TODO(fixtures): ecomSI_files has no size / upload timestamp — the SI's CrDate and 0 KB are used. */
export function mapSiFile(row: Row, uploadedAt: string): SIFileItem {
  return {
    id: str(row.id) || `${str(row.eSINo)}-${str(row.FileName)}`,
    fileName: str(row.FileName),
    fileType: str(row.FileCatgeory),
    uploadedAt,
    sizeKb: 0,
  };
}

/**
 * Reference fields come from the linked booking's reference columns (the catalog keys map 1:1).
 * ecomSI_reference rows (SOB / EBL / EOR / ORG / INU / ACI print clauses) have no catalog key.
 * TODO(fixtures): no DB source — SI print-clause references are not part of the ReferenceField catalog.
 */
export function mapReferenceFields(booking: Row | null, owner: string): ReferenceField[] {
  if (!booking) return [];
  const values: Partial<Record<ReferenceFieldKey, string>> = {
    rateRefNo: str(booking.rateno),
    agencyRefNo: str(booking.agencyRefNo),
    oceanFreightTerms: str(booking.oceanfreight).toUpperCase().startsWith('C') ? 'Collect' : str(booking.oceanfreight) ? 'Prepaid' : '',
    natCode: str(booking.nat_code),
    emptyPickupLocation: str(booking.emptypickup),
    finalReceiptPlace: str(booking.finalPortId),
    haulierCode: str(booking.haulercode),
  };
  return REFERENCE_FIELD_CATALOG.filter(item => values[item.key]).map(item => ({
    id: `${owner}-${item.key}`,
    key: item.key,
    name: item.label,
    type: item.type,
    placeholder: item.placeholder,
    options: item.options ? [...item.options] : undefined,
    value: values[item.key] ?? '',
  }));
}

export function mapSiPreview(si: Row): SIPreviewFields {
  const aes = str(si.AESDiscliamer).toUpperCase();
  const uae = str(si.bltype_UAE);
  return {
    declaredValue: str(si.declaredvalue) || undefined,
    customerRemarks: str(si.custremarks) || undefined,
    aesNumber: str(si.AESNumber) || undefined,
    aesDisclaimer: aes === 'Y' ? 'provided' : aes === 'N' ? 'not_applicable' : undefined,
    blTypeUae: uae === 'Master BL' || uae === 'Direct BL' ? uae : undefined,
    mpciIdUae: str(si.mpci_id) || undefined,
    acidValue: str(si.ACID) || undefined,
  };
}

export function mapCargoProtect(si: Row): SICargoProtectLine[] {
  const id = num(si.cargoprotectid);
  if (!id) return [];
  // TODO(fixtures): no DB source — cargo protect product master; only the product id is stored on ecomSI.
  return [{ id: `${str(si.eSINo)}-CP`, productCode: String(id), description: 'Cargo Protect', amount: 0, currency: 'USD' }];
}

// ---------------------------------------------------------------- assembly

export function buildSiDetail(ctx: SiContext): SIDTO {
  const { si, booking } = ctx;
  const siNo = str(si.eSINo) || null;
  const owner = siNo ?? str(si.bookno);
  const charges = mapSiCharges(ctx.charges, ctx.payers);
  const created = toIsoOrNull(si.CrDate) ?? toIsoOrNull(booking?.datecr) ?? '';
  return {
    id: owner,
    bookingNo: str(si.bookno),
    siNo,
    blNo: str(si.blno) || null,
    agencyRefNo: str(booking?.agencyRefNo) || undefined,
    blType: blTypeOf(si),
    releaseType: releaseTypeOf(si),
    freightOption: freightOptionOf(si, charges),
    nvocc: yes(si.nvocc),
    t2lFiling: yes(si.t2lfiling),
    ensFilingHint: ensFilingHintOf(si),
    origin: portLabel(si.pla ?? si.pol, si.plaHeaderName ?? si.polHeaderName),
    loadPort: portLabel(si.pol, si.polHeaderName),
    dischargePort: portLabel(si.pod, si.podHeaderName),
    delivery: portLabel(si.pld ?? si.pod, si.pldHeaderName ?? si.podHeaderName),
    parties: mapSiParties(si, ctx.parties),
    routing: mapSiRouting(si, ctx.legs),
    containers: mapSiContainers(ctx),
    charges,
    insurance: mapSiInsurance(ctx.insurance),
    cargoProtect: mapCargoProtect(si),
    ens: mapSiEns(ctx.ics),
    files: ctx.files.map(f => mapSiFile(f, created)),
    referenceFields: mapReferenceFields(booking, owner),
    preview: mapSiPreview(si),
  };
}

/** Child rows of an SI from the fixture db. */
export function siContext(si: Row): SiContext {
  const id = si.eSINo;
  const booking = findBooking(si.bookno);
  return {
    si,
    booking,
    legs: bookingLegs(booking),
    parties: childRows('siCust', 'eSINo', id),
    cargo: childRows('siCargo', 'eSINo', id),
    commodities: childRows('siCommodity', 'eSINo', id),
    dg: childRows('siDg', 'eSIno', id),
    oog: childRows('siOog', 'eSIno', id),
    reefer: childRows('siReefer', 'eSIno', id),
    charges: childRows('siCharges', 'esino', id),
    payers: childRows('siPayers', 'esino', id),
    files: childRows('siFiles', 'eSINo', id),
    ics: childRows('siIcs', 'eSINo', id)[0] ?? null,
    insurance: findInsurance(si),
  };
}

/** ecombooking_cargo / _commodity rows renamed to the ecomSI_cargo / _commodity columns. */
export const bookingCargoAsSi = (c: Row): Row => ({
  eSINo: c.ebookno,
  conId: c.conid,
  containerno: c.containerno,
  eqpSize: c.eqpSize,
  eqpType: c.eqpType,
  shipperOwn: c.soc,
  carrierSeal: '',
  ShipperSeal: '',
  tareWeight: c.tareWeight,
  cargoWeight: c.cargoWeight,
  grossweight: c.grossWeight,
  weightUnit: c.weightUnit,
  ref_nor: c.ref_nor,
  oog: c.oog,
  dgflag: c.dgFlag,
});

export const bookingCommodityAsSi = (m: Row): Row => ({
  conId: m.conid,
  containerno: m.containerno,
  itemno: m.itemno,
  commodity: m.commodity,
  HSCommodity: m.HSCommodity,
  package: m.package,
  packageQty: m.packageQty,
  itemWeight: m.itemWeight,
  itemVolume: m.cargoVolume,
  marksNo: m.marksNo,
  marksDesc: m.descr,
  hazardous: m.commodityFlag,
  nettwt: m.nettwt,
});

/** Pre-filled SI for a confirmed booking that has no SI yet ("Create SI"). */
export function bookingSiContext(booking: Row): SiContext {
  const legs = bookingLegs(booking);
  const main = mainLeg(legs);
  const si: Row = {
    eSINo: null,
    bookno: booking.extBookNo ?? booking.ebookno,
    blno: null,
    status: 'D',
    editbl: 0,
    custcode: booking.cust_code,
    Vessel: main?.vesselCode ?? null,
    Voyage: main?.voyageCode ?? null,
    bound: main?.bound ?? null,
    pla: booking.originPortId,
    pol: booking.loadPortId,
    pod: booking.dischargePortId,
    pld: booking.finalPortId,
    t2lfiling: booking.t2lfiling,
    ensType: booking.ensfiling,
    releasetype: booking.releasetype,
    ACID: booking.ACID,
    cargoprotectid: booking.cargoprotectid,
    fcnno: booking.fcnno,
    CrDate: booking.datecr,
    ChgDate: booking.dateup,
  };
  const ebookno = booking.ebookno;
  return {
    si,
    booking,
    legs,
    parties: childRows('bookingCust', 'ebookno', ebookno),
    cargo: childRows('bookingCargo', 'ebookno', ebookno).map(bookingCargoAsSi),
    commodities: childRows('bookingCommodity', 'ebookno', ebookno).map(bookingCommodityAsSi),
    dg: [],
    oog: [],
    reefer: [],
    charges: [],
    payers: [],
    files: [],
    ics: null,
    insurance: db.insurance.find(i => eq(i.book_no, ebookno) || (str(booking.extBookNo) && eq(i.lrpbook_no, booking.extBookNo))) ?? null,
  };
}

/** SIDTO by eSINo or booking number; a booking without SI yields the pre-filled draft; null when unknown. */
export function fixtureSiDetail(id: string): SIDTO | null {
  const si = findSiRow(id);
  if (si) return buildSiDetail(siContext(si));
  const booking = findBooking(id);
  return booking ? buildSiDetail(bookingSiContext(booking)) : null;
}

/** All plain SI rows (editbl = 0). */
export const plainSiRows = () => db.shippingInstructions.filter(isPlainSi);
