// Modified by Sekar Nagarajan (2026-08-25 12:45)
export const statementKeys = {
  all: ['customer-statement'] as const,
  accounts: () => [...statementKeys.all, 'accounts'] as const,
  statement: (c: {
    accountId: string;
    currency: string;
    fromDate: string;
    toDate: string;
  }) => [...statementKeys.all, 'statement', c] as const,
};
