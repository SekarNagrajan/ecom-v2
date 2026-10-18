// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { describe, expect, it } from 'vitest';

import { db } from '../db';
import {
  buildFacts,
  emptyTables,
  fixtureDashboardReport,
  fixtureDashboardSummary,
  fixtureVolumeAnalytics,
  fmtWeekRange,
  isoWeek,
  teuOf,
  titleCase,
  type DashboardTables,
} from './dashboard.bridge';

/** Friday 16 Oct 2026, noon local time — the clock every assertion below assumes. */
const NOW = new Date(2026, 9, 16, 12, 0);
const iso = (m: number, d: number, h = 10) => new Date(2026, m - 1, d, h, 0).toISOString();

const QUICK_ACTIONS = [
  { key: 'newBooking', title: 'New Booking', description: '', route: '/app/booking/new' },
  { key: 'submitSi', title: 'Submit SI', description: '', route: '/app/shipping-instruction' },
];

function sampleTables(): DashboardTables {
  const t = emptyTables();
  t.bookings = [
    // confirmed, SI accepted with B/L, sails next week
    { ebookno: 'BKON1', extBookNo: 'SVM1', ebook_status: 'A', originPortId: 'INNSA', finalPortId: 'AEJEA', loadPortId: 'INNSA', dischargePortId: 'AEJEA', datecr: iso(10, 10), dateup: iso(10, 15), submitted_date: iso(10, 10) },
    // confirmed, no SI, in transit, pending online payment
    { ebookno: 'BKON2', extBookNo: 'SVM2', ebook_status: 'A', originPortId: 'INNSA', finalPortId: 'NLRTM', loadPortId: 'INNSA', dischargePortId: 'NLRTM', datecr: iso(10, 2), dateup: iso(10, 14), submitted_date: iso(10, 2) },
    // draft, sails Monday next week
    { ebookno: 'BKON3', extBookNo: null, ebook_status: 'D', originPortId: 'INNSA', finalPortId: 'AEJEA', loadPortId: 'INNSA', dischargePortId: 'AEJEA', datecr: iso(10, 16, 9), dateup: iso(10, 16, 9), submitted_date: null },
    // cancelled after acceptance
    { ebookno: 'BKON4', extBookNo: 'SVM4', ebook_status: 'I', originPortId: 'INNSA', finalPortId: 'AEJEA', loadPortId: 'INNSA', dischargePortId: 'AEJEA', datecr: iso(9, 20), dateup: iso(10, 13), submitted_date: iso(9, 20) },
    // template — never a shipment
    { ebookno: 'BKON5', extBookNo: null, ebook_status: 'T', originPortId: 'INNSA', finalPortId: 'AEJEA', datecr: iso(9, 1), dateup: iso(9, 1) },
    // confirmed, SI submitted (no B/L yet), already arrived
    { ebookno: 'BKON6', extBookNo: 'SVM6', ebook_status: 'A', originPortId: 'EGALY', finalPortId: 'AEJEA', loadPortId: 'EGALY', dischargePortId: 'AEJEA', datecr: iso(9, 25), dateup: iso(10, 12), submitted_date: iso(9, 25) },
  ];
  t.bookingCargo = [
    { ebookno: 'BKON1', conid: 1, containerno: 'TEMU0000001', eqpSize: 'RE20', eqpType: 'R', quantity: 1, dgFlag: 'N' },
    { ebookno: 'BKON1', conid: 2, containerno: null, eqpSize: 'RE20', eqpType: 'R', quantity: 1, dgFlag: 'N' },
    { ebookno: 'BKON1', conid: 3, containerno: null, eqpSize: 'DV40', eqpType: 'D', quantity: 1, dgFlag: 'N' },
    { ebookno: 'BKON2', conid: 1, containerno: null, eqpSize: '20DC', eqpType: null, quantity: 1, dgFlag: 'Y' },
    { ebookno: 'BKON3', conid: 1, containerno: null, eqpSize: 'DV20', eqpType: 'D', quantity: 1, dgFlag: 'N' },
    { ebookno: 'BKON4', conid: 1, containerno: null, eqpSize: 'DV20', eqpType: 'D', quantity: 1, dgFlag: 'N' },
    { ebookno: 'BKON6', conid: 1, containerno: null, eqpSize: 'DV40', eqpType: 'D', quantity: 1, dgFlag: 'N' },
  ];
  t.bookingLeg = [
    { ebookno: 'BKON1', leg_no: 1, serviceCode: '8072', vesselCode: 'RNR', voyageCode: '4422', loadPortId: 'INNSA', loadTerminal: 'INNSABMCT0', dischargePortId: 'AEJEA', dischargeTerminal: 'AEJEA01', etdDate: iso(10, 21), etaDate: iso(10, 23) },
    { ebookno: 'BKON2', leg_no: 1, serviceCode: 'J260', vesselCode: 'ECO1', voyageCode: '01', loadPortId: 'INNSA', loadTerminal: 'INNSABMCT0', dischargePortId: 'NLRTM', dischargeTerminal: 'NLRTM00001', etdDate: iso(10, 14), etaDate: iso(10, 20) },
    { ebookno: 'BKON3', leg_no: 1, serviceCode: 'EGF1', vesselCode: 'SNA', voyageCode: 'EGF06', loadPortId: 'INNSA', loadTerminal: null, dischargePortId: 'AEJEA', dischargeTerminal: 'AEJEA01', etdDate: iso(10, 19), etaDate: iso(10, 22) },
    { ebookno: 'BKON6', leg_no: 1, serviceCode: 'AA74', vesselCode: 'HC7', voyageCode: '7', loadPortId: 'EGALY', loadTerminal: 'EGALYALY00', dischargePortId: 'AEJEA', dischargeTerminal: 'AEJEAT2', etdDate: iso(10, 1), etaDate: iso(10, 5) },
  ];
  t.bookingCommodity = [
    { ebookno: 'BKON1', conid: 1, descr: 'rice' },
    { ebookno: 'BKON1', conid: 2, descr: 'Rice' },
    { ebookno: 'BKON1', conid: 3, descr: 'RICE' },
    { ebookno: 'BKON2', conid: 1, descr: 'cotton' },
    { ebookno: 'BKON3', conid: 9, descr: '' },
  ];
  t.bookingCust = [
    { ebookno: 'BKON1', custTypeId: 'SH', name: 'Shipper Co' },
    { ebookno: 'BKON1', custTypeId: 'CN', name: 'Acme Imports' },
    { ebookno: 'BKON2', custTypeId: 'CN', name: 'Beta Traders' },
  ];
  t.shippingInstructions = [
    { eSINo: 'SIREQ1', bookno: 'SVM1', blno: 'BL1', status: 'A', editbl: 0, pol: 'INNSA', polHeaderName: 'NHAVA SHEVA,MUMBAI', pod: 'AEJEA', podHeaderName: 'JEBEL ALI, UAE', ChgDate: iso(10, 15) },
    { eSINo: 'SIREQ1X', bookno: 'SVM1', blno: 'BL1', status: 'A', editbl: 1, pol: 'INNSA', pod: 'AEJEA', ChgDate: iso(10, 16) }, // B/L amendment copy
    { eSINo: 'SIREQ2', bookno: 'SVM2', blno: null, status: 'I', editbl: 0, pol: 'INNSA', pod: 'NLRTM', ChgDate: iso(10, 13) }, // cancelled SI
    { eSINo: 'SIREQ6', bookno: 'SVM6', blno: null, status: 'S', editbl: 0, pol: 'EGALY', pod: 'AEJEA', ChgDate: iso(10, 11) },
    { eSINo: 'SIREQ7', bookno: 'OTHER1', blno: 'BL7', status: 'A', editbl: 0, pol: 'CNSHA', pod: 'SGSIN', ChgDate: iso(9, 1) },
    { eSINo: 'SIREQ8', bookno: 'OTHER2', blno: 'BL8', status: 'A', editbl: 0, pol: 'CNSHA', pod: 'SGSIN', ChgDate: iso(9, 2) },
  ];
  t.vgm = [
    { book_no: 'SVM1', eqpid: 'TEMU0000001', status: 'A' },
    { book_no: 'SVM1', eqpid: 'TEMU0000002', status: 'C' },
    { book_no: 'SVM1', eqpid: 'TEMU0000003', status: 'I' }, // inactive — does not count
  ];
  t.payments = [
    { requestId: 'R1', status: 'SESSION_CREATED', amountUsd: 500, agencyCode: 'INDMUM' },
    { requestId: 'R2', status: 'COMPLETED', amountUsd: 900, agencyCode: 'INDMUM' },
    { requestId: 'R3', status: 'FAILED', amountUsd: 250.5, agencyCode: 'INDMUM' },
  ];
  t.paymentReferences = [
    { requestId: 'R1', refType: 'BKG', refNo: 'SVM2', amountUsd: 500 },
    { requestId: 'R2', refType: 'BL', refNo: 'BL1', amountUsd: 900 },
    { requestId: 'R3', refType: 'INV', refNo: 'INV-OUTSIDE-SAMPLE', amountUsd: 250.5 },
  ];
  t.cutoffConfig = [{ port: 'INNSA', terminal: 'INNSABMCT0', docclosing: 24 }];
  t.routeSearchLog = [
    { custcode: 'C1', originport: 'INBLR', destport: 'AEJEA', crDate: iso(10, 15) },
    { custcode: 'C1', originport: 'INBLR', destport: 'AEJEA', crDate: iso(10, 14) },
    { custcode: 'C1', originport: 'INNSA', destport: 'AEJEA', crDate: iso(8, 1) },
  ];
  t.notices = [{ id: 1, Title: 'Port notice', FileName: '1~file.pdf', CrDate: iso(10, 1) }];
  t.advisories = [{ id: 2, advisoryname: 'Advisory', description: 'Line one\r\nLine two', createddate: iso(10, 5), status: 'A' }];
  t.notificationMaster = [{ id: 3, msgid: 'EN3', message: 'Hello customers', status: 'A', crdate: iso(10, 10) }];
  return t;
}

