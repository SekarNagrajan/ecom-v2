// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * VGM declaration (VgmDeclarationDTO) from the fixtures:
 *   vgm                  (ecom_vgmsolas)      one row per container submission; status A/C = current, I = superseded
 *   bookings/bookingCargo/bookingCust/bookingLeg  reference details, equipment and parties when searched by booking no
 *   shippingInstructions/siCargo/siCust       the same when searched by B/L no (or when the booking has an SI)
 *
 * A reference is found when a booking, an SI or at least one VGM row matches; the containers are the
 * union of SI cargo, booking cargo and the container ids already declared in ecom_vgmsolas.
 */
import type {
  VgmContainerDTO,
  VgmDeclarationDTO,
  VgmReferenceDetailsDTO,
  VgmSubmitPayload,
} from '../../../features/vgm/types/vgm.types';
import { ciRow, db, eq, nextRef, nowIso, type Row } from '../db';
import { toIsoOrNull } from './format';
import { portLabel as masterPortLabel } from './masters.bridge';
import { formatYmdHm } from './minute-format';
import { currentFixtureUser } from './user.bridge';

type RefType = 'bookno' | 'blno';

/** The subset of tables the pure functions read, so tests can pass inline rows. */
export interface VgmSources {
  bookings: Row[];
  bookingCargo: Row[];
  bookingCust: Row[];
  bookingLeg: Row[];
  shippingInstructions: Row[];
  siCargo: Row[];
  siCust: Row[];
  vgm: Row[];
}

export const fixtureVgmSources = (): VgmSources => db;

export interface VgmReference {
  type: RefType;
  referenceNo: string;
  booking: Row | null;
  si: Row | null;
  vgmRows: Row[];
}

type Declarant = Omit<VgmDeclarationDTO, 'referenceDetails' | 'containers'>;

const str = (v: unknown): string | undefined => {
  const s = String(v ?? '').trim();
  return s ? s : undefined;
};

const latestSi = (rows: Row[]) =>
  [...rows].sort((a, b) => Number(b.blversion ?? 0) - Number(a.blversion ?? 0) || +new Date(b.ChgDate) - +new Date(a.ChgDate))[0] ?? null;

const byBooking = (b: Row, value: unknown) => eq(b.extBookNo, value) || eq(b.ebookno, value);

/** Resolves booking / SI / VGM rows for a reference; null when nothing in the sample matches. */
export function resolveVgmReference(type: RefType, referenceNo: string, src: VgmSources = fixtureVgmSources()): VgmReference | null {
  const ref = referenceNo.trim();
  if (!ref) return null;
  let booking: Row | null = null;
  let si: Row | null = null;
  let vgmRows: Row[] = [];
  if (type === 'bookno') {
    booking = src.bookings.find(b => byBooking(b, ref)) ?? null;
    const bookingNos = [ref, booking?.extBookNo, booking?.ebookno].filter(Boolean);
    si = latestSi(src.shippingInstructions.filter(s => bookingNos.some(n => eq(s.bookno, n))));
    vgmRows = src.vgm.filter(v => bookingNos.some(n => eq(v.book_no, n)));
  } else {
    si = latestSi(src.shippingInstructions.filter(s => eq(s.blno, ref)));
    booking = si ? src.bookings.find(b => byBooking(b, si!.bookno)) ?? null : null;
    vgmRows = src.vgm.filter(v => eq(v.bl_no, ref) || (si && eq(v.book_no, si.bookno)));
  }
  if (!booking && !si && !vgmRows.length) return null;
  return { type, referenceNo: ref, booking, si, vgmRows };
}

const newestVgmFirst = (a: Row, b: Row) =>
  Number(b.Version_no ?? 0) - Number(a.Version_no ?? 0) || +new Date(b.Datecr) - +new Date(a.Datecr);

/** The current (status A or C) declaration of one container, newest version first. */
export function latestActiveVgm(rows: Row[], eqpid: unknown): Row | null {
  return rows
    .filter(v => eq(v.eqpid, eqpid) && ['A', 'C'].includes(String(v.status ?? '').toUpperCase()))
    .sort(newestVgmFirst)[0] ?? null;
}

/** The most recent row of the reference regardless of status — source of the declarant block. */
export const latestVgmRow = (rows: Row[]): Row | null => [...rows].sort((a, b) => +new Date(b.Datecr) - +new Date(a.Datecr))[0] ?? null;

/** "20RE" and "RE20" describe the same equipment; compare digits and letters separately. */
const sizeKey = (v: unknown) => {
  const s = String(v ?? '').toUpperCase();
  return `${s.replace(/\D/g, '')}|${s.replace(/\d/g, '')}`;
};

export function mapVgmContainer(containerNo: string, eqpType: string, tareWeight: number, current: Row | null): VgmContainerDTO {
  return {
    containerNo,
    eqpType,
    tareWeight,
    vgmWeight: current && current.VGM_Weight != null ? Number(current.VGM_Weight) : null,
    vgmUnit: String(current?.VGM_unit ?? 'K').toUpperCase() === 'T' ? 'T' : 'K',
    method: String(current?.VGM_Obtained_Method ?? 'SM1').toUpperCase() === 'SM2' ? 'SM2' : 'SM1',
    date: current ? toIsoOrNull(current.VGM_Obtained_Date ?? current.Datecr) : null,
  };
}

