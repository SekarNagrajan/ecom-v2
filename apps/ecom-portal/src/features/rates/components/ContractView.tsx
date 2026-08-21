// Modified by Antigravity (2026-08-21 23:58)
// ContractView AG-Grid component aligned with ApplicationResource_en.properties keys:
// rates.head.agreedrate=Agreed Rate
// rates.head.subtocharges=Subject to Charges
// rates.head.soc=SOC
// rates.head.carrterms=Trans. Service
// ecom.rr.ratenum=Rate No

import { EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Card, Flex, Select, Space, Spin, Tag, theme, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useContractsQuery } from '../api/rates.queries';
import { ContractDTO } from '../types/rates.types';
import { ContractSurchargeModal } from './ContractSurchargeModal';

const { Text } = Typography;

export function ContractView() {
  const { token } = theme.useToken();
  const [pol, setPol] = useState<string | undefined>();
  const [pod, setPod] = useState<string | undefined>();
  const [selectedContract, setSelectedContract] = useState<ContractDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: contracts = [], isLoading } = useContractsQuery({ pol, pod });

  const handleOpenSurcharges = (contract: ContractDTO) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const columnDefs: DataViewColumn<ContractDTO>[] = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'id',
        sortable: false,
        width: 120,
        pinned: 'left',
        cellRenderer: (params: { data?: ContractDTO }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <Tooltip title="View Subject to Charges Breakdown">
              <AppButton
                type="text"
                size="small"
                icon={<EyeOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />}
                onClick={() => handleOpenSurcharges(record)}
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
          <Text strong style={{ color: token.colorPrimary }}>{params.data?.contractNo}</Text>
        ),
      },
      {
        headerName: 'Rate No',
        field: 'rateNo',
        minWidth: 150,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Tag color="cyan">{params.data?.rateNo}</Tag>
        ),
      },
      {
        headerName: 'Customer Name',
        field: 'customerName',
        minWidth: 200,
      },
      {
        headerName: 'Port of Load',
        field: 'originPort',
        minWidth: 160,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.originPort}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{params.data?.originPortName}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Port of Discharge',
        field: 'deliveryPort',
        minWidth: 160,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Space direction="vertical" size={0}>
            <Text strong>{params.data?.deliveryPort}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{params.data?.deliveryPortName}</Text>
          </Space>
        ),
      },
      {
        headerName: 'Eqp Type',
        field: 'eqpType',
        minWidth: 160,
        cellRenderer: (params: { data?: ContractDTO }) => <Tag color="blue">{params.data?.eqpType}</Tag>,
      },
      {
        headerName: 'Commodity',
        field: 'commodityName',
        minWidth: 180,
      },
      {
        headerName: 'Agreed Rate',
        field: 'oceanFreight',
        minWidth: 160,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Text strong style={{ color: '#3f8600', fontSize: 14 }}>
            {params.data?.currency} ${params.data?.oceanFreight.toFixed(2)}
          </Text>
        ),
      },
      {
        headerName: 'Subject to Charges',
        field: 'subjectToChargesAmount',
        minWidth: 160,
        cellRenderer: (params: { data?: ContractDTO }) => (
          <Text style={{ color: '#cf1322', fontSize: 13 }}>
            + {params.data?.currency} ${params.data?.subjectToChargesAmount.toFixed(2)}
          </Text>
        ),
      },
      {
        headerName: 'SOC',
        field: 'soc',
        width: 90,
      },
      {
        headerName: 'Trans. Service',
        field: 'carrTerms',
        minWidth: 130,
      },
      {
        headerName: 'Validity Window',
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
            <Text strong>Filter Contract Rates:</Text>
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
            placeholder="Port of Discharge"
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

      {/* Contract Rates AG Grid DataView with CRM Spin Overlay */}
      <Spin spinning={isLoading} tip="Loading service contract rates...">
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

      {/* Contract Surcharge Breakdown Drawer */}
      <ContractSurchargeModal
        contract={selectedContract}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Space>
  );
}
