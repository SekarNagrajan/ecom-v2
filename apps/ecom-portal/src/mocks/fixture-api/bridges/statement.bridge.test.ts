// Modified by Sekar Nagarajan (2026-10-17 00:40)
import { describe, expect, it } from 'vitest';

import { ciRow } from '../db';
import {
  accountCodes,
  ageingBucket,
  buildAgeing,
  buildStatement,
  buildStatementDocument,
  buildStatementExport,
  centsToDecimalString,
  classifyInvoice,
  emptyStatementTables,
  hasMatchingReceipt,
  invoiceDocument,
  invoiceUsdAmount,
  onlinePaymentDocNo,
  postedDocuments,
  receiptPosting,
  resolveStatementAccount,
  statementAccounts,
  type StatementTables,
} from './statement.bridge';

/** Friday 16 Oct 2026, noon UTC — the clock every ageing assertion assumes. */
const NOW = new Date(Date.UTC(2026, 9, 16, 12));

const invoice = (over: Record<string, unknown>) => ciRow({
  status: 'CONFIRM', invtype: 'EXPORTINVOICE', invcategory: 'DFT', custcode: 'L1', custname: 'Login Co', invcurrency: 'USD', invroe: 1,
  amtreceived: 0, vslcode: '', voycode: '', pol: 'INNSA', pod: 'AEJEA', invrefno: '', ...over,
});

