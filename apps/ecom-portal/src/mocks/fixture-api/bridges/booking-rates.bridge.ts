// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Available rates for the Master step rate picker.
 *
 * Primary: one row per (lane, equipment) from sampled bookings (salesagreedrate / rateno when set).
 * Fallback / fill: published Commercial `tariffs` for the same POL→POD so any showcase lane with a
 * tariff shows rates even when the e-commerce sample never booked that pair.
 */
import { db, type Row } from '../db';
import { groupBy } from './booking-list.bridge';
import { splitEquipmentCode } from './booking-lookups.bridge';
import { extractPortCode, num, str } from './booking-shared.bridge';
import { customerName } from './masters.bridge';
import { bestTariffRow, compareTariffRows, tariffPod, tariffPol } from './rates.bridge';

export interface BookingRateOption {
  rateNo: string;
  itemNo: string;
  amdNo: string;
  rateType: string;
  eqpType: string;
  amount: number;
  currency: string;
  customer: string;
  customerCode: string;
}

// TODO(fixtures): used only for lanes without a published tariff — placeholder: USD 45 per foot of box, +600 for reefers.
export const RATE_CURRENCY = 'USD';
export const RATE_TYPE = 'CMS';
/** Rate type of a line taken from the Commercial tariff view (bookingrates_tariff.ratetype). */
export const TARIFF_RATE_TYPE = 'TAR';
export function placeholderAmount(eqpType: string): number {
  const { size, type } = splitEquipmentCode(eqpType);
  const feet = Number(size) || 20;
  const reefer = /^(RE|RF|RH)$/.test(type) ? 600 : 0;
  return feet * 45 + reefer;
}

export interface LaneRate {
  /** "POL>POD" the rate was derived from. */
  lane: string;
  rate: BookingRateOption;
}

/**
 * Every (lane, equipment) combination in the sampled bookings, newest booking first. When `tariffs`
 * (Commercial.bookingrates_tariff rows) are supplied, a lane's published tariff fills in the rate number,
 * amount and currency the booking itself does not carry.
 */
export function ratesFromRows(bookings: Row[], cargo: Row[], parties: Row[], tariffs: Row[] = []): LaneRate[] {
  const cargoByBooking = groupBy(cargo, 'ebookno');
  const partiesByBooking = groupBy(parties, 'ebookno');
  const seen = new Set<string>();
  const out: LaneRate[] = [];
  const sorted = [...bookings]
    .filter(b => str(b.ebook_status).toUpperCase() !== 'T')
    .sort((a, b) => +new Date(b.dateup) - +new Date(a.dateup));
  for (const b of sorted) {
    const key = str(b.ebookno).toLowerCase();
    const pol = str(b.originPortId).toUpperCase();
    const pod = str(b.finalPortId).toUpperCase();
    if (!pol || !pod) continue;
    const agreementParty = (partiesByBooking.get(key) ?? []).find(p => str(p.custTypeId).toUpperCase() === 'AP');
    for (const c of cargoByBooking.get(key) ?? []) {
      const eqpType = str(c.eqpSize).toUpperCase();
      if (!eqpType) continue;
      const laneKey = `${pol}>${pod}|${eqpType}`;
      if (seen.has(laneKey)) continue;
      seen.add(laneKey);
      const tariff = bestTariffRow(tariffs, pol, pod, eqpType);
      out.push({
        lane: `${pol}>${pod}`,
        rate: {
          rateNo: str(b.rateno) || str(tariff?.rateno) || `RT-${pol}${pod}-${eqpType}`,
          itemNo: String(out.length + 1),
          amdNo: String(num(b.version) ?? 0),
          rateType: tariff ? TARIFF_RATE_TYPE : RATE_TYPE,
          eqpType,
          amount: num(b.salesagreedrate) ?? num(tariff?.localamount) ?? placeholderAmount(eqpType),
          currency: str(tariff?.currency) || RATE_CURRENCY,
          customer: str(agreementParty?.name) || customerName(str(b.cust_code)),
          customerCode: str(b.cust_code),
        },
      });
    }
  }
  return out;
}

/** Rates for the requested lane only (empty when the sample never booked that lane). */
export function selectRates(all: LaneRate[], params: { origin: string; delivery: string }): BookingRateOption[] {
  const lane = `${extractPortCode(params.origin)}>${extractPortCode(params.delivery)}`;
  return all.filter(r => r.lane === lane).map(r => r.rate);
}

/**
 * Published tariff lines for every (POL, POD, equipment) in the Commercial extract — one row per
 * equipment type on the lane (cheapest / currently valid first via compareTariffRows).
 */
export function ratesFromTariffs(tariffs: Row[], now = Date.now()): LaneRate[] {
  const sorted = [...tariffs].sort(compareTariffRows(now));
  const seen = new Set<string>();
  const out: LaneRate[] = [];
  for (const t of sorted) {
    const pol = tariffPol(t);
    const pod = tariffPod(t);
    const eqpType = str(t.eqptype).toUpperCase();
    if (!pol || !pod || !eqpType) continue;
    const status = str(t.status).toUpperCase();
    if (status && status !== 'A') continue;
    const laneKey = `${pol}>${pod}|${eqpType}`;
    if (seen.has(laneKey)) continue;
    seen.add(laneKey);
    out.push({
      lane: `${pol}>${pod}`,
      rate: {
        rateNo: str(t.rateno) || `RT-${pol}${pod}-${eqpType}`,
        itemNo: String(out.length + 1),
        amdNo: '0',
        rateType: TARIFF_RATE_TYPE,
        eqpType,
        amount: num(t.localamount) ?? placeholderAmount(eqpType),
        currency: str(t.currency) || RATE_CURRENCY,
        customer: customerName(str(t.custcode)) || 'Published tariff',
        customerCode: str(t.custcode),
      },
    });
  }
  return out;
}

/**
 * Booking-derived rates for the lane first; Commercial tariffs fill any equipment types (or the whole
 * lane) so Master Details shows rates for every tariff port pair from the testing DB.
 */
export function fixtureBookingRates(params: { origin: string; delivery: string }): BookingRateOption[] {
  const fromBookings = selectRates(
    ratesFromRows(db.bookings, db.bookingCargo, db.bookingCust, db.tariffs),
    params,
  );
  const fromTariffs = selectRates(ratesFromTariffs(db.tariffs), params);
  if (!fromTariffs.length) return fromBookings;
  if (!fromBookings.length) return fromTariffs;
  const seen = new Set(fromBookings.map(r => r.eqpType.toUpperCase()));
  const merged = [...fromBookings];
  for (const r of fromTariffs) {
    if (seen.has(r.eqpType.toUpperCase())) continue;
    seen.add(r.eqpType.toUpperCase());
    merged.push(r);
  }
  return merged;
}
