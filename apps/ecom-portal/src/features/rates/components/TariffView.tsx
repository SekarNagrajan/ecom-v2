// Modified by sekar nagarajan (2026-08-21 23:35)

import { EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Card, Flex, Select, Space, Spin, Tag, theme, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useTariffsQuery } from '../api/rates.queries';
import { TariffDTO } from '../types/rates.types';

const { Text } = Typography;

export function TariffView() {
  const { token } = theme.useToken();
  const [loadPort, setLoadPort] = useState<string | undefined>();
  const [dischPort, setDischPort] = useState<string | undefined>();

  const { data: tariffs = [], isLoading } = useTariffsQuery({ loadPort, dischPort });

  const columnDefs: DataViewColumn<TariffDTO>[] = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'id',
        sortable: false,
        width: 110,
        pinned: 'left',
        cellRenderer: (params: { data?: TariffDTO }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <Tooltip title="View Published Tariff Terms & Rate Rules">
              <AppButton
                type="text"
                size="small"
                icon={<EyeOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />}
              />
            </Tooltip>
          );
        },
      },
      {
        headerName: 'Port of Loading (POL)',
        field: 'loadPort',
        minWidth: 160,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.loadPort}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{params.data?.loadPortName}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Port of Discharge (POD)',
        field: 'dischPort',
        minWidth: 160,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.dischPort}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{params.data?.dischPortName}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Equipment Type',
        field: 'eqpType',
        minWidth: 160,
        cellRenderer: (params: { data?: TariffDTO }) => <Tag color="blue">{params.data?.eqpType}</Tag>,
      },
      {
        headerName: 'Commodity',
        field: 'commodityName',
        minWidth: 200,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Space direction="vertical" size={0}>
            <Text>{params.data?.commodityName}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Code: {params.data?.commodityCode}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Currency',
        field: 'currency',
        width: 100,
      },
      {
        headerName: 'Published Tariff Rate',
        field: 'tariffAmount',
        minWidth: 150,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Text strong style={{ color: '#3f8600', fontSize: 14 }}>
            {params.data?.currency} ${params.data?.tariffAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        ),
      },
      {
        headerName: 'Effective Validity',
        field: 'effectiveFrom',
        minWidth: 180,
        cellRenderer: (params: { data?: TariffDTO }) => (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {params.data?.effectiveFrom} to {params.data?.effectiveTo}
          </Text>
        ),
      },
    ],
    [token.colorPrimary]
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Filter Toolbar */}
      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Flex gap="middle" align="center" wrap="wrap">
          <Space>
            <FilterOutlined style={{ color: token.colorPrimary }} />
            <Text strong>Filter Published Tariffs:</Text>
          </Space>

          <Select
            placeholder="Select Origin (POL)"
            allowClear
            style={{ width: 200 }}
            value={loadPort}
            onChange={setLoadPort}
            options={[
              { label: 'USNYC - New York', value: 'USNYC' },
              { label: 'DEHAM - Hamburg', value: 'DEHAM' },
              { label: 'NLRTM - Rotterdam', value: 'NLRTM' },
              { label: 'INNSA - Nhava Sheva', value: 'INNSA' },
            ]}
          />

          <Select
            placeholder="Select Destination (POD)"
            allowClear
            style={{ width: 200 }}
            value={dischPort}
            onChange={setDischPort}
            options={[
              { label: 'SGSIN - Singapore', value: 'SGSIN' },
              { label: 'USNYC - New York', value: 'USNYC' },
              { label: 'CNSHA - Shanghai', value: 'CNSHA' },
              { label: 'AEDXB - Jebel Ali', value: 'AEDXB' },
            ]}
          />
        </Flex>
      </Card>

      {/* Main Tariff AG Grid DataView Container with CRM Spin Overlay */}
      <Spin spinning={isLoading} tip="Loading published freight tariffs...">
        <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
          <DataView
            data={tariffs}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={10}
            style={{ height: 480 }}
          />
        </Card>
      </Spin>
    </Space>
  );
}
