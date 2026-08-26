// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { describe, expect, it } from 'vitest';

import {
  getMockStatement,
  MOCK_USD_STATEMENT_FIXTURE_CRITERIA,
  mockStatementAccounts,
} from '../../mocks/customer-statement.mock-data';
import {
  buildStatementExportFilename,
  formatStatementAmount,
  statementCriteriaSchema,
  statementPeriodMonths,
} from './types/customer-statement.types';

describe('customer-statement criteria schema', () => {
  it('accepts a valid criteria payload', () => {
    const result = statementCriteriaSchema.safeParse({
      accountId: 'ACC-USD-001',
      currency: 'USD',
      fromDate: '2026-07-26',
      toDate: '2026-08-25',
    });
    expect(result.success).toBe(true);
  });

  it('rejects when end date is before start date', () => {
    const result = statementCriteriaSchema.safeParse({
      accountId: 'ACC-USD-001',
      currency: 'USD',
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
      accountId: 'ACC-USD-001',
      currency: 'USD',
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
    const criteria = MOCK_USD_STATEMENT_FIXTURE_CRITERIA;
    expect(buildStatementExportFilename(criteria, 'pdf')).toBe(
      'Statement_ACC-USD-001_2026-07-26_2026-08-25.pdf'
    );
    expect(buildStatementExportFilename(criteria, 'xlsx')).toBe(
      'Statement_ACC-USD-001_2026-07-26_2026-08-25.xlsx'
    );
  });
});

describe('customer-statement mock ledger', () => {
  it('seeds at least two accounts', () => {
    expect(mockStatementAccounts.length).toBeGreaterThanOrEqual(2);
  });

  it('returns known-good USD statement totals for the fixture window', () => {
    const statement = getMockStatement(MOCK_USD_STATEMENT_FIXTURE_CRITERIA);
    expect(statement).not.toBeNull();
    expect(statement?.openingBalance).toBe('5000.00');
    expect(statement?.closingBalance).toBe('12860.50');
    expect(statement?.totals.totalDebit).toBe('17360.50');
    expect(statement?.totals.totalCredit).toBe('9500.00');
    expect(statement?.totals.net).toBe('7860.50');
    expect(statement?.lines.length).toBe(6);
    expect(statement?.lines.map((l) => l.docType)).toEqual([
      'Invoice',
      'CreditNote',
      'DebitNote',
      'Receipt',
      'Adjustment',
      'Invoice',
    ]);
  });

  it('returns empty lines with opening=closing when period has no activity', () => {
    const statement = getMockStatement({
      accountId: 'ACC-USD-001',
      currency: 'USD',
      fromDate: '2026-09-01',
      toDate: '2026-09-10',
    });
    expect(statement?.lines).toEqual([]);
    expect(statement?.openingBalance).toBe(statement?.closingBalance);
    expect(statement?.openingBalance).toBe('12860.50');
  });

  it('returns null for unknown account', () => {
    expect(
      getMockStatement({
        accountId: 'MISSING',
        currency: 'USD',
        fromDate: '2026-07-26',
        toDate: '2026-08-25',
      })
    ).toBeNull();
  });
});
