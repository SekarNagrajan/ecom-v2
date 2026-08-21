// Modified by sekar nagarajan (2026-08-21 23:36)

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
            <Tooltip title="View Surcharge Revision History & Circular">
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
        headerName: 'Charge Details',
        field: 'chargeName',
        minWidth: 220,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.chargeName}</Text>
            <Tag color="purple">{params.data?.chargeCode}</Tag>
          </Space>
        ),
      },
      {
        headerName: 'Origin / POL',
        field: 'origin',
        minWidth: 160,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.origin}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{params.data?.loadRegion}</Text>
          </Space>
        ),
      },
      {
        headerName: 'POD / Delivery',
        field: 'delivery',
        minWidth: 160,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.delivery}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{params.data?.dischargeRegion}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Equipment Type',
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
        headerName: 'Surcharge Amount',
        field: 'amount',
        minWidth: 150,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Text strong style={{ color: '#cf1322', fontSize: 14 }}>
            {params.data?.currency} ${params.data?.amount.toFixed(2)}
          </Text>
        ),
      },
      {
        headerName: 'NOR Flag',
        field: 'isNor',
        width: 110,
        cellRenderer: (params: { data?: SurchargeDTO }) => (
          <Tag color={params.data?.isNor ? 'orange' : 'default'}>
            {params.data?.isNor ? 'NOR Applicable' : 'Standard'}
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
            <Text strong>Filter Surcharges & Accessorials:</Text>
          </Space>

          <Select
            placeholder="Select Origin (POL)"
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
            placeholder="Select Destination (POD)"
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
