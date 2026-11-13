// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * B/L DTOs derived from the same ecomSI rows as the SI detail: BLDTO = SIDTO re-shaped + the list
 * facts (status / print / payment), BLChargesDTO from ecomSI_charges, BLInsuranceDTO from
 * ecominsurance, the voyage-closed guard from the booking's main leg, and MCN rows from the
 * B/L amendment versions (editbl ≥ 1 — there is no manifest-correction table in the database).
 */
import type {
  BLChargeLine,
  BLChargesDTO,
  BLChargeTotal,
  BLDTO,
  BLFileUploadItem,
  BLInsuranceDTO,
  BLListDTO,
  BLParty,
  BLRoutingLeg,
  MCNDTO,
  MCNListDTO,
} from '../../../features/bill-of-lading/types/bl.types';
import type { EnsData } from '../../../features/booking/types/booking.types';
import type { SIDTO, SIEnsInfo, SIFileItem, SIParty } from '../../../features/shipping-instruction/types/si.types';
import { db, eq, type Row } from '../db';
import { toIsoOrNull } from './format';
import { blRowFor, mcnIdOf } from './bl-list.bridge';
import { portCountry, vesselName } from './masters.bridge';
import { bookingLegs, findBlRow, findBooking, findSiRow, isAmendment, num, portLabel, str, voyageClosed } from './si-common.bridge';
import { buildSiDetail, findInsurance, freightOptionOf, siContext } from './si-detail.bridge';

// ---------------------------------------------------------------- SI → B/L shapes

export function siToBlParty(p: SIParty): BLParty {
  return {
    name: p.name,
    address: [p.address, p.address2].filter(Boolean).join(', '),
    city: p.city,
    country: p.country,
    printOnBl: p.printOnBl ?? true,
    printHeader: p.printHeader,
    email: p.email,
    phone: p.phone,
    fax: p.fax,
    zipCode: p.zip,
    eori: p.eori,
    personType: p.personType,
    state: p.state,
  };
}

/** SIEnsInfo (SI wizard shape) → EnsData (booking / B/L wizard shape). */
export function siEnsToBlEns(ens: SIEnsInfo | null | undefined): EnsData | null {
  if (!ens) return null;
  const d = ens.declarant;
  return {
    euCustomsZone: ens.euCustZone === 'Y',
    blType: ens.blTypeEns,
    ensFilingType: ens.ensFillingType,
    paymentMethod: ens.paymentMethod,
    declarantName: d?.name,
    declarantAddress: d ? [d.address, d.address2].filter(Boolean).join(', ') : undefined,
    declarantCity: d?.city,
    declarantCountry: d?.country,
    declarantEori: d?.eori,
    declarantEmail: d?.email ?? '',
    buyerName: ens.buyer.name,
    buyerAddress: ens.buyer.address,
    buyerCity: ens.buyer.city,
    buyerCountry: ens.buyer.country,
    sellerName: ens.seller.name,
    sellerAddress: ens.seller.address,
    sellerCity: ens.seller.city,
    sellerCountry: ens.seller.country,
  };
}

/** ecomSI_files.FileCatgeory (VGM / DG / LOL / OT / MSD) → upload category. */
export function fileCategory(code: unknown): BLFileUploadItem['category'] {
  const c = str(code).toUpperCase();
  if (c === 'VGM' || c === 'DG') return c;
  if (c === 'LOI' || c === 'LOL') return 'LOI';
  return 'OTHER';
}

export const siFileToBlFile = (f: SIFileItem): BLFileUploadItem => ({
  id: f.id,
  category: fileCategory(f.fileType),
  fileName: f.fileName,
  uploadedAt: f.uploadedAt,
});