function sampleTables(): StatementTables {
  const t = emptyStatementTables();
  t.invoices = [
    invoice({ invno: 'INV-OLD', invdate: '2026-05-20T10:00:00Z', invduedate: '2026-06-01T10:00:00Z', invamount: 300, amtbalance: 300 }),
    invoice({ invno: 'INV-A', invdate: '2026-08-02T10:00:00Z', invduedate: '2026-09-01T10:00:00Z', invamount: 1000, amtbalance: 400, amtreceived: 600 }),
    invoice({ invno: 'INV-CN', invdate: '2026-08-05T10:00:00Z', invduedate: '2026-10-01T10:00:00Z', invamount: -200, amtbalance: -200 }),
    invoice({ invno: 'INV-ADJ', invtype: 'ADJUSTMENT-LINEMCN', invdate: '2026-08-08T10:00:00Z', invduedate: '2026-08-08T10:00:00Z', invamount: 25, amtbalance: 0 }),
    invoice({
      invno: 'INV-B', invdate: '2026-08-20T10:00:00Z', invduedate: '2026-10-10T10:00:00Z', invcurrency: 'INR', invroe: 83, invamount: 8300, amtbalance: 8300,
      vslcode: 'V1', voycode: '001W', invcategory: 'LIN',
    }),
    invoice({ invno: 'INV-V', status: 'VOID', invdate: '2026-08-21T10:00:00Z', invduedate: '2026-08-21T10:00:00Z', invamount: 999, amtbalance: 999 }),
    invoice({ invno: 'INV-D', status: 'DRAFT', invdate: '2026-08-22T10:00:00Z', invduedate: '2026-08-22T10:00:00Z', invamount: 5, amtbalance: 5 }),
  ];
  t.invoiceCharges = [
    ciRow({ invno: 'INV-B', blnumber: 'BL-B', chargecode: 'OFR', chargename: 'OCEAN FREIGHT', itmqty: 2, baseunit: 'CN', itmcurrency: 'INR', itmrate: 2075, itmtotal: 4150, itmtotallocalinusd: 50, taxtot: 0, cntrno: 'ABCU1234567', conttype: '20DC', paymode: 'P' }),
    ciRow({ invno: 'INV-B', blnumber: 'BL-B', chargecode: 'ZZQ', chargename: '', itmqty: 2, baseunit: 'CN', itmcurrency: 'INR', itmrate: 2075, itmtotal: 4150, itmtotallocalinusd: 50, taxtot: 0, cntrno: null, conttype: null, paymode: 'C' }),
  ];
  t.invoiceBls = [ciRow({ InvoiceNumber: 'INV-A', BLNumber: 'BL-A', Shipmenttype: 'EXPORT' })];
  t.lrpBlCargo = [ciRow({ bl_no: 'BL-A', eqpId: 'XYZU7654321' })];
  t.receipts = [
    ciRow({ ReceiptNo: 'REC-1', ReceiptDate: '2026-08-12T09:00:00Z', CustCode: 'L1', ReceiptCurrency: 'USD', ReceiptAmt: 600, ExcessAmt: 0, receiptstatus: 'A', receipttype: 'Inv', rectamtinusd: 600 }),
    ciRow({ ReceiptNo: 'REC-2', ReceiptDate: '2026-08-14T09:00:00Z', CustCode: 'L1', ReceiptCurrency: 'USD', ReceiptAmt: 500, ExcessAmt: 0, receiptstatus: 'A', receipttype: 'Inv', rectamtinusd: 500 }),
    ciRow({ ReceiptNo: 'REC-3', ReceiptDate: '2026-08-15T09:00:00Z', CustCode: 'L1', ReceiptCurrency: 'USD', ReceiptAmt: 250, ExcessAmt: 0, receiptstatus: 'A', receipttype: 'CUS', rectamtinusd: 250 }),
    ciRow({ ReceiptNo: 'REC-4', ReceiptDate: '2026-08-16T09:00:00Z', CustCode: 'L1', ReceiptCurrency: 'USD', ReceiptAmt: 80, ExcessAmt: 0, receiptstatus: 'A', receipttype: 'Inv', rectamtinusd: 80 }),
    ciRow({ ReceiptNo: 'REC-V', ReceiptDate: '2026-08-17T09:00:00Z', CustCode: 'L1', ReceiptCurrency: 'USD', ReceiptAmt: 70, ExcessAmt: 0, receiptstatus: 'V', receipttype: 'Inv', rectamtinusd: 70 }),
    ciRow({ ReceiptNo: 'REC-X', ReceiptDate: '2026-08-18T09:00:00Z', CustCode: 'L1', ReceiptCurrency: 'INR', ReceiptAmt: 1660, ExcessAmt: 830, receiptstatus: 'A', receipttype: 'Inv', rectamtinusd: 20 }),
  ];
  t.receiptAllocations = [
    ciRow({ ReceiptNo: 'REC-1', InvNo: 'INV-A', ReceiptAmt: 600, rectamtinusd: 600, custcode: 'L1' }),
    ciRow({ ReceiptNo: 'REC-2', InvNo: 'INV-NOT-IN-EXTRACT', ReceiptAmt: 500, rectamtinusd: 500, custcode: 'L1' }),
    ciRow({ ReceiptNo: 'REC-X', InvNo: 'INV-NOT-IN-EXTRACT', ReceiptAmt: 830, rectamtinusd: 10, custcode: 'L1' }),
  ];
  t.payments = [
    ciRow({ requestId: 'aaaa1111-0000-4000-8000-000000000001', customerCode: 'L1', status: 'COMPLETED', currency: 'USD', amountUsd: 100, amountCents: '10000', createdAt: '2026-08-13T08:00:00Z' }),
    ciRow({ requestId: 'bbbb2222-0000-4000-8000-000000000002', customerCode: 'L1', status: 'COMPLETED', currency: 'USD', amountUsd: 600, amountCents: '60000', createdAt: '2026-08-12T12:00:00Z' }),
    ciRow({ requestId: 'cccc3333-0000-4000-8000-000000000003', customerCode: 'L1', status: 'SESSION_CREATED', currency: 'USD', amountUsd: 50, amountCents: '5000', createdAt: '2026-08-19T12:00:00Z' }),
  ];
  t.paymentReferences = [
    ciRow({ requestId: 'aaaa1111-0000-4000-8000-000000000001', refType: 'INV', refNo: 'INV-B', amountUsd: 100 }),
    ciRow({ requestId: 'aaaa1111-0000-4000-8000-000000000001', refType: 'BL', refNo: 'BL-B', amountUsd: 0 }),
    ciRow({ requestId: 'bbbb2222-0000-4000-8000-000000000002', refType: 'INV', refNo: 'INV-A', amountUsd: 600 }),
    ciRow({ requestId: 'cccc3333-0000-4000-8000-000000000003', refType: 'INV', refNo: 'INV-B', amountUsd: 50 }),
  ];
  t.customerMapping = [
    ciRow({ LoginCustCode: 'L1', APcustCode: 'AP1', Status: 'A' }),
    ciRow({ LoginCustCode: 'L1', APcustCode: 'AP2', Status: 'I' }),
    ciRow({ LoginCustCode: 'L1', APcustCode: 'AP1', Status: 'A' }),
    ciRow({ LoginCustCode: 'OTHER', APcustCode: 'AP9', Status: 'A' }),
  ];
  t.customerMaster = [
    ciRow({ CustCode: 'L1', CustName: 'Login Co', currency: '' }),
    ciRow({ CustCode: 'AP1', CustName: 'AP One', currency: 'aed' }),
  ];
  return t;
}