/** SI cargo ∪ booking cargo ∪ containers already declared, in that order, de-duplicated. */
export function vgmContainers(ref: VgmReference, src: VgmSources = fixtureVgmSources()): VgmContainerDTO[] {
  const cargo: Row[] = [
    ...(ref.si ? src.siCargo.filter(c => eq(c.eSINo, ref.si!.eSINo)) : []),
    ...(ref.booking ? src.bookingCargo.filter(c => eq(c.ebookno, ref.booking!.ebookno)) : []),
  ];
  const ids: string[] = [];
  const seen = new Set<string>();
  const add = (v: unknown) => {
    const id = String(v ?? '').trim();
    if (!id || seen.has(id.toUpperCase())) return;
    seen.add(id.toUpperCase());
    ids.push(id);
  };
  cargo.forEach(c => add(c.containerno));
  [...ref.vgmRows].sort(newestVgmFirst).forEach(v => add(v.eqpid));

  return ids.map(id => {
    const current = latestActiveVgm(ref.vgmRows, id);
    const anyVgm = current ?? ref.vgmRows.filter(v => eq(v.eqpid, id)).sort(newestVgmFirst)[0] ?? null;
    const own = cargo.find(c => eq(c.containerno, id)) ?? null;
    const eqpType = String(anyVgm?.eqptype || own?.eqpSize || own?.eqpType || '');
    const sameSize = own ?? cargo.find(c => sizeKey(c.eqpSize) === sizeKey(eqpType)) ?? null;
    return mapVgmContainer(id, eqpType, Number(sameSize?.tareWeight ?? 0), current);
  });
}

/** "CODE - NAME" from the SI header name when stored, else from the ports master (code alone when unknown). */
const portLabel = (code: unknown, name: unknown) => {
  const c = String(code ?? '').trim();
  const n = String(name ?? '').trim();
  return c && n ? `${c} - ${n}` : masterPortLabel(c);
};

const party = (rows: Row[], type: string) => rows.find(r => eq(r.custTypeId, type)) ?? null;

export function mapVgmReferenceDetails(ref: VgmReference, src: VgmSources = fixtureVgmSources()): VgmReferenceDetailsDTO {
  const { booking, si } = ref;
  const bookingParties = booking ? src.bookingCust.filter(c => eq(c.ebookno, booking.ebookno)) : [];
  const siParties = si ? src.siCust.filter(c => eq(c.eSINo, si.eSINo)) : [];
  const latest = latestVgmRow(ref.vgmRows);
  const shipperName =
    str(si?.shippername) ?? str(party(siParties, 'SH')?.name) ?? str(party(bookingParties, 'SH')?.name) ?? str(latest?.VGM_Company_Name) ?? '';
  const apName = str(party(bookingParties, 'AP')?.name) ?? str(party(siParties, 'AP')?.name) ?? shipperName;
  const legs = booking ? src.bookingLeg.filter(l => eq(l.ebookno, booking.ebookno)) : [];
  const etd = legs.map(l => l.etdDate).filter(Boolean).sort((a, b) => +new Date(a) - +new Date(b))[0];
  const eta = legs.map(l => l.etaDate).filter(Boolean).sort((a, b) => +new Date(b) - +new Date(a))[0];
  const ports = si
    ? { origin: portLabel(si.pla, si.plaHeaderName), pol: portLabel(si.pol, si.polHeaderName), pod: portLabel(si.pod, si.podHeaderName), delivery: portLabel(si.pld, si.pldHeaderName) }
    : booking
      ? { origin: portLabel(booking.originPortId, null), pol: portLabel(booking.loadPortId, null), pod: portLabel(booking.dischargePortId, null), delivery: portLabel(booking.finalPortId, null) }
      : { origin: '', pol: '', pod: '', delivery: '' };
  const details: VgmReferenceDetailsDTO = { referenceNo: ref.referenceNo, type: ref.type, shipperName, apName, ...ports };
  if (etd) details.etd = formatYmdHm(etd);
  if (eta) details.eta = formatYmdHm(eta);
  return details;
}

