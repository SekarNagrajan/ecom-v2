// Modified by Sekar Nagarajan (2026-10-18 21:00)
import { describe, expect, it } from 'vitest';

import {
  fixtureStatement,
  fixtureStatementAccounts,
} from '../../mocks/fixture-api/bridges/statement.bridge';
import {
  buildStatementExportFilename,
  formatStatementAmount,
  statementCriteriaSchema,
  statementPeriodMonths,
  type StatementCriteria,
} from './types/customer-statement.types';

/** Friday 16 Oct 2026, noon UTC — the clock the ageing assertions assume (fixture dates are shifted to 2026). */
const NOW = new Date(Date.UTC(2026, 9, 16, 12));

/** Demo customer 20001374 (Wisozk, Turcotte and Anderson), reporting-currency statement for August 2026. */
const USD_AUGUST_CRITERIA: StatementCriteria = {
  accountId: '20001374-USD',
  currency: 'USD',
  fromDate: '2026-08-01',
  toDate: '2026-08-31',
};

/** SGSIN→AEJEA import invoices (ATLANTIC SOLLI/130526) issued 1 Sep and reversed 13 Oct. */
const USD_SEP_OCT_CRITERIA: StatementCriteria = {
  accountId: '20001374-USD',
  currency: 'USD',
  fromDate: '2026-09-01',
  toDate: '2026-10-16',
};

