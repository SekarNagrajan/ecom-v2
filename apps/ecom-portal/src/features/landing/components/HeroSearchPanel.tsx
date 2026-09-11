// Modified by Sekar Nagarajan (2026-09-11 14:35)
import { Flex, Grid, Spin, Tabs, theme } from "antd";
import { AppIcon, Icons } from "../../../components/icons";

import type { useLandingController } from "../hooks/use-landing-controller";
import type { LandingTab, TabConfig } from "../types/landing.types";
import { RatesSearchTab } from "./RatesSearchTab";
import { ScheduleSearchTab } from "./ScheduleSearchTab";
import { TrackingSearchTab } from "./TrackingSearchTab";

interface HeroSearchPanelProps {
  controller: ReturnType<typeof useLandingController>;
  tabConfig?: TabConfig;
}

export function HeroSearchPanel({ controller }: HeroSearchPanelProps) {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const isSearching = controller.isSearching;

  const tabLabelStyle = {
    fontSize: 16,
    fontWeight: 600,
    padding: "12px 0",
  };

  const tabItems = [
    {
      key: "schedules" as LandingTab,
      label: (
        <Flex align="center" gap={8} style={tabLabelStyle}>
          <AppIcon icon={Icons.calendar} size={18} />
          <span>Schedule</span>
        </Flex>
      ),
      children: (
        <ScheduleSearchTab
          form={controller.scheduleForm}
          onSubmit={controller.handleScheduleSubmit}
          isSearching={isSearching}
        />
      ),
    },
    {
      key: "tracking" as LandingTab,
      label: (
        <Flex align="center" gap={8} style={tabLabelStyle}>
          <AppIcon icon={Icons.mapPin} size={18} />
          <span>Tracking</span>
        </Flex>
      ),
      children: (
        <TrackingSearchTab
          form={controller.trackingForm}
          onSubmit={controller.handleTrackingSubmit}
          showImageCaptcha
          isSearching={isSearching}
        />
      ),
    },
    {
      key: "rates" as LandingTab,
      label: (
        <Flex align="center" gap={8} style={tabLabelStyle}>
          <AppIcon icon={Icons.dollarSign} size={18} />
          <span>Rates</span>
        </Flex>
      ),
      children: (
        <RatesSearchTab
          form={controller.ratesForm}
          onSubmit={controller.handleRatesSubmit}
          isSearching={isSearching}
        />
      ),
    },
  ];

  return (
    <div
      className={[
        isMobile
          ? "pub-landing__search-card pub-landing__search-card--mobile"
          : "pub-landing__search-card",
        isSearching ? "pub-landing__search-card--loading" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Tabs
        activeKey={controller.activeTab}
        onChange={(key) => controller.handleTabChange(key as LandingTab)}
        items={tabItems}
        size="large"
        className={
          isMobile
            ? "pub-landing__search-tabs pub-landing__search-tabs--mobile"
            : "pub-landing__search-tabs"
        }
        tabBarStyle={{
          marginBottom: 24,
          borderBottom: `2px solid ${token.colorBorderSecondary}`,
        }}
        tabBarGutter={isMobile ? 16 : 32}
      />
      <div
        className={
          isMobile
            ? "pub-landing__search-tabs-pad pub-landing__search-tabs-pad--mobile"
            : "pub-landing__search-tabs-pad"
        }
      />

      {isSearching ? (
        <div
          className="pub-landing__search-loading module-loading-center"
          role="status"
          aria-label="Loading"
        >
          <Spin size="medium" />
        </div>
      ) : null}
    </div>
  );
}