describe('dashboard bridge helpers', () => {
  it('counts TEUs from the equipment size wherever the digits sit', () => {
    expect(teuOf({ eqpSize: 'RE20', quantity: 1 })).toBe(1);
    expect(teuOf({ eqpSize: '20DC', quantity: 3 })).toBe(3);
    expect(teuOf({ eqpSize: 'DV40', quantity: 1 })).toBe(2);
    expect(teuOf({ eqpSize: '45RF', quantity: 2 })).toBe(4);
    expect(teuOf({ eqpSize: null, quantity: null })).toBe(1);
  });

  it('computes ISO weeks and calendar ranges', () => {
    expect(isoWeek(new Date(2026, 9, 12))).toEqual({ week: 42, year: 2026 });
    expect(isoWeek(new Date(2026, 0, 1))).toEqual({ week: 1, year: 2026 });
    expect(fmtWeekRange(new Date(2026, 9, 12), new Date(2026, 9, 18))).toBe('12–18 Oct');
    expect(fmtWeekRange(new Date(2026, 9, 26), new Date(2026, 10, 1))).toBe('26 Oct–1 Nov');
  });

  it('title-cases SI header port names', () => {
    expect(titleCase('NHAVA SHEVA,MUMBAI')).toBe('Nhava Sheva, Mumbai');
    expect(titleCase('JEBEL ALI, UAE')).toBe('Jebel Ali, Uae');
  });
});

