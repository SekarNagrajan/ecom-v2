// Modified by Sekar Nagarajan (2026-08-26 16:25)
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { Tag, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { MODULE_TITLES } from "../../../constants/module-titles";
import type {
  ApprovalStatus,
  VendorApprovalItem,
} from "../types/vendor-approvals.types";

const { Text, Title } = Typography;

const INITIAL_ITEMS: VendorApprovalItem[] = [
  {
    id: "1",
    referenceNo: "BKG-2026-0991",
    customerName: "Apex Logistics Global",
    submittedDate: "2026-08-21 09:30",
    type: "BOOKING",
    originPort: "USNYC",
    destPort: "SGSIN",
    status: "PENDING",
  },
  {
    id: "2",
    referenceNo: "SI-2026-8812",
    customerName: "Atlantic Freight LLC",
    submittedDate: "2026-08-21 10:15",
    type: "SI",
    originPort: "NLRTM",
    destPort: "CNSHA",
    status: "PENDING",
  },
  {
    id: "3",
    referenceNo: "VGM-2026-4410",
    customerName: "Pacific Maritime Corp",
    submittedDate: "2026-08-21 08:45",
    type: "VGM",
    originPort: "DEHAM",
    destPort: "USNYC",
    status: "PENDING",
  },
  {
    id: "4",
    referenceNo: "BKG-2026-0988",
    customerName: "Global Shippers Inc",
    submittedDate: "2026-08-20 16:20",
    type: "BOOKING",
    originPort: "SGSIN",
    destPort: "AEJEA",
    status: "APPROVED",
  },
];

const TYPE_META: Record<
  VendorApprovalItem["type"],
  { color: string; label: string }
> = {
  BOOKING: { color: "blue", label: "Booking" },
  SI: { color: "purple", label: "Shipping Instruction" },
  VGM: { color: "green", label: "VGM" },
};

const STATUS_META: Record<ApprovalStatus, { color: string; label: string }> = {
  PENDING: { color: "gold", label: "Pending" },
  APPROVED: { color: "green", label: "Approved" },
  REJECTED: { color: "red", label: "Rejected" },
};

export function VendorApprovalsView() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<VendorApprovalItem[]>(INITIAL_ITEMS);

  const applyStatus = (id: string, status: Exclude<ApprovalStatus, "PENDING">) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    toast.success(
      status === "APPROVED"
        ? "Request approved successfully."
        : "Request rejected successfully.",
    );
  };

  // Use confirm.show / confirm.danger so Cancel is always available (success modals are OK-only).
  const handleApprove = (item: VendorApprovalItem) => {
    confirm.show({
      title: "Approve Request",
      content: `Approve ${item.referenceNo} for ${item.customerName}?`,
      okText: "Approve",
      cancelText: "Cancel",
      onOk: () => applyStatus(item.id, "APPROVED"),
    });
  };

  const handleReject = (item: VendorApprovalItem) => {
    confirm.danger({
      title: "Reject Request",
      content: `Reject ${item.referenceNo} for ${item.customerName}?`,
      okText: "Reject",
      cancelText: "Cancel",
      onOk: () => applyStatus(item.id, "REJECTED"),
    });
  };

  const columnDefs: DataViewColumn<VendorApprovalItem>[] = [
    buildActionsColumn<VendorApprovalItem>({
      field: "id",
      width: 100,
      cellRenderer: (params: { data?: VendorApprovalItem }) => {
        const rec = params.data;
        if (!rec) return null;
        if (rec.status !== "PENDING") {
          return <Text type="secondary" className="va-status-done">Done</Text>;
        }
        return (
          <ListActionsRow>
            <ListActionButton
              title="Approve Request"
              icon={
                <AppIcon icon={Icons.checkCircle} size={16} tone="approve" />
              }
              onClick={(event) => {
                event.stopPropagation();
                handleApprove(rec);
              }}
            />
            <ListActionButton
              title="Reject Request"
              icon={<AppIcon icon={Icons.circleX} size={16} tone="reject" />}
              danger
              onClick={(event) => {
                event.stopPropagation();
                handleReject(rec);
              }}
            />
          </ListActionsRow>
        );
      },
    }),
    {
      headerName: "Reference No",
      field: "referenceNo",
      sortable: true,
      flex: 1,
      minWidth: 140,
      cellRenderer: (params: { value?: string }) => (
        <strong>{params.value}</strong>
      ),
    },
    {
      headerName: "Type",
      field: "type",
      sortable: true,
      width: 160,
      cellRenderer: (params: { value?: VendorApprovalItem["type"] }) => {
        const t = params.value;
        if (!t) return null;
        const meta = TYPE_META[t];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      headerName: "Customer",
      field: "customerName",
      sortable: true,
      flex: 1.2,
      minWidth: 160,
    },
    {
      headerName: "Route",
      field: "originPort",
      sortable: false,
      flex: 1,
      minWidth: 130,
      valueGetter: (params: { data?: VendorApprovalItem }) =>
        params.data
          ? `${params.data.originPort} → ${params.data.destPort}`
          : "",
    },
    {
      headerName: "Submitted",
      field: "submittedDate",
      sortable: true,
      width: 150,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      width: 120,
      cellRenderer: (params: { value?: ApprovalStatus }) => {
        const st = params.value;
        if (!st) return null;
        const meta = STATUS_META[st];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
  ];

  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const approvedCount = items.filter((i) => i.status === "APPROVED").length;

  return (
    <div className="va-page-layout">
      <div className="va-panel-header">
        <div className="va-panel-header__main">
          <span className="va-panel-header__icon" aria-hidden>
            <AppIcon icon={Icons.checkSquare} size={24} />
          </span>
          <div className="va-panel-header__copy">
            <Title level={4} className="va-panel-header__title">
              {MODULE_TITLES.agencyApprovals}
            </Title>
            <Text type="secondary" className="va-panel-header__description">
              Review and process customer bookings, shipping instructions, and
              VGM submissions.
            </Text>
          </div>
        </div>
      </div>

      <div className="va-summary-strip" aria-label="Approval summary">
        <div className="va-summary-chip va-summary-chip--warning">
          <span className="va-summary-chip__label">Pending</span>
          <span className="va-summary-chip__value">{pendingCount}</span>
        </div>
        <div className="va-summary-chip va-summary-chip--success">
          <span className="va-summary-chip__label">Approved</span>
          <span className="va-summary-chip__value">{approvedCount}</span>
        </div>
        <div className="va-summary-chip">
          <span className="va-summary-chip__label">Total</span>
          <span className="va-summary-chip__value">{items.length}</span>
        </div>
      </div>

      <div className="va-grid-wrap va-approvals-grid responsive-table-wrap custom-scroll">
        <DataView
          className="va-data-view"
          columnDefs={columnDefs}
          rowData={items}
          allowedViewModes={["list"]}
          defaultViewMode="list"
          renderToolbar={() => null}
          listOptions={{
            showToolbar: false,
            gridOptions: {
              domLayout: "autoHeight",
              overlayNoRowsTemplate: "No approval requests to review.",
              suppressCellFocus: true,
            },
          }}
        />
      </div>
    </div>
  );
}
