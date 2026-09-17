// Modified by Sekar Nagarajan (2026-09-16 17:42)
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { Tag, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { NavAgencyApprovalIcon } from "../../../components/icons/nav-svg-icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { MOCK_VENDOR_APPROVALS } from "../mocks/vendor-approvals.mock";
import type {
  ApprovalStatus,
  VendorApprovalItem,
} from "../types/vendor-approvals.types";

const { Text } = Typography;

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
  const { profileHandlers } = useLocalGridProfiles("vendor-approvals");
  const [items, setItems] = useState<VendorApprovalItem[]>(() => [
    ...MOCK_VENDOR_APPROVALS,
  ]);

  const applyStatus = (
    id: string,
    status: Exclude<ApprovalStatus, "PENDING">,
  ) => {
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
          return (
            <Text type="secondary" className="va-status-done">
              Done
            </Text>
          );
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
  const rejectedCount = items.filter((i) => i.status === "REJECTED").length;

  return (
    <div className="va-page-layout">
      {/* Modified by Sekar Nagarajan (2026-09-16 17:38) — VGM/ARN page shell layout */}
      <div className="va-page-header">
        <ModuleScreenHeader
          icon={NavAgencyApprovalIcon}
          title={MODULE_TITLES.agencyApprovals}
          subtitle="Review and process customer bookings, shipping instructions, and VGM submissions."
          marginBottom={0}
        />
      </div>

      <div
        className="va-summary-panel"
        role="group"
        aria-label="Approval summary"
      >
        <div className="va-summary-strip">
          <div className="va-summary-chip va-summary-chip--warning">
            <span className="va-summary-chip__label">Pending</span>
            <span className="va-summary-chip__value">{pendingCount}</span>
          </div>
          <div className="va-summary-chip va-summary-chip--success">
            <span className="va-summary-chip__label">Approved</span>
            <span className="va-summary-chip__value">{approvedCount}</span>
          </div>
          <div className="va-summary-chip va-summary-chip--error">
            <span className="va-summary-chip__label">Rejected</span>
            <span className="va-summary-chip__value">{rejectedCount}</span>
          </div>
          <div className="va-summary-chip va-summary-chip--neutral">
            <span className="va-summary-chip__label">Total</span>
            <span className="va-summary-chip__value">{items.length}</span>
          </div>
        </div>
      </div>

      <div className="va-grid-wrap va-approvals-grid responsive-table-wrap custom-scroll">
        <DataView
          className="va-data-view"
          columnDefs={columnDefs}
          rowData={items}
          emptyState={
            <ModuleEmptyState
              variant="blank"
              title="No approval requests to review"
              message="New booking, shipping instruction, and VGM approval requests will appear here."
            />
          }
          allowedViewModes={["list"]}
          defaultViewMode="list"
          renderToolbar={() => null}
          listOptions={{
            ...profileHandlers,
            showToolbar: { showTotalCount: true, fullScreen: true },
            pagination: true,
            paginationPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
            sideBar: true,
            defaultColDef: { filter: true },
            gridOptions: {
              suppressCellFocus: true,
            },
          }}
        />
      </div>
    </div>
  );
}
