// Modified by Antigravity (2026-08-21 23:57)
// SurchargeView AG-Grid component aligned with ApplicationResource_en.properties keys:
// ecom.surcharge.chargename=Charge Name
// ecom.surcharge.chargecode=Charge Code
// ecom.surcharge.origin=Origin
// ecom.surcharge.pol=Port of Load
// ecom.surcharge.pod=Port Of Discharge
// ecom.surcharge.delivery=Delivery
// ecom.surcharge.cargotype=Cargo Type
// ecom.surcharge.currency=Currency
// ecom.surcharge.amount=Amount
// ecom.surcharge.nor=NOR

import { FilterOutlined, HistoryOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Card, Flex, Select, Space, Spin, Tag, theme, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useSurchargesQuery } from '../api/rates.queries';
import { SurchargeDTO } from '../types/rates.types';

const { Text } = Typography;

export function SurchargeView() {
  const { token } = theme.useToken();
  const [pol, setPol] = useState<string | undefined>();
  const [pod, setPod] = useState<string | undefined>();

  const { data: surcharges = [], isLoading } = useSurchargesQuery({ pol, pod });

  const columnDefs: DataViewColumn<SurchargeDTO>[] = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'id',
        sortable: false,
        width: 110,
        pinned: 'left',
        cellRenderer: (params: { data?: SurchargeDTO }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <Tooltip title="View Surcharge History">
              <AppButton
                type="text"
                size="small"
                icon={<HistoryOutlined style={{ color: '#722ed1', fontSize: 16 }} />}
              />
            </Tooltip>
          );
        },
      },
      {
        headerName: 'Charge Name',
        field: 'chargeName',
        minWidth: 200,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.chargeName}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Charge Code',
        field: 'chargeCode',
        minWidth: 130,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Tag color="purple">{params.data?.chargeCode}</Tag>
        ),
      },
      {
        headerName: 'Origin',
        field: 'origin',
        minWidth: 150,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.origin}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Port of Load',
        field: 'loadRegion',
        minWidth: 160,
      },
      {
        headerName: 'Port Of Discharge',
        field: 'dischargeRegion',
        minWidth: 160,
      },
      {
        headerName: 'Delivery',
        field: 'delivery',
        minWidth: 150,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.delivery}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Cargo Type',
        field: 'eqpType',
        minWidth: 160,
        cellRenderer: (params: { data?: SurchargeDTO }) => <Tag color="blue">{params.data?.eqpType}</Tag>,
      },
      {
        headerName: 'Currency',
        field: 'currency',
        width: 100,
      },
      {
        headerName: 'Amount',
        field: 'amount',
        minWidth: 140,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Text strong style={{ color: '#cf1322', fontSize: 14 }}>
            {params.data?.currency} ${params.data?.amount.toFixed(2)}
          </Text>
        ),
      },
      {
        headerName: 'NOR',
        field: 'isNor',
        width: 100,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Tag color={params.data?.isNor ? 'orange' : 'default'}>
            {params.data?.isNor ? 'Y' : 'N'}
          </Tag>
        ),
      },
    ],
    []
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Filter Toolbar */}
      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Flex gap="middle" align="center" wrap="wrap">
          <Space>
            <FilterOutlined style={{ color: token.colorPrimary }} />
            <Text strong>Filter Surcharge:</Text>
          </Space>

          <Select
            placeholder="Port of Load"
            allowClear
            style={{ width: 200 }}
            value={pol}
            onChange={setPol}
            options={[
              { label: 'USNYC - New York', value: 'USNYC' },
              { label: 'DEHAM - Hamburg', value: 'DEHAM' },
            ]}
          />

          <Select
            placeholder="Port Of Discharge"
            allowClear
            style={{ width: 200 }}
            value={pod}
            onChange={setPod}
            options={[
              { label: 'SGSIN - Singapore', value: 'SGSIN' },
              { label: 'CNSHA - Shanghai', value: 'CNSHA' },
            ]}
          />
        </Flex>
      </Card>

      {/* Surcharge AG Grid DataView with CRM Spin Overlay */}
      <Spin spinning={isLoading} tip="Loading surcharge breakdown...">
        <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
          <DataView
            data={surcharges}
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
