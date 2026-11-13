// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * Rate option type. The rate table itself is derived from the extracted fixtures in
 * src/mocks/fixture-api/bridges/booking-rates.bridge.ts; this shim only exists because
 * types/booking.types.ts imports `BookingRateOption` from this path.
 */
export type { BookingRateOption } from '../../../mocks/fixture-api/bridges/booking-rates.bridge';