describe('booking facts', () => {
  const facts = buildFacts(sampleTables(), NOW);
  const fact = (no: string) => facts.find(f => f.ebookno === no)!;

  it('drops templates and derives TEUs, lifecycle, SI, B/L, payments and VGM coverage', () => {
    expect(facts.map(f => f.ebookno)).toEqual(['BKON1', 'BKON2', 'BKON3', 'BKON4', 'BKON6']);
    const b1 = fact('BKON1');
    expect(b1.teus).toBe(4);
    expect(b1.reefer).toBe(true);
    expect(b1.lifecycle).toBe('origin');
    expect(b1.si?.eSINo).toBe('SIREQ1'); // the editbl=1 amendment copy is ignored
    expect(b1.blIssued).toBe(true);
    expect(b1.vgmPending).toBe(1); // 3 containers, 2 active VGM rows
    expect(b1.commodities).toEqual([{ name: 'rice', teus: 1 }, { name: 'Rice', teus: 1 }, { name: 'RICE', teus: 2 }]);

    const b2 = fact('BKON2');
    expect(b2.lifecycle).toBe('inTransit');
    expect(b2.si).toBeNull(); // cancelled SI does not count
    expect(b2.amtBal).toBe(500);
    expect(b2.dg).toBe(true);

    expect(fact('BKON3').vgmPending).toBe(0); // not confirmed yet
    expect(fact('BKON6').lifecycle).toBe('delivered');
  });
});

