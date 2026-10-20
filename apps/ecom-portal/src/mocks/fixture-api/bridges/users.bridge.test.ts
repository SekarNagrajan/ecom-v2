// Created by Sekar Nagarajan (2026-10-16 23:35)
import { describe, expect, it } from 'vitest';

import { db, type Row } from '../db';
import {
  activateUser, addressSuggestions, buildAdminProfile, buildCustomerProfile, buildImpersonatedUser, companyNameFor, configuredUserLimit,
  createSubUser, customerAccounts, customerCodeLookup, DEMO_CUSTOMER_CODE, emailAvailable, findAdminAccount, findUser, firstUserOfCustomer,
  moduleMappingCustomers, registerUser, resetUserPassword, resolveCustomerLogin, setSubUserActive, subAccountsOf, subUsersOf, userLimit,
} from './users.bridge';

const users: Row[] = [
  { id: 1, loginname: 'Admin@Example.com', User_Email: 'admin@example.com', First_Name: 'Ada', Last_Name: 'Lovelace', Comp_Name: 'Acme Lines', Cust_Code: '20001374', City: 'Mumbai', Country: 'IN', Address: '1 Dock Rd', isValid: 'Y', prefLang: 'EN', Comp_Phone: '+911234' },
  { id: 2, loginname: 'sub@example.com', User_Email: 'sub@example.com', First_Name: 'Sam', Last_Name: 'Sub', Comp_Name: 'Acme Lines', Cust_Code: null, City: 'Mumbai', Country: 'IN', isValid: 'Y', prefLang: 'EN' },
  { id: 3, loginname: 'other@example.com', User_Email: 'other@example.com', First_Name: 'Olu', Last_Name: 'Other', Comp_Name: 'Beta Freight', Cust_Code: '99', City: 'Pune', Country: 'IN', isValid: 'P', reg_no: 'REG9' },
];
const details: Row[] = [
  { Id: 10, EmailID: 'admin@example.com', userRole: 'Y', CustomerCode: '20001374', Status: 'A', MenuId: '44_47', AcceptedDate: '2026-09-01T00:00:00Z', WrgPassAtmpt: 2, LockedStatus: 'Y' },
  { Id: 11, EmailID: 'sub@example.com', userRole: 'N', CustomerCode: '20001374', Status: 'A', MenuId: '44', AcceptedDate: '2026-09-02T00:00:00Z' },
  { Id: 12, EmailID: 'gone@example.com', userRole: 'N', CustomerCode: '20001374', Status: 'I', MenuId: '44', AcceptedDate: '2026-09-03T00:00:00Z' },
];
const customerUsers: Row[] = [
  { id: '5', customerCode: '20001374', email: 'sub@example.com', firstName: 'Sam', lastName: 'Sub', status: 'A', createdAt: '2026-09-02T00:00:00Z' },
  { id: '6', customerCode: '20001374', email: 'invited@example.com', firstName: 'Ivy', lastName: 'Invited', mobile: '+1555', status: 'A', preferredLang: 'ZH', acceptedAt: '2026-09-05T00:00:00Z' },
];
const bookingCust: Row[] = [{ ebookno: 'B1', custTypeId: 'AP', custId: '99', name: 'Beta Freight Ltd', countryId: 'IN', address1: 'Pier 9', city: 'Pune' }];

describe('user lookup', () => {
  it('finds users case-insensitively by login name or e-mail', () => {
    expect(findUser('admin@example.com', users)?.id).toBe(1);
    expect(findUser('ADMIN@EXAMPLE.COM', users)?.id).toBe(1);
    expect(findUser('nobody@example.com', users)).toBeUndefined();
  });

  it('resolves the first user of a customer through ecomuserdetails', () => {
    const first = firstUserOfCustomer('20001374', users, details);
    expect(first?.user.id).toBe(1);
    expect(first?.details?.Id).toBe(10);
    expect(firstUserOfCustomer('nope', users, details)).toBeNull();
  });

  it('prefers the booking AP party for company names', () => {
    expect(companyNameFor('99', users, bookingCust)).toBe('Beta Freight Ltd');
    expect(companyNameFor('20001374', users, [])).toBe('Acme Lines');
    expect(companyNameFor('unknown', users, [])).toBe('unknown');
  });

  it('lists customers and multi-account sub accounts', () => {
    expect(customerAccounts(users, details, []).map(c => c.custCode)).toEqual(['20001374', '99']);
    const subs = subAccountsOf('20001374', [{ LoginCustCode: '20001374', APcustCode: '777', Status: 'A' }, { LoginCustCode: '20001374', APcustCode: '888', Status: 'I' }], users, []);
    expect(subs.map(s => s.custCode)).toEqual(['20001374', '777']);
  });
});

