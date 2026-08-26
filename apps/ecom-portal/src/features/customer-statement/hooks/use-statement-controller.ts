// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { DateTime } from 'luxon';
import { useState } from 'react';

import {
  statementCriteriaSchema,
  type StatementCriteria,
} from '../types/customer-statement.types';

export function useStatementController() {
  const [accountId, setAccountId] = useState('');
  const [currency, setCurrency] = useState('');
  const [fromDate, setFromDate] = useState(
    DateTime.now().minus({ days: 30 }).toISODate() ?? ''
  );
  const [toDate, setToDate] = useState(DateTime.now().toISODate() ?? '');
  const [activeCriteria, setActiveCriteria] = useState<StatementCriteria | null>(null);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);

  const handleAccountChange = (nextAccountId: string, nextCurrency: string) => {
    setAccountId(nextAccountId);
    setCurrency(nextCurrency);
  };

  const handleSearch = (override?: Partial<StatementCriteria>) => {
    const draft: StatementCriteria = {
      accountId: override?.accountId ?? accountId,
      currency: override?.currency ?? currency,
      fromDate: override?.fromDate ?? fromDate,
      toDate: override?.toDate ?? toDate,
    };
    if (override?.accountId) setAccountId(override.accountId);
    if (override?.currency) setCurrency(override.currency);

    const parsed = statementCriteriaSchema.safeParse(draft);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setCriteriaError(first?.message ?? 'Invalid statement criteria.');
      return;
    }
    setCriteriaError(null);
    setActiveCriteria(parsed.data);
  };

  return {
    accountId,
    currency,
    fromDate,
    toDate,
    activeCriteria,
    criteriaError,
    setFromDate,
    setToDate,
    setCurrency,
    handleAccountChange,
    handleSearch,
  };
}