const CRITERIA = { accountId: 'L1-USD', currency: 'USD', fromDate: '2026-08-01', toDate: '2026-08-31' };
const ACCOUNT = { code: 'L1', name: 'Login Co · L1', currency: 'USD' };

describe('statement bridge — accounts', () => {
  it('resolves the login code plus its active, de-duplicated AP codes', () => {
    expect(accountCodes('L1', sampleTables().customerMapping)).toEqual(['L1', 'AP1']);
    expect(accountCodes('ZZZ', sampleTables().customerMapping)).toEqual(['ZZZ']);
  });

  it('lists one account per (code, currency) — USD first, idle codes in their master currency', () => {
    expect(statementAccounts('L1', sampleTables())).toEqual([
      { accountId: 'L1-USD', name: 'Login Co · L1', currency: 'USD' },
      { accountId: 'L1-INR', name: 'Login Co · L1', currency: 'INR' },
      { accountId: 'AP1-AED', name: 'AP One · AP1', currency: 'AED' },
    ]);
  });

  it('falls back to the invoice name, then the portal company, then the code', () => {
    const t = sampleTables();
    t.customerMaster = [];
    expect(statementAccounts('L1', t, 'Portal Co')[0].name).toBe('Login Co · L1');
    expect(statementAccounts('L1', t, 'Portal Co')[2].name).toBe('Portal Co · AP1');
    expect(statementAccounts('L1', t)[2].name).toBe('AP1 · AP1');
  });

  it('resolves an accountId back to its customer code', () => {
    const accounts = statementAccounts('L1', sampleTables());
    expect(resolveStatementAccount('L1-INR', accounts)).toEqual({ code: 'L1', name: 'Login Co · L1', currency: 'INR' });
    expect(resolveStatementAccount('AP1-AED', accounts)?.code).toBe('AP1');
    expect(resolveStatementAccount('MISSING', accounts)).toBeNull();
  });
});

