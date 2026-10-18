// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * Maps the latest ecomSI row per B/L number onto the BLListDTO the B/L list screen already renders.
 * A B/L number appears on the plain SI once the carrier accepts it (editbl=0, "Verify Copy") and on
 * every customer amendment version (editbl ≥ 1) whose ecomSI.status follows the BOL wording of
 * statusDescriptions.json. Used by src/mocks/bl.handlers.ts.
 */
import type { BLListDTO, BLRowStatus } from '../../../features/bill-of-lading/types/bl.types';
import { BL_STATUS_LABELS } from '../../../features/bill-of-lading/types/bl.types';
import { db, eq, hasFixtures, type Row } from '../db';
import { toIsoOrNull } from './format';
import { findInsurance } from './si-detail.bridge';
import { isAmendment, isPlainSi, latestVersion, num, portLabel, str, yes } from './si-common.bridge';
import { bookingIndex, isSiLocked } from './si-list.bridge';

/**
 * ecomSI.status of an amendment version → B/L row status (module BOL of statusDescriptions):
 * D "Verify Copy", S "Submitted by customer", A "Approved by customer" and C "Confirmed by Carrier"
 * both show as Confirmed, P "Ready to print" and I "Released" both show as Issued.
 */
export const BL_ROW_STATUS: Record<string, BLRowStatus> = {
  D: 'D',
  S: 'S',
  A: 'C',
  C: 'C',
  P: 'I',
  I: 'I',
};

/** MCN id derived from the amendment version row (there is no manifest-correction table). */
export const mcnIdOf = (si: Row) => `MCN-${str(si.eSINo)}`;

/** B/L row status: amendments follow the BOL map; a plain SI that merely carries a blno is a Verify Copy. */
export function blRowStatus(si: Row): BLRowStatus {
  if (!isAmendment(si)) return 'D';
  return BL_ROW_STATUS[str(si.status).toUpperCase()] ?? 'D';
}

/** Latest blversion per blno among the rows carrying a B/L number; cancelled plain SIs (status I) are void. */
export function latestBlVersions(rows: Row[]): Row[] {
  const byBl = new Map<string, Row[]>();
  for (const r of rows) {
    if (!str(r.blno)) continue;
    if (isPlainSi(r) && eq(r.status, 'I')) continue;
    const key = str(r.blno).toLowerCase();
    byBl.set(key, [...(byBl.get(key) ?? []), r]);
  }
  return [...byBl.values()].map(v => latestVersion(v)!).filter(Boolean);
}

/** Facts that come from other tables than ecomSI. */
export interface BlRowExtras {
  locked?: boolean;
  policyNo?: string | null;
  /** ecomPaymentReferences rows (refType BL) for the B/L and whether a linked payment COMPLETED. */
  paymentRefs?: Row[];
  paymentCompleted?: boolean;
  /** true when at least one charge line is prepaid (the customer has something to pay). */
  hasPrepaid?: boolean;
  issueAgency?: string;
}

export const appVersionOf = (si: Row): '1' | '2' => (num(si.appversion) >= 2 || /v2/i.test(str(si.appversion)) ? '2' : '1');

export function mapBlRow(si: Row, booking: Row | null, hasInsurance: boolean, extras: BlRowExtras = {}): BLListDTO {
  const status = blRowStatus(si);
  const confirmed = status === 'C' || status === 'I';
  const payAmountUsd = extras.paymentRefs?.length ? extras.paymentRefs.reduce((s, r) => s + num(r.amountUsd), 0) : undefined;
  return {
    blNo: String(si.blno),
    mcnNo: isAmendment(si) && !eq(si.status, 'I') ? mcnIdOf(si) : null,
    bookingNo: String(si.bookno ?? ''),
    siNo: si.eSINo ? String(si.eSINo) : null,
    status,
    statusLabel: BL_STATUS_LABELS[status],
    agencyRefNo: booking?.AgencyRefNo ? String(booking.AgencyRefNo) : null,
    origin: portLabel(si.pla ?? si.pol, si.plaHeaderName ?? si.polHeaderName),
    loadPort: portLabel(si.pol, si.polHeaderName),
    dischargePort: portLabel(si.pod, si.podHeaderName),
    delivery: portLabel(si.pld ?? si.pod, si.pldHeaderName ?? si.podHeaderName),
    confirmedDate: confirmed ? toIsoOrNull(si.ChgDate) : null,
    createdDate: toIsoOrNull(si.CrDate),
    printStatus: confirmed ? 'Y' : 'N', // originals are printable once the carrier confirmed
    appVersion: appVersionOf(si),
    isLocked: extras.locked ?? false,
    draftAccepted: isAmendment(si) && eq(si.status, 'A'),
    paymentEligible: confirmed && (extras.hasPrepaid ?? false) && !(extras.paymentCompleted ?? false),
    paymentCompleted: extras.paymentCompleted ?? false,
    payAmountUsd,
    fcnNo: str(si.fcnno) || undefined,
    hasInsurance,
    policyNo: extras.policyNo ?? null,
    issueAgency: extras.issueAgency ?? (str(booking?.agencyid) || str(si.pol) || undefined),
  };
}

/** Payment references of type BL for a B/L number and whether one of their payments completed. */
export function paymentFacts(blNo: unknown): Pick<BlRowExtras, 'paymentRefs' | 'paymentCompleted'> {
  const refs = db.paymentReferences.filter(r => eq(r.refType, 'BL') && eq(r.refNo, blNo));
  const completed = refs.some(r => db.payments.some(p => eq(p.requestId, r.requestId) && eq(p.status, 'COMPLETED')));
  return { paymentRefs: refs, paymentCompleted: completed };
}

/** Everything the list row needs for one ecomSI row, read from the fixture db. */
export function blRowFor(si: Row, booking: Row | null): BLListDTO {
  const insurance = findInsurance(si);
  const charges = db.siCharges.filter(c => eq(c.esino, si.eSINo));
  return mapBlRow(si, booking, !!insurance, {
    locked: isSiLocked(si, db.siLocks),
    policyNo: insurance && yes(insurance.policyStatus) ? str(insurance.policy_no) || null : null,
    ...paymentFacts(si.blno),
    hasPrepaid: charges.some(c => eq(c.prepaidcollect, 'P')),
    issueAgency: str(booking?.agencyid) || str(charges.find(c => eq(c.prepaidcollect, 'P'))?.payagencyid) || str(si.pol) || undefined,
  });
}

/** B/L list rows from the fixtures, newest first; null when no SI fixtures were extracted. */
export function fixtureBlList(): BLListDTO[] | null {
  if (!hasFixtures('shippingInstructions')) return null;
  const bookings = bookingIndex(db.bookings);
  return latestBlVersions(db.shippingInstructions)
    .sort((a, b) => +new Date(b.ChgDate) - +new Date(a.ChgDate))
    .map(si => blRowFor(si, bookings.get(str(si.bookno).toLowerCase()) ?? null));
}