/** BLDTO from the list row (status facts) + the SI detail (content) + the raw ecomSI row (B/L-only columns). */
export function buildBlDetail(row: BLListDTO, si: SIDTO, raw: Row): BLDTO {
  const p = si.parties;
  const preview = si.preview ?? {};
  return {
    id: row.blNo,
    blNo: row.blNo,
    siNo: si.siNo ?? '',
    bookingNo: row.bookingNo,
    status: row.status,
    blType: si.blType,
    releaseType: si.releaseType,
    freightOption: si.freightOption,
    appVersion: row.appVersion,
    printCount: row.printStatus === 'Y' ? 1 : 0,
    issuedAt: row.status === 'I' ? toIsoOrNull(raw.ChgDate) : null,
    mcnNo: row.mcnNo,
    agencyRefNo: row.agencyRefNo,
    origin: row.origin,
    loadPort: row.loadPort,
    dischargePort: row.dischargePort,
    delivery: row.delivery,
    loadPortCountry: portCountry(raw.pol) ?? (str(raw.pol).slice(0, 2) || undefined),
    dischargePortCountry: portCountry(raw.pod) ?? (str(raw.pod).slice(0, 2) || undefined),
    t2lFiling: si.t2lFiling,
    nvocc: si.nvocc,
    ensFiling: si.ensFilingHint,
    routing: {
      originPrint: si.routing?.originPrint ?? row.origin,
      polPrint: si.routing?.polPrint ?? row.loadPort,
      podPrint: si.routing?.podPrint ?? row.dischargePort,
      deliveryPrint: si.routing?.deliveryPrint ?? row.delivery,
      vesselVoyage: si.routing?.vesselVoyage ?? '',
      scheduleLegs: (si.routing?.scheduleLegs ?? []).map((leg): BLRoutingLeg => ({ legType: 'Ocean', ...leg })),
    },
    preview: {
      declaredValue: preview.declaredValue,
      siCustRemarks: preview.customerRemarks,
      siAesNumber: preview.aesNumber,
      aesDisclaimer: preview.aesDisclaimer,
      packingList: str(raw.packinglst) || undefined,
      invoiceUpload: str(raw.invoiceupload) || undefined,
      blTypeUae: preview.blTypeUae,
      mpciIdUae: preview.mpciIdUae,
      acidValue: preview.acidValue,
    },
    parties: {
      shipper: siToBlParty(p.shipper),
      consignee: p.consignee ? { ...siToBlParty(p.consignee), toOrder: p.consignee.toOrder } : undefined,
      notify: siToBlParty(p.notify),
      notify2: p.notify2 ? siToBlParty(p.notify2) : undefined,
      notify3: p.notify3 ? siToBlParty(p.notify3) : undefined,
      forwarder: p.forwarder ? siToBlParty(p.forwarder) : undefined,
      warehouse: p.warehouse ? siToBlParty(p.warehouse) : undefined,
      agreementParty: p.agreementParty ? siToBlParty(p.agreementParty) : undefined,
    },
    containers: si.containers,
    charges: si.charges ?? [],
    ens: siEnsToBlEns(si.ens),
    insurance: si.insurance ? { ...si.insurance } : null,
    cargoProtect: si.cargoProtect ?? [],
    files: (si.files ?? []).map(siFileToBlFile),
    referenceFields: si.referenceFields ?? [],
  };
}

// ---------------------------------------------------------------- charges / insurance

/** Per-currency prepaid / collect / pay-at totals of the lines. */
export function chargeTotals(lines: BLChargeLine[]): BLChargeTotal[] {
  const byCurrency = new Map<string, BLChargeTotal>();
  for (const l of lines) {
    const t = byCurrency.get(l.currency) ?? { currency: l.currency, prepaid: 0, collect: 0, payAt: 0, grandTotal: 0 };
    t.prepaid += l.prepaidAmount ?? (l.prepaidCollect === 'PREPAID' ? l.amount : 0);
    t.collect += l.collectAmount ?? (l.prepaidCollect === 'COLLECT' ? l.amount : 0);
    t.payAt += l.payAtAmount ?? (l.prepaidCollect === 'PAY_AT' ? l.amount : 0);
    t.grandTotal = t.prepaid + t.collect + t.payAt;
    byCurrency.set(l.currency, t);
  }
  return [...byCurrency.values()];
}

export const buildBlCharges = (blNo: string, lines: BLChargeLine[]): BLChargesDTO => ({ blNo, lines, totals: chargeTotals(lines) });

/** ecominsurance row → BLInsuranceDTO. TODO(fixtures): no DB source — insurer name (only the policy / quote numbers are stored). */
export function mapBlInsurance(blNo: string, row: Row): BLInsuranceDTO {
  return {
    blNo,
    policyNo: str(row.policy_no) || str(row.quoteNo),
    provider: 'Cargo Protect (policy via agency)',
    coverageAmount: num(row.suminsured) || num(row.insurance_amount),
    currency: 'USD',
    effectiveDate: toIsoOrNull(row.policyCreatedDate) ?? toIsoOrNull(row.datecr) ?? '',
  };
}

// ---------------------------------------------------------------- MCN (derived from amendment versions)

export const MCN_STATUS: Record<string, MCNDTO['status']> = {
  D: 'Draft',
  S: 'Submitted',
  A: 'Confirmed',
  C: 'Confirmed',
  P: 'Confirmed',
  I: 'Confirmed',
};