describe('customer-statement criteria schema', () => {
  it('accepts a valid criteria payload', () => {
    const result = statementCriteriaSchema.safeParse(USD_AUGUST_CRITERIA);
    expect(result.success).toBe(true);
  });

  it('rejects when end date is before start date', () => {
    const result = statementCriteriaSchema.safeParse({
      ...USD_AUGUST_CRITERIA,
      fromDate: '2026-08-25',
      toDate: '2026-07-26',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('on or after');
    }
  });

  it('rejects periods longer than 12 months', () => {
    const result = statementCriteriaSchema.safeParse({
      ...USD_AUGUST_CRITERIA,
      fromDate: '2025-01-01',
      toDate: '2026-08-25',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('12 months');
    }
  });

  it('computes period months for the 12-month guard', () => {
    expect(statementPeriodMonths('2026-01-01', '2026-01-31')).toBeLessThan(2);
    expect(statementPeriodMonths('2025-01-01', '2026-08-25')).toBeGreaterThan(12);
  });
});

describe('customer-statement format helpers', () => {
  it('formats amounts as 12,540.00 USD', () => {
    expect(formatStatementAmount('12540.00', 'USD')).toBe('12,540.00 USD');
  });

  it('builds export filenames for pdf and xlsx', () => {
    expect(buildStatementExportFilename(USD_AUGUST_CRITERIA, 'pdf')).toBe(
      'Statement_20001374-USD_2026-08-01_2026-08-31.pdf'
    );
    expect(buildStatementExportFilename(USD_AUGUST_CRITERIA, 'xlsx')).toBe(
      'Statement_20001374-USD_2026-08-01_2026-08-31.xlsx'
    );
  });
});

describe('customer-statement fixture ledger (invoicemaster / receiptmaster)', () => {
  it('lists the login customer and its mapped AP customers as accounts', () => {
    const accounts = fixtureStatementAccounts();
    expect(accounts[0]).toEqual({
      accountId: '20001374-USD',
      name: 'Wisozk, Turcotte and Anderson · 20001374',
      currency: 'USD',
    });
    // one account per currency the login customer has posted documents in, USD first
    expect(accounts.filter((a) => a.accountId.startsWith('20001374-')).map((a) => a.currency)).toEqual([
      'USD',
      'INR',
      'AED',
      'EUR',
    ]);
    // ecom_customermapping: 20001374 → 20120004232, INSVM497, 20140004483, SM17004
    const codes = accounts.map((a) => a.accountId.replace(/-[A-Z]{3}$/, ''));
    for (const ap of ['20120004232', 'INSVM497', '20140004483', 'SM17004']) {
      expect(codes).toContain(ap);
    }
    expect(accounts.find((a) => a.accountId.startsWith('20120004232-'))?.name).toBe(
      'Franey, Glover and Hagenes · 20120004232'
    );
  });

  /** Σ debit − Σ credit of the lines, in cents. */
  const cents = (v: string) => Math.round(Number(v) * 100);

  it('returns a USD statement whose lines reconcile from opening to closing balance', () => {
    const result = fixtureStatement(USD_AUGUST_CRITERIA, NOW);
    expect(result).not.toBeNull();
    const statement = result!.statement;
    expect(statement.accountName).toBe('Wisozk, Turcotte and Anderson · 20001374');
    expect(statement.lines.length).toBeGreaterThan(0);
    expect(statement.lines.every((l) => l.currency === 'USD')).toBe(true);
    // chronological, and every line is either a debit or a credit
    const dates = statement.lines.map((l) => l.date);
    expect([...dates].sort()).toEqual(dates);
    expect(statement.lines.every((l) => (cents(l.debit) > 0) !== (cents(l.credit) > 0) || (cents(l.debit) === 0 && cents(l.credit) === 0))).toBe(true);
    // running balance = opening + Σ(debit − credit) line by line; closing = last running balance
    let running = cents(statement.openingBalance);
    for (const line of statement.lines) {
      running += cents(line.debit) - cents(line.credit);
      expect(cents(line.runningBalance)).toBe(running);
    }
    expect(cents(statement.closingBalance)).toBe(running);
    // totals are the period sums
    const debit = statement.lines.reduce((n, l) => n + cents(l.debit), 0);
    const credit = statement.lines.reduce((n, l) => n + cents(l.credit), 0);
    expect(cents(statement.totals.totalDebit)).toBe(debit);
    expect(cents(statement.totals.totalCredit)).toBe(credit);
    expect(cents(statement.totals.net)).toBe(debit - credit);
    // document kinds and references carry the shipment context
    const kinds = new Set(statement.lines.map((l) => l.docType));
    expect([...kinds].every((k) => ['Invoice', 'CreditNote', 'DebitNote', 'Adjustment', 'Receipt', 'Payment'].includes(k))).toBe(true);
    expect(statement.lines.filter((l) => l.docType === 'Invoice').every((l) => /B\/L|·/.test(l.reference ?? ''))).toBe(true);
  });

  it('converts non-USD invoices at their rate of exchange and posts credit notes as credits', () => {
    const { statement, documents } = fixtureStatement(USD_SEP_OCT_CRITERIA, NOW)!;
    expect(statement.currency).toBe('USD');
    for (const doc of documents.filter((d) => d.currency !== 'USD' && d.roe > 0)) {
      // USD amount = native amount / ROE (two-decimal rounding tolerance)
      expect(Math.abs(Number(doc.amountUsd) - Number(doc.amount) / doc.roe)).toBeLessThan(0.02 * Math.max(1, Number(doc.amountUsd)));
    }
    const creditNotes = statement.lines.filter((l) => l.docType === 'CreditNote');
    expect(creditNotes.every((l) => cents(l.credit) > 0 && cents(l.debit) === 0)).toBe(true);
    expect(cents(statement.closingBalance)).toBe(cents(statement.openingBalance) + cents(statement.totals.net));
  });

  it('lists only documents issued in that currency on a native-currency statement', () => {
    const statement = fixtureStatement(
      { accountId: '20001374-INR', currency: 'INR', fromDate: '2026-07-01', toDate: '2026-08-31' },
      NOW
    )!.statement;
    expect(statement.currency).toBe('INR');
    expect(statement.lines.every((l) => l.currency === 'INR')).toBe(true);
    const settles = statement.lines.filter((l) => l.docType === 'Receipt');
    expect(settles.every((l) => /Settles|On-account|Unapplied/.test(l.reference ?? ''))).toBe(true);
    expect(cents(statement.closingBalance)).toBe(cents(statement.openingBalance) + cents(statement.totals.net));
  });

  it('returns empty lines with opening=closing when period has no activity', () => {
    const statement = fixtureStatement(
      { ...USD_AUGUST_CRITERIA, fromDate: '2026-06-01', toDate: '2026-06-30' },
      NOW
    )!.statement;
    expect(statement.lines).toEqual([]);
    expect(statement.openingBalance).toBe(statement.closingBalance);
    expect(statement.openingBalance).toBe('-2722.94');
  });

  it('ages the outstanding invoice balances from invduedate', () => {
    const { ageing } = fixtureStatement(USD_AUGUST_CRITERIA, NOW)!;
    expect(ageing.asOf).toBe('2026-10-16');
    expect(ageing.buckets.map((b) => b.bucket)).toEqual(['0-30', '31-60', '61-90', '90+']);
    const total = ageing.buckets.reduce((n, b) => n + cents(b.amount), 0);
    expect(cents(ageing.total)).toBe(total);
    expect(ageing.buckets.reduce((n, b) => n + b.count, 0)).toBeGreaterThan(0); // the demo customer has open items
  });

  it('attaches the invoice documents (charges, B/Ls, named vessel and ports) of the period', () => {
    const { statement, documents } = fixtureStatement(USD_AUGUST_CRITERIA, NOW)!;
    const invoiceLines = statement.lines.filter((l) => l.docType !== 'Receipt' && l.docType !== 'Payment');
    expect(documents.length).toBe(invoiceLines.length);
    for (const doc of documents) {
      expect(invoiceLines.some((l) => l.docNo === doc.invoiceNo)).toBe(true);
      expect(doc.customerName).toBe('Wisozk, Turcotte and Anderson');
      expect(doc.currency).toMatch(/^[A-Z]{3}$/);
      expect(Array.isArray(doc.charges)).toBe(true);
      expect(Array.isArray(doc.blNumbers)).toBe(true);
    }
    const withCharges = documents.filter((d) => d.charges.length > 0);
    expect(withCharges.length).toBeGreaterThan(0);
    expect(withCharges.every((d) => d.charges.every((c) => c.chargeCode))).toBe(true);
    const named = documents.find((d) => d.pol && d.pod);
    expect(named?.pol).toMatch(/[A-Z]{5}/);
  });

  it('returns null for an account that is not the user\'s', () => {
    expect(fixtureStatement({ ...USD_AUGUST_CRITERIA, accountId: 'MISSING' }, NOW)).toBeNull();
    expect(fixtureStatement({ ...USD_AUGUST_CRITERIA, accountId: 'AEESAD992-USD' }, NOW)).toBeNull();
  });
});