describe('statement bridge — document rules', () => {
  it('classifies invoicemaster rows', () => {
    expect(classifyInvoice(ciRow({ invtype: 'EXPORTINVOICE', invamount: 10 }))).toBe('Invoice');
    expect(classifyInvoice(ciRow({ invtype: 'IMPORTINVOICE', invamount: -10 }))).toBe('CreditNote');
    expect(classifyInvoice(ciRow({ invtype: 'PriceReductionInvoice', invamount: -10 }))).toBe('CreditNote');
    expect(classifyInvoice(ciRow({ invtype: 'ADJUSTMENT-AGENCYMCN', invamount: -10 }))).toBe('Adjustment');
    expect(classifyInvoice(ciRow({ invtype: 'BOUNCE', invamount: 10 }))).toBe('DebitNote');
  });

  it('converts to USD from the charge lines, else invamount / invroe', () => {
    const t = sampleTables();
    const invB = t.invoices.find(r => r.invno === 'INV-B')!;
    expect(invoiceUsdAmount(invB, t.invoiceCharges)).toBe(100);
    expect(invoiceUsdAmount(invB, [])).toBeCloseTo(100, 6);
    expect(invoiceUsdAmount(ciRow({ invcurrency: 'USD', invroe: 1.015, invamount: 620 }), [])).toBe(620);
    expect(invoiceUsdAmount(ciRow({ invcurrency: 'AED', invroe: 0, invamount: 36.7 }), [])).toBe(36.7);
  });

  it('posts a receipt only for allocations to invoices in the ledger plus unapplied excess', () => {
    const t = sampleTables();
    const posted = new Set(['inv-a', 'inv-b']);
    const alloc = (no: string) => t.receiptAllocations.filter(a => a.ReceiptNo === no);
    const rec = (no: string) => t.receipts.find(r => r.ReceiptNo === no)!;
    expect(receiptPosting(rec('REC-1'), alloc('REC-1'), posted)).toMatchObject({ native: 600, usd: 600 });
    expect(receiptPosting(rec('REC-2'), alloc('REC-2'), posted)).toMatchObject({ native: 0, usd: 0 });
    expect(receiptPosting(rec('REC-3'), alloc('REC-3'), posted)).toMatchObject({ native: 250, usd: 250 });
    expect(receiptPosting(rec('REC-4'), alloc('REC-4'), posted)).toMatchObject({ native: 0, usd: 0 });
    expect(receiptPosting(rec('REC-X'), alloc('REC-X'), posted)).toMatchObject({ native: 830, usd: 10 });
  });

  it('skips online payments already booked as receipts and derives a short document number', () => {
    const t = sampleTables();
    expect(hasMatchingReceipt(t.payments[1], t.receipts)).toBe(true);
    expect(hasMatchingReceipt(t.payments[0], t.receipts)).toBe(false);
    expect(onlinePaymentDocNo('aaaa1111-0000-4000-8000-000000000001')).toBe('OLP-AAAA1111');
  });

  it('posts confirmed invoices, settled receipts and un-receipted payments in ledger order', () => {
    const docs = postedDocuments('L1', sampleTables());
    expect(docs.map(d => `${d.date} ${d.docType} ${d.docNo}`)).toEqual([
      '2026-05-20 Invoice INV-OLD',
      '2026-08-02 Invoice INV-A',
      '2026-08-05 CreditNote INV-CN',
      '2026-08-08 Adjustment INV-ADJ',
      '2026-08-12 Receipt REC-1',
      '2026-08-13 Receipt OLP-AAAA1111',
      '2026-08-15 Receipt REC-3',
      '2026-08-18 Receipt REC-X',
      '2026-08-20 Invoice INV-B',
    ]);
    const invB = docs.find(d => d.docNo === 'INV-B')!;
    expect(invB).toMatchObject({ currency: 'INR', cents: 830000, usdCents: 10000, outstandingCents: 830000, outstandingUsdCents: 10000, dueDate: '2026-10-10' });
    expect(invB.reference).toBe('LIN · B/L BL-B · V1/001W · INNSA→AEJEA');
    expect(docs.find(d => d.docNo === 'INV-A')?.reference).toBe('DFT · B/L BL-A · INNSA→AEJEA');
    expect(docs.find(d => d.docNo === 'REC-1')?.reference).toBe('Settles INV-A');
    expect(docs.find(d => d.docNo === 'REC-3')?.reference).toBe('On-account receipt');
    expect(docs.find(d => d.docNo === 'REC-X')?.reference).toBe('Unapplied receipt balance');
    expect(docs.find(d => d.docNo === 'OLP-AAAA1111')?.reference).toBe('Online payment · settles INV-B · BL BL-B');
  });
});