/** Declarant block: latest VGM row, else the booking/SI shipper party, else the logged-in user. */
export function mapVgmDeclarant(latest: Row | null, fallbackParty: Row | null, user: Row | null): Declarant {
  const p = fallbackParty;
  const u = user;
  const declarant: Declarant = {
    companyName: str(latest?.VGM_Company_Name) ?? str(p?.name) ?? str(u?.Comp_Name),
    orderNo: str(latest?.VGM_order_Number),
    addr1: str(latest?.VGM_Address1) ?? str(p?.address1) ?? str(u?.Address),
    addr2: str(latest?.VGM_Address2) ?? str(p?.address2) ?? str(u?.Address2),
    obtainDate: toIsoOrNull(latest?.VGM_Obtained_Date) ?? undefined,
    obtainMethod: String(latest?.VGM_Obtained_Method ?? 'SM1').toUpperCase() === 'SM2' ? 'SM2' : 'SM1',
    authPerson: str(latest?.VGM_Authorized_Person) ?? str([u?.First_Name, u?.Last_Name].filter(Boolean).join(' ')),
    country: str(latest?.VGM_Country) ?? str(p?.countryId) ?? str(u?.Country),
    city: str(latest?.VGM_City) ?? str(p?.city) ?? str(u?.City),
    phone: str(latest?.Telephone) ?? str(p?.telephone) ?? str(u?.User_Phone),
    email: str(latest?.Email) ?? str(p?.email) ?? str(u?.User_Email),
    zipcode: str(latest?.VGM_Zipcode) ?? str(p?.zipCode) ?? str(u?.Pin_Code),
    fax: str(latest?.Fax) ?? str(p?.fax) ?? str(u?.User_Fax),
  };
  return Object.fromEntries(Object.entries(declarant).filter(([, v]) => v !== undefined)) as Declarant;
}

export function buildVgmDeclaration(type: RefType, referenceNo: string, src: VgmSources = fixtureVgmSources(), user: Row | null = currentFixtureUser()?.user ?? null): VgmDeclarationDTO | null {
  const ref = resolveVgmReference(type, referenceNo, src);
  if (!ref) return null;
  const bookingParties = ref.booking ? src.bookingCust.filter(c => eq(c.ebookno, ref.booking!.ebookno)) : [];
  const siParties = ref.si ? src.siCust.filter(c => eq(c.eSINo, ref.si!.eSINo)) : [];
  const fallbackParty = party(siParties, 'SH') ?? party(bookingParties, 'SH') ?? party(bookingParties, 'AP');
  return {
    referenceDetails: mapVgmReferenceDetails(ref, src),
    containers: vgmContainers(ref, src),
    ...mapVgmDeclarant(latestVgmRow(ref.vgmRows), fallbackParty, user),
  };
}

/**
 * Persists a submission the way the EJB does: the active rows of each book_no + eqpid become
 * inactive (I) and a new row with Version_no + 1 and status A is inserted. Returns the new rows.
 */
export function applyVgmSubmission(payload: VgmSubmitPayload, login: string, src: VgmSources = fixtureVgmSources()): Row[] {
  const ref = resolveVgmReference(payload.type, payload.referenceNo, src);
  const bookNo = payload.type === 'bookno'
    ? String(ref?.booking?.extBookNo || payload.referenceNo)
    : String(ref?.si?.bookno || payload.referenceNo);
  const blNo = payload.type === 'blno' ? payload.referenceNo : ref?.si?.blno ?? null;
  const party = payload.partyDetails;
  const ts = nowIso();
  let nextId = src.vgm.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  const cargo = [
    ...(ref?.si ? src.siCargo.filter(c => eq(c.eSINo, ref.si!.eSINo)) : []),
    ...(ref?.booking ? src.bookingCargo.filter(c => eq(c.ebookno, ref.booking!.ebookno)) : []),
  ];

  return payload.containers.map(c => {
    const previous = src.vgm.filter(v => eq(v.book_no, bookNo) && eq(v.eqpid, c.containerNo));
    for (const v of previous) {
      if (['A', 'C'].includes(String(v.status ?? '').toUpperCase())) {
        v.status = 'I';
        v.userup = login;
        v.DateUp = ts;
      }
    }
    const version = previous.reduce((m, r) => Math.max(m, Number(r.Version_no) || 0), 0) + 1;
    const eqptype = previous.sort(newestVgmFirst)[0]?.eqptype ?? cargo.find(k => eq(k.containerno, c.containerNo))?.eqpSize ?? null;
    nextId += 1;
    const row = ciRow({
      id: nextId,
      book_no: bookNo,
      bl_no: blNo,
      eqptype,
      eqpid: c.containerNo,
      vgm_type: payload.type,
      vgm_ref_number: nextRef('VGM'),
      VGM_order_Number: party.orderNo ?? null,
      VGM_Obtained_Date: c.date || party.obtainDate || ts,
      VGM_Weight: Number(c.vgmWeight),
      VGM_unit: c.vgmUnit,
      VGM_Obtained_Method: c.method,
      VGM_Company_Name: party.companyName ?? null,
      VGM_Address1: party.addr1 ?? null,
      VGM_Address2: party.addr2 ?? null,
      VGM_Zipcode: party.zipcode ?? null,
      VGM_City: party.city ?? null,
      VGM_Country: party.country ?? null,
      VGM_Authorized_Person: party.authPerson ?? null,
      Telephone: party.phone ?? null,
      Fax: party.fax ?? null,
      Email: party.email || payload.sendEmailId || null,
      oprstatus: null,
      usercr: login,
      Datecr: ts,
      userup: login,
      DateUp: ts,
      status: 'A',
      remarks: null,
      VGM_Source: 'C',
      Version_no: version,
    });
    src.vgm.unshift(row);
    return row;
  });
}
