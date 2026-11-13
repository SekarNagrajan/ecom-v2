// Modified by Sekar Nagarajan (2026-10-16 23:40)
import { describe, expect, it } from 'vitest';

import { ciRow, db } from '../db';
import {
  applyProfilePatch,
  currentFixtureUser,
  customerParty,
  mapAlertLog,
  mapAlertPreferences,
  mapProfile,
  pickCurrentUser,
  splitDialCode,
  toDbTimezone,
  toPortalTimezone,
  type AlertSources,
} from './user.bridge';

const users = [
  ciRow({ id: 4950, Cust_Code: null, loginname: 'johnathon6@example.com', User_Email: 'johnathon6@example.com', First_Name: 'Rowan', Last_Name: 'Vandervort', Country: 'IN' }),
  ciRow({
    id: 4928, Cust_Code: '20001374', Comp_Name: 'Schultz - Romaguera', Address: '2301 Church Close', Address2: 'Apt. 580', City: 'Terrenceport', Pin_Code: '68394',
    Country: 'CN', Title: 'Mr.', First_Name: 'Gage', Last_Name: 'Keeling', User_Phone: '+19385207153', User_Mobile: '+16005730770',
    User_Email: 'guillermo.thompson@example.com', loginname: 'guillermo.thompson@example.com', prefLang: 'EN', preferredTimezone: null,
  }),
];
const userDetails = [
  ciRow({ Id: 9, EmailID: 'nobody@example.com', userRole: 'Y', CustomerCode: '20001374', logindate: '2026-09-01T00:00:00Z' }),
  ciRow({ Id: 2356, EmailID: 'guillermo.thompson@example.com', userRole: 'Y', CustomerCode: '20001374', preferredTimezone: '-05:00~~(GMT-05:00) Indiana (East', logindate: '2026-09-18T10:15:21.949Z' }),
];

describe('user bridge — current user & profile', () => {
  it('picks the first userDetails row of the customer that has a matching users row', () => {
    const cur = pickCurrentUser(users, userDetails);
    expect(cur?.user.loginname).toBe('guillermo.thompson@example.com');
    expect(cur?.details?.Id).toBe(2356);
  });

  it('resolves a user from the real fixtures', () => {
    const cur = currentFixtureUser();
    expect(cur?.user.loginname).toBeTruthy();
    expect(String(cur?.details?.CustomerCode ?? cur?.user.Cust_Code)).toBe('20001374');
  });

  it('splits dial codes, preferring the country code', () => {
    expect(splitDialCode('+19385207153', 'CN')).toEqual({ code: '+1', number: '9385207153' });
    expect(splitDialCode('+971501234567', 'AE')).toEqual({ code: '+971', number: '501234567' });
    expect(splitDialCode('+919876543210', null)).toEqual({ code: '+91', number: '9876543210' });
    expect(splitDialCode(null, 'IN')).toEqual({ code: '+91', number: '' });
  });

  it('maps the DB timezone label onto the portal select values and back', () => {
    expect(toPortalTimezone('-05:00~~(GMT-05:00) Indiana (East')).toBe('UTC-5 (EST)');
    expect(toPortalTimezone('+08:00~~(GMT+08:00) Kuala Lampur, Singapore')).toBe('UTC+8 (SGT)');
    expect(toPortalTimezone('+05:30~~(GMT+05:30) Chennai')).toBe('UTC+5.5');
    expect(toPortalTimezone(null)).toBe('UTC-5 (EST)');
    expect(toPortalTimezone(toDbTimezone('UTC+1 (CET)'))).toBe('UTC+1 (CET)');
  });

  it('maps users + userDetails onto CustomerProfile', () => {
    const p = mapProfile(users[1], userDetails[1]);
    expect(p).toMatchObject({
      loginName: 'guillermo.thompson@example.com', customerCode: '20001374', companyName: 'Schultz - Romaguera',
      firstName: 'Gage', lastName: 'Keeling', email: 'guillermo.thompson@example.com',
      phoneCode: '+1', phoneNo: '9385207153', mobileCode: '+1', mobileNo: '6005730770',
      country: 'CN', city: 'Terrenceport', address: '2301 Church Close, Apt. 580', defLanguage: 'en', prefTimeZone: 'UTC-5 (EST)',
    });
  });

  it('falls back to the customer party address on bookings when eCom_Reg_Details has none', () => {
    const blank = ciRow({ ...users[1], Address: '', Address2: 'Apt. 580', City: '' });
    const party = customerParty('20001374', [
      ciRow({ cid: '1', ebookno: 'OLD', custTypeId: 'AP', custId: '20001374', address1: 'Old Street', city: 'Oldtown' }),
      ciRow({ cid: '9', ebookno: 'NEW', custTypeId: 'BP', custId: '20001374', address1: '2301 Church Close', address2: 'Apt. 580', city: 'Terrenceport' }),
      ciRow({ cid: '10', ebookno: 'NEW', custTypeId: 'CN', custId: '2021000073', address1: 'Consignee Rd' }),
    ]);
    expect(party?.cid).toBe('9');
    expect(mapProfile(blank, userDetails[1], party)).toMatchObject({ address: '2301 Church Close, Apt. 580', city: 'Terrenceport' });
    expect(mapProfile(users[1], userDetails[1], party).address).toBe('2301 Church Close, Apt. 580');
    expect(customerParty('NOPE', [])).toBeNull();
  });

  it('writes a profile patch back into the fixture rows', () => {
    const user = ciRow({ ...users[1] });
    const details = ciRow({ ...userDetails[1] });
    const next = applyProfilePatch({ user, details }, { firstName: 'Sekar', phoneNo: '5550199', address: '100 Wall Street', prefTimeZone: 'UTC+8 (SGT)', defLanguage: 'zh' });
    expect(next.firstName).toBe('Sekar');
    expect(user.First_Name).toBe('Sekar');
    expect(user.User_Phone).toBe('+15550199');
    expect(user.Address).toBe('100 Wall Street');
    expect(user.prefLang).toBe('ZH');
    expect(details.preferredTimezone).toBe('+08:00~~(GMT+08:00) SGT');
    expect(next.prefTimeZone).toBe('UTC+8 (SGT)');
    expect(next.address).toBe('100 Wall Street');
  });
});

