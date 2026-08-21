import {
  LeftOutlined,
  RightOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Select, Space, Typography, theme, Flex } from 'antd';
import React from 'react';

import { AppButton } from '../../button';
import type { CalendarHeaderProps } from '../calendar-types';

const { Text } = Typography;

const VIEW_LABELS: Record<CalendarHeaderProps['view'], string> = {
  dayGridMonth: 'Month',
  timeGridWeek: 'Week',
  timeGridDay: 'Day',
  listWeek: 'List',
};

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  views,
  onNavigatePrevious,
  onNavigateNext,
  onNavigateToday,
  onViewChange,
  action,
}) => {
  const { token } = theme.useToken();

  return (
    <Flex align="center" wrap justify="space-between" gap={token.marginSM}>
      <Space>
        <Button icon={<LeftOutlined />} onClick={onNavigatePrevious} />
        <Button onClick={onNavigateToday}>Today</Button>
        <Button icon={<RightOutlined />} onClick={onNavigateNext} />
      </Space>

      <Text strong style={{ fontSize: token.fontSizeLG }}>
        {currentDate.toFormat('MMMM yyyy')}
      </Text>

      <Space size="middle">
        <Select
          value={view}
          onChange={onViewChange}
          popupMatchSelectWidth={false}
          style={{ width: 120 }}
          options={views.map((option) => ({
            label: VIEW_LABELS[option],
            value: option,
          }))}
        />

        {action ? (
          <AppButton
            type="primary"
            icon={action.icon ?? <VideoCameraOutlined />}
            onClick={action.onClick}
          >
            {action.label}
          </AppButton>
        ) : null}
      </Space>
    </Flex>
  );
};
