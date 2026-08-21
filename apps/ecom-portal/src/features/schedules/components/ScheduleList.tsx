import React from 'react';
import { Tag, Space, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
// @ts-ignore
import { DataView } from '@solverminds/shared-ui/data-view';
import type { ColDef } from 'ag-grid-community';
import type { ScheduleItem } from '../types/schedules.types';

interface ScheduleListProps {
  schedules: ScheduleItem[];
  isLoading: boolean;
  onViewDetails: (schedule: ScheduleItem) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ schedules, isLoading, onViewDetails }) => {
  const columnDefs: ColDef<ScheduleItem>[] = [
    {
      headerName: 'Actions',
      field: 'id',
      sortable: false,
      width: 100,
      pinned: 'left',
      cellRenderer: (params: { data?: ScheduleItem }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Tooltip title="View Voyage Details & Carbon Footprint">
            <AppButton
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: '#1677ff', fontSize: 16 }} />}
              onClick={() => onViewDetails(record)}
            />
          </Tooltip>
        );
      },
    },
    {
      headerName: 'Vessel / Voyage',
      field: 'vesselName',
      cellRenderer: (params: { data?: ScheduleItem }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#002B49' }}>{record.vesselName}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Voyage: {record.voyage} · Service: <Tag color="blue">{record.serviceCode}</Tag>
            </div>
          </div>
        );
      },
    },
    {
      headerName: 'Route',
      field: 'polPortId',
      cellRenderer: (params: { data?: ScheduleItem }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <div>
            <div>
              <strong>{record.polPortId}</strong> ➔ <strong>{record.podPortId}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Terminal: {record.polTerminal}</div>
          </div>
        );
      },
    },
    {
      headerName: 'ETD',
      field: 'etd',
    },
    {
      headerName: 'ETA',
      field: 'eta',
    },
    {
      headerName: 'Transit',
      field: 'transitTimeDays',
      valueFormatter: (params: { value?: number }) => (params.value ? `${params.value} days` : ''),
    },
  ];

  return <DataView columnDefs={columnDefs} rowData={schedules || []} loading={isLoading} />;
};
