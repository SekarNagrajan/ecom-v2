// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Card, Flex, Select, Space, Spin, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
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
import { useTariffsQuery } from "../api/rates.queries";
import type { TariffDTO } from "../types/rates.types";

const { Text } = Typography;

export function TariffView() {
  const { t } = useTranslation(["rates", "common", "modules"]);
  const { profileHandlers } = useLocalGridProfiles("rates-tariff");
  const [loadPort, setLoadPort] = useState<string | undefined>();
  const [dischPort, setDischPort] = useState<string | undefined>();

  const {
    data: tariffs = [],
    isLoading,
    isError,
    refetch,
  } = useTariffsQuery({
    loadPort,
    dischPort,
  });

  const loadPortOptions = useMemo(
    () => [
      { label: t("options.ports.USNYC_short"), value: "USNYC" },
      { label: t("options.ports.DEHAM_short"), value: "DEHAM" },
      { label: t("options.ports.NLRTM_short"), value: "NLRTM" },
      { label: t("options.ports.INNSA_short"), value: "INNSA" },
    ],
    [t],
  );

  const dischPortOptions = useMemo(
    () => [
      { label: t("options.ports.SGSIN_short"), value: "SGSIN" },
      { label: t("options.ports.USNYC_short"), value: "USNYC" },
      { label: t("options.ports.CNSHA_short"), value: "CNSHA" },
      { label: t("options.ports.AEDXB_short"), value: "AEDXB" },
    ],
    [t],
  );

  const columnDefs = useMemo<DataViewColumn<TariffDTO>[]>(
    () => [
      buildActionsColumn<TariffDTO>({
        field: "id",
        width: 110,
        cellRenderer: (params: { data?: TariffDTO }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <ListActionsRow>
              <ListActionButton
                title={t("actions.viewTariffTerms")}
                icon={
                  <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
                }
                onClick={() => undefined}
              />
            </ListActionsRow>
          );
        },
      }),
      {
        headerName: t("tariff.columns.portOfLoad"),
        field: "loadPort",
        minWidth: 160,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <div className="rates-cell-stack">
            <Text className="rates-cell-title">{params.data?.loadPort}</Text>
            <Text className="rates-cell-sub">{params.data?.loadPortName}</Text>
          </div>
        ),
      },
      {
        headerName: t("tariff.columns.portOfDischarge"),
        field: "dischPort",
        minWidth: 160,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <div className="rates-cell-stack">
            <Text className="rates-cell-title">{params.data?.dischPort}</Text>
            <Text className="rates-cell-sub">{params.data?.dischPortName}</Text>
          </div>
        ),
      },
      {
        headerName: t("tariff.columns.eqpType"),
        field: "eqpType",
        minWidth: 160,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Tag color="blue">{params.data?.eqpType}</Tag>
        ),
      },
      {
        headerName: t("tariff.columns.commodity"),
        field: "commodityName",
        minWidth: 200,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <div className="rates-cell-stack">
            <Text className="rates-cell-body">{params.data?.commodityName}</Text>
            <Text className="rates-cell-sub">
              {t("tariff.commodityCode", {
                code: params.data?.commodityCode ?? "",
              })}
            </Text>
          </div>
        ),
      },
      {
        headerName: t("tariff.columns.currency"),
        field: "currency",
        width: 100,
      },
      {
        headerName: t("tariff.columns.amount"),
        field: "tariffAmount",
        minWidth: 150,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Text strong className="text-amount-success rates-amount">
            {params.data?.currency} $
            {params.data?.tariffAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </Text>
        ),
      },
      {
        headerName: t("tariff.columns.fromDate"),
        field: "effectiveFrom",
        minWidth: 120,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Text className="rates-cell-sub">{params.data?.effectiveFrom}</Text>
        ),
      },
      {
        headerName: t("tariff.columns.toDate"),
        field: "effectiveTo",
        minWidth: 120,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Text className="rates-cell-sub">{params.data?.effectiveTo}</Text>
        ),
      },
    ],
    [t],
  );

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title={t("errors.tariffLoadTitle")}
      message={t("errors.tariffLoadMessage")}
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant={loadPort || dischPort ? "filtered" : "blank"}
      title={t("empty.tariffTitle")}
      message={t("empty.tariffMessage")}
      actions={
        loadPort || dischPort
          ? [
              buildClearFiltersAction(() => {
                setLoadPort(undefined);
                setDischPort(undefined);
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
            <Text strong>{t("tariff.filterHeading")}</Text>
          </Space>

          <Select
            placeholder={t("tariff.portOfLoad")}
            allowClear
            size="large"
            className="rates-filter-select"
            value={loadPort}
            onChange={setLoadPort}
            options={loadPortOptions}
          />

          <Select
            placeholder={t("tariff.portOfDischarge")}
            allowClear
            size="large"
            className="rates-filter-select"
            value={dischPort}
            onChange={setDischPort}
            options={dischPortOptions}
          />
        </Flex>
      </Card>

      <Spin spinning={isLoading} tip={t("tariff.loading")}>
        <Card className="rates-grid-panel">
          <div className="rates-grid responsive-table-wrap custom-scroll">
            <DataView
              rowData={tariffs}
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
