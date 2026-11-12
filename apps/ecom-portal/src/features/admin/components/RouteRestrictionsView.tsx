// Modified by Sekar Nagarajan (2026-11-12 15:40)
/**
 * Route Restrictions — origin/destination lanes per service loop in a DataView grid. Restricting
 * a lane asks for confirmation; releasing does not. Each toggle PUTs the full list (the endpoint
 * replaces the set), so there is no page-level draft state.
 */
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import { Tag, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  ModuleEmptyState,
  buildClearFiltersAction,
} from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import type { ServiceRestriction } from "../types/admin.types";
import { AdminFilterPills } from "./shared/AdminFilterPills";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminStatusPill } from "./shared/AdminStatusPill";

const { Text } = Typography;

type RouteFilter = "all" | "open" | "restricted";

interface RouteRestrictionsViewProps {
  restrictions: ServiceRestriction[];
  onSave: (items: ServiceRestriction[]) => Promise<void>;
  isSaving: boolean;
  isFetching: boolean;
}

function LaneCell({ pol, pod }: { pol: string; pod: string }) {
  return (
    <span className="admin-lane" aria-label={`${pol} to ${pod}`}>
      <span className="admin-lane__port">{pol}</span>
      <AppIcon icon={Icons.arrowRight} size={14} className="admin-lane__arrow" />
      <span className="admin-lane__port">{pod}</span>
    </span>
  );
}

export function RouteRestrictionsView({
  restrictions,
  onSave,
  isSaving,
  isFetching,
}: RouteRestrictionsViewProps) {
  const confirm = useConfirm();
  const { profileHandlers } = useLocalGridProfiles("admin-route-restrictions");
  const [filter, setFilter] = useState<RouteFilter>("all");

  const rows =
    filter === "all"
      ? restrictions
      : restrictions.filter((r) => r.isRestricted === (filter === "restricted"));

  const applyToggle = (row: ServiceRestriction, isRestricted: boolean) =>
    onSave(
      restrictions.map((item) =>
        item.id === row.id ? { ...item, isRestricted } : item,
      ),
    );

  const handleRestrict = (row: ServiceRestriction) => {
    confirm.danger({
      title: "Restrict Route",
      content: `Restrict ${row.polCode} → ${row.podCode} on ${row.serviceLoop}? Customers can no longer book this lane.`,
      okText: "Restrict",
      cancelText: "Cancel",
      onOk: () => applyToggle(row, true),
    });
  };

  const columnDefs: DataViewColumn<ServiceRestriction>[] = [
    {
      ...buildActionsColumn<ServiceRestriction>({
        field: "id",
        width: 96,
        cellRenderer: (params) => {
          const row = params.data;
          if (!row) return null;
          return (
            <ListActionsRow>
              {row.isRestricted ? (
                <ListActionButton
                  title="Release Route"
                  tone="approve"
                  disabled={isSaving}
                  icon={<AppIcon icon={Icons.checkCircle} size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    void applyToggle(row, false);
                  }}
                />
              ) : (
                <ListActionButton
                  title="Restrict Route"
                  tone="reject"
                  disabled={isSaving}
                  icon={<AppIcon icon={Icons.ban} size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestrict(row);
                  }}
                />
              )}
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      headerName: "Status",
      field: "isRestricted",
      width: 130,
      cellRenderer: (params: { value?: boolean }) => (
        <AdminStatusPill tone={params.value ? "error" : "success"}>
          {params.value ? "Restricted" : "Open"}
        </AdminStatusPill>
      ),
      valueFormatter: (params) => (params.value ? "Restricted" : "Open"),
    },
    {
      headerName: "Lane",
      colId: "lane",
      flex: 1.2,
      minWidth: 200,
      valueGetter: (params) =>
        params.data ? `${params.data.polCode} → ${params.data.podCode}` : "",
      cellRenderer: (params: { data?: ServiceRestriction }) =>
        params.data ? (
          <LaneCell pol={params.data.polCode} pod={params.data.podCode} />
        ) : null,
    },
    {
      headerName: "Service Loop",
      field: "serviceLoop",
      flex: 1,
      minWidth: 140,
    },
    {
      headerName: "Tenant",
      field: "tenantId",
      width: 130,
      cellRenderer: (params: { value?: string }) =>
        params.value ? <Tag className="admin-code-tag">{params.value}</Tag> : null,
    },
    {
      headerName: "Reason",
      field: "reason",
      flex: 1.5,
      minWidth: 180,
      cellRenderer: (params: { value?: string }) =>
        params.value ? (
          <Text>{params.value}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  return (
    <AdminSectionPage>
      <div className="admin-route-form">
        <AdminFilterPills<RouteFilter>
          ariaLabel="Filter routes by status"
          value={filter}
          onChange={setFilter}
          items={[
            { key: "all", label: "All", tone: "primary" },
            { key: "open", label: "Open", tone: "success" },
            { key: "restricted", label: "Restricted", tone: "error" },
          ]}
        />

        <div className="admin-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columnDefs}
            loading={isFetching || isSaving}
            emptyState={
              <ModuleEmptyState
                variant="filtered"
                title="No routes match this filter"
                actions={[buildClearFiltersAction(() => setFilter("all"))]}
              />
            }
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="admin-data-view"
            listOptions={{
              ...profileHandlers,
              showToolbar: { showTotalCount: true, fullScreen: true },
              sideBar: true,
              pagination: true,
              paginationPageSize: 20,
              pageSizeOptions: [10, 20, 50, 100],
              defaultColDef: { filter: true },
              gridOptions: {
                domLayout: "autoHeight",
                getRowId: (params: { data: ServiceRestriction }) => params.data.id,
              },
            }}
          />
        </div>
      </div>
    </AdminSectionPage>
  );
}
