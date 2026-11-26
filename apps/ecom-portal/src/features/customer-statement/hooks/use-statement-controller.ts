// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useStatementAccountsQuery } from "../api/customer-statement.queries";
import {
  createStatementCriteriaSchema,
  type StatementCriteria,
} from "../types/customer-statement.types";

const DEFAULT_FROM_DATE = DateTime.now().minus({ days: 30 }).toISODate() ?? "";
const DEFAULT_TO_DATE = DateTime.now().toISODate() ?? "";

export function useStatementController() {
  const { t } = useTranslation("customer-statement");
  const schema = useMemo(() => createStatementCriteriaSchema(t), [t]);
  const { data: accounts = [] } = useStatementAccountsQuery();

  const [accountId, setAccountId] = useState("");
  const [currency, setCurrency] = useState("");
  const [fromDate, setFromDate] = useState(DEFAULT_FROM_DATE);
  const [toDate, setToDate] = useState(DEFAULT_TO_DATE);
  const [activeCriteria, setActiveCriteria] = useState<StatementCriteria | null>(null);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);

  const applyCriteria = (draft: StatementCriteria) => {
    const parsed = schema.safeParse(draft);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setCriteriaError(first?.message ?? t("validation.invalidCriteria"));
      return;
    }
    setCriteriaError(null);
    setAccountId(parsed.data.accountId);
    setCurrency(parsed.data.currency);
    setActiveCriteria(parsed.data);
  };

  /** ARN-style: show default input-based records once accounts are ready. */
  useEffect(() => {
    if (activeCriteria || accounts.length === 0) return;
    const first = accounts[0];
    applyCriteria({
      accountId: first.accountId,
      currency: first.currency,
      fromDate: DEFAULT_FROM_DATE,
      toDate: DEFAULT_TO_DATE,
    });
  }, [accounts, activeCriteria, schema, t]);

  const handleAccountChange = (nextAccountId: string, nextCurrency: string) => {
    setAccountId(nextAccountId);
    setCurrency(nextCurrency);
  };

  const handleSearch = (override?: Partial<StatementCriteria>) => {
    applyCriteria({
      accountId: override?.accountId ?? accountId,
      currency: override?.currency ?? currency,
      fromDate: override?.fromDate ?? fromDate,
      toDate: override?.toDate ?? toDate,
    });
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
