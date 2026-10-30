// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * BookingPayload (the wizard / detail shape) ⇄ ecombooking rows.
 *
 *   payloadFromRows(header, children)  — GET /api/booking/:id, templates, PDF
 *   rowsFromPayload(payload, …)        — POST submit / draft / import, PUT amend
 *
 * Column → field decisions are documented inline; every required field of BookingPayload is filled from
 * createEmptyContainer / createEmptyCommodity so nothing is undefined for the screens.
 */
import type {
  BookingDocument,
  BookingPayload,
  BookingRouteLeg,
  CargoData,
  CommodityItem,
  ContainerItem,
  EnsData,
  InsuranceData,
  MasterDetailsData,
  PartiesData,
  SelectedRoute,
} from '../../../features/booking/types/booking.types';
import { createEmptyCommodity, createEmptyContainer } from '../../../features/booking/types/booking.types';
import {
  createReferenceField,
  REFERENCE_FIELD_CATALOG,
  type ReferenceField,
  type ReferenceFieldKey,
} from '../../../features/booking/utils/reference-field.utils';
import { childRows, ciRow, db, eq, nowIso, type Row } from '../db';
import { findBookingRow } from './booking-list.bridge';
import { RATE_CURRENCY, RATE_TYPE } from './booking-rates.bridge';
import { buildRoute } from './booking-routing.bridge';
import { extractPortCode, mostCommon, num, str, toDateOnly, yes } from './booking-shared.bridge';
import { toIsoOrNull } from './format';
import { customerName, portLabel } from './masters.bridge';

export interface BookingChildren {
  parties: Row[];
  cargo: Row[];
  commodities: Row[];
  dg: Row[];
  oog: Row[];
  reefer: Row[];
  legs: Row[];
  haulage: Row[];
  cutoffs: Row[];
  files: Row[];
  ens: Row[];
  insurance: Row[];
  references: Row[];
}

export const CHILD_TABLES: Record<keyof BookingChildren, string> = {
  parties: 'bookingCust',
  cargo: 'bookingCargo',
  commodities: 'bookingCommodity',
  dg: 'bookingDg',
  oog: 'bookingOog',
  reefer: 'bookingRefer',
  legs: 'bookingLeg',
  haulage: 'bookingHaulage',
  cutoffs: 'bookingConf',
  files: 'bookingFiles',
  ens: 'bookingIcs',
  insurance: 'insurance',
  references: 'bookingReference',
};

/** ecombooking_cust.custTypeId codes. */
export const PARTY_TYPE = {
  bookingParty: 'BP',
  shipper: 'SH',
  consignee: 'CN',
  notify: 'NT',
  notify2: 'N1',
  forwarder: 'FW',
  agreement: 'AP',
} as const;

// TODO(fixtures): no DB source — insurance currency (ecom insurance only stores suminsured).
export const INSURANCE_CURRENCY = 'USD';

const OCEAN_FREIGHT: Record<string, MasterDetailsData['oceanFreight']> = { P: 'Prepaid', C: 'Collect' };
const OCEAN_FREIGHT_CODE: Record<string, string> = { Prepaid: 'P', Collect: 'C' };
const PICKUP_POINT: Record<string, MasterDetailsData['emptyPickupPoint']> = { T: 'Terminal', D: 'Depot' };
const PICKUP_POINT_CODE: Record<string, string> = { Terminal: 'T', Depot: 'D' };
const HAULAGE_TYPES = ['Live Load', 'Drop Only', 'Pickup only', 'Pickup & Drop'] as const;
const REF_TYPES = ['Normal', 'Express'] as const;
const TEMP_UNIT: Record<string, string> = { C: 'Celsius', F: 'Fahrenheit' };
const TEMP_UNIT_CODE: Record<string, string> = { Celsius: 'C', Fahrenheit: 'F' };
const DIMENSION_UNIT: Record<string, string> = { C: 'CM', M: 'M', F: 'FT', I: 'IN' };
const DIMENSION_UNIT_CODE: Record<string, string> = { CM: 'C', M: 'M', FT: 'F', IN: 'I' };
const LEG_TYPE_CODE: Record<BookingRouteLeg['legType'], string> = { Mainline: 'M', Feeder: 'F', Inland: 'T', Vessel: 'M' };
const BL_TYPES: EnsData['blType'][] = ['Straight BL', 'Master BL'];
const ENS_FILING_TYPES: EnsData['ensFilingType'][] = ['Single Filing', 'Multiple Filing'];
const PAYMENT_METHODS: EnsData['paymentMethod'][] = ['Wire Transfer', 'Not Prepaid'];

