// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { describe, expect, it } from 'vitest';

import type { Row } from '../db';
import {
  advisories, advisoryRow, applyCutoff, applyFieldConfigs, applyGlobalConfig, applyServiceRestrictions, bannerRow, banners, cutoffConfigs,
  cutoffPorts, cutoffTerminals, extractPlaceholders, findCutoffRow, globalConfigDto, hotlineContacts, mapCutoff, mapEmailTemplate,
  mapFieldConfig, portNameIndex, serviceRestrictions,
} from './admin.bridge';

describe('banners and advisories', () => {
  it('maps EcomImageUpload rows in display order and appends new ones', () => {
    const rows: Row[] = [{ id: 5, imagename: 'Im3', imagepath: '/bgimage/Im3.jpg', displayorder: 3, status: 'A' }, { id: 1, imagename: 'image1', imagepath: '/bgimage/image1.jpg', displayorder: 1, status: 'I' }];
    expect(banners(rows).map(b => b.id)).toEqual(['1', '5']);
    expect(banners(rows)[0]).toMatchObject({ title: 'image1', imageUrl: '/bgimage/image1.jpg', sortOrder: 1, isActive: false });
    bannerRow({ title: 'New', imageUrl: '/x.png', sortOrder: 9, isActive: true }, rows);
    expect(rows.at(-1)).toMatchObject({ id: 6, imagename: 'New', status: 'A' });
  });

  it('maps EcomCustomerAdvisory newest first', () => {
    const rows: Row[] = [
      { id: 1, advisoryname: 'Old', description: 'd1', createddate: '2018-11-16T07:45:01Z', status: 'V' },
      { id: 2, advisoryname: 'New', description: 'd2', createddate: '2019-01-17T08:38:13Z', status: 'A' },
    ];
    expect(advisories(rows).map(a => a.title)).toEqual(['New', 'Old']);
    expect(advisories(rows)[0]).toMatchObject({ id: '2', message: 'd2', severity: 'INFO', effectiveFrom: '2019-01-17', isActive: true });
    advisoryRow({ title: 'T', message: 'M', severity: 'URGENT', effectiveFrom: '2026-10-01', effectiveTo: '2026-10-02', isActive: true }, rows);
    expect(rows.at(-1)).toMatchObject({ id: 3, advisoryname: 'T', createddate: '2026-10-01', status: 'A' });
  });
});

describe('cut-off configuration', () => {
  const rows: Row[] = [
    { id: 62, port: 'INNSA', terminal: 'INNSABMCT0', cfsclosing: 24, vgmclosing: 48, docclosing: 24, ediclosing: 24, fullcntrclosing: 72, status: null, excludeweekend: 'N' },
    { id: 52, port: 'All', terminal: 'All', cfsclosing: 24, vgmclosing: 48, docclosing: 24, ediclosing: 24, fullcntrclosing: 48, status: null, excludeweekend: 'Y' },
    { id: 1, port: 'AEJEA', terminal: 'All', cfsclosing: 1, vgmclosing: 1, docclosing: 1, ediclosing: 1, fullcntrclosing: 1, status: 'I', excludeweekend: 'N' },
  ];
  const si: Row[] = [{ pol: 'INNSA', polHeaderName: 'NHAVA SHEVA,MUMBAI', pod: 'AEJEA', podHeaderName: 'JEBEL ALI, UAE' }];
  const index = portNameIndex([], si);

  it('maps rows with port names from the SI headers and skips inactive rows', () => {
    const list = cutoffConfigs(rows, index);
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ id: 'INNSA|INNSABMCT0', portName: 'NHAVA SHEVA,MUMBAI', terminalName: 'BHARAT MUMBAI CONTAINER TERMINAL TERMINAL AVCBDSVM', vgmClosing: 48, excludeWeekends: false }); // terminal name from the terminals master
    expect(list[1]).toMatchObject({ id: 'All|All', portName: 'All Port', terminalName: 'All Terminal', excludeWeekends: true });
    expect(mapCutoff(rows[2], index).portName).toBe('JEBEL ALI, UAE');
  });

  it('finds and patches a row by composite id', () => {
    const copy = rows.map(r => ({ ...r }));
    const row = findCutoffRow('INNSA|INNSABMCT0', copy);
    expect(row?.id).toBe(62);
    applyCutoff(row as Row, { cfsClosing: 99, excludeWeekends: true });
    expect(row).toMatchObject({ cfsclosing: 99, excludeweekend: 'Y' });
    expect(findCutoffRow('AEJEA|All', copy)).toBeUndefined();
  });

  it('collects port and terminal options from cut-offs and booking legs', () => {
    const bookings: Row[] = [{ originPortId: 'CNSHA', finalPortId: 'AEJEA' }];
    const legs: Row[] = [{ loadPortId: 'INNSA', loadTerminal: 'INNSAGTI01', dischargePortId: 'AEJEA', dischargeTerminal: 'AEJEAT1' }];
    const ports = cutoffPorts(rows, bookings, legs, [], index);
    expect(ports[0].portCode).toBe('All');
    expect(ports.map(p => p.portCode)).toEqual(['All', 'AEJEA', 'CNSHA', 'INNSA']);
    expect(ports.find(p => p.portCode === 'INNSA')?.label).toBe('INNSA - NHAVA SHEVA,MUMBAI');
    expect(cutoffTerminals('INNSA', rows, legs).map(t => t.terminalCode)).toEqual(['All', 'INNSABMCT0', 'INNSAGTI01']);
  });
});

