// Modified by Sekar Nagarajan (2026-10-17 00:45)
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

  it('returns the August 2026 USD statement with invoices converted at their ROE', () => {
    const result = fixtureStatement(USD_AUGUST_CRITERIA, NOW);
    expect(result).not.toBeNull();
    const statement = result!.statement;
    expect(statement.accountName).toBe('Wisozk, Turcotte and Anderson · 20001374');
    // opening = the AED 10,000 price-reduction credit note of 28 May (-2,722.94 USD)
    expect(statement.openingBalance).toBe('-2722.94');
    expect(statement.lines.map((l) => [l.docType, l.docNo, l.debit, l.credit])).toEqual([
      ['Receipt', 'AEESADREC26000083', '0.00', '77.94'],
      ['Invoice', 'MUMBAIMUMINV1652', '22.99', '0.00'],
      ['Invoice', 'MUMBAIMUMINV1653', '120.00', '0.00'],
      ['Receipt', 'INDMUMREC26000039', '0.00', '70.74'],
      ['Receipt', 'INDMUMREC26000049', '0.00', '316.93'],
      ['Receipt', 'OLP-E53B51A5', '0.00', '142.99'],
      ['Invoice', 'MUMBAIMUMINV1654', '9.01', '0.00'],
      ['Invoice', 'MUMBAIMUMINV1655', '316.93', '0.00'],
      ['Invoice', 'MUMBAIMUMINV1656', '1100.00', '0.00'],
      ['Invoice', 'MUMBAIMUMINV1657', '123.00', '0.00'],
    ]);
    // INR 147,372.23 @ 465 and EUR 1,000 @ 111 land as 316.93 / 9.01 USD (= Σ itmtotallocalinusd)
    expect(statement.lines.find((l) => l.docNo === 'MUMBAIMUMINV1655')?.reference).toBe(
      'DFT · B/L EPIRINDMUM69183 · VJP/11A · INNSA→SGSIN'
    );
    expect(statement.lines.find((l) => l.docNo === 'OLP-E53B51A5')?.reference).toBe(
      'Online payment · settles MUMBAIMUMINV1653, MUMBAIMUMINV1652'
    );
    expect(statement.lines.at(-1)?.runningBalance).toBe('-1639.61');
    expect(statement.closingBalance).toBe('-1639.61');
    expect(statement.totals).toEqual({ totalDebit: '1691.93', totalCredit: '608.60', net: '1083.33' });
    expect(statement.lines.every((l) => l.currency === 'USD')).toBe(true);
  });

  it('shows the SGSIN→AEJEA invoices and their October reversals as credit notes', () => {
    const statement = fixtureStatement(USD_SEP_OCT_CRITERIA, NOW)!.statement;
    expect(statement.openingBalance).toBe('-1639.61');
    expect(statement.lines.map((l) => `${l.date} ${l.docType} ${l.docNo}`)).toEqual([
      '2026-09-01 Invoice XDEMOSADISSINV6153',
      '2026-09-01 Invoice XDEMOSADISSINV6154',
      '2026-09-01 Invoice XDEMOSADISSINV6155',
      '2026-10-13 CreditNote XDEMOSADISSINV6313',
      '2026-10-13 CreditNote XDEMOSADISSINV6314',
      '2026-10-13 CreditNote XDEMOSADISSINV6315',
    ]);
    expect(statement.lines[0]?.reference).toBe('DFT · B/L SG000286700 · ATLANTIC SOLLI/130526 · SGSIN→AEJEA');
    expect(statement.lines[0]?.debit).toBe('1565.00'); // AED 15,650 @ 10
    expect(statement.lines[3]?.credit).toBe('1565.00');
    expect(statement.totals).toEqual({ totalDebit: '3775.00', totalCredit: '3775.00', net: '0.00' });
    expect(statement.closingBalance).toBe('-1639.61');
  });

  it('lists only native documents on the INR statement', () => {
    const statement = fixtureStatement(
      { accountId: '20001374-INR', currency: 'INR', fromDate: '2026-07-01', toDate: '2026-08-31' },
      NOW
    )!.statement;
    expect(statement.currency).toBe('INR');
    expect(statement.lines.map((l) => [l.docNo, l.debit, l.credit])).toEqual([
      ['MUMBAIMUMINV1633', '30465.05', '0.00'],
      ['INDMUMREC26000032', '0.00', '30465.04'],
      ['MUMBAIMUMINV1652', '2183.63', '0.00'],
      ['INDMUMREC26000039', '0.00', '6720.24'],
      ['INDMUMREC26000049', '0.00', '147372.23'],
      ['MUMBAIMUMINV1655', '147372.23', '0.00'],
    ]);
    expect(statement.lines[1]?.reference).toBe('Settles MUMBAIMUMINV1633');
    expect(statement.closingBalance).toBe('-4536.60');
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
    expect(ageing.buckets).toEqual([
      { bucket: '0-30', count: 0, amount: '0.00' },
      { bucket: '31-60', count: 0, amount: '0.00' },
      // MUMBAIMUMINV1652/1653/1654/1656/1657 due 11–13 Aug 2026
      { bucket: '61-90', count: 5, amount: '1375.00' },
      // DEMOSADISSINV5890 price reduction (credit) still open
      { bucket: '90+', count: 1, amount: '-2722.94' },
    ]);
    expect(ageing.total).toBe('-1347.94');
  });

  it('attaches the invoice documents (charges, B/Ls, named vessel and ports) of the period', () => {
    const { documents } = fixtureStatement(USD_AUGUST_CRITERIA, NOW)!;
    expect(documents.map((d) => d.invoiceNo)).toEqual([
      'MUMBAIMUMINV1652',
      'MUMBAIMUMINV1653',
      'MUMBAIMUMINV1654',
      'MUMBAIMUMINV1655',
      'MUMBAIMUMINV1656',
      'MUMBAIMUMINV1657',
    ]);
    const inv1655 = documents.find((d) => d.invoiceNo === 'MUMBAIMUMINV1655')!;
    expect(inv1655).toMatchObject({
      currency: 'INR',
      amount: '147372.23',
      amountUsd: '316.93',
      roe: 465,
      vesselName: 'VJP',
      voyage: '11A',
      blNumbers: ['EPIRINDMUM69183'],
      customerName: 'Wisozk, Turcotte and Anderson',
    });
    expect(inv1655.pol).toContain('NHAVA SHEVA');
    expect(inv1655.pod).toContain('SINGAPORE');
    expect(inv1655.charges.length).toBe(6);
    expect(inv1655.charges.map((c) => c.chargeCode)).toContain('BLF');
  });

  it('returns null for an account that is not the user\'s', () => {
    expect(fixtureStatement({ ...USD_AUGUST_CRITERIA, accountId: 'MISSING' }, NOW)).toBeNull();
    expect(fixtureStatement({ ...USD_AUGUST_CRITERIA, accountId: 'AEESAD992-USD' }, NOW)).toBeNull();
  });
});