/**
 * ecombooking_reference.refid → wizard reference field. Only the codes the demo itself writes are mapped;
 * legacy codes (UCR, BSR, EBC, ERR, EOR, ERT, EOF) have no matching wizard field — SHR feeds shipperReference.
 */
const REFERENCE_KEYS = REFERENCE_FIELD_CATALOG.map(c => c.key);
const referenceKeyOf = (refid: unknown): ReferenceFieldKey | undefined =>
  REFERENCE_KEYS.find(k => k.toLowerCase() === str(refid).toLowerCase());

const oneOf = <T extends string>(allowed: readonly T[], v: unknown): T | undefined =>
  allowed.find(a => a.toLowerCase() === str(v).toLowerCase());

const party = (parties: Row[], type: string) => parties.find(p => str(p.custTypeId).toUpperCase() === type);
const address = (p: Row | undefined) => [str(p?.address1), str(p?.address2)].filter(Boolean).join(', ');

export function masterDetailsFromRows(b: Row, c: BookingChildren): MasterDetailsData {
  const agreement = party(c.parties, PARTY_TYPE.agreement);
  const cutoff = c.cutoffs[0];
  const route = buildRoute(str(b.ebookno), c.legs, cutoff);
  const firstCargo = c.cargo[0];
  const haulage = c.haulage[0];
  const hasRate = Boolean(str(b.rateno) || num(b.salesagreedrate) !== undefined);
  return {
    // The wizard's port fields hold the "CODE - NAME" display text (extractPortCode strips it back on save).
    origin: portLabel(b.originPortId),
    delivery: portLabel(b.finalPortId),
    cargoReadyDate: toDateOnly(b.bookReady) || toDateOnly(b.bookDate),
    haulageOriginType: str(b.preCarriage).toUpperCase() === 'C' ? 'Carrier' : 'Merchant',
    haulageDestinationType: str(b.onCarriage).toUpperCase() === 'C' ? 'Carrier' : 'Merchant',
    carriageContract: str(b.shipTerms),
    onlineBookingNo: str(b.ebookno),
    agreementParty: str(agreement?.name),
    preferredAgency: str(b.agencyid),
    additionalInformation: str(b.remarks),
    rateReference: str(b.rateno),
    agencyReference: str(b.agencyRefNo),
    oceanFreight: OCEAN_FREIGHT[str(b.oceanfreight).toUpperCase()] ?? '',
    placeOfFinalReceipt: str(haulage?.loadLocation),
    natCode: str(b.nat_code),
    haulageType: oneOf(HAULAGE_TYPES, b.haulagetype) ?? '',
    pickupDate: toDateOnly(b.pickupdate),
    dropDate: toDateOnly(b.dropdate) || toDateOnly(haulage?.dropDate),
    haulerCode: str(b.haulercode),
    customerPo: str(b.custPO),
    refType: oneOf(REF_TYPES, b.releasetype) ?? '',
    exportRef: str(b.exportRef),
    emptyPickupPoint: PICKUP_POINT[str(b.pickup_point).toUpperCase()] ?? '',
    emptyPickupFacility: str(b.emptypickup),
    emptyPickupDate: toDateOnly(b.emptypickupdate),
    customerReference: str(b.customerreference),
    acid: str(b.ACID),
    dpwShipperType: '',
    dpwShipperCode: '',
    selectedRoute: route ? { ...route, isDefaultRoute: true } : null,
    selectedRate: hasRate
      ? {
          rateNo: str(b.rateno),
          itemNo: '1',
          amdNo: String(num(b.version) ?? 0),
          rateType: RATE_TYPE,
          eqpType: str(firstCargo?.eqpSize).toUpperCase(),
          amount: num(b.salesagreedrate) ?? 0,
          currency: RATE_CURRENCY,
          customer: str(agreement?.name) || customerName(str(b.cust_code)),
          customerCode: str(b.cust_code),
        }
      : null,
  };
}

