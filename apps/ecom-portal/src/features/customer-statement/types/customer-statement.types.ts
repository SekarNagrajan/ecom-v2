// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { z } from 'zod';

export type StatementDocType =
  | 'Invoice'
  | 'CreditNote'
  | 'DebitNote'
  | 'Receipt'
  | 'Adjustment';

export interface AccountOption {
  accountId: string;
  name: string;
  currency: string;
}

export interface StatementLine {
  date: string;
  docType: StatementDocType;
  docNo: string;
  reference?: string;
  debit: string;
  credit: string;
  runningBalance: string;
  currency: string;
}

export interface StatementTotals {
  totalDebit: string;
  totalCredit: string;
  net: string;
}

export interface StatementDTO {
  accountId: string;
  accountName: string;
  currency: string;
  period: { from: string; to: string };
  openingBalance: string;
  lines: StatementLine[];
  closingBalance: string;
  totals: StatementTotals;
}

export interface StatementCriteria {
  accountId: string;
  currency: string;
  fromDate: string;
  toDate: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export const STATEMENT_DOCTYPE_LABELS: Record<StatementDocType, string> = {
  Invoice: 'Invoice',
  CreditNote: 'Credit Note',
  DebitNote: 'Debit Note',
  Receipt: 'Receipt',
  Adjustment: 'Adjustment',
};

export type StatementExportFormat = 'pdf' | 'xlsx';

/** Approximate inclusive month span used for the 12-month cap. */
export function statementPeriodMonths(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((to.getTime() - from.getTime()) / dayMs) + 1;
  return days / 30.4375;
}

export const statementCriteriaSchema = z
  .object({
    accountId: z.string().min(1, 'Account is required.'),
    currency: z.string().min(1, 'Currency is required.'),
    fromDate: z.string().min(1, 'From date is required.'),
    toDate: z.string().min(1, 'To date is required.'),
  })
  .superRefine((v, ctx) => {
    if (v.fromDate && v.toDate && v.fromDate > v.toDate) {
      ctx.addIssue({
        path: ['toDate'],
        code: 'custom',
        message: 'End date must be on or after start date.',
      });
    }
    if (v.fromDate && v.toDate && statementPeriodMonths(v.fromDate, v.toDate) > 12) {
      ctx.addIssue({
        path: ['toDate'],
        code: 'custom',
        message: 'Statement period cannot exceed 12 months.',
      });
    }
  });

export function formatStatementAmount(amountStr: string, currency: string): string {
  const numeric = Number(amountStr);
  if (!Number.isFinite(numeric)) {
    return `— ${currency}`;
  }
  const formatted = numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

export function buildStatementExportFilename(
  criteria: StatementCriteria,
  format: StatementExportFormat
): string {
  const ext = format === 'pdf' ? 'pdf' : 'xlsx';
  return `Statement_${criteria.accountId}_${criteria.fromDate}_${criteria.toDate}.${ext}`;
}
