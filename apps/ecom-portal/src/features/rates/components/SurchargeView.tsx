// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Card, Flex, Select, Space, Spin, Tag, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["rates", "common", "modules"]);
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
              title={t("actions.viewSurchargeHistory")}
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
      headerName: t("surchargeView.columns.chargeName"),
      field: "chargeName",
      minWidth: 200,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Text className="rates-cell-title">{params.data?.chargeName}</Text>
      ),
    },
    {
      headerName: t("surchargeView.columns.chargeCode"),
      field: "chargeCode",
      minWidth: 130,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Tag color="purple">{params.data?.chargeCode}</Tag>
      ),
    },
    {
      headerName: t("rateList.columns.origin"),
      field: "origin",
      minWidth: 150,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Text className="rates-cell-title">{params.data?.origin}</Text>
      ),
    },
    {
      headerName: t("tariff.columns.portOfLoad"),
      field: "loadRegion",
      minWidth: 160,
    },
    {
      headerName: t("tariff.columns.portOfDischarge"),
      field: "dischargeRegion",
      minWidth: 160,
    },
    {
      headerName: t("rateList.columns.delivery"),
      field: "delivery",
      minWidth: 150,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Text className="rates-cell-title">{params.data?.delivery}</Text>
      ),
    },
    {
      headerName: t("surchargeView.columns.cargoType"),
      field: "eqpType",
      minWidth: 160,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Tag color="blue">{params.data?.eqpType}</Tag>
      ),
    },
    {
      headerName: t("tariff.columns.currency"),
      field: "currency",
      width: 100,
    },
    {
      headerName: t("tariff.columns.amount"),
      field: "amount",
      minWidth: 140,
      cellRenderer: (params: { data?: SurchargeDTO }) => (
        <Text strong className="text-amount-error rates-amount">
          {params.data?.currency} ${params.data?.amount.toFixed(2)}
        </Text>
      ),
    },
    {
      headerName: t("surchargeView.columns.nor"),
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
      title={t("errors.surchargesLoadTitle")}
      message={t("errors.loadFailedMessage")}
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant={pol || pod ? "filtered" : "blank"}
      title={t("empty.surchargesTitle")}
      message={t("empty.surchargesMessage")}
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
            <Text strong>{t("surchargeView.filterHeading")}</Text>
          </Space>

          <Select
            placeholder={t("tariff.portOfLoad")}
            allowClear
            size="large"
            className="rates-filter-select"
            value={pol}
            onChange={setPol}
            options={[
              { label: t("options.ports.USNYC_short"), value: "USNYC" },
              { label: t("options.ports.DEHAM_short"), value: "DEHAM" },
            ]}
          />

          <Select
            placeholder={t("tariff.portOfDischarge")}
            allowClear
            size="large"
            className="rates-filter-select"
            value={pod}
            onChange={setPod}
            options={[
              { label: t("options.ports.SGSIN_short"), value: "SGSIN" },
              { label: t("options.ports.CNSHA_short"), value: "CNSHA" },
            ]}
          />
        </Flex>
      </Card>

      <Spin spinning={isLoading} tip={t("surchargeView.loading")}>
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
