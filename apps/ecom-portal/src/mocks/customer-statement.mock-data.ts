// Modified by Sekar Nagarajan (2026-08-25 12:45)
import type {
  AccountOption,
  StatementCriteria,
  StatementDTO,
  StatementDocType,
  StatementLine,
} from '../features/customer-statement/types/customer-statement.types';

export const mockStatementAccounts: AccountOption[] = [
  {
    accountId: 'ACC-USD-001',
    name: 'Trade Receivable — USD',
    currency: 'USD',
  },
  {
    accountId: 'ACC-EUR-001',
    name: 'Trade Receivable — EUR',
    currency: 'EUR',
  },
];

interface LedgerSeedLine {
  date: string;
  docType: StatementDocType;
  docNo: string;
  reference?: string;
  /** Positive = debit, negative = credit; stored as minor units (cents) for mock-only math. */
  amountCents: number;
  currency: string;
  accountId: string;
}

/**
 * Fixed ledger fixture. Opening for ACC-USD-001 before 2026-07-26 is 5,000.00.
 * Lines below fall inside a typical today−30 window around 2026-08-25.
 */
const ledgerSeed: LedgerSeedLine[] = [
  // Pre-period activity (carry-forward into opening)
  {
    accountId: 'ACC-USD-001',
    date: '2026-07-01',
    docType: 'Invoice',
    docNo: 'INV-9001',
    reference: 'Prior period',
    amountCents: 500000,
    currency: 'USD',
  },
  // In-period USD
  {
    accountId: 'ACC-USD-001',
    date: '2026-08-02',
    docType: 'Invoice',
    docNo: 'INV-9101',
    reference: 'Ocean freight',
    amountCents: 1254000,
    currency: 'USD',
  },
  {
    accountId: 'ACC-USD-001',
    date: '2026-08-05',
    docType: 'CreditNote',
    docNo: 'CN-3101',
    reference: 'Rate adjustment',
    amountCents: -150000,
    currency: 'USD',
  },
  {
    accountId: 'ACC-USD-001',
    date: '2026-08-08',
    docType: 'DebitNote',
    docNo: 'DN-2101',
    reference: 'Detention',
    amountCents: 32000,
    currency: 'USD',
  },
  {
    accountId: 'ACC-USD-001',
    date: '2026-08-12',
    docType: 'Receipt',
    docNo: 'RCP-1101',
    reference: 'Wire transfer',
    amountCents: -800000,
    currency: 'USD',
  },
  {
    accountId: 'ACC-USD-001',
    date: '2026-08-18',
    docType: 'Adjustment',
    docNo: 'ADJ-0101',
    reference: 'Rounding',
    amountCents: 50,
    currency: 'USD',
  },
  {
    accountId: 'ACC-USD-001',
    date: '2026-08-20',
    docType: 'Invoice',
    docNo: 'INV-9102',
    reference: 'THC charges',
    amountCents: 450000,
    currency: 'USD',
  },
  // EUR account
  {
    accountId: 'ACC-EUR-001',
    date: '2026-07-15',
    docType: 'Invoice',
    docNo: 'INV-E701',
    reference: 'Prior EUR',
    amountCents: 220000,
    currency: 'EUR',
  },
  {
    accountId: 'ACC-EUR-001',
    date: '2026-08-10',
    docType: 'Invoice',
    docNo: 'INV-E801',
    reference: 'Local charges',
    amountCents: 345000,
    currency: 'EUR',
  },
  {
    accountId: 'ACC-EUR-001',
    date: '2026-08-16',
    docType: 'Receipt',
    docNo: 'RCP-E801',
    reference: 'SEPA payment',
    amountCents: -100000,
    currency: 'EUR',
  },
];

function centsToDecimalString(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, '0');
  return `${sign}${whole}.${frac}`;
}

function accountName(accountId: string): string {
  return mockStatementAccounts.find((a) => a.accountId === accountId)?.name ?? accountId;
}

/**
 * Builds a statement with precomputed opening, running balances, closing, and totals.
 * Mock-only arithmetic (integer cents) — React must never re-sum these figures.
 */
export function getMockStatement(criteria: StatementCriteria): StatementDTO | null {
  const account = mockStatementAccounts.find((a) => a.accountId === criteria.accountId);
  if (!account) return null;
  if (account.currency !== criteria.currency) {
    // Still allow if currency matches any line set; reject hard mismatch on account default
    // when no lines would match — return empty statement with zero balances
  }

  const accountLines = ledgerSeed.filter(
    (l) => l.accountId === criteria.accountId && l.currency === criteria.currency
  );

  let openingCents = 0;
  for (const line of accountLines) {
    if (line.date.slice(0, 10) < criteria.fromDate) {
      openingCents += line.amountCents;
    }
  }

  const periodLines = accountLines
    .filter((l) => {
      const day = l.date.slice(0, 10);
      return day >= criteria.fromDate && day <= criteria.toDate;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.docNo.localeCompare(b.docNo));

  let running = openingCents;
  let totalDebitCents = 0;
  let totalCreditCents = 0;

  const lines: StatementLine[] = periodLines.map((seed) => {
    running += seed.amountCents;
    const debitCents = seed.amountCents > 0 ? seed.amountCents : 0;
    const creditCents = seed.amountCents < 0 ? -seed.amountCents : 0;
    totalDebitCents += debitCents;
    totalCreditCents += creditCents;
    return {
      date: seed.date,
      docType: seed.docType,
      docNo: seed.docNo,
      reference: seed.reference,
      debit: centsToDecimalString(debitCents),
      credit: centsToDecimalString(creditCents),
      runningBalance: centsToDecimalString(running),
      currency: seed.currency,
    };
  });

  const netCents = totalDebitCents - totalCreditCents;

  return {
    accountId: criteria.accountId,
    accountName: accountName(criteria.accountId),
    currency: criteria.currency,
    period: { from: criteria.fromDate, to: criteria.toDate },
    openingBalance: centsToDecimalString(openingCents),
    lines,
    closingBalance: centsToDecimalString(running),
    totals: {
      totalDebit: centsToDecimalString(totalDebitCents),
      totalCredit: centsToDecimalString(totalCreditCents),
      net: centsToDecimalString(netCents),
    },
  };
}

/** Known-good totals for ACC-USD-001 from 2026-07-26 to 2026-08-25 (for Vitest). */
export const MOCK_USD_STATEMENT_FIXTURE_CRITERIA: StatementCriteria = {
  accountId: 'ACC-USD-001',
  currency: 'USD',
  fromDate: '2026-07-26',
  toDate: '2026-08-25',
};
