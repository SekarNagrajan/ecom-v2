// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Descriptions, Divider, Tag } from "antd";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["schedules", "common", "modules"]);

  if (!schedule) return null;

  return (
    <AppDrawer
      title={t("details.title", {
        vessel: schedule.vesselName,
        voyage: schedule.voyage,
      })}
      dialogSize="md"
      open={open}
      onClose={onClose}
      classNames={{ body: "schedule-drawer-body custom-scroll" }}
      extra={
        <AppButton onClick={onClose} type="default">
          {t("common:actions.close")}
        </AppButton>
      }
    >
      <Descriptions
        title={t("details.vesselAndService")}
        column={1}
        bordered
        size="small"
      >
        <Descriptions.Item label={t("details.vesselName")}>
          {schedule.vesselName}
        </Descriptions.Item>
        <Descriptions.Item label={t("details.voyageNumber")}>
          {schedule.voyage}
        </Descriptions.Item>
        <Descriptions.Item label={t("details.serviceCode")}>
          <Tag color="blue">{schedule.serviceCode}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider className="schedule-divider" />

      <Descriptions
        title={t("details.routingAndSchedule")}
        column={1}
        bordered
        size="small"
      >
        <Descriptions.Item label={t("details.originPort")}>
          {schedule.polPortName} ({schedule.polPortId})
        </Descriptions.Item>
        <Descriptions.Item label={t("details.destinationPort")}>
          {schedule.podPortName} ({schedule.podPortId})
        </Descriptions.Item>
        <Descriptions.Item label={t("details.polTerminal")}>
          {schedule.polTerminal}
        </Descriptions.Item>
        <Descriptions.Item label={t("details.estimatedDeparture")}>
          {schedule.etd}
        </Descriptions.Item>
        <Descriptions.Item label={t("details.estimatedArrival")}>
          {schedule.eta}
        </Descriptions.Item>
        <Descriptions.Item label={t("details.transitDuration")}>
          {t("details.transitDays", { count: schedule.transitTimeDays })}
        </Descriptions.Item>
      </Descriptions>
    </AppDrawer>
  );
}