describe('fixtureDashboardSummary', () => {
  const summary = fixtureDashboardSummary({ tables: sampleTables(), now: NOW, quickActions: QUICK_ACTIONS });

  it('lists only bookings with an agency number as ongoing transactions, newest first', () => {
    expect(summary.shipments.map(s => s.bookNo)).toEqual(['SVM1', 'SVM2', 'SVM4', 'SVM6']);
    const svm1 = summary.shipments[0];
    expect(svm1).toMatchObject({
      id: 'BKON1', onlineRefNo: 'BKON1', blNo: 'BL1', siNo: 'SIREQ1', status: 'I', teus: '4',
      containerNo: 'TEMU0000001', polAt: '2026-10-21', originPortDesc: 'Nhava Sheva, Mumbai', finalPortDesc: 'Jebel Ali, Uae',
      filterKey: 'origin', amtBal: 0,
    });
    expect(summary.shipments[1]).toMatchObject({ status: 'C', filterKey: 'inTransit', amtBal: 500, invNo: 'SVM2', invAgency: 'INDMUM' });
    expect(summary.shipments[2]).toMatchObject({ status: 'V', filterKey: 'cancelled' });
    expect(summary.shipments[3]).toMatchObject({ status: 'C', filterKey: 'delivered', siNo: 'SIREQ6', blNo: '' });
  });

  it('makes every KPI equal to the slice its card filters down to', () => {
    expect(summary.counts).toEqual({
      totCou: 4, bkConfirmed: 3, siPending: 2, payPending: 1, pendingAmount: 500, orgCou: 1, inTransitCou: 1, delCou: 1,
    });
  });

  it('builds the planning calendar from ETD days starting on the current Monday', () => {
    const { calendar, kpis } = summary.planning;
    expect(calendar.map(w => w.week)).toEqual(['W42', 'W43', 'W44']);
    expect(calendar.map(w => w.dateRange)).toEqual(['12–18 Oct', '19–25 Oct', '26 Oct–1 Nov']);
    expect(calendar[0].days.wed).toMatchObject({ count: 1, missingSI: 1, pendingPayment: 1 }); // BKON2 sails 14 Oct, no SI, payment pending
    expect(calendar[0].days.total).toBe(1);
    expect(calendar[1].days.mon.bookings[0]).toMatchObject({ bookingNo: 'BKON3', status: 'Draft', missingSIFlag: false, teusCount: 1 });
    expect(calendar[1].days.wed.bookings[0]).toMatchObject({ bookingNo: 'SVM1', origin: 'INNSA - Nhava Sheva, Mumbai', missingSIFlag: false });
    expect(calendar[1].days.total).toBe(2);
    expect(calendar[2].days.total).toBe(0);
    expect(kpis).toEqual({ bookingsNext7Days: 2, feusNext7Days: 5, missingSI: 1, atRisk: 1 });
  });

  it('ranks lanes by TEU and derives quiet / suggested lanes from searches and agency SIs', () => {
    expect(summary.lanes.top).toEqual([
      { rank: 1, pol: 'INNSA', pod: 'AEJEA', feus: 5, pctOfTotal: 62.5 },
      { rank: 2, pol: 'EGALY', pod: 'AEJEA', feus: 2, pctOfTotal: 25 },
      { rank: 3, pol: 'INNSA', pod: 'NLRTM', feus: 1, pctOfTotal: 12.5 },
    ]);
    expect(summary.lanes.lastUsed[0]).toEqual({ pol: 'INNSA', pod: 'AEJEA', date: 'Oct 16, 2026' });
    expect(summary.lanes.contracted).toEqual([{ pol: 'INBLR', pod: 'AEJEA', lastActivity: null }]);
    expect(summary.lanes.opportunities).toEqual([{ pol: 'CNSHA', pod: 'SGSIN', suggestion: 'High Potential' }]);
  });

  it('breaks volume down by dimension and derives shipment statistics', () => {
    const { breakdowns, consignees, stats } = summary.intelligence;
    expect(breakdowns.origin.map(b => [b.name, b.feus, b.pctOfTotal, b.tone])).toEqual([
      ['INNSA – Nhava Sheva, Mumbai', 6, 75, 'primary'],
      ['EGALY', 2, 25, 'success'],
    ]);
    expect(breakdowns.pickup[0].name).toBe('INNSABMCT0');
    expect(consignees.map(c => c.name)).toEqual(['Acme Imports', 'Beta Traders']);
    expect(stats).toEqual({
      shipments: 4, containers: 6, teus: 8, avgTransitDays: 4, dgSharePct: 12.5, reeferSharePct: 50, vgmPending: 3,
      topCommodities: [{ name: 'Rice', teus: 4 }, { name: 'Cotton', teus: 1 }],
    });
  });

  it('fills the stat cards, quick-action counts, recent bookings, schedules and notices', () => {
    expect(summary.stats.map(s => [s.key, s.value, s.subtitle])).toEqual([
      ['activeBookings', '3', '+2 this week'],
      ['inTransit', '1', '1 arriving this week'],
      ['pendingSiBl', '2', '3 VGM pending'],
      ['outstanding', 'USD 751', '2 payments pending'],
    ]);
    expect(summary.outstandingBalance).toBe(750.5);
    expect(summary.quickActions).toEqual([
      { ...QUICK_ACTIONS[0], count: 1 },
      { ...QUICK_ACTIONS[1], count: 1 },
    ]);
    expect(summary.recentBookings.map(r => [r.bookingNo, r.status, r.etd])).toEqual([
      ['BKON3', 'Pending', '19 Oct 2026'],
      ['SVM1', 'B/L Issued', '21 Oct 2026'],
      ['SVM2', 'In Transit', '14 Oct 2026'],
      ['SVM6', 'Completed', '01 Oct 2026'],
    ]);
    expect(summary.recentBookings[1]).toMatchObject({ vessel: 'EVER GREEN', voyage: '4422', polName: 'Nhava Sheva, Mumbai', pod: 'AEJEA' }); // vessels master
    expect(summary.upcomingSchedules.map(s => [s.vessel, s.etd, s.cutoff, s.cutoffOverdue])).toEqual([
      ['ESL SANA', '19 Oct 2026', '17 Oct 2026', false], // no cut-off config → 48h default
      ['EVER GREEN', '21 Oct 2026', '20 Oct 2026', false], // INNSA/INNSABMCT0 doc closing 24h
    ]);
    expect(summary.upcomingSchedules[1]).toMatchObject({ service: 'SHIPPER', pol: 'Nhava Sheva, Mumbai', pod: 'Jebel Ali, Uae' }); // services / ports masters
    expect(summary.notices.map(n => [n.title, n.body, n.date])).toEqual([
      ['Notification EN3', 'Hello customers', '10 Oct 2026'],
      ['Advisory', 'Line one', '05 Oct 2026'],
      ['Port notice', 'Attachment: file.pdf', '01 Oct 2026'],
    ]);
  });

  it('derives charts and uncleared cargo', () => {
    expect(summary.bookingChart.map(c => [c.status, c.count])).toEqual([['Confirmed', 3], ['Draft', 1], ['Cancelled', 1]]);
    expect(summary.topDestinations[0]).toEqual({ port: 'AEJEA', count: 3 });
    expect(summary.portPairs[0]).toEqual({ pol: 'INNSA', pod: 'AEJEA', count: 2 });
    expect(summary.unclearedCargo).toEqual([{ port: 'AEJEA', count: 1 }]);
    expect(summary.unclearedRemaining).toBe(1);
  });
});

