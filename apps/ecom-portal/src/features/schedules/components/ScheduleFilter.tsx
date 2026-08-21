import React from 'react';
import { Card, Space } from 'antd';
import { UseFormReturn } from 'react-hook-form';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { AppButton, FormInput } from '@solverminds/shared-ui';

interface ScheduleFilterProps {
  form: UseFormReturn<{ originPort?: string; destinationPort?: string }>;
  onSearch: (values: { originPort?: string; destinationPort?: string }) => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ScheduleFilter: React.FC<ScheduleFilterProps> = ({ form, onSearch, onReset, isLoading }) => {
  return (
    <Card style={{ marginBottom: 16, borderRadius: 8 }}>
      <form onSubmit={form.handleSubmit(onSearch)}>
        <Space size="middle" wrap style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Space size="middle" wrap>
            <div style={{ width: 240 }}>
              <FormInput
                control={form.control}
                name="originPort"
                label="Origin Port"
                placeholder="e.g. USNYC or New York"
              />
            </div>
            <div style={{ width: 240 }}>
              <FormInput
                control={form.control}
                name="destinationPort"
                label="Destination Port"
                placeholder="e.g. SGSIN or Singapore"
              />
            </div>
          </Space>
          <Space style={{ marginBottom: 16 }}>
            <AppButton type="primary" htmlType="submit" icon={<SearchOutlined />} loading={isLoading}>
              Search Vessel Schedules
            </AppButton>
            <AppButton onClick={onReset} icon={<ReloadOutlined />}>
              Reset
            </AppButton>
          </Space>
        </Space>
      </form>
    </Card>
  );
};