describe('e-mail templates', () => {
  it('extracts {{mustache}} and @token placeholders but not e-mail addresses', () => {
    expect(extractPlaceholders('Booking {{bookingNo}} for @bookref', '<p>{{ bookingNo }} contact ops@example.com @url</p>')).toEqual(['{{bookingNo}}', '@bookref', '@url']);
  });

  it('maps EcomEmailTemplate rows with an updatedAt fallback', () => {
    const t = mapEmailTemplate({ id: '7', templateKey: 'BOOKING_ACCEPTED_CUSTOMER', subject: 'ESEA Booking In Progress', bodyHtml: '<p>{{x}}</p>', createdAt: '2026-10-08T12:43:06.579Z', updatedAt: null });
    expect(t).toMatchObject({ id: '7', templateCode: 'BOOKING_ACCEPTED_CUSTOMER', placeholders: ['{{x}}'], updatedAt: '2026-10-08T12:43:06.579Z' });
  });
});

describe('field configuration', () => {
  const names: Row[] = [{ module: 'BKG', fieldcode: 'HSC', fieldname: 'HS Code', shipmenttype: 'I' }];

  it('labels fieldconfigdetails rows through fieldnameconfig', () => {
    const fc = mapFieldConfig({ id: 6, fieldcode: 'HSC', searchtype: 'P', searchvalue: 'INMAA', shipmenttype: 'I', inputtype: 'M ', status: 'A' }, names);
    expect(fc).toMatchObject({ id: '6', formName: 'Booking Form', fieldId: 'HSC', fieldLabel: 'HS Code (Port INMAA, Import)', isVisible: true, isRequired: true });
  });

  it('writes visibility and mandatory flags back', () => {
    const rows: Row[] = [{ id: 6, fieldcode: 'HSC', searchtype: 'P', searchvalue: 'INMAA', shipmenttype: 'I', inputtype: 'M ', status: 'A' }];
    applyFieldConfigs([{ id: '6', formName: '', fieldId: 'HSC', fieldLabel: '', isVisible: false, isRequired: false }], rows);
    expect(rows[0]).toMatchObject({ status: 'I', inputtype: 'E' });
  });
});

describe('global config', () => {
  it('reads Y/N flags from globalconfigproduct and writes them back', () => {
    const rows: Row[] = [
      { id: 1, pathname: 'ENABLE_GOOGLE_CAPTCHA', pathvalue: 'Y', status: 'C' },
      { id: 2, pathname: 'Enable_NewEcom', pathvalue: 'N', status: 'C' },
      { id: 3, pathname: 'GOOGLE_CAPTCHA_SITE_KEY', pathvalue: 'site-key', status: 'C' },
    ];
    const dto = globalConfigDto(rows, []);
    expect(dto).toMatchObject({ enableLoginCaptcha: true, v1DataEnableStatus: false, dashboardDisplay: false, captchaSecretKey: 'site-key', attemptLimit: 3 });
    applyGlobalConfig({ ...dto, enableLoginCaptcha: false, dashboardDisplay: true }, rows);
    expect(rows.find(r => r.pathname === 'ENABLE_GOOGLE_CAPTCHA')?.pathvalue).toBe('N');
    expect(rows.find(r => r.pathname === 'Enable_Enhanced_Dashboard')?.pathvalue).toBe('Y');
  });
});

describe('service restrictions', () => {
  it('maps ecom_service_restrict rows and replaces the list on PUT', () => {
    const rows: Row[] = [{ id: 11, pla: 'INMAA', pld: 'LKCMB', service: '1111', status: 'A' }, { id: 1, pla: 'INAMD', pld: 'SGSIN', service: 'EASS', status: 'A' }];
    const list = serviceRestrictions(rows, 'SVM');
    expect(list[0]).toMatchObject({ id: '11', polCode: 'INMAA', podCode: 'LKCMB', serviceLoop: '1111', tenantId: 'SVM', isRestricted: true });
    applyServiceRestrictions([{ ...list[0], isRestricted: false }, { id: 'tmp', polCode: 'A', podCode: 'B', serviceLoop: 'S', tenantId: 'SVM', isRestricted: true }], rows);
    expect(rows.map(r => r.id)).toEqual([11, 12]);
    expect(rows[0].status).toBe('I');
    expect(rows[1]).toMatchObject({ pla: 'A', pld: 'B', service: 'S', status: 'A' });
  });
});

describe('hotline contacts', () => {
  it('groups active rows by country (case-insensitive) and sorts countries and ports', () => {
    const rows: Row[] = [
      { CountryName: 'India', PortName: 'Nhava Sheva', ContactName: 'A', phone: '1', email: 'a@x', status: 'A' },
      { CountryName: 'india', PortName: 'Chennai', ContactName: 'B', phone: '2', email: 'b@x', status: 'A' },
      { CountryName: 'Hong Kong', PortName: '', portcode: 'hkhkg', ContactName: 'C', phone: '3', email: 'c@x', status: 'A' },
      { CountryName: 'Gone', PortName: 'X', ContactName: 'D', phone: '4', email: 'd@x', status: 'I' },
    ];
    const { countries } = hotlineContacts(rows);
    expect(countries.map(c => c.countryName)).toEqual(['Hong Kong', 'India']);
    expect(countries[1].ports.map(p => p.portName)).toEqual(['Chennai', 'Nhava Sheva']);
    expect(countries[0].ports[0]).toEqual({ portName: 'HONG KONG', contactName: 'C', phone: '3', email: 'c@x' }); // portcode → ports master name
  });
});