export function partiesFromRows(b: Row, c: BookingChildren): PartiesData {
  const shipper = party(c.parties, PARTY_TYPE.bookingParty) ?? party(c.parties, PARTY_TYPE.shipper);
  const consignee = party(c.parties, PARTY_TYPE.consignee);
  const notify = party(c.parties, PARTY_TYPE.notify);
  const notify2 = party(c.parties, PARTY_TYPE.notify2);
  const forwarder = party(c.parties, PARTY_TYPE.forwarder);
  const agreement = party(c.parties, PARTY_TYPE.agreement) ?? shipper;
  const shipperRef = c.references.find(r => str(r.refid).toUpperCase() === 'SHR');
  const siParty = str(b.sisubmitparty) || str(agreement?.name) || str(shipper?.name);
  return {
    shipperName: str(shipper?.name),
    shipperReference: str(b.ShipperReference) || str(shipperRef?.refval),
    shipperContact: str(shipper?.persontype),
    shipperAddress: address(shipper),
    shipperCity: str(shipper?.city),
    shipperCountry: str(shipper?.countryId).toUpperCase(),
    shipperEmail: str(shipper?.email),
    shipperPhone: str(shipper?.telephone),
    consigneeName: str(consignee?.name),
    consigneeContact: str(consignee?.persontype),
    consigneeAddress: address(consignee),
    consigneeCity: str(consignee?.city),
    consigneeCountry: str(consignee?.countryId).toUpperCase(),
    consigneeEmail: str(consignee?.email),
    consigneePhone: str(consignee?.telephone),
    notifyPartyName: str(notify?.name),
    notifyPartyContact: str(notify?.persontype),
    notifyPartyAddress: address(notify),
    notifyPartyCity: str(notify?.city),
    notifyPartyCountry: str(notify?.countryId).toUpperCase(),
    notifyPartyEmail: str(notify?.email),
    notifyPartyPhone: str(notify?.telephone),
    notifyParty2Name: str(notify2?.name),
    notifyParty2Contact: str(notify2?.persontype),
    freightForwarder: str(forwarder?.name),
    freightForwarderContact: str(forwarder?.persontype),
    agreementParty: str(agreement?.name),
    agreementPartyContact: str(agreement?.persontype),
    siSubmittingParty: siParty,
    siSubmittingPartyContact: str(agreement?.email),
  };
}

const sameContainer = (row: Row, cargo: Row) =>
  eq(row.conid, cargo.conid) || (str(cargo.containerno) !== '' && eq(row.containerno, cargo.containerno));

export function commodityFromRows(m: Row, dg: Row | undefined): CommodityItem {
  const empty = createEmptyCommodity();
  const flashPoint = dg && num(dg.FlashPt) !== undefined ? `${num(dg.FlashPt)}${str(dg.FlashPtUnit).toUpperCase()}` : '';
  return {
    ...empty,
    id: `${str(m.ebookno)}-c${str(m.conid)}-i${str(m.itemno) || '1'}`,
    commodity: str(m.commodity),
    hsCode: str(m.HSCommodity) || str(m.commodity),
    classCode: str(dg?.class),
    weight: num(m.itemWeight) ?? num(m.nettwt) ?? empty.weight,
    volume: num(m.cargoVolume) ?? 0,
    packageType: str(m.package).toUpperCase(),
    packageQuantity: num(m.packageQty) ?? empty.packageQuantity,
    description: str(m.descr),
    marksAndNumbers: str(m.marksNo),
    isDangerousGoods: Boolean(dg) || yes(m.commodityFlag),
    unNumber: str(dg?.unNo),
    dgClass: str(dg?.class),
    flashPoint,
    marinePollutant: yes(dg?.MarinePollutant),
    shippingName: '',
  };
}

export function containerFromRows(cargo: Row, c: BookingChildren): ContainerItem {
  const type = str(cargo.eqpSize).toUpperCase() || '20DC';
  const base = createEmptyContainer(type, { allocateMockNo: false });
  const commodities = c.commodities.filter(m => sameContainer(m, cargo)).sort((a, b) => Number(a.itemno ?? 0) - Number(b.itemno ?? 0));
  const dgRows = c.dg.filter(d => sameContainer(d, cargo));
  const oog = c.oog.find(o => sameContainer(o, cargo));
  // ecombooking_refer.conid does not always line up with the reefer box (stray rows exist on dry boxes in the
  // sample), so temperature settings are only applied to reefer equipment.
  const isReeferBox = str(cargo.eqpType).toUpperCase() === 'R' || /R[EFH]/.test(type);
  const reefer = isReeferBox ? c.reefer.find(r => sameContainer(r, cargo)) : undefined;
  const reeferMode: ContainerItem['reeferMode'] = yes(cargo.ref_nor) ? 'nor' : isReeferBox ? 'operating' : 'none';
  const isOog = yes(cargo.oog) || Boolean(oog);
  const items = commodities.length
    ? commodities.map(m => commodityFromRows(m, dgRows.find(d => eq(d.itemno, m.itemno)) ?? (commodities.length === 1 ? dgRows[0] : undefined)))
    : base.commodities;
  return {
    ...base,
    id: `${str(cargo.ebookno)}-c${str(cargo.conid)}`,
    containerType: type,
    containerNo: str(cargo.containerno),
    quantity: num(cargo.quantity) ?? 1,
    eqpStatus: str(cargo.eqpstatus).toUpperCase() === 'M' ? 'EMPTY' : 'LADEN',
    tareWeight: num(cargo.tareWeight) ?? base.tareWeight,
    isSoc: yes(cargo.soc),
    reeferMode,
    setTemp: num(reefer?.ref_setTemp),
    minTemp: num(reefer?.ref_minTemp),
    maxTemp: num(reefer?.ref_maxTemp),
    tempUnit: TEMP_UNIT[str(reefer?.ref_tempUnit).toUpperCase()] ?? base.tempUnit,
    isLcl: false,
    isOog,
    olForward: num(oog?.forward),
    olAft: num(oog?.alt),
    owLeft: num(oog?.leftft),
    owRight: num(oog?.rightft),
    oh: num(oog?.topft),
    dimensionUnit: DIMENSION_UNIT[str(oog?.unit).toUpperCase()] ?? base.dimensionUnit,
    commodities: items,
  };
}

