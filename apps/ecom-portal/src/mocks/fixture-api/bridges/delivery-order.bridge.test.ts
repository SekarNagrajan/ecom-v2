// Modified by Sekar Nagarajan (2026-10-17 00:35)
import { beforeEach, describe, expect, it } from 'vitest';

import { db, eq, resetDb } from '../db';
import {
  deliveryOrderContainers,
  deliveryOrderDocument,
  deliveryOrderFacts,
  deliveryOrderList,
  filterDeliveryOrders,
  importBlNumbers,
  isDeliveryOrderIssuable,
  markDeliveryOrderPrinted,
} from './delivery-order.bridge';

const confirmedImport = (blNo: string) =>
  db.invoices.filter(inv => eq(inv.invrefno, blNo) && eq(inv.invtype, 'IMPORTINVOICE') && eq(inv.status, 'CONFIRM'));

describe('delivery-order bridge (invoices → DO rows)', () => {
  beforeEach(() => {
    resetDb();
  });

  it('lists one DO per import B/L whose confirmed invoices are fully paid, newest first', () => {
    const list = deliveryOrderList();
    expect(list.length).toBeGreaterThanOrEqual(5);
    expect(new Set(list.map(r => r.blnumber)).size).toBe(list.length);
    for (const row of list) {
      const balance = confirmedImport(row.blnumber).reduce((s, inv) => s + Number(inv.amtbalance), 0);
      expect(Math.abs(balance)).toBeLessThan(0.005);
      expect(row.delordno).toMatch(/^DO-/);
      expect(row.vessel).not.toBe('');
      expect(row.dischargeport).toMatch(/^[A-Z0-9]{5}( - .+)?$/);
      expect(+new Date(row.dovaliditydate)).toBeGreaterThan(+new Date(row.delorddate));
      expect(row.ecomprintstatus).toBe('1');
    }
    for (let i = 1; i < list.length; i += 1) {
      expect(+new Date(list[i - 1].delorddate)).toBeGreaterThanOrEqual(+new Date(list[i].delorddate));
    }
  });

  it('includes the demo customer B/L with a zero balance and excludes unpaid or unconfirmed B/Ls', () => {
    const blNos = deliveryOrderList().map(r => r.blnumber);
    expect(blNos).toContain('SG000286700'); // customer 20001374, 6 confirmed invoices, balance 0
    expect(blNos).not.toContain('AE01386800'); // balance outstanding
    expect(blNos).not.toContain('EPIRINDMUM69246'); // only VOID / DRAFT invoices
    expect(deliveryOrderFacts('EPIRINDMUM69246')).toBeNull();
    expect(isDeliveryOrderIssuable(deliveryOrderFacts('AE01386800')!)).toBe(false);
  });

  it('walks every import B/L of the sample', () => {
    const blNos = importBlNumbers();
    expect(blNos.length).toBe(new Set(db.invoices.filter(i => eq(i.invtype, 'IMPORTINVOICE')).map(i => String(i.invrefno))).size);
  });

  it('filters inclusively by DO date', () => {
    const list = deliveryOrderList();
    const day = list[0].delorddate.slice(0, 10);
    expect(filterDeliveryOrders(list, day, day).every(r => r.delorddate.slice(0, 10) === day)).toBe(true);
    expect(filterDeliveryOrders(list, '2999-01-01', null)).toEqual([]);
  });

  it('marks the invoices printed and appends a deliveryOrderVersions row on download', () => {
    const target = deliveryOrderList().find(r => r.printstatus === 'N')!;
    const before = db.deliveryOrderVersions.length;
    expect(markDeliveryOrderPrinted(target.delordno, 'tester')).toBe(true);
    const after = deliveryOrderList().find(r => r.delordno === target.delordno);
    expect(after?.printstatus).toBe('Y');
    expect(confirmedImport(target.blnumber).every(inv => inv.isprinted === 'Y' && inv.doprintstatus === 'Y')).toBe(true);
    const versions = db.deliveryOrderVersions.filter(v => eq(v.delordno, target.delordno));
    expect(versions.length).toBeGreaterThan(0);
    expect(versions.length).toBe(Math.max(1, deliveryOrderContainers(deliveryOrderFacts(target.blnumber)!).length));
    expect(db.deliveryOrderVersions.length).toBe(before + versions.length);
    expect(deliveryOrderDocument(target.delordno)).toContain(`B/L: ${target.blnumber}`);
    expect(markDeliveryOrderPrinted('DO-NOPE')).toBe(false);
    resetDb();
    expect(deliveryOrderList().find(r => r.delordno === target.delordno)?.printstatus).toBe('N');
  });
});
