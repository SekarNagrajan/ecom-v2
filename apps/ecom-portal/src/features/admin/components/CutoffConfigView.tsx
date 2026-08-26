// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton } from '@solverminds/shared-ui';
import { InputNumber, Table, Tag } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import type { CutoffConfig } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

interface CutoffConfigViewProps {
  cutoffConfigs: CutoffConfig[];
  onSave: (items: CutoffConfig[]) => void;
}

export function CutoffConfigView({ cutoffConfigs, onSave }: CutoffConfigViewProps) {
  const [data, setData] = React.useState<CutoffConfig[]>(cutoffConfigs);

  React.useEffect(() => {
    setData(cutoffConfigs);
  }, [cutoffConfigs]);

  const handleHourChange = (
    id: string,
    field: 'vgmCutoffHours' | 'siCutoffHours' | 'bookingCutoffHours',
    val: number
  ) => {
    setData(data.map((item) => (item.id === id ? { ...item, [field]: val } : item)));
  };

  const columns = [
    {
      title: 'Port Code',
      dataIndex: 'portCode',
      key: 'portCode',
      render: (val: string) => (
        <Tag className="admin-code-tag" color="blue">
          {val}
        </Tag>
      ),
    },
    {
      title: 'Vessel Name',
      dataIndex: 'vesselName',
      key: 'vesselName',
      render: (val: string) => <strong>{val}</strong>,
    },
    {
      title: 'Voyage No',
      dataIndex: 'voyageNo',
      key: 'voyageNo',
      render: (val: string) => (
        <Tag className="admin-code-tag" color="geekblue">
          {val}
        </Tag>
      ),
    },
    {
      title: 'VGM Cut-off (Hours Prior ETA)',
      dataIndex: 'vgmCutoffHours',
      key: 'vgmCutoffHours',
      render: (val: number, record: CutoffConfig) => (
        <InputNumber
          size="large"
          min={1}
          value={val}
          onChange={(newVal) => handleHourChange(record.id, 'vgmCutoffHours', newVal || 12)}
        />
      ),
    },
    {
      title: 'SI Cut-off (Hours Prior ETA)',
      dataIndex: 'siCutoffHours',
      key: 'siCutoffHours',
      render: (val: number, record: CutoffConfig) => (
        <InputNumber
          size="large"
          min={1}
          value={val}
          onChange={(newVal) => handleHourChange(record.id, 'siCutoffHours', newVal || 24)}
        />
      ),
    },
    {
      title: 'Booking Cut-off (Hours Prior ETA)',
      dataIndex: 'bookingCutoffHours',
      key: 'bookingCutoffHours',
      render: (val: number, record: CutoffConfig) => (
        <InputNumber
          size="large"
          min={1}
          value={val}
          onChange={(newVal) => handleHourChange(record.id, 'bookingCutoffHours', newVal || 48)}
        />
      ),
    },
  ];

  return (
    <AdminPanelShell
      icon={Icons.clock}
      title="Cut-off Time Configuration"
      subtitle="Set port and vessel call cut-off thresholds for VGM, SI, and Booking submissions."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.save} size={16} />}
          onClick={() => onSave(data)}
        >
          Save Cutoff Matrix
        </AppButton>
      }
    >
      <div className="responsive-table-wrap">
        <Table dataSource={data} columns={columns} rowKey="id" pagination={false} scroll={{ x: true }} />
      </div>
    </AdminPanelShell>
  );
}
