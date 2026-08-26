// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Card, Flex, Select, Space, Spin, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { useContractsQuery } from "../api/rates.queries";
import type { ContractDTO } from "../types/rates.types";
import { ContractSurchargeModal } from "./ContractSurchargeModal";

const { Text } = Typography;

export function ContractView() {
  const [pol, setPol] = useState<string | undefined>();
  const [pod, setPod] = useState<string | undefined>();
  const [selectedContract, setSelectedContract] = useState<ContractDTO | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: contracts = [], isLoading } = useContractsQuery({ pol, pod });

  const handleOpenSurcharges = (contract: ContractDTO) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const columnDefs: DataViewColumn<ContractDTO>[] = [
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      width: 120,
      pinned: "left",
      cellRenderer: (params: { data?: ContractDTO }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Tooltip title="View Subject to Charges Breakdown">
            <AppButton
              type="text"
              size="small"
              icon={
                <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
              }
              onClick={() => handleOpenSurcharges(record)}
            />
          </Tooltip>
        );
      },
    },
    {
      headerName: "Contract No",
      field: "contractNo",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Text className="rates-cell-title rates-cell-title--primary">
          {params.data?.contractNo}
        </Text>
      ),
    },
    {
      headerName: "Rate No",
      field: "rateNo",
      minWidth: 150,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Tag color="cyan">{params.data?.rateNo}</Tag>
      ),
    },
    {
      headerName: "Customer Name",
      field: "customerName",
      minWidth: 200,
    },
    {
      headerName: "Port of Load",
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
      headerName: "Port of Discharge",
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
      headerName: "Eqp Type",
      field: "eqpType",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Tag color="blue">{params.data?.eqpType}</Tag>
      ),
    },
    {
      headerName: "Commodity",
      field: "commodityName",
      minWidth: 180,
    },
    {
      headerName: "Agreed Rate",
      field: "oceanFreight",
      minWidth: 160,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Text strong className="text-amount-success rates-amount">
          {params.data?.currency} ${params.data?.oceanFreight.toFixed(2)}
        </Text>
      ),
    },
    {
      headerName: "Subject to Charges",
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
      headerName: "SOC",
      field: "soc",
      width: 90,
    },
    {
      headerName: "Trans. Service",
      field: "carrTerms",
      minWidth: 130,
    },
    {
      headerName: "Validity Window",
      field: "effectiveFrom",
      minWidth: 180,
      cellRenderer: (params: { data?: ContractDTO }) => (
        <Text className="rates-cell-sub">
          {params.data?.effectiveFrom} to {params.data?.effectiveTo}
        </Text>
      ),
    },
  ];

  return (
    <div className="rates-stack">
      <Card className="rates-filter-card">
        <Flex gap="middle" align="center" wrap="wrap">
          <Space>
            <AppIcon icon={Icons.filter} size={16} />
            <Text strong>Filter Contract Rates:</Text>
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
            placeholder="Port of Discharge"
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

      <Spin spinning={isLoading} tip="Loading service contract rates...">
        <Card className="rates-grid-panel">
          <div className="rates-grid responsive-table-wrap custom-scroll">
            <DataView
              data={contracts}
              columnDefs={columnDefs}
              pagination
              paginationPageSize={10}
              className="rates-grid"
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
