// Modified by Sekar Nagarajan (2026-11-12 23:55)
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import type { GridApi } from "ag-grid-community";
import { Tag, Typography } from "antd";
import { useRef, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { NavAgencyApprovalIcon } from "../../../components/icons/nav-svg-icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import { ListActionButton, ListActionsRow } from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { useModuleTitles } from "../../../i18n/use-module-titles";
import { vendorApprovalsApi } from "../api/vendor-approvals.api";
import { useVendorApprovalsQuery } from "../api/vendor-approvals.queries";
import type { ApprovalStatus, VendorApprovalItem } from "../types/vendor-approvals.types";
import { buildBulkConfirmContent, VendorApprovalsBulkBar } from "./VendorApprovalsBulkBar";
import { VendorApprovalsRejectModal } from "./VendorApprovalsRejectModal";
import { type SummaryFilter, VendorApprovalsSummaryPanel } from "./VendorApprovalsSummaryPanel";

const { Text } = Typography;

const TYPE_META: Record<VendorApprovalItem["type"], { color: string; label: string }> = {
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
  const MODULE_TITLES = useModuleTitles();
  const toast = useToast();
  const confirm = useConfirm();
  const { profileHandlers } = useLocalGridProfiles("vendor-approvals");
  // Queue derived from the ecombooking / ecomSI / ecom_vgmsolas fixtures through the data-source seam.
  const approvalsQuery = useVendorApprovalsQuery();
  // Optimistic status changes layered over the fetched queue until the next refetch.
  const [statusPatches, setStatusPatches] = useState<
    Record<string, Pick<VendorApprovalItem, "status" | "rejectRemarks">>
  >({});
  const items: VendorApprovalItem[] = (approvalsQuery.data ?? []).map((item) =>
    statusPatches[item.id] ? { ...item, ...statusPatches[item.id] } : item,
  );
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>("ALL");
  const [selectedRows, setSelectedRows] = useState<VendorApprovalItem[]>([]);
  const [rejectTargets, setRejectTargets] = useState<VendorApprovalItem[]>([]);
  const gridApiRef = useRef<GridApi<VendorApprovalItem> | null>(null);

  const selectedPending = selectedRows.filter((row) => row.status === "PENDING");
  const selectedPendingCount = selectedPending.length;
  const rejectModalOpen = rejectTargets.length > 0;

  const clearSelection = () => {
    gridApiRef.current?.deselectAll();
    setSelectedRows([]);
  };

  const applyStatus = async (
    ids: string[],
    status: Exclude<ApprovalStatus, "PENDING">,
    remarks?: string,
  ) => {
    if (ids.length === 0) return;
    try {
      await vendorApprovalsApi.applyStatus(ids, status, remarks);
    } catch {
      toast.error("Couldn't update the request status. Please try again.");
      return;
    }
    setStatusPatches((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        const current = items.find((item) => item.id === id);
        next[id] = {
          status,
          rejectRemarks: status === "REJECTED" ? remarks : current?.rejectRemarks,
        };
      });
      return next;
    });
    clearSelection();
    setRejectTargets([]);
    toast.success(
      status === "APPROVED"
        ? ids.length === 1
          ? "Request approved successfully."
          : `${ids.length} requests approved successfully.`
        : ids.length === 1
          ? "Request rejected successfully."
          : `${ids.length} requests rejected successfully.`,
    );
  };

  // Use confirm.show so Cancel is always available (success modals are OK-only).
  const handleApprove = (item: VendorApprovalItem) => {
    confirm.show({
      title: "Approve Request",
      content: `Approve ${item.referenceNo} for ${item.customerName}?`,
      okText: "Approve",
      cancelText: "Cancel",
      onOk: () => applyStatus([item.id], "APPROVED"),
    });
  };

  const handleReject = (item: VendorApprovalItem) => {
    setRejectTargets([item]);
  };

  const handleBulkApprove = () => {
    if (selectedPendingCount === 0) return;
    confirm.show({
      title:
        selectedPendingCount === 1 ? "Approve Request" : `Approve ${selectedPendingCount} Requests`,
      content: buildBulkConfirmContent(selectedPending, "approve"),
      okText: selectedPendingCount === 1 ? "Approve" : `Approve ${selectedPendingCount}`,
      cancelText: "Cancel",
      onOk: () =>
        applyStatus(
          selectedPending.map((row) => row.id),
          "APPROVED",
        ),
    });
  };

  const handleBulkReject = () => {
    if (selectedPendingCount === 0) return;
    setRejectTargets(selectedPending);
  };

  const handleRejectConfirm = (remarks: string) => {
    void applyStatus(
      rejectTargets.map((row) => row.id),
      "REJECTED",
      remarks,
    );
  };

  const handleSelectAllPending = () => {
    const api = gridApiRef.current;
    if (!api) return;
    api.forEachNode((node) => {
      if (node.data?.status === "PENDING") {
        node.setSelected(true);
      }
    });
  };

  const handleSummaryFilterChange = (filter: SummaryFilter) => {
    setSummaryFilter(filter);
    clearSelection();
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
              title={`Approve ${rec.referenceNo}`}
              ariaLabel={`Approve ${rec.referenceNo}`}
              icon={<AppIcon icon={Icons.checkCircle} size={16} tone="create" />}
              onClick={(event) => {
                event.stopPropagation();
                handleApprove(rec);
              }}
            />
            <ListActionButton
              title={`Reject ${rec.referenceNo}`}
              ariaLabel={`Reject ${rec.referenceNo}`}
              icon={<AppIcon icon={Icons.circleX} size={16} tone="delete" />}
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
      cellRenderer: (params: { value?: string }) => <strong>{params.value}</strong>,
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
        params.data ? `${params.data.originPort} → ${params.data.destPort}` : "",
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

  const visibleItems =
    summaryFilter === "ALL" ? items : items.filter((item) => item.status === summaryFilter);
  const pendingInViewCount = visibleItems.filter((item) => item.status === "PENDING").length;

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

      <VendorApprovalsSummaryPanel
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        totalCount={items.length}
        activeFilter={summaryFilter}
        onFilterChange={handleSummaryFilterChange}
      />

      <VendorApprovalsBulkBar
        selectedRows={selectedPending}
        pendingInViewCount={pendingInViewCount}
        onApprove={handleBulkApprove}
        onReject={handleBulkReject}
        onClear={clearSelection}
        onSelectAllPending={handleSelectAllPending}
      />

      <div className="va-grid-wrap va-approvals-grid responsive-table-wrap custom-scroll">
        <DataView
          loading={approvalsQuery.isLoading}
          className="va-data-view"
          columnDefs={columnDefs}
          rowData={visibleItems}
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
            selectionMode: "multiple",
            showCheckboxes: true,
            onGridReady: (params) => {
              gridApiRef.current = params.api;
            },
            onSelectionChanged: (rows) => setSelectedRows(rows as VendorApprovalItem[]),
            pagination: true,
            paginationPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
            sideBar: true,
            defaultColDef: { filter: true },
            rowSelection: {
              mode: "multiRow",
              checkboxes: true,
              headerCheckbox: true,
              enableClickSelection: false,
              hideDisabledCheckboxes: true,
              isRowSelectable: (node) => node.data?.status === "PENDING",
            },
            gridOptions: {
              suppressCellFocus: true,
              getRowId: (params) => params.data.id,
            },
          }}
        />
      </div>

      <VendorApprovalsRejectModal
        open={rejectModalOpen}
        items={rejectTargets}
        onCancel={() => setRejectTargets([])}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
