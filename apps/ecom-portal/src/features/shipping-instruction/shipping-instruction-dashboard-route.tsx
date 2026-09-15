// Modified by Sekar Nagarajan (2026-09-15 11:45)
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { Card, Tag } from "antd";
import { useCallback, useMemo, useState } from "react";

import { NavShippingInstructionIcon } from "../../components/icons/nav-svg-icons";
import { buildActionsColumn } from "../../components/shared/build-actions-column";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { useModuleCardPagination } from "../../components/shared/hooks/use-module-card-pagination";
import { useModuleViewMode } from "../../components/shared/hooks/use-module-view-mode";
import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { ModuleCardViewPanel } from "../../components/shared/module-card-view-panel";
import { MODULE_TITLES } from "../../constants/module-titles";
import { useCancelSiMutation, useSiListQuery } from "./api/si.queries";
import { SiListActions } from "./components/list/si-list-actions";
import { SiListCard } from "./components/list/si-list-card";
import { SiModuleStyles } from "./components/si-module-styles";
import { SiViewDrawer } from "./components/view/SiViewDrawer";
import type { SIListDTO } from "./types/si.types";
import { getSiStatusTagColor } from "./utils/si-status";

const VIEW_MODE_KEY = "ecom.si.viewMode";

export function ShippingInstructionDashboardRoute() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const [selectedRecord, setSelectedRecord] = useState<SIListDTO | null>(null);
  const { viewMode, setViewMode } = useModuleViewMode(VIEW_MODE_KEY);
  const {
    page: cardPage,
    pageSize: cardPageSize,
    onPaginationChange: onCardPaginationChange,
  } = useModuleCardPagination();

  const { data: siList = [], isLoading, isError, refetch } = useSiListQuery();
  const cancelMutation = useCancelSiMutation();

  const openWizard = useCallback(
    (id: string) => {
      navigate({ to: `/app/shipping-instruction/wizard/${id}` });
    },
    [navigate],
  );

  const handleView = useCallback((record: SIListDTO) => {
    setSelectedRecord(record);
  }, []);

  const handleRowDoubleClick = useCallback(
    (event: RowDoubleClickedEvent<SIListDTO>) => {
      const record = event.data;
      if (!record) return;
      if (record.status === "Create SI" || record.status === "Draft") {
        openWizard(record.id);
        return;
      }
      handleView(record);
    },
    [handleView, openWizard],
  );

  const handleCancel = useCallback(
    (record: SIListDTO) => {
      confirm.danger({
        title: "Cancel Shipping Instruction",
        content: "Are you sure you want to cancel this Shipping Instruction?",
        okText: "Yes",
        cancelText: "No",
        onOk: async () => {
          try {
            await cancelMutation.mutateAsync(record.id);
            toast.success(
              `Shipping Instruction ${record.siNo || record.id} cancelled.`,
            );
          } catch {
            toast.error("Failed to cancel Shipping Instruction.");
          }
        },
      });
    },
    [cancelMutation, confirm, toast],
  );

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title="Couldn't load shipping instructions"
      message="The request didn't complete. Check your connection and try again."
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant="blank"
      title="No shipping instructions yet"
      message="Shipping instructions will appear here when they are created for confirmed bookings."
    />
  );

  const columnDefs = useMemo<DataViewColumn<SIListDTO>[]>(
    () => [
      buildActionsColumn<SIListDTO>({
        field: "id",
        width: 150,
        cellRenderer: (params: { data?: SIListDTO }) => {
          const data = params.data;
          if (!data) return null;
          return (
            <SiListActions
              record={data}
              onOpenWizard={openWizard}
              onView={handleView}
              onCancel={handleCancel}
            />
          );
        },
      }),
      {
        field: "status",
        headerName: "Status",
        cellRenderer: (params: { value?: string }) => (
          <Tag
            className="module-status-tag"
            color={getSiStatusTagColor(params.value ?? "")}
          >
            {params.value}
          </Tag>
        ),
      },
      { field: "bookingNo", headerName: "Booking No", isPrimary: true },
      { field: "blNo", headerName: "B/L No" },
      { field: "siNo", headerName: "SI No" },
      { field: "agencyRefNo", headerName: "Agency Ref No" },
      { field: "origin", headerName: "Origin", isSecondary: true },
      { field: "delivery", headerName: "Delivery" },
      { field: "createdDate", headerName: "Created Date" },
      { field: "submittedDate", headerName: "Submitted Date" },
    ],
    [handleCancel, handleView, openWizard],
  );

  const renderCard = useCallback(
    (item: SIListDTO, state: { isSelected: boolean }) => (
      <SiListCard
        record={item}
        isSelected={state.isSelected}
        onOpenWizard={openWizard}
        onView={handleView}
        onCancel={handleCancel}
      />
    ),
    [handleCancel, handleView, openWizard],
  );

  return (
    <FeaturePageShell>
      <SiModuleStyles />
      <Card className="feature-page-card si-page-card" bordered={false}>
        <div className="si-page-layout">
          <div className="si-page-header">
            <ModuleScreenHeader
              icon={NavShippingInstructionIcon}
              title={MODULE_TITLES.shippingInstructions}
              recordCount={siList.length}
              subtitle="Review SI status, open drafts, and submit shipping instructions for confirmed bookings."
              marginBottom={0}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              viewModePlacement="after"
            />
          </div>

          <div className="si-grid-wrap si-grid-wrap--no-toolbar">
            <div className="si-list-grid responsive-table-wrap custom-scroll ag-theme-alpine">
              {isError && siList.length === 0 && !isLoading ? (
                emptyState
              ) : (
                <ModuleCardViewPanel active={viewMode === "card"}>
                  <DataView
                    key={viewMode}
                    rowData={siList}
                    loading={isLoading}
                    emptyState={emptyState}
                    columnDefs={columnDefs}
                    defaultViewMode={viewMode}
                    allowedViewModes={["list", "card"]}
                    onViewModeChange={setViewMode}
                    renderToolbar={() => null}
                    className="si-data-view"
                    listOptions={{
                      showToolbar: false,
                      sideBar: false,
                      defaultColDef: { filter: true },
                      gridOptions: {
                        getRowId: (params) => params.data.id,
                        onRowDoubleClicked: handleRowDoubleClick,
                      },
                    }}
                    cardOptions={{
                      renderCard,
                      minCardWidth: 360,
                      paginationMode: "pagination",
                      page: cardPage,
                      pageSize: cardPageSize,
                      totalCount: siList.length,
                      onPaginationChange: onCardPaginationChange,
                      enableLongPressSelection: false,
                      surfacePadding: 16,
                      gutter: [16, 16],
                      surfaceBackground: "transparent",
                    }}
                  />
                </ModuleCardViewPanel>
              )}
            </div>
          </div>
        </div>
      </Card>

      {selectedRecord ? (
        <SiViewDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      ) : null}
    </FeaturePageShell>
  );
}
