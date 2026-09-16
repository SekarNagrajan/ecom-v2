// Modified by Sekar Nagarajan (2026-09-15 15:35)
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { useMemo } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import type { CombinedRateItem } from "../types/rates.types";
import {
  canBookRate,
  canViewRateSurcharges,
  formatRateAmount,
  RateListTypeCell,
} from "./list/rate-list-cells";

interface RateListProps {
  rates: CombinedRateItem[];
  isLoading: boolean;
  hasSearched?: boolean;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
}

export function RateList({
  rates,
  isLoading,
  hasSearched = true,
  onBookNow,
  onViewSurcharges,
  onShareRate,
}: RateListProps) {
  const { profileHandlers } = useLocalGridProfiles("rates-list");
  const columnDefs = useMemo<DataViewColumn<CombinedRateItem>[]>(
    () => [
      buildActionsColumn<CombinedRateItem>({
        field: "id",
        width: 150,
        cellRenderer: (params: { data?: CombinedRateItem }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <ListActionsRow>
              {canBookRate(record) ? (
                <ListActionButton
                  title="Book at This Rate"
                  icon={<AppIcon icon={Icons.plus} size={16} tone="create" />}
                  tone="create"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookNow(record);
                  }}
                />
              ) : null}
              {canViewRateSurcharges(record) ? (
                <ListActionButton
                  title="View Surcharges"
                  icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
                  tone="view"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewSurcharges(record);
                  }}
                />
              ) : null}
              <ListActionButton
                title="Share Rate Quote"
                icon={<AppIcon icon={Icons.mail} size={16} tone="navigate" />}
                tone="navigate"
                onClick={(e) => {
                  e.stopPropagation();
                  onShareRate(record);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      {
        headerName: "Type",
        field: "type",
        width: 120,
        minWidth: 110,
        cellRenderer: (params: { data?: CombinedRateItem }) => {
          const record = params.data;
          if (!record) return null;
          return <RateListTypeCell record={record} />;
        },
      },
      {
        headerName: "Code",
        field: "code",
        flex: 1,
        minWidth: 120,
        isPrimary: true,
      },
      // {
      //   headerName: "Title",
      //   field: "title",
      //   flex: 1.2,
      //   minWidth: 150,
      // },
      {
        headerName: "Origin",
        field: "originPortName",
        flex: 1.1,
        minWidth: 140,
        isSecondary: true,
      },
      {
        headerName: "Origin Code",
        field: "originPort",
        width: 120,
        minWidth: 110,
      },
      {
        headerName: "Delivery",
        field: "deliveryPortName",
        flex: 1.1,
        minWidth: 140,
      },
      {
        headerName: "Delivery Code",
        field: "deliveryPort",
        width: 120,
        minWidth: 110,
      },
      {
        headerName: "Equipment",
        field: "eqpType",
        flex: 1,
        minWidth: 130,
      },
      {
        headerName: "Commodity",
        field: "commodityName",
        flex: 1,
        minWidth: 120,
        valueGetter: (params: { data?: CombinedRateItem }) => {
          const record = params.data;
          if (!record) return "";
          return record.commodityName || record.commodity;
        },
      },
      {
        headerName: "Currency",
        field: "currency",
        width: 100,
        minWidth: 90,
      },
      {
        headerName: "Base",
        field: "baseAmount",
        width: 110,
        minWidth: 100,
        valueFormatter: (params: { value?: number }) =>
          params.value != null ? formatRateAmount(params.value) : "",
      },
      {
        headerName: "Surcharges",
        field: "surchargeAmount",
        width: 110,
        minWidth: 100,
        valueFormatter: (params: { value?: number }) =>
          params.value != null ? formatRateAmount(params.value) : "",
      },
      {
        headerName: "Total",
        field: "totalEstimatedAmount",
        width: 110,
        minWidth: 100,
        valueFormatter: (params: { value?: number }) =>
          params.value != null ? formatRateAmount(params.value) : "",
      },
      {
        headerName: "Valid From",
        field: "effectiveFrom",
        width: 120,
        minWidth: 110,
      },
      {
        headerName: "Valid To",
        field: "effectiveTo",
        width: 120,
        minWidth: 110,
      },
    ],
    [onBookNow, onViewSurcharges, onShareRate],
  );

  const emptyState = !hasSearched ? (
    <ModuleEmptyState
      variant="blank"
      title="Search for rates"
      message="Choose your search criteria and click Search to view published rates."
      artSize="md"
    />
  ) : (
    <ModuleEmptyState
      variant="filtered"
      title="No rates found"
      message="Try different ports, equipment, or commodity filters."
      artSize="md"
    />
  );

  const hasRecommended = rates.some((item) => item.isRecommended);

  return (
    <div className="rates-grid-wrap rates-grid-wrap--no-toolbar">
      <div className="rates-list-grid responsive-table-wrap custom-scroll ag-theme-alpine">
        <DataView
          key="list"
          columnDefs={columnDefs}
          rowData={rates}
          loading={isLoading}
          emptyState={emptyState}
          defaultViewMode="list"
          allowedViewModes={["list"]}
          renderToolbar={() => null}
          className="rates-data-view"
          listOptions={{
            ...profileHandlers,
            showToolbar: { showTotalCount: false, fullScreen: true },
            sideBar: false,
            pagination: true,
            paginationPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
            defaultColDef: { filter: true },
            gridOptions: {
              getRowId: (params) => params.data.id,
              getRowClass: (params) =>
                params.data?.isRecommended
                  ? "rates-list-row--recommended"
                  : undefined,
              onRowDoubleClicked: (
                event: RowDoubleClickedEvent<CombinedRateItem>,
              ) => {
                if (event.data && canBookRate(event.data)) {
                  onBookNow(event.data);
                }
              },
            },
          }}
        />
      </div>
      {hasRecommended ? (
        <div
          className="rates-list-legend"
          role="note"
          aria-label="Recommended rate legend"
        >
          <span className="rates-list-legend__swatch" aria-hidden />
          <span className="rates-list-legend__text">
            Lowest published freight (recommended)
          </span>
        </div>
      ) : null}
    </div>
  );
}
