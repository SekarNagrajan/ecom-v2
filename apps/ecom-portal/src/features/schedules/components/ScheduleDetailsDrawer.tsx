import React from 'react';
import { Descriptions, Tag, Divider } from 'antd';
import { AppDrawer, AppButton } from '@solverminds/shared-ui';
import type { ScheduleItem } from '../types/schedules.types';

interface ScheduleDetailsDrawerProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
}

export const ScheduleDetailsDrawer: React.FC<ScheduleDetailsDrawerProps> = ({ schedule, open, onClose }) => {
  if (!schedule) return null;

  return (
    <AppDrawer
      title={`Schedule Details: ${schedule.vesselName} (${schedule.voyage})`}
      dialogSize="md"
      open={open}
      onClose={onClose}
      extra={
        <AppButton onClick={onClose} type="default">
          Close
        </AppButton>
      }
    >
      <Descriptions title="Vessel & Service" column={1} bordered size="small">
        <Descriptions.Item label="Vessel Name">{schedule.vesselName}</Descriptions.Item>
        <Descriptions.Item label="Voyage Number">{schedule.voyage}</Descriptions.Item>
        <Descriptions.Item label="Service Code">
          <Tag color="blue">{schedule.serviceCode}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '16px 0' }} />

      <Descriptions title="Routing & Schedule" column={1} bordered size="small">
        <Descriptions.Item label="Origin Port">{schedule.polPortName} ({schedule.polPortId})</Descriptions.Item>
        <Descriptions.Item label="Destination Port">{schedule.podPortName} ({schedule.podPortId})</Descriptions.Item>
        <Descriptions.Item label="POL Terminal">{schedule.polTerminal}</Descriptions.Item>
        <Descriptions.Item label="Estimated Departure (ETD)">{schedule.etd}</Descriptions.Item>
        <Descriptions.Item label="Estimated Arrival (ETA)">{schedule.eta}</Descriptions.Item>
        <Descriptions.Item label="Transit Duration">{schedule.transitTimeDays} Days</Descriptions.Item>
      </Descriptions>
    </AppDrawer>
  );
};
