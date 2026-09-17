// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Card, Flex, Select, Space, Spin, Tag, Typography } from "antd";
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
  buildRetryAction,
} from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { useSurchargesQuery } from "../api/rates.queries";
import type { SurchargeDTO } from "../types/rates.types";

const { Text } = Typography;

export function SurchargeView() {
  const { profileHandlers } = useLocalGridProfiles("rates-surcharge");
  const [pol, setPol] = useState<string | undefined>();
  const [pod, setPod] = useState<string | undefined>();

  const {
    data: surcharges = [],
    isLoading,
    isError,
    refetch,
  } = useSurchargesQuery({ pol, pod });

  const columnDefs: DataViewColumn<SurchargeDTO>[] = [
    buildActionsColumn<SurchargeDTO>({
      field: "id",
      width: 110,
      cellRenderer: (params: { data?: SurchargeDTO }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <ListActionsRow>
            <ListActionButton
              title="View Surcharge History"
              icon={
                <AppIcon
                  icon={Icons.history}
                  size={16}
                  gridAction
                  tone="history"
                />
              }
              onClick={() => undefined}
            />
          </ListActionsRow>
        );
      },
    }),
    {
      headerName: "Charge Name",
      field: "chargeName",
      minWidth: 200,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Text className="rates-cell-title">{params.data?.chargeName}</Text>
      ),
    },
    {
      headerName: "Charge Code",
      field: "chargeCode",
      minWidth: 130,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Tag color="purple">{params.data?.chargeCode}</Tag>
      ),
    },
    {
      headerName: "Origin",
      field: "origin",
      minWidth: 150,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Text className="rates-cell-title">{params.data?.origin}</Text>
      ),
    },
    {
      headerName: "Port of Load",
      field: "loadRegion",
      minWidth: 160,
    },
    {
      headerName: "Port Of Discharge",
      field: "dischargeRegion",
      minWidth: 160,
    },
    {
      headerName: "Delivery",
      field: "delivery",
      minWidth: 150,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Text className="rates-cell-title">{params.data?.delivery}</Text>
      ),
    },
    {
      headerName: "Cargo Type",
      field: "eqpType",
      minWidth: 160,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Tag color="blue">{params.data?.eqpType}</Tag>
      ),
    },
    {
      headerName: "Currency",
      field: "currency",
      width: 100,
    },
    {
      headerName: "Amount",
      field: "amount",
      minWidth: 140,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Text strong className="text-amount-error rates-amount">
          {params.data?.currency} ${params.data?.amount.toFixed(2)}
        </Text>
      ),
    },
    {
      headerName: "NOR",
      field: "isNor",
      width: 100,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Tag color={params.data?.isNor ? "orange" : "default"}>
          {params.data?.isNor ? "Y" : "N"}
        </Tag>
      ),
    },
  ];

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title="Couldn't load surcharges"
      message="The request didn't complete. Check your connection and try again."
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant={pol || pod ? "filtered" : "blank"}
      title="No surcharges found"
      message="Try a different port combination or clear the filters to see more charges."
      actions={
        pol || pod
          ? [
              buildClearFiltersAction(() => {
                setPol(undefined);
                setPod(undefined);
              }),
            ]
          : undefined
      }
    />
  );

  return (
    <div className="rates-stack">
      <Card className="rates-filter-card">
        <Flex gap="middle" align="center" wrap="wrap">
          <Space>
            <AppIcon icon={Icons.filter} size={16} />
            <Text strong>Filter Surcharge:</Text>
          </Space>

          <Select
            placeholder="Port of Load"
            allowClear
            size="large"
            className="rates-filter-select"
            value={pol}
            onChange={setPol}
            options={[
              { label: "USNYC - New York", value: "USNYC" },
              { label: "DEHAM - Hamburg", value: "DEHAM" },
            ]}
          />

          <Select
            placeholder="Port Of Discharge"
            allowClear
            size="large"
            className="rates-filter-select"
            value={pod}
            onChange={setPod}
            options={[
              { label: "SGSIN - Singapore", value: "SGSIN" },
              { label: "CNSHA - Shanghai", value: "CNSHA" },
            ]}
          />
        </Flex>
      </Card>

      <Spin spinning={isLoading} tip="Loading surcharge breakdown...">
        <Card className="rates-grid-panel">
          <div className="rates-grid responsive-table-wrap custom-scroll">
            <DataView
              rowData={surcharges}
              emptyState={emptyState}
              columnDefs={columnDefs}
              listOptions={{
                ...profileHandlers,
                showToolbar: { showTotalCount: true, fullScreen: true },
                sideBar: true,
                pagination: true,
                paginationPageSize: 10,
                pageSizeOptions: [10, 20, 50, 100],
                defaultColDef: { filter: true },
              }}
              className="rates-grid"
              renderToolbar={() => null}
            />
          </div>
        </Card>
      </Spin>
    </div>
  );
}
