// Modified by Sekar Nagarajan (2026-10-08 15:15)
import { FormattedDate } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { Spin } from "antd";
import { useEffect, useMemo } from "react";
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

/** Grid row — normal ledger line or the pinned period-totals footer. */
type StatementGridRow = StatementLine & { isTotals?: boolean };

const TOTALS_ROW_ID = "stmt-period-totals";

function MoneyCell({
  value,
  currency,
  showZero = false,
}: {
  value?: string;
  currency: string;
  showZero?: boolean;
}) {
  if (!showZero && (!value || value === "0" || value === "0.00")) {
    return <span className="stmt-money-cell">—</span>;
  }
  return (
    <span className="stmt-money-cell">
      {formatStatementAmount(value || "0.00", currency)}
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

  const pinnedBottomRowData = useMemo<StatementGridRow[]>(() => {
    if (!statement) return [];
    return [
      {
        date: "",
        docType: "Adjustment",
        docNo: TOTALS_ROW_ID,
        reference: t("totals.periodTotals"),
        debit: statement.totals.totalDebit,
        credit: statement.totals.totalCredit,
        runningBalance: statement.totals.net,
        currency: statement.currency,
        isTotals: true,
      },
    ];
  }, [statement, t]);

  const columns: DataViewColumn<StatementGridRow>[] = useMemo(
    () => [
      {
        field: "date",
        headerName: t("columns.date"),
        width: 130,
        colSpan: (p: { data?: StatementGridRow }) => (p.data?.isTotals ? 4 : 1),
        cellRenderer: (p: { value?: string; data?: StatementGridRow }) => {
          if (p.data?.isTotals) {
            return (
              <span className="stmt-totals-label">
                {t("totals.periodTotals")}
              </span>
            );
          }
          return p.value ? <FormattedDate value={p.value} /> : "—";
        },
      },
      {
        field: "docType",
        headerName: t("columns.type"),
        width: 130,
        cellRenderer: (p: {
          value?: StatementLine["docType"];
          data?: StatementGridRow;
        }) => {
          if (p.data?.isTotals) return null;
          return p.value ? getStatementDocTypeLabel(p.value, t) : "—";
        },
      },
      {
        field: "docNo",
        headerName: t("columns.docNo"),
        width: 140,
        cellRenderer: (p: { value?: string; data?: StatementGridRow }) => {
          if (p.data?.isTotals) return null;
          return p.value || "—";
        },
      },
      {
        field: "reference",
        headerName: t("columns.reference"),
        flex: 1,
        minWidth: 140,
        cellRenderer: (p: { value?: string; data?: StatementGridRow }) => {
          if (p.data?.isTotals) return null;
          return p.value || "—";
        },
      },
      {
        field: "debit",
        headerName: t("columns.debit"),
        width: 150,
        headerTooltip: t("totals.totalDebit"),
        cellRenderer: (params: { data?: StatementGridRow }) =>
          params.data ? (
            <MoneyCell
              value={params.data.debit}
              currency={params.data.currency}
              showZero={params.data.isTotals}
            />
          ) : null,
      },
      {
        field: "credit",
        headerName: t("columns.credit"),
        width: 150,
        headerTooltip: t("totals.totalCredit"),
        cellRenderer: (params: { data?: StatementGridRow }) =>
          params.data ? (
            <MoneyCell
              value={params.data.credit}
              currency={params.data.currency}
              showZero={params.data.isTotals}
            />
          ) : null,
      },
      {
        field: "runningBalance",
        headerName: t("columns.balance"),
        width: 160,
        headerTooltip: t("totals.net"),
        cellRenderer: (params: { data?: StatementGridRow }) => {
          if (!params.data) return null;
          if (params.data.isTotals) {
            return (
              <span className="stmt-totals-net">
                <span className="stmt-totals-net__label">
                  {t("totals.net")}
                </span>
                <MoneyCell
                  value={params.data.runningBalance}
                  currency={params.data.currency}
                  showZero
                />
              </span>
            );
          }
          return (
            <MoneyCell
              value={params.data.runningBalance}
              currency={params.data.currency}
            />
          );
        },
      },
    ],
    [t],
  );

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
                    pinnedBottomRowData,
                    getRowId: (params: { data: StatementGridRow }) =>
                      params.data.isTotals
                        ? TOTALS_ROW_ID
                        : `${params.data.docNo}-${params.data.date}`,
                    getRowClass: (params: { data?: StatementGridRow }) =>
                      params.data?.isTotals ? "stmt-totals-row" : undefined,
                  },
                }}
              />
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
