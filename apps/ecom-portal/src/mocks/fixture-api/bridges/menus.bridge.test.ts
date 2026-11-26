// Created by Sekar Nagarajan (2026-10-16 23:35)
import { describe, expect, it } from 'vitest';

import type { Row } from '../db';
import {
  adminAccessType, applyMenuConfigs, applySpecialPrivileges, assignedMenuIds, attrRoute, capabilitiesForMenuIds, joinMenuIds,
  mapMenuConfig, menuCategories, moduleMappingMenus, setAssignedMenuIds, specialPrivileges, splitMenuIds, vendorMenuKeys,
} from './menus.bridge';

const menu = (MenuId: number, RefNo: string, Category: 'D' | 'P', MenuStatus = 'A', extra: Row = {}): Row => ({
  MenuId, MenuName: RefNo, RefNo, Category, MenuStatus, userttype: 'U', menuorder: MenuId, MenuType: 'M', ParentMenu: 'ROOT',
  LabelValue: `ecom.${RefNo.toLowerCase()}`, ClassValue: 'fa fa-x', AttrValue: `href="${RefNo.toLowerCase()}.do"`, ...extra,
});
const menus: Row[] = [
  menu(44, 'DBD', 'P'), menu(45, 'SCH', 'D'), menu(47, 'BKG', 'P'), menu(48, 'SHI', 'P'), menu(52, 'BOL', 'P'), menu(55, 'VGM', 'D'),
  menu(102, 'PAY', 'P', 'I'), menu(71, 'BLS', 'D', 'A', { ParentMenu: 'SCH', MenuType: 'S' }), menu(76, 'DEO', 'P', 'A', { ParentMenu: 'IMO', MenuType: 'S' }),
];

describe('menu ids and capabilities', () => {
  it('splits and joins the underscore-separated MenuId column', () => {
    expect(splitMenuIds('44_47_48_52_56')).toEqual(['44', '47', '48', '52', '56']);
    expect(splitMenuIds(null)).toEqual([]);
    expect(joinMenuIds(['47', '47', '48'])).toBe('47_48');
  });

  it('maps the user menus plus the default D menus onto capability codes', () => {
    const caps = capabilitiesForMenuIds(['44', '47', '48'], menus);
    expect(caps).toEqual(expect.arrayContaining(['VIEW_DASHBOARD', 'BKG', 'CREATE_BOOKING', 'SI', 'SCH', 'VGM']));
    expect(caps).not.toContain('BL');
    expect(caps).not.toContain('DO');
    expect(caps).not.toContain('PAY'); // inactive menu
  });

  it('derives the menu-access category map (P wins over D)', () => {
    const cats = menuCategories(menus);
    expect(cats.SCH).toBe('D');
    expect(cats.VGM).toBe('D');
    expect(cats.BKG).toBe('P');
    expect(cats.PAY).toBeUndefined();
  });

  it('extracts routes and legacy AdminAccess keys from AttrValue', () => {
    expect(attrRoute('href="tracking.do"')).toBe('tracking.do');
    expect(attrRoute('/app/tracking')).toBe('/app/tracking');
    expect(adminAccessType('href="AdminAccess.do?type=specialprivi"')).toBe('specialprivi');
    expect(adminAccessType('href="x.do"')).toBeNull();
  });

  it('builds vendorMenuList from the vendor module mapping', () => {
    const mapping: Row[] = [
      { status: 'V', menuorder: 20, AttrValue: 'href="AdminAccess.do?type=specialprivi"' },
      { status: 'A', menuorder: 30, AttrValue: 'href="AdminAccess.do?type=emailtemplate"' },
      { status: 'V', menuorder: 10, AttrValue: 'href="AdminAccess.do?type=specialprivi"' },
    ];
    const adminMenus: Row[] = [{ status: 'A', AttrValue: 'href="AdminAccess.do?type=registermenu"' }];
    expect(vendorMenuKeys('vendor', mapping, adminMenus)).toEqual(['specialprivi']);
    expect(vendorMenuKeys('all', mapping, adminMenus)).toEqual(['specialprivi', 'emailtemplate', 'registermenu']);
  });
});

describe('menu config', () => {
  it('maps a MenuRegistration row onto MenuConfig', () => {
    const cfg = mapMenuConfig(menus[6]);
    expect(cfg).toMatchObject({ refNo: 'PAY', isEnabled: false, category: 'P', userType: 'U', attrValue: 'pay.do', orderNo: 102, parentMenu: 'ROOT' });
  });

  it('writes a PUT list back onto rows and appends unknown entries', () => {
    const rows = menus.map(m => ({ ...m }));
    const list = rows.map(mapMenuConfig);
    list[0] = { ...list[0], isEnabled: false, orderNo: 999 };
    list.push({ refNo: 'NEW', labelValue: 'ecom.new', category: 'P', classValue: '', attrValue: '/app/new', orderNo: 5, isEnabled: true, userType: 'U', parentMenu: 'ROOT' });
    applyMenuConfigs(list, rows);
    expect(rows[0].MenuStatus).toBe('I');
    expect(rows[0].menuorder).toBe(999);
    expect(rows.at(-1)).toMatchObject({ RefNo: 'NEW', MenuId: 103, MenuStatus: 'A' });
  });
});

describe('module mapping (SplPrivilegeMenu)', () => {
  const assigned: Row[] = [{ ID: 1, menuid: '47_48', custid: 'a@example.com' }];

  it('flags assigned privileged menus as NP, defaults as D', () => {
    const rows = moduleMappingMenus('20001374', 'a@example.com', menus, assigned);
    const by = Object.fromEntries(rows.map(r => [r.refNo, r.category]));
    expect(by).toMatchObject({ BKG: 'NP', SHI: 'NP', BOL: 'P', SCH: 'D', VGM: 'D' });
    expect(by.PAY).toBeUndefined();
  });

  it('matches on the customer code too and creates a row when missing', () => {
    const rows = assigned.map(r => ({ ...r }));
    expect(assignedMenuIds('20001374', '', rows)).toEqual([]);
    expect(assignedMenuIds('a@example.com', '', rows)).toEqual(['47', '48']); // custid may hold the login e-mail
    setAssignedMenuIds('20001374', 'b@example.com', ['52'], rows);
    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({ ID: 2, custid: 'b@example.com', menuid: '52' });
    setAssignedMenuIds('', 'a@example.com', ['47'], rows);
    expect(rows[0].menuid).toBe('47');
  });
});

describe('special privileges matrix', () => {
  const users: Row[] = [{ loginname: 'a@example.com', Comp_Name: 'Acme', Cust_Code: '1' }];
  const details: Row[] = [{ EmailID: 'a@example.com', userRole: 'Y' }];

  it('expands each customer menu list into one row per menu', () => {
    const list = specialPrivileges([{ ID: 1, menuid: '47_45', custid: 'a@example.com' }], menus, users, details);
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ roleId: 'a@example.com', roleName: 'Acme', moduleCode: 'BKG', canView: true, canCreate: true, canApprove: true });
    expect(list[1]).toMatchObject({ moduleCode: 'SCH', canCreate: false });
  });

  it('drops rows whose canView was cleared on PUT', () => {
    const rows: Row[] = [{ ID: 1, menuid: '47_45', custid: 'a@example.com' }];
    const list = specialPrivileges(rows, menus, users, details).map(p => (p.moduleCode === 'SCH' ? { ...p, canView: false } : p));
    applySpecialPrivileges(list, rows, menus);
    expect(rows[0].menuid).toBe('47');
  });
});