export function cargoFromRows(c: BookingChildren): CargoData {
  const sorted = [...c.cargo].sort((a, b) => Number(a.conid ?? 0) - Number(b.conid ?? 0));
  return { containers: sorted.map(row => containerFromRows(row, c)) };
}

export function ensFromRows(c: BookingChildren): EnsData | null {
  const row = c.ens[0];
  if (!row) return null;
  return {
    euCustomsZone: yes(row.eucustom),
    blType: oneOf(BL_TYPES, row.bill_type) ?? 'Straight BL',
    ensFilingType: oneOf(ENS_FILING_TYPES, row.ens_type) ?? 'Single Filing',
    paymentMethod: oneOf(PAYMENT_METHODS, row.payment_mode) ?? 'Wire Transfer',
    declarantName: str(row.cust_name),
    declarantAddress: [str(row.address), str(row.address1) !== str(row.address) ? str(row.address1) : ''].filter(Boolean).join(', '),
    declarantCity: str(row.city),
    declarantCountry: str(row.country),
    declarantEori: str(row.enseori),
    declarantEmail: str(row.email),
    buyerName: '',
    buyerAddress: '',
    buyerCity: '',
    buyerCountry: '',
    sellerName: '',
    sellerAddress: '',
    sellerCity: '',
    sellerCountry: '',
  };
}

export function insuranceFromRows(b: Row, c: BookingChildren): InsuranceData {
  const row = c.insurance[0];
  const required = Boolean(row) || str(b.cargoprotectid) !== '';
  if (!required) return { isInsuranceRequired: false, currency: undefined, cargoValue: undefined, termsAccepted: false };
  return {
    isInsuranceRequired: true,
    currency: INSURANCE_CURRENCY,
    cargoValue: num(row?.suminsured) ?? num(row?.insurance_amount),
    termsAccepted: true,
  };
}

export function documentsFromRows(b: Row, c: BookingChildren): BookingDocument[] {
  const uploadedAt = toIsoOrNull(b.dateup) ?? toIsoOrNull(b.datecr) ?? nowIso();
  return c.files.map((f, i) => ({
    id: `${str(b.ebookno)}-doc-${i + 1}`,
    type: str(f.FileCatgeory).toUpperCase(),
    fileName: str(f.FileName),
    uploadedAt,
  }));
}

export function referenceFieldsFromRows(b: Row, c: BookingChildren): ReferenceField[] {
  const values: Partial<Record<ReferenceFieldKey, string>> = {
    rateRefNo: str(b.rateno),
    agencyRefNo: str(b.agencyRefNo),
    oceanFreightTerms: OCEAN_FREIGHT[str(b.oceanfreight).toUpperCase()] ?? '',
    natCode: str(b.nat_code),
    emptyPickupLocation: str(b.emptypickup),
    finalReceiptPlace: str(c.haulage[0]?.loadLocation),
    haulierCode: str(b.haulercode),
  };
  for (const r of c.references) {
    const key = referenceKeyOf(r.refid);
    if (key && str(r.refval)) values[key] = str(r.refval);
  }
  return REFERENCE_FIELD_CATALOG.filter(item => str(values[item.key]) !== '').map(item => {
    const field = createReferenceField(item, values[item.key]);
    field.id = `${str(b.ebookno)}-ref-${item.key}`;
    return field;
  });
}

