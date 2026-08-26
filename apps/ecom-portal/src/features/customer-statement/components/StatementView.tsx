// Modified by Sekar Nagarajan (2026-08-25 12:55)
import { FormattedDate } from '@solverminds/shared-ui';
import { DataView, type DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Spin } from 'antd';

import {
  useStatementExportMutation,
  useStatementQuery,
} from '../api/customer-statement.queries';
import type {
  StatementCriteria,
  StatementLine,
} from '../types/customer-statement.types';
import {
  STATEMENT_DOCTYPE_LABELS,
  formatStatementAmount,
} from '../types/customer-statement.types';
import { StatementSummaryHeader } from './StatementSummaryHeader';

interface StatementViewProps {
  criteria: StatementCriteria;
}

function MoneyCell({ value, currency }: { value?: string; currency: string }) {
  if (!value || value === '0' || value === '0.00') {
    return <span className="stmt-money-cell">—</span>;
  }
  return (
    <span className="stmt-money-cell">{formatStatementAmount(value, currency)}</span>
  );
}

export function StatementView({ criteria }: StatementViewProps) {
  const { data: statement, isLoading, isFetching } = useStatementQuery(criteria);
  const exportMutation = useStatementExportMutation();

  const columns: DataViewColumn<StatementLine>[] = [
    {
      field: 'date',
      headerName: 'Date',
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : '—',
    },
    {
      field: 'docType',
      headerName: 'Type',
      width: 130,
      cellRenderer: (p: { value?: StatementLine['docType'] }) =>
        p.value ? STATEMENT_DOCTYPE_LABELS[p.value] : '—',
    },
    { field: 'docNo', headerName: 'Doc No', width: 140 },
    { field: 'reference', headerName: 'Reference', flex: 1, minWidth: 140 },
    {
      field: 'debit',
      headerName: 'Debit',
      width: 150,
      cellRenderer: (params: { data?: StatementLine }) =>
        params.data ? (
          <MoneyCell value={params.data.debit} currency={params.data.currency} />
        ) : null,
    },
    {
      field: 'credit',
      headerName: 'Credit',
      width: 150,
      cellRenderer: (params: { data?: StatementLine }) =>
        params.data ? (
          <MoneyCell value={params.data.credit} currency={params.data.currency} />
        ) : null,
    },
    {
      field: 'runningBalance',
      headerName: 'Balance',
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
    exportMutation.isPending && exportMutation.variables?.format === 'pdf';
  const exportingXlsx =
    exportMutation.isPending && exportMutation.variables?.format === 'xlsx';

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
                exportMutation.mutate({ criteria, format: 'pdf' })
              }
              onExportXlsx={() =>
                exportMutation.mutate({ criteria, format: 'xlsx' })
              }
            />

            <div className="stmt-grid-wrap responsive-table-wrap">
              <DataView
                rowData={statement.lines}
                columnDefs={columns}
                loading={false}
                allowedViewModes={['list']}
                defaultViewMode="list"
                renderToolbar={() => null}
                className="stmt-data-view"
                listOptions={{
                  showToolbar: false,
                  gridOptions: {
                    getRowId: (params: { data: StatementLine }) =>
                      `${params.data.docNo}-${params.data.date}`,
                    overlayNoRowsTemplate: 'No transactions for this period.',
                  },
                }}
              />
            </div>

            <div className="stmt-totals-strip">
              <div className="stmt-totals-strip__item">
                <span className="stmt-totals-strip__label">Total Debit</span>
                <span className="stmt-totals-strip__value">
                  {formatStatementAmount(
                    statement.totals.totalDebit,
                    statement.currency
                  )}
                </span>
              </div>
              <div className="stmt-totals-strip__item">
                <span className="stmt-totals-strip__label">Total Credit</span>
                <span className="stmt-totals-strip__value">
                  {formatStatementAmount(
                    statement.totals.totalCredit,
                    statement.currency
                  )}
                </span>
              </div>
              <div className="stmt-totals-strip__item">
                <span className="stmt-totals-strip__label">Net</span>
                <span className="stmt-totals-strip__value">
                  {formatStatementAmount(statement.totals.net, statement.currency)}
                </span>
              </div>
            </div>
          </>
        ) : !isLoading ? (
          <p className="stmt-empty-hint">No transactions for this period.</p>
        ) : (
          <div className="stmt-empty-hint" />
        )}
      </Spin>
    </div>
  );
}
