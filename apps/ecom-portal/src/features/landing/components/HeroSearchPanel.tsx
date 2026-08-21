import {
  CalendarOutlined,
  CodeSandboxOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Flex, Tabs, theme } from 'antd';

import type { LandingTab, TabConfig } from '../types/landing.types';
import type { useLandingController } from '../hooks/use-landing-controller';
import { RatesSearchTab } from './RatesSearchTab';
import { ScheduleSearchTab } from './ScheduleSearchTab';
import { TrackingSearchTab } from './TrackingSearchTab';

interface HeroSearchPanelProps {
  controller: ReturnType<typeof useLandingController>;
  tabConfig?: TabConfig;
}

export function HeroSearchPanel({ controller }: HeroSearchPanelProps) {
  const { token } = theme.useToken();

  const tabLabelStyle = {
    fontSize: 16,
    fontWeight: 600,
    padding: '12px 0',
  };

  const tabItems = [
    {
      key: 'schedules' as LandingTab,
      label: (
        <Flex align="center" gap={8} style={tabLabelStyle}>
          <CalendarOutlined style={{ fontSize: 18 }} />
          <span>Schedule</span>
        </Flex>
      ),
      children: (
        <ScheduleSearchTab
          form={controller.scheduleForm}
          onSubmit={controller.handleScheduleSubmit}
        />
      ),
    },
    {
      key: 'tracking' as LandingTab,
      label: (
        <Flex align="center" gap={8} style={tabLabelStyle}>
          <CodeSandboxOutlined style={{ fontSize: 18 }} />
          <span>Tracking</span>
        </Flex>
      ),
      children: (
        <TrackingSearchTab
          form={controller.trackingForm}
          onSubmit={controller.handleTrackingSubmit}
          showImageCaptcha
        />
      ),
    },
    {
      key: 'rates' as LandingTab,
      label: (
        <Flex align="center" gap={8} style={tabLabelStyle}>
          <DollarOutlined style={{ fontSize: 18 }} />
          <span>Rates</span>
        </Flex>
      ),
      children: (
        <RatesSearchTab
          form={controller.ratesForm}
          onSubmit={controller.handleRatesSubmit}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Tabs
        activeKey={controller.activeTab}
        onChange={(key) => controller.handleTabChange(key as LandingTab)}
        items={tabItems}
        size="large"
        style={{ padding: '16px 32px 0' }}
        tabBarStyle={{
          marginBottom: 24,
          borderBottom: `2px solid ${token.colorBorderSecondary}`,
        }}
        tabBarGutter={32}
      />
      <div style={{ padding: '0 32px 32px' }}>
        {/* Tab content is rendered by the Tabs component items above */}
      </div>
    </div>
  );
}