export function payloadFromRows(b: Row, c: BookingChildren): BookingPayload {
  const status = str(b.ebook_status).toUpperCase();
  return {
    masterDetails: masterDetailsFromRows(b, c),
    parties: partiesFromRows(b, c),
    cargo: cargoFromRows(c),
    ens: ensFromRows(c),
    insurance: insuranceFromRows(b, c),
    documents: documentsFromRows(b, c),
    referenceFields: referenceFieldsFromRows(b, c),
    draftId: status === 'D' ? str(b.ebookno) : undefined,
  };
}

/** Child rows of one booking from the fixture store. */
export function childrenOf(b: Row): BookingChildren {
  const id = str(b.ebookno);
  const ext = str(b.extBookNo);
  return {
    parties: childRows('bookingCust', 'ebookno', id),
    cargo: childRows('bookingCargo', 'ebookno', id),
    commodities: childRows('bookingCommodity', 'ebookno', id),
    dg: childRows('bookingDg', 'ebookno', id),
    oog: childRows('bookingOog', 'ebookno', id),
    reefer: childRows('bookingRefer', 'ebookno', id),
    legs: childRows('bookingLeg', 'ebookno', id),
    haulage: childRows('bookingHaulage', 'ebookno', id),
    cutoffs: childRows('bookingConf', 'ebookno', id),
    files: childRows('bookingFiles', 'ebookno', id),
    ens: childRows('bookingIcs', 'ebookno', id),
    insurance: db.insurance.filter(i => eq(i.book_no, id) || (ext !== '' && eq(i.lrpbook_no, ext))),
    references: childRows('bookingReference', 'ebookno', id),
  };
}

export function fixtureBookingPayload(id: string): BookingPayload | null {
  const b = findBookingRow(id);
  return b ? payloadFromRows(b, childrenOf(b)) : null;
}

// ---------------------------------------------------------------------------------------------
// Reverse mapping: BookingPayload → rows (submit / draft / amend / import)
// ---------------------------------------------------------------------------------------------

let childSeq = 900_000;
const nextChildId = () => ++childSeq;

/** Customer / user context for rows the demo creates: the customer the sampled bookings belong to. */
export function demoBookingContext() {
  const custCode = mostCommon(db.bookings, 'cust_code') || str(db.userDetails[0]?.CustomerCode);
  const user = db.userDetails.find(u => eq(u.CustomerCode, custCode));
  return {
    custCode,
    agencyId: mostCommon(db.bookings, 'agencyid'),
    userEmail: str(user?.EmailID) || 'demo.user@example.com',
  };
}

export interface RowsFromPayloadOptions {
  ebookno: string;
  status: 'D' | 'S' | 'T';
  /** Existing header when amending/updating; audit columns are carried over. */
  existing?: Row;
  custCode: string;
  agencyId: string;
  userEmail: string;
}

const partyRow = (
  ebookno: string,
  custTypeId: string,
  custId: string,
  p: { name?: string; contact?: string; address?: string; city?: string; country?: string; email?: string; phone?: string },
): Row | null =>
  str(p.name)
    ? {
        cid: String(nextChildId()),
        ebookno,
        custTypeId,
        custId,
        countryId: str(p.country).toUpperCase(),
        name: str(p.name),
        address1: str(p.address),
        address2: '',
        city: str(p.city),
        zipCode: '',
        telephone: str(p.phone),
        fax: '',
        email: str(p.email),
        flag: null,
        toorder: null,
        stateId: '',
        eori: '',
        persontype: str(p.contact),
      }
    : null;

