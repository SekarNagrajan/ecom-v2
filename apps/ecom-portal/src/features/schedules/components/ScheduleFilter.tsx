// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton, FormInput } from "@solverminds/shared-ui";
import { Card, Space } from "antd";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";

interface ScheduleFilterProps {
  form: UseFormReturn<{ originPort?: string; destinationPort?: string }>;
  onSearch: (values: { originPort?: string; destinationPort?: string }) => void;
  onReset: () => void;
  isLoading: boolean;
}

export function ScheduleFilter({
  form,
  onSearch,
  onReset,
  isLoading,
}: ScheduleFilterProps) {
  const { t } = useTranslation(["schedules", "common", "modules"]);

  return (
    <Card className="schedule-filter-card">
      <form onSubmit={form.handleSubmit(onSearch)}>
        <Space size="middle" wrap className="schedule-filter-toolbar">
          <Space size="middle" wrap>
            <div className="schedule-filter-field">
              <FormInput
                control={form.control}
                name="originPort"
                label={t("filters.originPort")}
                placeholder={t("filters.originPlaceholder")}
              />
            </div>
            <div className="schedule-filter-field">
              <FormInput
                control={form.control}
                name="destinationPort"
                label={t("filters.destinationPort")}
                placeholder={t("filters.destinationPlaceholder")}
              />
            </div>
          </Space>
          <Space className="schedule-filter-actions">
            <AppButton
              type="primary"
              htmlType="submit"
              icon={<AppIcon icon={Icons.search} size={16} />}
              loading={isLoading}
            >
              {t("filters.searchVesselSchedules")}
            </AppButton>
            <AppButton
              danger
              onClick={onReset}
              icon={<AppIcon icon={Icons.refreshCw} size={16} tone="delete" />}
            >
              {t("common:actions.reset")}
            </AppButton>
          </Space>
        </Space>
      </form>
    </Card>
  );
}
