// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  buildStatementExportFilename,
  type StatementCriteria,
  type StatementExportFormat,
} from "../types/customer-statement.types";
import {
  downloadStatementDocument,
  getStatement,
  getStatementAccounts,
} from "./customer-statement.api";
import { statementKeys } from "./customer-statement.keys";

export function useStatementAccountsQuery() {
  const { t } = useTranslation("customer-statement");

  return useQuery({
    queryKey: statementKeys.accounts(),
    queryFn: async () => {
      const res = await getStatementAccounts();
      if (res.error) {
        throw new Error(res.error.message || t("errors.fetchAccounts"));
      }
      return res.data ?? [];
    },
  });
}

export function useStatementQuery(criteria: StatementCriteria | null) {
  const { t } = useTranslation("customer-statement");

  return useQuery({
    queryKey: statementKeys.statement(
      criteria ?? { accountId: "", currency: "", fromDate: "", toDate: "" },
    ),
    enabled: Boolean(criteria),
    queryFn: async () => {
      if (!criteria) return null;
      const res = await getStatement(criteria);
      if (res.error) {
        throw new Error(res.error.message || t("errors.fetchStatement"));
      }
      return res.data ?? null;
    },
  });
}

export function useStatementExportMutation() {
  const { t } = useTranslation("customer-statement");
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      criteria,
      format,
    }: {
      criteria: StatementCriteria;
      format: StatementExportFormat;
    }) => {
      const res = await downloadStatementDocument(criteria, format);
      if (res.error) {
        throw new Error(res.error.message || t("errors.download"));
      }
      return { blob: res.data, criteria, format };
    },
    onSuccess: ({ blob, criteria, format }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: buildStatementExportFilename(criteria, format),
      });
      a.click();
      URL.revokeObjectURL(url);
      toast.success(
        format === "pdf"
          ? t("toasts.pdfDownloaded")
          : t("toasts.excelDownloaded"),
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
