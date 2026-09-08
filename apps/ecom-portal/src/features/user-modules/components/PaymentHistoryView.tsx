// Modified by Sekar Nagarajan (2026-09-08 11:08)
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { useToast } from "@solverminds/shared-ui/hooks";
import { DatePicker, Space, Tag, Typography } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useState } from "react";

import {
  AppIcon,
  Icons,
  NavPaymentHistoryIcon,
} from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../../components/shared/module-empty-state";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { usePaymentHistoryQuery } from "../api/user-modules.queries";
import type { PaymentHistoryRecord } from "../types/user-modules.types";
import { UmPanelHeader } from "./um-panel-header";

const { Text } = Typography;
const { RangePicker } = DatePicker;

type DateRangeValue = [Dayjs | null, Dayjs | null] | null;

const STATUS_META: Record<
  PaymentHistoryRecord["status"],
  { color: string; label: string }
> = {
  SUCCESSFUL: { color: "green", label: "Successful" },
  PENDING: { color: "gold", label: "Pending" },
  FAILED: { color: "red", label: "Failed" },
  REFUNDED: { color: "purple", label: "Refunded" },
};

const GATEWAY_META: Record<
  PaymentHistoryRecord["gateway"],
  { color: string; label: string }
> = {
  STRIPE: { color: "purple", label: "Stripe" },
  NGENIUS: { color: "cyan", label: "NGenius" },
  BANK_TRANSFER: { color: "blue", label: "Bank Transfer" },
};

/** Default: last 120 days — covers Jun–Sep mock seeds for demo. */
function defaultDateRange(): [Dayjs, Dayjs] {
  return [dayjs().subtract(120, "day"), dayjs()];
}

function toQueryDates(range: DateRangeValue): {
  fromDate?: string;
  toDate?: string;
} {
  if (!range?.[0] || !range?.[1]) return {};
  return {
    fromDate: range[0].format("YYYY-MM-DD"),
    toDate: range[1].format("YYYY-MM-DD"),
  };
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })} ${currency}`;
  }
}

export function PaymentHistoryView() {
  const toast = useToast();
  const [dateRange, setDateRange] = useState<DateRangeValue>(defaultDateRange);
  const query = toQueryDates(dateRange);

  const {
    data: payments = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = usePaymentHistoryQuery(query);

  const handleDownloadReceipt = (rec: PaymentHistoryRecord) => {
    toast.info(`Downloading PDF receipt for ${rec.paymentRefNo}...`);
  };

  const handleRangeChange = (values: DateRangeValue) => {
    setDateRange(values);
  };

  const settledTotal = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((sum, p) => sum + p.amount, 0);
  const successfulCount = payments.filter(
    (p) => p.status === "SUCCESSFUL",
  ).length;
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  const columnDefs: DataViewColumn<PaymentHistoryRecord>[] = [
    buildActionsColumn<PaymentHistoryRecord>({
      field: "id",
      width: 90,
      cellRenderer: (params: { data?: PaymentHistoryRecord }) => {
        const rec = params.data;
        if (!rec) return null;
        if (rec.status !== "SUCCESSFUL") {
          return <Text type="secondary">—</Text>;
        }
        return (
          <ListActionsRow>
            <ListActionButton
              title="Download PDF Receipt"
              icon={<AppIcon icon={Icons.fileText} size={16} tone="download" />}
              onClick={(event) => {
                event.stopPropagation();
                handleDownloadReceipt(rec);
              }}
            />
          </ListActionsRow>
        );
      },
    }),
    {
      headerName: "Payment Ref",
      field: "paymentRefNo",
      sortable: true,
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: { value?: string }) => (
        <Space size={6}>
          <strong>{params.value}</strong>
        </Space>
      ),
    },
    {
      headerName: "Invoice / BL",
      field: "invoiceNo",
      sortable: true,
      flex: 1,
      minWidth: 150,
      valueGetter: (params: { data?: PaymentHistoryRecord }) =>
        params.data ? `${params.data.invoiceNo} · ${params.data.blNumber}` : "",
    },
    {
      headerName: "Gateway",
      field: "gateway",
      sortable: true,
      width: 130,
      cellRenderer: (params: { value?: PaymentHistoryRecord["gateway"] }) => {
        const gw = params.value;
        if (!gw) return null;
        const meta = GATEWAY_META[gw];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      headerName: "Amount",
      field: "amount",
      sortable: true,
      width: 140,
      cellRenderer: (params: { data?: PaymentHistoryRecord }) => {
        const rec = params.data;
        if (!rec) return null;
        const tone =
          rec.status === "SUCCESSFUL"
            ? "um-amount-success"
            : rec.status === "FAILED"
            ? "um-amount-primary"
            : undefined;
        return (
          <span className={tone}>{formatMoney(rec.amount, rec.currency)}</span>
        );
      },
    },
    {
      headerName: "Paid On",
      field: "paymentDate",
      sortable: true,
      width: 150,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      width: 120,
      cellRenderer: (params: { value?: PaymentHistoryRecord["status"] }) => {
        const st = params.value;
        if (!st) return null;
        const meta = STATUS_META[st];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
  ];

  const hasRange = Boolean(query.fromDate && query.toDate);
  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title="Couldn't load payment history"
      message="The request didn't complete. Check your connection and try again."
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant="filtered"
      title="No payment records found"
      message={
        hasRange
          ? `No payments between ${query.fromDate} and ${query.toDate}. Clear or widen the date range.`
          : "Payments will appear here once they are processed."
      }
    />
  );

  return (
    <div className="um-page-layout">
      <UmPanelHeader
        icon={NavPaymentHistoryIcon}
        title={MODULE_TITLES.paymentHistory}
        description="Review online payments, invoice settlements, and download PDF receipts."
        extra={
          <RangePicker
            size="large"
            className="um-range-picker"
            allowClear
            value={dateRange}
            onChange={handleRangeChange}
            format="DD-MMM-YYYY"
            placeholder={["From date", "To date"]}
          />
        }
      />

      <div className="um-summary-strip" aria-label="Payment summary">
        <div className="um-summary-chip um-summary-chip--success">
          <span className="um-summary-chip__label">Settled</span>
          <span className="um-summary-chip__value">
            {formatMoney(settledTotal, "USD")}
          </span>
        </div>
        <div className="um-summary-chip um-summary-chip--primary">
          <span className="um-summary-chip__label">Successful</span>
          <span className="um-summary-chip__value">{successfulCount}</span>
        </div>
        <div className="um-summary-chip">
          <span className="um-summary-chip__label">Pending</span>
          <span className="um-summary-chip__value">{pendingCount}</span>
        </div>
        <div className="um-summary-chip">
          <span className="um-summary-chip__label">In range</span>
          <span className="um-summary-chip__value">{payments.length}</span>
        </div>
      </div>

      <div className="um-grid-wrap um-payments-grid responsive-table-wrap custom-scroll">
        <DataView
          className="um-data-view"
          columnDefs={columnDefs}
          rowData={payments}
          loading={isLoading || isFetching}
          emptyState={emptyState}
          allowedViewModes={["list"]}
          defaultViewMode="list"
          renderToolbar={() => null}
          listOptions={{
            showToolbar: false,
            pagination: true,
            paginationPageSize: 10,
            pageSizeOptions: [10, 20, 50],
            gridOptions: {
              domLayout: "autoHeight",
              suppressCellFocus: true,
              pagination: true,
              paginationPageSize: 10,
            },
          }}
        />
      </div>
    </div>
  );
}