export function rowsFromPayload(payload: BookingPayload, o: RowsFromPayloadOptions): { header: Row; children: BookingChildren } {
  const m = payload.masterDetails;
  const p = payload.parties;
  const route = m?.selectedRoute ?? null;
  const ts = nowIso();
  const prev = o.existing;
  const origin = extractPortCode(m?.origin ?? '');
  const delivery = extractPortCode(m?.delivery ?? '');
  const header: Row = {
    ebookno: o.ebookno,
    agencyid: str(prev?.agencyid) || o.agencyId,
    originPortId: origin,
    finalPortId: delivery,
    loadPortId: route?.polPortId ?? origin,
    dischargePortId: route?.podPortId ?? delivery,
    bookDate: prev?.bookDate ?? ts,
    bookReady: toIsoOrNull(m?.cargoReadyDate) ?? ts,
    preCarriage: m?.haulageOriginType === 'Carrier' ? 'C' : 'M',
    onCarriage: m?.haulageDestinationType === 'Carrier' ? 'C' : 'M',
    remarks: str(m?.additionalInformation),
    usercr: str(prev?.usercr) || o.userEmail,
    datecr: prev?.datecr ?? ts,
    userup: o.userEmail,
    dateup: ts,
    ebook_status: o.status,
    extBookNo: prev?.extBookNo ?? null,
    cust_code: str(prev?.cust_code) || o.custCode,
    templatename: prev?.templatename ?? null,
    shipTerms: str(m?.carriageContract) || null,
    rateno: str(m?.selectedRate?.rateNo) || str(m?.rateReference),
    submitted_date: o.status === 'S' ? ts : (prev?.submitted_date ?? null),
    declined_remarks: prev?.declined_remarks ?? null,
    routeId: route?.routeId ?? null,
    agencyRefNo: str(m?.agencyReference),
    oceanfreight: OCEAN_FREIGHT_CODE[str(m?.oceanFreight)] ?? null,
    trptsvccode: str(prev?.trptsvccode),
    emptypickup: str(m?.emptyPickupFacility),
    emptypickupdate: toIsoOrNull(m?.emptyPickupDate),
    version: prev ? Number(prev.version ?? 0) + 1 : 0,
    isAmendment: prev ? 'Y' : null,
    intransitport: '',
    nat_code: str(m?.natCode),
    pickup_point: PICKUP_POINT_CODE[str(m?.emptyPickupPoint)] ?? '',
    appversion: 2,
    salesagreedrate: m?.selectedRate ? String(m.selectedRate.amount) : '',
    ccmailid: '',
    haulercode: str(m?.haulerCode),
    haulagetype: str(m?.haulageType),
    pickupdate: toIsoOrNull(m?.pickupDate),
    dropdate: toIsoOrNull(m?.dropDate),
    exportRef: str(m?.exportRef),
    releasetype: str(m?.refType) || 'Normal',
    custPO: str(m?.customerPo),
    customerreference: str(m?.customerReference),
    fcnno: null,
    ACID: str(m?.acid),
    cargoprotectid: payload.insurance?.isInsuranceRequired ? (prev?.cargoprotectid ?? String(nextChildId())) : null,
    ShipperReference: str(p?.shipperReference),
    ensfiling: payload.ens ? 'Y' : 'N',
    t2lfiling: 'N',
    sisubmitparty: str(p?.siSubmittingParty),
    ensType: payload.ens?.ensFilingType === 'Multiple Filing' ? 'M' : 'S',
    UCRRef: '',
  };

  const id = o.ebookno;
  const custCode = header.cust_code;
  const parties = [
    partyRow(id, PARTY_TYPE.bookingParty, custCode, {
      name: p?.shipperName, contact: p?.shipperContact, address: p?.shipperAddress, city: p?.shipperCity,
      country: p?.shipperCountry, email: p?.shipperEmail, phone: p?.shipperPhone,
    }),
    partyRow(id, PARTY_TYPE.consignee, '', {
      name: p?.consigneeName, contact: p?.consigneeContact, address: p?.consigneeAddress, city: p?.consigneeCity,
      country: p?.consigneeCountry, email: p?.consigneeEmail, phone: p?.consigneePhone,
    }),
    partyRow(id, PARTY_TYPE.notify, '', {
      name: p?.notifyPartyName, contact: p?.notifyPartyContact, address: p?.notifyPartyAddress, city: p?.notifyPartyCity,
      country: p?.notifyPartyCountry, email: p?.notifyPartyEmail, phone: p?.notifyPartyPhone,
    }),
    partyRow(id, PARTY_TYPE.notify2, '', { name: p?.notifyParty2Name, contact: p?.notifyParty2Contact }),
    partyRow(id, PARTY_TYPE.forwarder, '', { name: p?.freightForwarder, contact: p?.freightForwarderContact }),
    partyRow(id, PARTY_TYPE.agreement, custCode, { name: p?.agreementParty ?? m?.agreementParty, contact: p?.agreementPartyContact }),
  ].filter((r): r is Row => r !== null);

  const cargo: Row[] = [];
  const commodities: Row[] = [];
  const dg: Row[] = [];
  const oog: Row[] = [];
  const reefer: Row[] = [];
  (payload.cargo?.containers ?? []).forEach((ct, i) => {
    const conid = i + 1;
    const containerno = str(ct.containerNo);
    const items = ct.commodities ?? [];
    const cargoWeight = items.reduce((sum, x) => sum + (num(x.weight) ?? 0), 0);
    const tare = num(ct.tareWeight) ?? 0;
    const isReefer = ct.reeferMode !== 'none' || /R[EFH]/.test(str(ct.containerType).toUpperCase());
    cargo.push({
      id: nextChildId(),
      ebookno: id,
      conid,
      containerno,
      eqpType: isReefer ? 'R' : 'D',
      eqpSize: str(ct.containerType).toUpperCase(),
      soc: ct.isSoc ? 'Y' : 'N',
      ref_nor: ct.reeferMode === 'nor' ? 'Y' : 'N',
      quantity: num(ct.quantity) ?? 1,
      dgFlag: items.some(x => x.isDangerousGoods) ? 'Y' : 'N',
      tareWeight: tare,
      cargoWeight,
      grossWeight: cargoWeight + tare,
      weightUnit: 'K',
      eqpstatus: ct.eqpStatus === 'EMPTY' ? 'M' : 'F',
      oog: ct.isOog ? 'Y' : 'N',
      ctFlag: 'N',
    });
    items.forEach((x, j) => {
      const itemno = j + 1;
      commodities.push({
        id: nextChildId(),
        ebookno: id,
        conid,
        containerno,
        itemno,
        commodityFlag: x.isDangerousGoods ? 'Y' : 'N',
        commodity: str(x.commodity),
        HSCommodity: str(x.hsCode),
        package: str(x.packageType).toUpperCase(),
        packageQty: num(x.packageQuantity) ?? 0,
        cargoVolume: num(x.volume) ?? null,
        volumnUnit: 'M',
        marksNo: str(x.marksAndNumbers),
        descr: str(x.description),
        nettwt: null,
        itemWeight: num(x.weight) ?? 0,
        itemWeightUnit: 'K',
      });
      if (x.isDangerousGoods) {
        const fp = str(x.flashPoint).match(/^(-?\d+(?:\.\d+)?)\s*([CF])?/i);
        dg.push({
          id: nextChildId(),
          ebookno: id,
          conid,
          containerno,
          itemno,
          MarinePollutant: x.marinePollutant ? 'Y' : 'N',
          unNo: str(x.unNumber),
          class: str(x.dgClass),
          FlashPt: fp ? Number(fp[1]) : null,
          FlashPtUnit: fp?.[2]?.toUpperCase() ?? null,
        });
      }
    });
    if (ct.isOog) {
      oog.push({
        id: nextChildId(), ebookno: id, conid, containerno, comItemNo: 1,
        leftft: ct.owLeft ?? null, rightft: ct.owRight ?? null, forward: ct.olForward ?? null, alt: ct.olAft ?? null, topft: ct.oh ?? null,
        unit: DIMENSION_UNIT_CODE[str(ct.dimensionUnit).toUpperCase()] ?? 'C',
      });
    }
    if (ct.reeferMode !== 'none') {
      reefer.push({
        id: nextChildId(), ebookno: id, conid, itemno: 1, containerno,
        ref_setTemp: ct.setTemp ?? null, ref_minTemp: ct.minTemp ?? null, ref_maxTemp: ct.maxTemp ?? null,
        ref_tempUnit: TEMP_UNIT_CODE[str(ct.tempUnit)] ?? 'C',
        Humidity: '', Humidity_flag: false, Drains: '', CO2Value: '', O2Value: '', VentPercentage: '', gensetId: null,
      });
    }
  });

  const legs: Row[] = legRowsFromRoute(id, route);
  const cutoffs: Row[] = route && (route.gateInCutoff || route.siDocCutoff || route.vgmCutoff)
    ? [{
        cid: String(nextChildId()), ebookno: id,
        bkgCutoff: toIsoOrNull(route.gateInCutoff), docCutoff: toIsoOrNull(route.siDocCutoff), vgmCutoff: toIsoOrNull(route.vgmCutoff),
        bbroroCutoff: null, hazCutoff: null, portentryCutoff: null,
      }]
    : [];
  const haulage: Row[] = str(m?.placeOfFinalReceipt)
    ? [{
        id: nextChildId(), ebookno: id, eqprowid: 1, eqpId: str(cargo[0]?.containerno), eqptypeid: str(cargo[0]?.eqpSize),
        loadLocation: str(m?.placeOfFinalReceipt), loadlocationname: '', contactPerson: str(p?.shipperContact), contactAddress: str(p?.shipperAddress),
        contactPhone: str(p?.shipperPhone), contactEmail: str(p?.shipperEmail), referenceNumber: '', dropDate: toIsoOrNull(m?.dropDate),
        remarks: '', docType: '', overWeight: 'N', stopSequence: 1, TMSRefNo: null, TMSClientCode: null,
      }]
    : [];
  const files: Row[] = (payload.documents ?? []).map(d => ({ ebookno: id, FileCatgeory: str(d.type).toUpperCase(), FileName: str(d.fileName) }));
  const e = payload.ens;
  const ens: Row[] = e
    ? [{
        id: String(nextChildId()), ebookno: id, eucustom: e.euCustomsZone ? 'Y' : 'N', bill_type: e.blType, ens_type: e.ensFilingType,
        payment_mode: e.paymentMethod, cust_name: str(e.declarantName), address: str(e.declarantAddress), address1: str(e.declarantAddress),
        country: str(e.declarantCountry), state: '', telephone: '', email: str(e.declarantEmail), enseori: str(e.declarantEori),
        filing_type: '', city: str(e.declarantCity), zipcode: '',
      }]
    : [];
  const ins = payload.insurance;
  const insurance: Row[] = ins?.isInsuranceRequired
    ? [{
        id: nextChildId(), book_no: id, lrpbook_no: header.extBookNo, eqpid: '', commodity: str(commodities[0]?.commodity), quoteNo: null,
        policy_no: null, insurance_amount: null, partyType: PARTY_TYPE.agreement, lrpbl_no: null, policyStatus: 'N',
        suminsured: String(ins.cargoValue ?? 0), status: 'P', usercr: o.userEmail, datecr: ts, userup: o.userEmail, dateup: ts,
        contactName: str(p?.shipperContact), insuredParty: str(p?.shipperName), policyCreatedDate: null, confirmBL_Status: 'N',
        email: str(p?.shipperEmail), primaryEmail: o.userEmail,
      }]
    : [];
  const references: Row[] = (payload.referenceFields ?? [])
    .filter(f => str(f.value) !== '')
    .map(f => ({ id: String(nextChildId()), ebookno: id, refid: f.key, refval: str(f.value) }));

  return { header, children: { parties, cargo, commodities, dg, oog, reefer, legs, haulage, cutoffs, files, ens, insurance, references } };
}