describe('customer login profile (real fixtures)', () => {
  it('`test` resolves to the first fixture user of the sampled customer', () => {
    const r = resolveCustomerLogin('test');
    expect(r?.demo).toBe(true);
    expect(String(r?.user.Cust_Code ?? r?.details?.CustomerCode)).toBe(DEMO_CUSTOMER_CODE);
    expect(resolveCustomerLogin('nobody@nowhere.example')).toBeNull();
  });

  it('builds a UserProfile with loginType U and menu-derived capabilities', () => {
    const profile = buildCustomerProfile(users[0], details[0], ['DO']);
    expect(profile).toMatchObject({ role: 'CUSTOMER', loginType: 'U', email: 'admin@example.com', company: 'Acme Lines', customerCode: '20001374', isSessionAdmin: true, name: 'Ada Lovelace' });
    expect(profile.capabilities).toEqual(expect.arrayContaining(['VIEW_DASHBOARD', 'BKG', 'CREATE_BOOKING', 'DO']));
    expect(profile.subCustomerAccounts?.[0].custCode).toBe('20001374');
  });

  it('accepts any fixture login name', () => {
    const login = String(db.users[0].loginname);
    expect(resolveCustomerLogin(login)?.user.loginname).toBe(login);
  });
});

describe('admin accounts', () => {
  const adminUsers: Row[] = [
    { id: 1, username: 'AdminUser', userid: 'admin', usertype: 'A', status: 'A' },
    { id: 11, username: 'AgencyUser', userid: 'agency', usertype: 'C', status: 'A' },
    { id: 2, username: 'WHITE LINE', userid: 'wlsadmin', usertype: 'V', status: 'I' },
  ];
  const accounts: Row[] = [{ id: '1', username: 'superadmin', fullName: 'Super Administrator', email: 'root@example.com', status: 'A' }];

  it('matches legacy admin users and the new admin accounts', () => {
    expect(findAdminAccount('ADMIN', adminUsers, accounts)).toMatchObject({ userId: 'admin', userType: 'A', name: 'AdminUser' });
    expect(findAdminAccount('agency', adminUsers, accounts)?.userType).toBe('C');
    expect(findAdminAccount('wlsadmin', adminUsers, accounts)).toBeNull(); // inactive
    expect(findAdminAccount('root@example.com', adminUsers, accounts)).toMatchObject({ userId: 'superadmin', userType: 'A' });
    expect(findAdminAccount('', adminUsers, accounts)).toBeNull();
  });

  it('shapes the profile by entry type', () => {
    const account = { id: '1', userId: 'admin', name: 'AdminUser', email: '', userType: 'A' as const };
    const cpanel = buildAdminProfile(account, 'cpanel');
    expect(cpanel).toMatchObject({ role: 'ADMIN', adminUserType: 'A', loginType: 'V' });
    expect(cpanel.vendorMenuList).toContain('specialprivi');
    expect(cpanel.capabilities).toEqual(expect.arrayContaining(['BKG', 'SI', 'BL', 'VGM']));
    const vendor = buildAdminProfile(account, 'eadmin');
    expect(vendor).toMatchObject({ role: 'VENDOR', adminUserType: 'V', vendorId: 'admin' });
    const imp = buildAdminProfile(account, 'admin');
    expect(imp).toMatchObject({ role: 'ADMIN', adminUserType: 'C', isImpersonating: true, loginType: 'U' });
    const switched = buildImpersonatedUser(imp, DEMO_CUSTOMER_CODE);
    expect(switched.customerCode).toBe(DEMO_CUSTOMER_CODE);
    expect(switched.impersonatedCustomer?.custCode).toBe(DEMO_CUSTOMER_CODE);
  });
});

