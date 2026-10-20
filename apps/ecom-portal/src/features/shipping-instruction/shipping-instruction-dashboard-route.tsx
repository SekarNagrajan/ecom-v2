// Modified by Sekar Nagarajan (2026-09-29 16:45)
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { Card, Tag } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { NavShippingInstructionIcon } from "../../components/icons/nav-svg-icons";
import { buildActionsColumn } from "../../components/shared/build-actions-column";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { useModuleCardPagination } from "../../components/shared/hooks/use-module-card-pagination";
import { useModuleViewMode } from "../../components/shared/hooks/use-module-view-mode";
import { ModuleCardViewPanel } from "../../components/shared/module-card-view-panel";
import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { useLocalGridProfiles } from "../../components/shared/use-local-grid-profiles";
import { useModuleTitles } from "../../i18n/use-module-titles";
import { useCancelSiMutation, useSiListQuery } from "./api/si.queries";
import { SiListActions } from "./components/list/si-list-actions";
import { SiListCard } from "./components/list/si-list-card";
import { SiModuleStyles } from "./components/si-module-styles";
import { SiViewDrawer } from "./components/view/SiViewDrawer";
import type { SIListDTO, SIStatus } from "./types/si.types";
import { getSiStatusLabel, getSiStatusTagColor } from "./utils/si-status";

const VIEW_MODE_KEY = "ecom.si.viewMode";

export function ShippingInstructionDashboardRoute() {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const { profileHandlers } = useLocalGridProfiles("shipping-instruction");
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
        title: t("confirms.cancelTitle"),
        content: t("confirms.cancelContent"),
        okText: t("common:actions.yes"),
        cancelText: t("common:actions.no"),
        onOk: async () => {
          try {
            await cancelMutation.mutateAsync(record.id);
            toast.success(
              t("toasts.cancelSuccess", {
                siNo: record.siNo || record.id,
              }),
            );
          } catch {
            toast.error(t("toasts.cancelFailed"));
          }
        },
      });
    },
    [cancelMutation, confirm, t, toast],
  );

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title={t("empty.loadErrorTitle")}
      message={t("empty.loadErrorMessage")}
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant="blank"
      title={t("empty.noResultsTitle")}
      message={t("empty.noResultsMessage")}
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
        headerName: t("columns.status"),
        cellRenderer: (params: { value?: string }) => {
          const status = (params.value ?? "") as SIStatus;
          return (
            <Tag
              className="module-status-tag"
              color={getSiStatusTagColor(status)}
            >
              {params.value ? getSiStatusLabel(status, t) : params.value}
            </Tag>
          );
        },
      },
      {
        field: "bookingNo",
        headerName: t("columns.bookingNo"),
        isPrimary: true,
      },
      { field: "blNo", headerName: t("columns.blNo") },
      { field: "siNo", headerName: t("columns.siNo") },
      { field: "agencyRefNo", headerName: t("columns.agencyRefNo") },
      { field: "origin", headerName: t("columns.origin"), isSecondary: true },
      { field: "delivery", headerName: t("columns.delivery") },
      { field: "createdDate", headerName: t("columns.createdDate") },
      { field: "submittedDate", headerName: t("columns.submittedDate") },
    ],
    [handleCancel, handleView, openWizard, t],
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
              // recordCount={siList.length}
              subtitle={t("subtitle")}
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
                      ...profileHandlers,
                      showToolbar: { showTotalCount: true, fullScreen: true },
                      sideBar: true,
                      pagination: true,
                      paginationPageSize: 20,
                      pageSizeOptions: [10, 20, 50, 100],
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