export const mcnStatusOf = (si: Row): MCNDTO['status'] => MCN_STATUS[str(si.status).toUpperCase()] ?? 'Draft';

export function mapMcnRow(si: Row): MCNListDTO {
  return {
    mcnId: mcnIdOf(si),
    blNo: str(si.blno),
    bookingNo: str(si.bookno),
    status: mcnStatusOf(si),
    origin: portLabel(si.pla ?? si.pol, si.plaHeaderName ?? si.polHeaderName),
    delivery: portLabel(si.pld ?? si.pod, si.pldHeaderName ?? si.podHeaderName),
  };
}

export function mapMcnDetail(si: Row, containers: Row[], commodities: Row[], charges: Row[]): MCNDTO {
  const freight = freightOptionOf(si, charges.map(c => ({ chargeCode: str(c.chargeid), prepaidCollect: eq(c.prepaidcollect, 'C') ? 'COLLECT' : 'PREPAID' }) as BLChargeLine));
  const description = commodities.map(c => str(c.marksDesc)).filter(Boolean);
  return {
    ...mapMcnRow(si),
    vessel: vesselName(str(si.Vessel)),
    voyage: str(si.Voyage),
    loadPort: portLabel(si.pol, si.polHeaderName),
    dischargePort: portLabel(si.pod, si.podHeaderName),
    containerCount: containers.length,
    remarks: str(si.custremarks) || undefined,
    cargoDescription: description.length ? [...new Set(description)].join('; ') : undefined,
    freightTerms: freight === 'COLLECT' ? 'Collect' : 'Prepaid',
  };
}

/** Amendment versions that still stand (a cancelled amendment, status I with cancel remarks, is not a manifest correction). */
export const mcnRows = (rows: Row[]): Row[] => rows.filter(r => isAmendment(r) && str(r.blno) && !eq(r.status, 'I'));

export const findMcnRow = (mcnId: unknown): Row | null =>
  mcnRows(db.shippingInstructions).find(r => eq(mcnIdOf(r), mcnId)) ?? null;

// ---------------------------------------------------------------- db-backed accessors

/** List row + detail for the latest version of a B/L number; null when unknown. */
export function fixtureBlDetail(blNo: string): BLDTO | null {
  const raw = findBlRow(blNo);
  if (!raw) return null;
  const row = blRowFor(raw, findBooking(raw.bookno));
  return buildBlDetail(row, buildSiDetail(siContext(raw)), raw);
}

/** Draft B/L built from an SI (status D, B/L number = the SI's blno when the carrier already allotted one). */
export function fixtureBlFromSi(siNo: string): BLDTO | null {
  const raw = findSiRow(siNo);
  if (!raw) return null;
  const detail = buildSiDetail(siContext(raw));
  const row = blRowFor(raw, findBooking(raw.bookno));
  const blNo = str(raw.blno) || str(raw.eSINo);
  return { ...buildBlDetail({ ...row, blNo, status: 'D', statusLabel: 'Draft', printStatus: 'N' }, detail, raw), siNo: str(raw.eSINo) };
}

export function fixtureBlCharges(blNo: string): BLChargesDTO | null {
  const detail = fixtureBlDetail(blNo);
  return detail ? buildBlCharges(blNo, detail.charges) : null;
}

export function fixtureBlInsurance(blNo: string): BLInsuranceDTO | null {
  const raw = findBlRow(blNo);
  const row = raw ? findInsurance(raw) : (db.insurance.find(i => eq(i.lrpbl_no, blNo)) ?? null);
  return row ? mapBlInsurance(blNo, row) : null;
}

/** Closed when the linked booking's main-leg ETD is in the past. */
export function fixtureVoyageClosed(blNo: string, now: number = Date.now()): boolean {
  const raw = findBlRow(blNo) ?? findSiRow(blNo);
  if (!raw) return false;
  return voyageClosed(bookingLegs(findBooking(raw.bookno)), now);
}

export const fixtureMcnList = (): MCNListDTO[] =>
  mcnRows(db.shippingInstructions)
    .sort((a, b) => +new Date(b.ChgDate) - +new Date(a.ChgDate))
    .map(mapMcnRow);

export function fixtureMcnDetail(mcnId: string): MCNDTO | null {
  const si = findMcnRow(mcnId);
  if (!si) return null;
  return mapMcnDetail(
    si,
    db.siCargo.filter(c => eq(c.eSINo, si.eSINo)),
    db.siCommodity.filter(c => eq(c.eSINo, si.eSINo)),
    db.siCharges.filter(c => eq(c.esino, si.eSINo)),
  );
}