describe('sub-users and user limit', () => {
  it('lists userRole N users plus invited customer users, newest first', () => {
    const subs = subUsersOf('20001374', details, users, customerUsers);
    expect(subs.map(s => s.loginName)).toEqual(['invited@example.com', 'gone@example.com', 'sub@example.com']);
    expect(subs[2]).toMatchObject({ id: 'ud-11', firstName: 'Sam', companyName: 'Acme Lines', isActive: true, createdDate: '2026-09-02' });
    expect(subs[0]).toMatchObject({ id: 'cu-6', prefLanguage: 'zh', mobileNo: '+1555' });
    expect(subs[1].isActive).toBe(false);
  });

  it('counts only active sub-users against the allowance', () => {
    const limit = userLimit('20001374', details, users, customerUsers);
    expect(limit).toMatchObject({ currentlyAllocated: 2, limitReached: false });
    expect(limit.remainingSlots).toBe(limit.allowedUserLimit - 2);
  });

  it('reads a configured limit when a user-limit key exists', () => {
    expect(configuredUserLimit([{ configKey: 'MAX_USER_LIMIT', configValue: '8' }], [], [])).toBe(8);
    expect(configuredUserLimit([{ configKey: 'DISPLAY_DATE_FORMAT', configValue: 'dd' }], [{ pathname: 'Enable_User_OTP', pathvalue: 'Y' }], [])).toBeNull();
  });

  it('creates and toggles sub-users on the fixture arrays', () => {
    const u = users.map(r => ({ ...r }));
    const d = details.map(r => ({ ...r }));
    const created = createSubUser('20001374', {
      loginName: 'new@example.com', password: 'secret1', firstName: 'New', lastName: 'User', email: 'new@example.com', companyName: 'Acme Lines',
      custCountryCode: '+91', custPhoneCode: '22', custPhoneNo: '5555', mobileCode: '+91', mobileNo: '9', defLanguage: 'en', prefLanguage: 'en', allowedModules: ['BKG', 'SI'],
    }, u[0], u, d);
    expect(created).toMatchObject({ id: 'ud-13', loginName: 'new@example.com', isActive: true, custPhoneNo: '+91225555' });
    expect(created.allowedModules).toEqual(expect.arrayContaining(['BKG', 'SI']));
    expect(u.at(-1)).toMatchObject({ id: 4, Cust_Code: '20001374', isValid: 'Y', RegType: 'S' });
    expect(setSubUserActive('ud-13', false, d, u, [])?.isActive).toBe(false);
    const cu = customerUsers.map(r => ({ ...r }));
    expect(setSubUserActive('cu-6', false, d, u, cu)?.isActive).toBe(false);
    expect(setSubUserActive('ud-404', true, d, u, cu)).toBeUndefined();
  });
});

describe('registration helpers', () => {
  it('checks e-mail availability and customer codes', () => {
    expect(emailAvailable('ADMIN@example.com', users)).toBe(false);
    expect(emailAvailable('fresh@example.com', users)).toBe(true);
    expect(customerCodeLookup('20001374', users, bookingCust)).toMatchObject({ valid: true, companyName: 'Acme Lines', country: 'IN', city: 'Mumbai' });
    expect(customerCodeLookup('99', [], bookingCust)).toMatchObject({ valid: true, companyName: 'Beta Freight Ltd', address1: 'Pier 9' });
    expect(customerCodeLookup('nope', users, bookingCust)).toBeNull();
  });

  it('suggests distinct companies matching the query', () => {
    expect(addressSuggestions('acme', users).map(a => a.companyName)).toEqual(['Acme Lines']);
    expect(addressSuggestions('', users)).toHaveLength(2);
  });

  it('registers a pending user with a history row and activates it later', () => {
    const u = users.map(r => ({ ...r }));
    const history: Row[] = [];
    const row = registerUser({ email: 'reg@example.com', companyName: 'Reg Co', firstName: 'R', lastName: 'G', customerType: 'NEW', country: 'SG', city: 'Singapore', timezone: '+08:00' }, u, history);
    expect(row).toMatchObject({ id: 4, loginname: 'reg@example.com', isValid: 'P', RegType: 'S', Country: 'SG' });
    expect(String(row.reg_no)).toMatch(/^REG\d{6}$/);
    expect(history[0]).toMatchObject({ Email: 'reg@example.com', Status: 'P', Remarks: 'Customer Registered' });
    expect(activateUser('reg@example.com', u, [])).toBe(true);
    expect(row.isValid).toBe('Y');
    expect(activateUser('REG9', u, [])).toBe(true);
    expect(activateUser('missing', u, [])).toBe(false);
  });

  it('resets lock counters on password reset', () => {
    const d = details.map(r => ({ ...r }));
    expect(resetUserPassword('admin@example.com', users, d, [])).toBe(true);
    expect(d[0]).toMatchObject({ WrgPassAtmpt: 0, LockedStatus: 'N' });
    expect(resetUserPassword('ghost', users, d, [])).toBe(false);
    expect(resetUserPassword('svmadmin', users, d, [{ userid: 'svmadmin' }])).toBe(true);
  });
});

describe('module mapping customers', () => {
  it('lists registered customers and mapping-only login codes, filtered by q', () => {
    const all = moduleMappingCustomers('', users, [{ LoginCustCode: '555', APcustCode: '1' }], []);
    expect(all.map(c => c.custCode).sort()).toEqual(['20001374', '555', '99']);
    expect(all.find(c => c.custCode === '555')).toMatchObject({ webId: '555', compName: '555' });
    expect(moduleMappingCustomers('beta', users, [], []).map(c => c.webId)).toEqual(['other@example.com']);
  });
});