const activities = [
  ciRow({ module: 'BKG', activity: 'Send to Agency', activitycode: 'BSA ' }),
  ciRow({ module: 'BKG', activity: 'Accepted By the Agency', activitycode: 'BAA ' }),
  ciRow({ module: 'SHI', activity: 'Send to Agency', activitycode: 'SSA ' }),
  ciRow({ module: 'BOL', activity: 'Send to Agency', activitycode: 'DSA ' }),
];
const notificationSettings = [
  ciRow({ id: '1', category: 'BOOKING', notificationKey: 'BOOKING_REQUEST_SUBMISSION', defaultEnabled: true, status: 'A' }),
  ciRow({ id: '8', category: 'SHIPPING_INSTRUCTION', notificationKey: 'SHIPPING_INSTRUCTION_SUBMISSION', defaultEnabled: true, status: 'A' }),
  ciRow({ id: '6', category: 'BILL_OF_LADING', notificationKey: 'BILL_OF_LADING_ACCEPTANCE', defaultEnabled: false, status: 'A' }),
];
const base: AlertSources = {
  login: 'angelica83@example.com', customerCode: '20001374',
  mailAlerts: [
    ciRow({ loginname: 'angelica83@example.com', activitycode: 'BSA', mail: 'Y' }),
    ciRow({ loginname: 'angelica83@example.com', activitycode: 'SSA', mail: 'N' }),
    ciRow({ loginname: 'angelica83@example.com', activitycode: 'DSA', mail: 'Y' }),
  ],
  activities, notificationSettings,
  customerNotifications: [ciRow({ id: '5', customerUserId: '5', notificationId: '1', isEnabled: false })],
  customerUsers: [ciRow({ id: '5', customerCode: '20001374', email: 'baylee.howe87@example.com' })],
  payments: [ciRow({ requestId: 'X', customerCode: '20001374', status: 'COMPLETED' })],
};

describe('user bridge — alert preferences', () => {
  it('derives module flags from ecom_mailalert rows via ecom_activity modules', () => {
    expect(mapAlertPreferences(base)).toEqual({
      bookingUpdates: true, siConfirmation: false, blRelease: true,
      scheduleDelays: false, paymentInvoices: true, channelEmail: true, channelSms: false, channelPortal: true,
    });
  });

  it('falls back to notificationSettings defaults + customerNotifications overrides for users without mailAlerts', () => {
    const prefs = mapAlertPreferences({ ...base, login: 'baylee.howe87@example.com' });
    expect(prefs.bookingUpdates).toBe(false); // default true, overridden to false for customer user 5
    expect(prefs.siConfirmation).toBe(true);
    expect(prefs.blRelease).toBe(false);
  });

  it('honours session overrides for the flags that have no fixture column', () => {
    const prefs = mapAlertPreferences({ ...base, payments: [] }, { scheduleDelays: true, channelSms: true });
    expect(prefs.paymentInvoices).toBe(false);
    expect(prefs.scheduleDelays).toBe(true);
    expect(prefs.channelSms).toBe(true);
  });
});

describe('user bridge — alert history', () => {
  it('maps an EcommuserlogDetails row onto AlertHistoryLog', () => {
    const log = mapAlertLog(
      ciRow({ id: 30941, username: 'baylee.howe87@example.com', Logdate: '2026-10-16T13:25:17.232Z', module: 'SI', activity: 'Submit', referenceno: 'SVMDMU2694105', remarks: 'New Shipping Instruction Submitted', customercode: '20001374' }),
      '2026-10-17T00:00:00Z',
    );
    expect(log).toMatchObject({ id: 'log-30941', category: 'SI', title: 'Shipping Instruction · Submit', message: 'New Shipping Instruction Submitted', isRead: true, referenceNo: 'SVMDMU2694105' });
    expect(log.timestamp).toMatch(/^2026-10-16 \d{2}:\d{2}$/);
    expect(mapAlertLog(ciRow({ id: 1, module: 'Booking', activity: 'Sent To Agency', Logdate: '2026-10-16T13:18:55Z' }), '2026-09-18T10:15:21Z').isRead).toBe(false);
  });

  it('has fixture rows for the demo customer', () => {
    expect(db.EcommuserlogDetails.some(r => String(r.customercode) === '20001374')).toBe(true);
  });
});
