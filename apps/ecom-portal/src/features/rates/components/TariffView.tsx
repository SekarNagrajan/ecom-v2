// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Card, Flex, Select, Space, Spin, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { useTariffsQuery } from "../api/rates.queries";
import type { TariffDTO } from "../types/rates.types";

const { Text } = Typography;

export function TariffView() {
  const [loadPort, setLoadPort] = useState<string | undefined>();
  const [dischPort, setDischPort] = useState<string | undefined>();

  const { data: tariffs = [], isLoading } = useTariffsQuery({
    loadPort,
    dischPort,
  });

  const columnDefs: DataViewColumn<TariffDTO>[] = [
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      width: 110,
      pinned: "left",
      cellRenderer: (params: { data?: TariffDTO }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Tooltip title="View Published Tariff Terms">
            <AppButton
              type="text"
              size="small"
              icon={
                <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
              }
            />
          </Tooltip>
        );
      },
    },
    {
      headerName: "Port of Load",
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
      headerName: "Port of Discharge",
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
      headerName: "Eqp Type",
      field: "eqpType",
      minWidth: 160,
      cellRenderer: (params: { data?: TariffDTO }) => (
        <Tag color="blue">{params.data?.eqpType}</Tag>
      ),
    },
    {
      headerName: "Commodity",
      field: "commodityName",
      minWidth: 200,
      cellRenderer: (params: { data?: TariffDTO }) => (
        <div className="rates-cell-stack">
          <Text className="rates-cell-body">{params.data?.commodityName}</Text>
          <Text className="rates-cell-sub">
            Code: {params.data?.commodityCode}
          </Text>
        </div>
      ),
    },
    {
      headerName: "Currency",
      field: "currency",
      width: 100,
    },
    {
      headerName: "Amount",
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
      headerName: "From Date",
      field: "effectiveFrom",
      minWidth: 120,
      cellRenderer: (params: { data?: TariffDTO }) => (
        <Text className="rates-cell-sub">{params.data?.effectiveFrom}</Text>
      ),
    },
    {
      headerName: "To Date",
      field: "effectiveTo",
      minWidth: 120,
      cellRenderer: (params: { data?: TariffDTO }) => (
        <Text className="rates-cell-sub">{params.data?.effectiveTo}</Text>
      ),
    },
  ];

  return (
    <div className="rates-stack">
      <Card className="rates-filter-card">
        <Flex gap="middle" align="center" wrap="wrap">
          <Space>
            <AppIcon icon={Icons.filter} size={16} />
            <Text strong>Filter Tariff:</Text>
          </Space>

          <Select
            placeholder="Port of Load"
            allowClear
            size="large"
            className="rates-filter-select"
            value={loadPort}
            onChange={setLoadPort}
            options={[
              { label: "USNYC - New York", value: "USNYC" },
              { label: "DEHAM - Hamburg", value: "DEHAM" },
              { label: "NLRTM - Rotterdam", value: "NLRTM" },
              { label: "INNSA - Nhava Sheva", value: "INNSA" },
            ]}
          />

          <Select
            placeholder="Port of Discharge"
            allowClear
            size="large"
            className="rates-filter-select"
            value={dischPort}
            onChange={setDischPort}
            options={[
              { label: "SGSIN - Singapore", value: "SGSIN" },
              { label: "USNYC - New York", value: "USNYC" },
              { label: "CNSHA - Shanghai", value: "CNSHA" },
              { label: "AEDXB - Jebel Ali", value: "AEDXB" },
            ]}
          />
        </Flex>
      </Card>

      <Spin spinning={isLoading} tip="Loading published freight tariffs...">
        <Card className="rates-grid-panel">
          <div className="rates-grid responsive-table-wrap custom-scroll">
            <DataView
              data={tariffs}
              columnDefs={columnDefs}
              pagination
              paginationPageSize={10}
              className="rates-grid"
            />
          </div>
        </Card>
      </Spin>
    </div>
  );
}
