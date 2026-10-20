// Created by Sekar Nagarajan (2026-10-16 22:31)
import { http } from 'msw';
import {
  clearBookingDbOverlay,
  resetBookingDbReadyGate,
} from './booking-persistence';
import { resetProfilePhoto } from '../profile-photo.store';
import { resetQuotes } from './bridges/rates.bridge';
import { resetAlertOverrides } from './bridges/user.bridge';
import { db, resetDb } from './db';
import { authHandlers } from './handlers/auth';
import { bookingHandlers } from './handlers/bookings';
import { billOfLadingHandlers, dashboardHandlers, paymentHandlers, scheduleHandlers, vgmHandlers } from './handlers/documents';
import { masterHandlers } from './handlers/masters';
import { shippingInstructionHandlers } from './handlers/shipping-instructions';
import {
  clearSiDbOverlay,
  resetSiDbReadyGate,
} from './si-persistence';
import {
  clearUserDbOverlay,
  resetUserDbReadyGate,
} from './user-persistence';
import {
  clearVgmDbOverlay,
  resetVgmDbReadyGate,
} from './vgm-persistence';
import { API, ok } from './utils';

const mockControlHandlers = [
  /** Restore pristine fixtures between demo sessions: fetch('/api/_mock/reset', { method: 'POST' }) */
  http.post(`${API}/_mock/reset`, async () => {
    resetDb();
    resetQuotes();
    resetAlertOverrides();
    resetProfilePhoto();
    resetBookingDbReadyGate();
    resetSiDbReadyGate();
    resetVgmDbReadyGate();
    resetUserDbReadyGate();
    await clearBookingDbOverlay();
    await clearSiDbOverlay();
    await clearVgmDbOverlay();
    await clearUserDbOverlay();
    return ok({ reset: true });
  }),
  /** Row counts per table — useful to confirm the fixtures loaded. */
  http.get(`${API}/_mock/status`, () => ok(Object.fromEntries(Object.entries(db).map(([k, v]) => [k, v.length])))),
];

/**
 * REST contract served from the SQL-extracted fixtures (src/mocks/fixtures, written by mock-data/).
 * Registered AFTER the hand-written handlers in browser.ts, so on any overlapping path the
 * hand-written handler keeps winning. None of these routes overlap today; see mock-data/README.md.
 */
export const fixtureApiHandlers = [
  ...mockControlHandlers,
  ...authHandlers,
  ...masterHandlers,
  ...bookingHandlers,
  ...shippingInstructionHandlers,
  ...billOfLadingHandlers,
  ...vgmHandlers,
  ...scheduleHandlers,
  ...dashboardHandlers,
  ...paymentHandlers,
];
