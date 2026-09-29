// Modified by Sekar Nagarajan (2026-08-25 12:45)
import type { TFunction } from "i18next";
import { z } from "zod";

export type StatementDocType =
  | "Invoice"
  | "CreditNote"
  | "DebitNote"
  | "Receipt"
  | "Adjustment";

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

type TranslateFn = (key: string) => string;

/** Language-reactive display label for statement document types. */
export function getStatementDocTypeLabel(
  docType: StatementDocType,
  t: TranslateFn,
): string {
  switch (docType) {
    case "Invoice":
      return t("docTypes.invoice");
    case "CreditNote":
      return t("docTypes.creditNote");
    case "DebitNote":
      return t("docTypes.debitNote");
    case "Receipt":
      return t("docTypes.receipt");
    case "Adjustment":
      return t("docTypes.adjustment");
    default: {
      const _exhaustive: never = docType;
      return _exhaustive;
    }
  }
}

export type StatementExportFormat = "pdf" | "xlsx";

/** Approximate inclusive month span used for the 12-month cap. */
export function statementPeriodMonths(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((to.getTime() - from.getTime()) / dayMs) + 1;
  return days / 30.4375;
}

/** Build the criteria schema with localized validation messages. */
export function createStatementCriteriaSchema(
  t: TFunction<"customer-statement">,
) {
  return z
    .object({
      accountId: z.string().min(1, t("validation.accountRequired")),
      currency: z.string().min(1, t("validation.currencyRequired")),
      fromDate: z.string().min(1, t("validation.fromDateRequired")),
      toDate: z.string().min(1, t("validation.toDateRequired")),
    })
    .superRefine((v, ctx) => {
      if (v.fromDate && v.toDate && v.fromDate > v.toDate) {
        ctx.addIssue({
          path: ["toDate"],
          code: "custom",
          message: t("validation.endAfterStart"),
        });
      }
      if (
        v.fromDate &&
        v.toDate &&
        statementPeriodMonths(v.fromDate, v.toDate) > 12
      ) {
        ctx.addIssue({
          path: ["toDate"],
          code: "custom",
          message: t("validation.periodMaxMonths"),
        });
      }
    });
}

const EN_VALIDATION_MESSAGES: Record<string, string> = {
  "validation.accountRequired": "Account is required.",
  "validation.currencyRequired": "Currency is required.",
  "validation.fromDateRequired": "From date is required.",
  "validation.toDateRequired": "To date is required.",
  "validation.endAfterStart": "End date must be on or after start date.",
  "validation.periodMaxMonths": "Statement period cannot exceed 12 months.",
};

/** English schema for mocks, handlers, and tests. */
export const statementCriteriaSchema = createStatementCriteriaSchema(
  ((key: string) => EN_VALIDATION_MESSAGES[key] ?? key) as TFunction<
    "customer-statement"
  >,
);

export function formatStatementAmount(
  amountStr: string,
  currency: string,
): string {
  const numeric = Number(amountStr);
  if (!Number.isFinite(numeric)) {
    return `— ${currency}`;
  }
  const formatted = numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

export function buildStatementExportFilename(
  criteria: StatementCriteria,
  format: StatementExportFormat,
): string {
  const ext = format === "pdf" ? "pdf" : "xlsx";
  return `Statement_${criteria.accountId}_${criteria.fromDate}_${criteria.toDate}.${ext}`;
}