function legRowsFromRoute(ebookno: string, route: SelectedRoute | null): Row[] {
  if (!route) return [];
  const legs: BookingRouteLeg[] = route.legs?.length
    ? route.legs
    : [{
        id: `${route.routeId}-1`, legType: 'Mainline', vesselName: route.vesselName, vesselCode: route.vesselCode, voyage: route.voyage,
        bound: route.bound, serviceName: route.serviceName, serviceCode: route.serviceCode, polPortId: route.polPortId, polPortName: route.polPortName,
        podPortId: route.podPortId, podPortName: route.podPortName, etd: route.etd, eta: route.eta, terminal: route.polTerminal,
      }];
  return legs.map((l, i) => ({
    id: nextChildId(),
    ebookno,
    leg_no: i + 1,
    bound: str(l.bound),
    serviceCode: str(l.serviceCode),
    vesselCode: str(l.vesselCode),
    voyageCode: str(l.voyage),
    legTypeId: LEG_TYPE_CODE[l.legType],
    loadPortId: str(l.polPortId).toUpperCase(),
    loadTerminal: str(l.terminal),
    dischargePortId: str(l.podPortId).toUpperCase(),
    dischargeTerminal: i === legs.length - 1 ? str(route.podTerminal) : '',
    etdDate: toIsoOrNull(l.etd),
    etaDate: toIsoOrNull(l.eta),
    loadType: 'L',
    dischType: 'D',
    groupcallid: null,
    callIdDischarge: null,
    callIdLoading: null,
    dbound: str(l.bound),
  }));
}

