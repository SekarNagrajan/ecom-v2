// Tracking Containers Table Surface Component — AG Grid DataView Implementation
// Parity with TrackingDetails.jsp datatablebytrack table
// Follows agenct.md and @solverminds/shared-ui/data-view rules
// Modified by sekar nagarajan (2026-08-21)

import {
  BarcodeOutlined,
  GlobalOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { DataView, DataViewColumn } from '@solverminds/shared-ui/data-view';
import { Badge, Flex, Space, Tag, theme, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';
import type { ContainerEquipment } from '../types/tracking.types';

const { Text } = Typography;

interface TrackingContainersTableProps {
  containers: ContainerEquipment[];
  onViewMovements: (container: ContainerEquipment) => void;
}

export function TrackingContainersTable({ containers, onViewMovements }: TrackingContainersTableProps) {
  const { token } = theme.useToken();

  // AG Grid DataView Column Definitions — Actions Column FIRST per agenct.md
  const columnDefs: DataViewColumn<ContainerEquipment>[] = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'containerNo',
        sortable: false,
        width: 140,
        pinned: 'left',
        cellRenderer: (params: { data?: ContainerEquipment }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <Space size={6}>
              <Tooltip title="View Container Event Log & Movements">
                <AppButton
                  type="text"
                  size="small"
                  icon={<HistoryOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />}
                  onClick={() => onViewMovements(record)}
                />
              </Tooltip>
              <Tooltip title="Interactive Container Live Map">
                <AppButton
                  type="text"
                  size="small"
                  icon={<GlobalOutlined style={{ color: '#722ed1', fontSize: 16 }} />}
                  onClick={() => onViewMovements(record)}
                />
              </Tooltip>
            </Space>
          );
        },
      },
      {
        headerName: 'Container No & Seal',
        field: 'containerNo',
        sortable: true,
        width: 220,
        cellRenderer: (params: { data?: ContainerEquipment }) => {
          const record = params.data;
          if (!record) return <Text type="secondary">-</Text>;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.2 }}>
                <BarcodeOutlined style={{ color: token.colorPrimary }} />
                <Text strong style={{ fontSize: 13 }}>
                  {record.containerNo}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.2 }}>
                Seal: {record.sealNo} | {record.containerType}
              </Text>
            </div>
          );
        },
      },
      {
        headerName: 'Latest Activity',
        field: 'latestActivity',
        sortable: true,
        width: 240,
        cellRenderer: (params: { value?: string }) => (
          <Text strong style={{ color: token.colorTextHeading, fontSize: 13 }}>
            {params.value || '-'}
          </Text>
        ),
      },
      {
        headerName: 'Location & Facility',
        field: 'activityLocation',
        sortable: true,
        width: 240,
        cellRenderer: (params: { value?: string }) => (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {params.value || '-'}
          </Text>
        ),
      },
      {
        headerName: 'Activity Timestamp',
        field: 'activityDate',
        sortable: true,
        width: 170,
        cellRenderer: (params: { value?: string }) => (
          params.value ? <Tag color="blue">{params.value}</Tag> : <Text type="secondary">-</Text>
        ),
      },
      {
        headerName: 'Status',
        field: 'status',
        sortable: true,
        width: 140,
        cellRenderer: (params: { value?: string }) => {
          const val = params.value || '';
          if (!val) return <Text type="secondary">-</Text>;
          const isTransit = val === 'IN_TRANSIT';
          return (
            <Tag color={isTransit ? 'cyan' : 'green'} style={{ borderRadius: 10 }}>
              {val.replace('_', ' ')}
            </Tag>
          );
        },
      },
    ],
    [onViewMovements, token]
  );

  return (
    <div
      style={{
        background: token.colorBgContainer,
        borderRadius: 16,
        padding: '16px 20px',
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <DataView
        style={{ height: 340 }}
        columnDefs={columnDefs}
        rowData={containers}
        allowedViewModes={['list']}
        renderToolbar={() => (
          <Flex align="center" justify="space-between" style={{ marginBottom: 12 }}>
            <Space align="center" size={8}>
              <Text strong style={{ fontSize: 15 }}>
                Transport Equipment & Containers
              </Text>
              <Badge count={containers.length} style={{ backgroundColor: token.colorError }} />
            </Space>
          </Flex>
        )}
        listOptions={{
          gridOptions: {
            domLayout: 'autoHeight',
            animateRows: true,
            pagination: false,
          },
        }}
      />
    </div>
  );
}