describe('fixtureVolumeAnalytics', () => {
  const tables = sampleTables();

  it('measures TEUs per period on the sailing date and compares with the previous period', () => {
    const all = fixtureVolumeAnalytics('all', 'Monthly', { tables, now: NOW });
    const [week, month, quarter, year] = all.kpis;
    expect(week).toMatchObject({ label: 'This Week', period: 'W42, 2026', value: 1, unit: 'TEUs' });
    expect(month).toMatchObject({ label: 'This Month', period: 'Month (Oct 2026)', value: 8, changePrev: 0, change: 100 });
    expect(quarter).toMatchObject({ period: 'Q4, 2026', value: 8 });
    expect(year).toMatchObject({ period: 'Year (2026)', value: 8 });
    expect(week.sparkline).toHaveLength(10);
    expect(all.trend).toHaveLength(12);
    expect(all.trend.at(-1)).toEqual({ month: 'Oct 2026', feus: 8 });
  });

  it('narrows the slice per lifecycle stage and trend granularity', () => {
    expect(fixtureVolumeAnalytics('bl', 'Weekly', { tables, now: NOW }).kpis[1].value).toBe(4);
    expect(fixtureVolumeAnalytics('inTransit', 'Weekly', { tables, now: NOW }).kpis[1].value).toBe(1);
    expect(fixtureVolumeAnalytics('booking', 'Quarterly', { tables, now: NOW }).kpis[1].value).toBe(7);
    const weekly = fixtureVolumeAnalytics('all', 'Weekly', { tables, now: NOW });
    expect(weekly.trend).toHaveLength(12);
    expect(weekly.trend.at(-1)).toEqual({ month: 'W42', feus: 1 });
    expect(fixtureVolumeAnalytics('all', 'Quarterly', { tables, now: NOW }).trend.at(-1)).toEqual({ month: 'Q4 2026', feus: 8 });
  });
});