// ---------------------------------------------------------------------------------------------
// Store writers (mutate db so the session stays consistent)
// ---------------------------------------------------------------------------------------------

export function removeBookingChildren(ebookno: string) {
  for (const [key, table] of Object.entries(CHILD_TABLES) as [keyof BookingChildren, string][]) {
    const column = key === 'insurance' ? 'book_no' : 'ebookno';
    db[table] = db[table].filter(r => !eq(r[column], ebookno));
  }
}

/** New rows are wrapped like the fixtures so column access stays case-insensitive. */
export function writeBookingChildren(children: BookingChildren) {
  for (const [key, table] of Object.entries(CHILD_TABLES) as [keyof BookingChildren, string][]) {
    db[table].push(...children[key].map(ciRow));
  }
}

/** Insert a brand-new booking (header first in the list so it tops newest-first views). */
export function insertBooking(header: Row, children: BookingChildren) {
  db.bookings.unshift(ciRow(header));
  writeBookingChildren(children);
}

/** Replace an existing booking's header fields and all child rows in place. */
export function replaceBooking(existing: Row, header: Row, children: BookingChildren) {
  Object.assign(existing, header);
  removeBookingChildren(str(existing.ebookno));
  writeBookingChildren(children);
}

export function deleteBooking(ebookno: string) {
  db.bookings = db.bookings.filter(b => !eq(b.ebookno, ebookno));
  removeBookingChildren(ebookno);
}
