// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton, FormInput } from "@solverminds/shared-ui";
import { Card, Space } from "antd";
import type { UseFormReturn } from "react-hook-form";

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
  return (
    <Card className="schedule-filter-card">
      <form onSubmit={form.handleSubmit(onSearch)}>
        <Space size="middle" wrap className="schedule-filter-toolbar">
          <Space size="middle" wrap>
            <div className="schedule-filter-field">
              <FormInput
                control={form.control}
                name="originPort"
                label="Origin Port"
                placeholder="e.g. USNYC or New York"
              />
            </div>
            <div className="schedule-filter-field">
              <FormInput
                control={form.control}
                name="destinationPort"
                label="Destination Port"
                placeholder="e.g. SGSIN or Singapore"
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
              Search Vessel Schedules
            </AppButton>
            <AppButton
              danger
              onClick={onReset}
              icon={<AppIcon icon={Icons.refreshCw} size={16} tone="delete" />}
            >
              Reset
            </AppButton>
          </Space>
        </Space>
      </form>
    </Card>
  );
}
