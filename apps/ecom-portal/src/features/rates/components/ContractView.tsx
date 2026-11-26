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
import { useContractsQuery } from "../api/rates.queries";
import type { ContractDTO } from "../types/rates.types";
import { ContractSurchargeModal } from "./ContractSurchargeModal";

const { Text } = Typography;

export function ContractView() {
  const { t } = useTranslation(["rates", "common", "modules"]);
  const { profileHandlers } = useLocalGridProfiles("rates-contract");
  const [pol, setPol] = useState<string | undefined>();
  const [pod, setPod] = useState<string | undefined>();
  const [selectedContract, setSelectedContract] = useState<ContractDTO | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: contracts = [],
    isLoading,
    isError,
    refetch,
  } = useContractsQuery({ pol, pod });

  const handleOpenSurcharges = (contract: ContractDTO) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const columnDefs: DataViewColumn<ContractDTO>[] = [
    buildActionsColumn<ContractDTO>({
      field: "id",
      width: 120,
      cellRenderer: (params: { data?: ContractDTO }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <ListActionsRow>
            <ListActionButton
              title={t("actions.viewSubjectToCharges")}
              icon={
                <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
              }
              onClick={() => handleOpenSurcharges(record)}
            />
          </ListActionsRow>
        );
      },
    }),
    {
      headerName: t("contract.columns.contractNo"),
      field: "contractNo",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Text className="rates-cell-title rates-cell-title--primary">
          {params.data?.contractNo}
        </Text>
      ),
    },
    {
      headerName: t("contract.columns.rateNo"),
      field: "rateNo",
      minWidth: 150,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Tag color="cyan">{params.data?.rateNo}</Tag>
      ),
    },
    {
      headerName: t("contract.columns.customerName"),
      field: "customerName",
      minWidth: 200,
    },
    {
      headerName: t("tariff.columns.portOfLoad"),
      field: "originPort",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <div className="rates-cell-stack">
          <Text className="rates-cell-title">{params.data?.originPort}</Text>
          <Text className="rates-cell-sub">{params.data?.originPortName}</Text>
        </div>
      ),
    },
    {
      headerName: t("tariff.columns.portOfDischarge"),
      field: "deliveryPort",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <div className="rates-cell-stack">
          <Text className="rates-cell-title">{params.data?.deliveryPort}</Text>
          <Text className="rates-cell-sub">
            {params.data?.deliveryPortName}
          </Text>
        </div>
      ),
    },
    {
      headerName: t("tariff.columns.eqpType"),
      field: "eqpType",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Tag color="blue">{params.data?.eqpType}</Tag>
      ),
    },
    {
      headerName: t("tariff.columns.commodity"),
      field: "commodityName",
      minWidth: 180,
    },
    {
      headerName: t("contract.columns.agreedRate"),
      field: "oceanFreight",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Text strong className="text-amount-success rates-amount">
          {params.data?.currency} ${params.data?.oceanFreight.toFixed(2)}
        </Text>
      ),
    },
    {
      headerName: t("contract.columns.subjectToCharges"),
      field: "subjectToChargesAmount",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Text className="text-amount-error rates-amount">
          + {params.data?.currency} $
          {params.data?.subjectToChargesAmount.toFixed(2)}
        </Text>
      ),
    },
    {
      headerName: t("contract.columns.soc"),
      field: "soc",
      width: 90,
    },
    {
      headerName: t("contract.columns.transService"),
      field: "carrTerms",
      minWidth: 130,
    },
    {
      headerName: t("contract.columns.validityWindow"),
      field: "effectiveFrom",
      minWidth: 180,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Text className="rates-cell-sub">
          {t("contract.validityRange", {
            from: params.data?.effectiveFrom,
            to: params.data?.effectiveTo,
          })}
        </Text>
      ),
    },
  ];

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title={t("errors.contractsLoadTitle")}
      message={t("errors.loadFailedMessage")}
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant={pol || pod ? "filtered" : "blank"}
      title={t("empty.contractsTitle")}
      message={t("empty.contractsMessage")}
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
            <Text strong>{t("contract.filterHeading")}</Text>
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

      <Spin spinning={isLoading} tip={t("contract.loading")}>
        <Card className="rates-grid-panel">
          <div className="rates-grid responsive-table-wrap custom-scroll">
            <DataView
              rowData={contracts}
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

      <ContractSurchargeModal
        contract={selectedContract}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
