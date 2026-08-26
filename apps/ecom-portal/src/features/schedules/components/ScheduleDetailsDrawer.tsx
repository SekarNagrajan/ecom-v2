// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Descriptions, Divider, Tag } from "antd";

import type { ScheduleItem } from "../types/schedules.types";

interface ScheduleDetailsDrawerProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
}

export function ScheduleDetailsDrawer({
  schedule,
  open,
  onClose,
}: ScheduleDetailsDrawerProps) {
  if (!schedule) return null;

  return (
    <AppDrawer
      title={`Schedule Details: ${schedule.vesselName} (${schedule.voyage})`}
      dialogSize="md"
      open={open}
      onClose={onClose}
      classNames={{ body: "schedule-drawer-body custom-scroll" }}
      extra={
        <AppButton onClick={onClose} type="default">
          Close
        </AppButton>
      }
    >
      <Descriptions title="Vessel & Service" column={1} bordered size="small">
        <Descriptions.Item label="Vessel Name">
          {schedule.vesselName}
        </Descriptions.Item>
        <Descriptions.Item label="Voyage Number">
          {schedule.voyage}
        </Descriptions.Item>
        <Descriptions.Item label="Service Code">
          <Tag color="blue">{schedule.serviceCode}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider className="schedule-divider" />

      <Descriptions title="Routing & Schedule" column={1} bordered size="small">
        <Descriptions.Item label="Origin Port">
          {schedule.polPortName} ({schedule.polPortId})
        </Descriptions.Item>
        <Descriptions.Item label="Destination Port">
          {schedule.podPortName} ({schedule.podPortId})
        </Descriptions.Item>
        <Descriptions.Item label="POL Terminal">
          {schedule.polTerminal}
        </Descriptions.Item>
        <Descriptions.Item label="Estimated Departure (ETD)">
          {schedule.etd}
        </Descriptions.Item>
        <Descriptions.Item label="Estimated Arrival (ETA)">
          {schedule.eta}
        </Descriptions.Item>
        <Descriptions.Item label="Transit Duration">
          {schedule.transitTimeDays} Days
        </Descriptions.Item>
      </Descriptions>
    </AppDrawer>
  );
}