describe('statement bridge — statement, ageing, exports', () => {
  it('builds the USD (reporting currency) statement with opening, running balance and period totals', () => {
    const s = buildStatement(ACCOUNT, CRITERIA, sampleTables());
    expect(s.openingBalance).toBe('300.00');
    expect(s.lines.map(l => [l.docNo, l.debit, l.credit, l.runningBalance])).toEqual([
      ['INV-A', '1000.00', '0.00', '1300.00'],
      ['INV-CN', '0.00', '200.00', '1100.00'],
      ['INV-ADJ', '25.00', '0.00', '1125.00'],
      ['REC-1', '0.00', '600.00', '525.00'],
      ['OLP-AAAA1111', '0.00', '100.00', '425.00'],
      ['REC-3', '0.00', '250.00', '175.00'],
      ['REC-X', '0.00', '10.00', '165.00'],
      ['INV-B', '100.00', '0.00', '265.00'],
    ]);
    expect(s.closingBalance).toBe('265.00');
    expect(s.totals).toEqual({ totalDebit: '1125.00', totalCredit: '1160.00', net: '-35.00' });
    expect(s.lines.every(l => l.currency === 'USD')).toBe(true);
    expect(s.accountName).toBe('Login Co · L1');
  });

  it('lists only native documents for a non-USD statement currency', () => {
    const s = buildStatement(ACCOUNT, { ...CRITERIA, accountId: 'L1-INR', currency: 'INR' }, sampleTables());
    expect(s.openingBalance).toBe('0.00');
    expect(s.lines.map(l => [l.docNo, l.debit, l.credit, l.runningBalance])).toEqual([
      ['REC-X', '0.00', '830.00', '-830.00'],
      ['INV-B', '8300.00', '0.00', '7470.00'],
    ]);
    expect(s.closingBalance).toBe('7470.00');
  });

  it('keeps opening = closing when the period has no activity', () => {
    const s = buildStatement(ACCOUNT, { ...CRITERIA, fromDate: '2026-06-01', toDate: '2026-06-30' }, sampleTables());
    expect(s.lines).toEqual([]);
    expect(s.openingBalance).toBe('300.00');
    expect(s.closingBalance).toBe('300.00');
  });

  it('buckets outstanding balances by days past due', () => {
    expect(ageingBucket('2026-09-16', NOW)).toBe('0-30');
    expect(ageingBucket('2026-09-15', NOW)).toBe('31-60');
    expect(ageingBucket('2026-08-17', NOW)).toBe('31-60');
    expect(ageingBucket('2026-08-16', NOW)).toBe('61-90');
    expect(ageingBucket('2026-07-18', NOW)).toBe('61-90');
    expect(ageingBucket('2026-07-17', NOW)).toBe('90+');
    expect(ageingBucket('2026-12-01', NOW)).toBe('0-30');
    const ageing = buildAgeing('L1', 'USD', sampleTables(), NOW);
    expect(ageing).toEqual({
      asOf: '2026-10-16',
      currency: 'USD',
      total: '600.00',
      buckets: [
        { bucket: '0-30', count: 2, amount: '-100.00' },
        { bucket: '31-60', count: 1, amount: '400.00' },
        { bucket: '61-90', count: 0, amount: '0.00' },
        { bucket: '90+', count: 1, amount: '300.00' },
      ],
    });
    expect(buildAgeing('L1', 'INR', sampleTables(), NOW).total).toBe('8300.00');
  });

  it('assembles the invoice document with charges, B/Ls, containers and names', () => {
    const t = sampleTables();
    const invB = invoiceDocument('INV-B', t)!;
    expect(invB).toMatchObject({
      invoiceNo: 'INV-B', docType: 'Invoice', currency: 'INR', amount: '8300.00', amountUsd: '100.00', roe: 83, balance: '8300.00',
      vesselCode: 'V1', voyage: '001W', blNumbers: ['BL-B'], containers: ['ABCU1234567'],
    });
    expect(invB.pol.startsWith('INNSA')).toBe(true);
    expect(invB.charges.map(c => [c.chargeCode, c.chargeName, c.total, c.totalUsd, c.payMode, c.containerNo])).toEqual([
      ['OFR', 'OCEAN FREIGHT', '4150.00', '50.00', 'P', 'ABCU1234567'],
      ['ZZQ', 'ZZQ', '4150.00', '50.00', 'C', ''],
    ]);
    // containers fall back to the B/L's cargo rows when the charge lines carry none
    expect(invoiceDocument('INV-A', t)).toMatchObject({ blNumbers: ['BL-A'], containers: ['XYZU7654321'], charges: [] });
    expect(invoiceDocument('NOPE', t)).toBeNull();
  });

  it('writes the export and document payloads in the existing formats', () => {
    const t = sampleTables();
    const s = buildStatement(ACCOUNT, CRITERIA, t);
    const ageing = buildAgeing('L1', 'USD', t, NOW);
    const xlsx = buildStatementExport(s, ageing).split('\n');
    expect(xlsx[0]).toBe('Customer Statement\tLogin Co · L1');
    expect(xlsx).toContain('Date\tType\tDocument No\tReference\tDebit\tCredit\tBalance');
    expect(xlsx).toContain('2026-08-02\tInvoice\tINV-A\tDFT · B/L BL-A · INNSA→AEJEA\t1000.00\t0.00\t1300.00');
    expect(xlsx).toContain('Period totals\t\t\t\t1125.00\t1160.00\t-35.00');
    expect(xlsx).toContain('Outstanding\t-100.00\t400.00\t0.00\t300.00\t600.00');
    const pdf = buildStatementDocument(s, ageing, [invoiceDocument('INV-B', t)!]);
    expect(pdf.startsWith('%PDF-1.4 Mock Customer Statement for Login Co · L1')).toBe(true);
    expect(pdf).toContain('Invoice INV-B (EXPORTINVOICE LIN) 2026-08-20 due 2026-10-10 · INR 8300.00 (USD 100.00, ROE 83)');
    expect(pdf).toContain('OFR OCEAN FREIGHT · 2 CN × INR 2075.00 = 4150.00 (USD 50.00) · P · ABCU1234567');
  });

  it('formats cents as decimal strings', () => {
    expect(centsToDecimalString(1234567)).toBe('12345.67');
    expect(centsToDecimalString(-50)).toBe('-0.50');
    expect(centsToDecimalString(0)).toBe('0.00');
  });
});