describe('fixtureDashboardReport', () => {
  it('assembles the export sections from the same derived data and honours the KPI filter', () => {
    const report = fixtureDashboardReport({ reportTitle: '  Weekly ops  ', activeFilter: 'payPending' }, { tables: sampleTables(), now: NOW });
    expect(report.title).toBe('Weekly ops');
    expect(report.appliedFilters).toEqual([
      { label: 'KPI filter', value: 'Payment Pending' },
      { label: 'Shipments', value: '1 of 4' },
    ]);
    expect(report.sections.map(s => s.id)).toEqual([
      'shipmentKpis', 'ongoingTransactions', 'volumeKpis', 'volumeTrend', 'topLanes', 'topConsignees', 'lanesChart', 'shipmentIntelligence',
    ]);
    const table = report.sections[1];
    expect(table.type === 'TABLE' && table.rows).toEqual([
      { bookNo: 'SVM2', blNo: '—', route: 'INNSA → NLRTM', polAt: '2026-10-14', status: 'Confirmed', teus: '1', amtBal: '$500' },
    ]);
    const intel = report.sections[7];
    expect(intel.type === 'KPI' && intel.items.map(i => i.value)).toEqual(['4 days', '12.5%', '50.0%', '3', 'Rice']);
  });
});

describe('against the extracted fixtures', () => {
  it('derives the ongoing table from every non-template booking the agency numbered', () => {
    const summary = fixtureDashboardSummary({ quickActions: QUICK_ACTIONS });
    const numbered = db.bookings.filter(b => String(b.ebook_status).toUpperCase() !== 'T' && String(b.extBookNo ?? '').trim());
    expect(summary.shipments).toHaveLength(numbered.length);
    expect(summary.counts.totCou).toBe(numbered.length);
    expect(summary.shipments.every(s => s.bookNo && s.onlineRefNo && s.originPortId && s.finalPortId)).toBe(true);
    expect(summary.planning.calendar).toHaveLength(3);
    expect(summary.lanes.top.length).toBeGreaterThan(0);
    expect(summary.intelligence.breakdowns.origin.length).toBeGreaterThan(0);
    expect(summary.stats).toHaveLength(4);
    expect(summary.quickActions.every(a => typeof a.count === 'number')).toBe(true);
    expect(fixtureVolumeAnalytics().kpis).toHaveLength(4);
  });
});
