// Modified by Sekar Nagarajan (2026-08-25 12:55)
import { FormattedDate } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { Spin } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import {
  useStatementExportMutation,
  useStatementQuery,
} from "../api/customer-statement.queries";
import type {
  StatementCriteria,
  StatementLine,
} from "../types/customer-statement.types";
import {
  formatStatementAmount,
  getStatementDocTypeLabel,
} from "../types/customer-statement.types";
import { StatementSummaryHeader } from "./StatementSummaryHeader";

interface StatementViewProps {
  criteria: StatementCriteria;
  onRecordCountChange?: (count: number | undefined) => void;
}

function MoneyCell({ value, currency }: { value?: string; currency: string }) {
  if (!value || value === "0" || value === "0.00") {
    return <span className="stmt-money-cell">—</span>;
  }
  return (
    <span className="stmt-money-cell">
      {formatStatementAmount(value, currency)}
    </span>
  );
}

export function StatementView({
  criteria,
  onRecordCountChange,
}: StatementViewProps) {
  const { t } = useTranslation(["customer-statement", "common", "modules"]);
  const { profileHandlers } = useLocalGridProfiles("customer-statement");
  const {
    data: statement,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useStatementQuery(criteria);
  const exportMutation = useStatementExportMutation();

  useEffect(() => {
    if (!onRecordCountChange) return;
    if (statement?.lines) {
      onRecordCountChange(statement.lines.length);
      return;
    }
    if (!isLoading && !isFetching) {
      onRecordCountChange(0);
    }
  }, [statement?.lines, isLoading, isFetching, onRecordCountChange]);

  useEffect(() => {
    return () => {
      onRecordCountChange?.(undefined);
    };
  }, [onRecordCountChange]);

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title={t("empty.loadErrorTitle")}
      message={t("empty.loadErrorMessage")}
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant="filtered"
      title={t("empty.noTransactionsTitle")}
      message={t("empty.noTransactionsMessage")}
    />
  );

  const columns: DataViewColumn<StatementLine>[] = [
    {
      field: "date",
      headerName: t("columns.date"),
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "—",
    },
    {
      field: "docType",
      headerName: t("columns.type"),
      width: 130,
      cellRenderer: (p: { value?: StatementLine["docType"] }) =>
        p.value ? getStatementDocTypeLabel(p.value, t) : "—",
    },
    { field: "docNo", headerName: t("columns.docNo"), width: 140 },
    {
      field: "reference",
      headerName: t("columns.reference"),
      flex: 1,
      minWidth: 140,
    },
    {
      field: "debit",
      headerName: t("columns.debit"),
      width: 150,
      cellRenderer: (params: { data?: StatementLine }) =>
        params.data ? (
          <MoneyCell
            value={params.data.debit}
            currency={params.data.currency}
          />
        ) : null,
    },
    {
      field: "credit",
      headerName: t("columns.credit"),
      width: 150,
      cellRenderer: (params: { data?: StatementLine }) =>
        params.data ? (
          <MoneyCell
            value={params.data.credit}
            currency={params.data.currency}
          />
        ) : null,
    },
    {
      field: "runningBalance",
      headerName: t("columns.balance"),
      width: 160,
      cellRenderer: (params: { data?: StatementLine }) =>
        params.data ? (
          <MoneyCell
            value={params.data.runningBalance}
            currency={params.data.currency}
          />
        ) : null,
    },
  ];

  const exportingPdf =
    exportMutation.isPending && exportMutation.variables?.format === "pdf";
  const exportingXlsx =
    exportMutation.isPending && exportMutation.variables?.format === "xlsx";

  return (
    <div className="stmt-result-wrap">
      <Spin spinning={isLoading || isFetching}>
        {statement ? (
          <>
            <StatementSummaryHeader
              statement={statement}
              exportingPdf={exportingPdf}
              exportingXlsx={exportingXlsx}
              onExportPdf={() =>
                exportMutation.mutate({ criteria, format: "pdf" })
              }
              onExportXlsx={() =>
                exportMutation.mutate({ criteria, format: "xlsx" })
              }
            />

            <div className="stmt-grid-wrap responsive-table-wrap">
              <DataView
                rowData={statement.lines}
                columnDefs={columns}
                loading={false}
                emptyState={emptyState}
                allowedViewModes={["list"]}
                defaultViewMode="list"
                renderToolbar={() => null}
                className="stmt-data-view"
                listOptions={{
                  ...profileHandlers,
                  showToolbar: { showTotalCount: true, fullScreen: true },
                  sideBar: true,
                  pagination: true,
                  paginationPageSize: 20,
                  pageSizeOptions: [10, 20, 50, 100],
                  defaultColDef: { filter: true },
                  gridOptions: {
                    getRowId: (params: { data: StatementLine }) =>
                      `${params.data.docNo}-${params.data.date}`,
                  },
                }}
              />
            </div>

            <div className="stmt-totals-strip">
              <div className="stmt-totals-strip__item">
                <span className="stmt-totals-strip__label">
                  {t("totals.totalDebit")}
                </span>
                <span className="stmt-totals-strip__value">
                  {formatStatementAmount(
                    statement.totals.totalDebit,
                    statement.currency,
                  )}
                </span>
              </div>
              <div className="stmt-totals-strip__item">
                <span className="stmt-totals-strip__label">
                  {t("totals.totalCredit")}
                </span>
                <span className="stmt-totals-strip__value">
                  {formatStatementAmount(
                    statement.totals.totalCredit,
                    statement.currency,
                  )}
                </span>
              </div>
              <div className="stmt-totals-strip__item">
                <span className="stmt-totals-strip__label">
                  {t("totals.net")}
                </span>
                <span className="stmt-totals-strip__value">
                  {formatStatementAmount(
                    statement.totals.net,
                    statement.currency,
                  )}
                </span>
              </div>
            </div>
          </>
        ) : !isLoading ? (
          emptyState
        ) : (
          <div className="stmt-empty-hint" />
        )}
      </Spin>
    </div>
  );
}
