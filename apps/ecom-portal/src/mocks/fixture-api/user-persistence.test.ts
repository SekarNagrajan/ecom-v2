// Modified by Sekar Nagarajan (2026-10-19)
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getProfilePhotoBytes,
  getProfilePhotoContentType,
  resetProfilePhoto,
  setProfilePhoto,
} from '../profile-photo.store';
import {
  applyAlertPreferences,
  applyProfilePatch,
  currentFixtureUser,
  fixtureAlertPreferences,
  getAlertOverrides,
  resetAlertOverrides,
} from './bridges/user.bridge';
import {
  activateUser,
  createSubUser,
  DEMO_CUSTOMER_CODE,
  firstUserOfCustomer,
  registerUser,
  setSubUserActive,
  subUsersOf,
} from './bridges/users.bridge';
import {
  createQuote,
  listQuotes,
  resetQuotes,
} from './bridges/rates.bridge';
import { db, eq, getRefCounters, resetDb } from './db';
import {
  applyUserOverlay,
  persistUserDb,
  rehydrateUserDb,
  resetUserDbReadyGate,
  snapshotUserDb,
} from './user-persistence';

afterEach(() => {
  resetDb();
  resetQuotes();
  resetAlertOverrides();
  resetProfilePhoto();
  resetUserDbReadyGate();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('user persistence overlay', () => {
  it('profile patch survives snapshot → resetDb → apply', () => {
    const cur = currentFixtureUser();
    expect(cur).toBeTruthy();
    applyProfilePatch(cur!, { firstName: 'OverlayFirst', lastName: 'OverlayLast' });

    const snap = snapshotUserDb();
    const login = String(cur!.user.loginname);
    expect(snap.tables!.users.find((u) => eq(u.loginname, login))?.First_Name).toBe('OverlayFirst');

    resetDb();
    expect(String(currentFixtureUser()!.user.First_Name)).not.toBe('OverlayFirst');

    applyUserOverlay(snap);
    expect(String(currentFixtureUser()!.user.First_Name)).toBe('OverlayFirst');
    expect(String(currentFixtureUser()!.user.Last_Name)).toBe('OverlayLast');
  });

  it('alert prefs restore mailAlerts and session alertOverrides', () => {
    const before = fixtureAlertPreferences();
    const next = {
      ...before,
      bookingUpdates: !before.bookingUpdates,
      scheduleDelays: true,
      channelSms: true,
    };
    applyAlertPreferences(next);

    const snap = snapshotUserDb();
    expect(snap.sidecars?.session?.alertOverrides.scheduleDelays).toBe(true);
    expect(snap.sidecars?.session?.alertOverrides.channelSms).toBe(true);
    expect(snap.tables!.mailAlerts.length).toBeGreaterThan(0);

    resetDb();
    resetAlertOverrides();
    expect(getAlertOverrides().scheduleDelays).toBeUndefined();

    applyUserOverlay(snap);
    const restored = fixtureAlertPreferences();
    expect(restored.scheduleDelays).toBe(true);
    expect(restored.channelSms).toBe(true);
    expect(restored.bookingUpdates).toBe(next.bookingUpdates);
  });

  it('session quotes survive snapshot → resetQuotes → apply', () => {
    resetQuotes();
    const created = createQuote({
      originPort: 'INNSA',
      deliveryPort: 'AEJEA',
      eqpType: 'DV20',
      eqpQuantity: 1,
      commodity: 'GEN-CGO',
      cargoWeightKg: 18000,
    });
    const snap = snapshotUserDb();
    expect(snap.sidecars?.session?.quotes.some((q) => q.id === created.id)).toBe(true);

    resetQuotes();
    expect(listQuotes().some((q) => q.id === created.id)).toBe(false);

    applyUserOverlay(snap);
    expect(listQuotes()[0].id).toBe(created.id);
  });

  it('createSubUser survives snapshot → resetDb → apply', () => {
    const parent = firstUserOfCustomer(DEMO_CUSTOMER_CODE)?.user;
    const before = subUsersOf(DEMO_CUSTOMER_CODE).length;
    const created = createSubUser(
      DEMO_CUSTOMER_CODE,
      {
        loginName: 'overlay.sub@example.com',
        password: 'secret1',
        firstName: 'Overlay',
        lastName: 'Sub',
        email: 'overlay.sub@example.com',
        companyName: 'Acme',
        custPhoneNo: '12345',
        allowedModules: [],
      },
      parent,
    );
    expect(created.loginName).toBe('overlay.sub@example.com');
    expect(subUsersOf(DEMO_CUSTOMER_CODE).length).toBe(before + 1);

    const snap = snapshotUserDb();
    resetDb();
    expect(subUsersOf(DEMO_CUSTOMER_CODE).some((s) => s.loginName === 'overlay.sub@example.com')).toBe(false);

    applyUserOverlay(snap);
    const restored = subUsersOf(DEMO_CUSTOMER_CODE).find((s) => s.loginName === 'overlay.sub@example.com');
    expect(restored).toBeTruthy();
    expect(restored!.isActive).toBe(true);
    expect(db.users.find((u) => eq(u.loginname, 'overlay.sub@example.com'))?.isValid).toBe('Y');
  });

  it('setSubUserActive for cu-* restores customerUsers.status', () => {
    const listed = subUsersOf(DEMO_CUSTOMER_CODE);
    const cu = listed.find((s) => s.id.startsWith('cu-'));
    expect(cu).toBeTruthy();
    expect(setSubUserActive(cu!.id, false)?.isActive).toBe(false);

    const snap = snapshotUserDb();
    const rowId = cu!.id.slice('cu-'.length);
    expect(snap.tables!.customerUsers.find((r) => eq(r.id, rowId))?.status).toBe('I');

    resetDb();
    applyUserOverlay(snap);
    expect(db.customerUsers.find((r) => eq(r.id, rowId))?.status).toBe('I');
    expect(subUsersOf(DEMO_CUSTOMER_CODE).find((s) => s.id === cu!.id)?.isActive).toBe(false);
  });

  it('registerUser pending user + ECOMRegHistory survive apply', () => {
    const user = registerUser({
      email: 'pending.overlay@example.com',
      companyName: 'Pending Co',
      firstName: 'P',
      lastName: 'O',
      customerType: 'NEW',
    });
    expect(user.isValid).toBe('P');
    expect(db.ECOMRegHistory.at(-1)?.Email).toBe('pending.overlay@example.com');

    const snap = snapshotUserDb();
    resetDb();
    expect(db.users.some((u) => eq(u.loginname, 'pending.overlay@example.com'))).toBe(false);

    applyUserOverlay(snap);
    expect(db.users.find((u) => eq(u.loginname, 'pending.overlay@example.com'))?.isValid).toBe('P');
    expect(db.ECOMRegHistory.some((h) => eq(h.Email, 'pending.overlay@example.com'))).toBe(true);
  });

  it('activateUser isValid Y survives apply', () => {
    registerUser({
      email: 'activate.overlay@example.com',
      companyName: 'Act Co',
      firstName: 'A',
      lastName: 'O',
      customerType: 'NEW',
    });
    expect(activateUser('activate.overlay@example.com')).toBe(true);
    expect(db.users.find((u) => eq(u.loginname, 'activate.overlay@example.com'))?.isValid).toBe('Y');

    const snap = snapshotUserDb();
    resetDb();
    applyUserOverlay(snap);
    expect(db.users.find((u) => eq(u.loginname, 'activate.overlay@example.com'))?.isValid).toBe('Y');
  });

  it('persists REG and QTE counters in the overlay', () => {
    const before = getRefCounters();
    createSubUser(
      DEMO_CUSTOMER_CODE,
      {
        loginName: 'counter.sub@example.com',
        password: 'secret1',
        firstName: 'C',
        lastName: 'S',
        email: 'counter.sub@example.com',
        companyName: 'Acme',
        custPhoneNo: '1',
        allowedModules: [],
      },
      firstUserOfCustomer(DEMO_CUSTOMER_CODE)?.user,
    );
    createQuote({
      originPort: 'INNSA',
      deliveryPort: 'AEJEA',
      eqpType: 'DV20',
      eqpQuantity: 1,
      commodity: 'GEN-CGO',
      cargoWeightKg: 1000,
    });
    const snap = snapshotUserDb();
    expect(snap.counters.REG).toBeGreaterThanOrEqual((before.REG ?? 0) + 1);
    expect(snap.counters.QTE).toBeGreaterThanOrEqual((before.QTE ?? 0) + 1);

    resetDb();
    applyUserOverlay(snap);
    expect(getRefCounters().REG).toBe(snap.counters.REG);
    expect(getRefCounters().QTE).toBe(snap.counters.QTE);
  });

  it('profile photo survives snapshot → clear → apply', () => {
    const bytes = new Uint8Array([1, 2, 3, 4]).buffer;
    setProfilePhoto(bytes, 'image/png');
    const snap = snapshotUserDb();
    expect(snap.sidecars?.session?.profilePhoto).toMatchObject({ contentType: 'image/png' });
    expect(snap.sidecars?.session?.profilePhoto?.base64).toBeTruthy();

    resetProfilePhoto();
    expect(getProfilePhotoBytes()).toBeNull();

    applyUserOverlay(snap);
    expect(getProfilePhotoContentType()).toBe('image/png');
    expect(getProfilePhotoBytes()?.byteLength).toBe(4);
  });

  it('persistUserDb PUTs a snapshot via fetch (bypass URL)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const cur = currentFixtureUser();
    applyProfilePatch(cur!, { firstName: 'PersistMe' });
    persistUserDb();

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const arg = fetchMock.mock.calls[0][0] as Request;
    expect(String(arg.url)).toContain('/api/_mock/user-db');
    expect(arg.method).toBe('PUT');
    const body = JSON.parse(await arg.text()) as ReturnType<typeof snapshotUserDb>;
    expect(body.tables!.users.some((u) => u.First_Name === 'PersistMe')).toBe(true);
    expect(body.sidecars?.session).toBeDefined();
    expect(body.tables!.customerUsers).toBeDefined();
    expect(body.tables!.ECOMRegHistory).toBeDefined();
  });

  it('rehydrateUserDb applies GET overlay data', async () => {
    const cur = currentFixtureUser();
    applyProfilePatch(cur!, { firstName: 'FromDisk' });
    createQuote({
      originPort: 'INNSA',
      deliveryPort: 'AEJEA',
      eqpType: 'DV20',
      eqpQuantity: 1,
      commodity: 'GEN-CGO',
      cargoWeightKg: 1000,
    });
    const overlay = snapshotUserDb();

    resetDb();
    resetQuotes();
    resetAlertOverrides();
    resetProfilePhoto();
    resetUserDbReadyGate();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: overlay }),
      }),
    );

    await rehydrateUserDb();
    expect(String(currentFixtureUser()!.user.First_Name)).toBe('FromDisk');
    expect(listQuotes().some((q) => q.originPort === 'INNSA')).toBe(true);
  });
});
