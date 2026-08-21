// Modified by sekar nagarajan (2026-08-21 23:38)

import { EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Card, Flex, Input, Space, Spin, Tag, theme, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useContractsQuery } from '../api/rates.queries';
import { ContractDTO } from '../types/rates.types';
import { ContractSurchargeModal } from './ContractSurchargeModal';

const { Text } = Typography;

export function ContractView() {
  const { token } = theme.useToken();
  const [contractNo, setContractNo] = useState<string | undefined>();
  const [selectedContract, setSelectedContract] = useState<ContractDTO | null>(null);

  const { data: contracts = [], isLoading } = useContractsQuery({ contractNo });

  const columnDefs: DataViewColumn<ContractDTO>[] = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'id',
        sortable: false,
        width: 110,
        pinned: 'left',
        cellRenderer: (params: { data?: ContractDTO }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <Tooltip title="View Included Surcharge Breakdown">
              <AppButton
                type="text"
                size="small"
                icon={<EyeOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />}
                onClick={() => setSelectedContract(record)}
              />
            </Tooltip>
          );
        },
      },
      {
        headerName: 'Contract No',
        field: 'contractNo',
        minWidth: 160,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.contractNo}</Text>
            <Tag color="cyan">{params.data?.rateNo}</Tag>
          </Space>
        ),
      },
      {
        headerName: 'Customer Name',
        field: 'customerName',
        minWidth: 200,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.customerName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{params.data?.customerCode}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Origin / Delivery',
        field: 'originPort',
        minWidth: 200,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Text style={{ fontSize: 13 }}>
            {params.data?.originPort} → {params.data?.deliveryPort}
          </Text>
        ),
      },
      {
        headerName: 'Equipment & Commodity',
        field: 'eqpType',
        minWidth: 200,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Space direction="vertical" size={0}>
            <Tag color="blue">{params.data?.eqpType}</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>{params.data?.commodityName}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Agreed Ocean Freight',
        field: 'oceanFreight',
        minWidth: 160,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Text strong style={{ color: '#3f8600', fontSize: 14 }}>
            {params.data?.currency} ${params.data?.oceanFreight.toFixed(2)}
          </Text>
        ),
      },
      {
        headerName: 'Subject to Surcharges',
        field: 'subjectToChargesAmount',
        minWidth: 160,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Text style={{ color: '#cf1322', fontSize: 13 }}>
            {params.data?.currency} ${params.data?.subjectToChargesAmount.toFixed(2)}
          </Text>
        ),
      },
      {
        headerName: 'SOC Flag',
        field: 'soc',
        width: 100,
      },
      {
        headerName: 'Carriage Terms',
        field: 'carrTerms',
        width: 130,
        cellRenderer: (params: { data?: ContractDTO }) => <Tag color="gold">{params.data?.carrTerms}</Tag>,
      },
      {
        headerName: 'Validity',
        field: 'effectiveFrom',
        minWidth: 180,
        cellRenderer: (params: { data?: ContractDTO }) => (
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
            <Text strong>Filter Freight Agreements:</Text>
          </Space>

          <Input.Search
            placeholder="Search Contract No / Customer Code"
            allowClear
            style={{ width: 300 }}
            onSearch={(val) => setContractNo(val || undefined)}
          />
        </Flex>
      </Card>

      {/* Contract Rates AG Grid DataView with CRM Spin Overlay */}
      <Spin spinning={isLoading} tip="Loading service contracts...">
        <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
          <DataView
            data={contracts}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={10}
            style={{ height: 480 }}
          />
        </Card>
      </Spin>

      {/* Surcharge Breakdown Modal */}
      <ContractSurchargeModal
        contract={selectedContract}
        open={Boolean(selectedContract)}
        onClose={() => setSelectedContract(null)}
      />
    </Space>
  );
}
