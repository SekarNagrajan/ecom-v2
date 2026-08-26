// Modified by Sekar Nagarajan (2026-08-25 18:50)
import { AppButton } from "@solverminds/shared-ui";
import { Empty, Space, Spin, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { ScheduleItem } from "../types/schedules.types";

const { Text, Title } = Typography;

interface ScheduleCardListProps {
  schedules: ScheduleItem[];
  isLoading?: boolean;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}

interface ScheduleCardProps {
  item: ScheduleItem;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}

function ScheduleCard({
  item,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: ScheduleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={[
        "schedule-card",
        item.isDefaultRoute ? "schedule-card--recommended" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="schedule-card__body">
        <div className="schedule-card__header">
          <div className="schedule-card__meta">
            {item.isDefaultRoute ? <Tag color="gold">Recommended</Tag> : null}
            <Tag color="blue">
              {item.serviceCode} — {item.serviceName}
            </Tag>
            {item.isDirect ? (
              <Tag color="green">Direct</Tag>
            ) : (
              <Tag color="purple">
                {item.transshipmentCount}{" "}
                {item.transshipmentCount === 1 ? "Stop" : "Stops"}
              </Tag>
            )}
            <Tag
              className="schedule-card__vessel-tag"
              onClick={() => onViewVessel(item.vesselCode)}
            >
              {item.vesselName} ({item.voyage}
              {item.bound})
            </Tag>
          </div>
          <Text className="schedule-card__distance">
            {item.distanceKm.toLocaleString()} km
          </Text>
        </div>

        <div className="schedule-card__voyage">
          {/* Departure ship */}
          <div className="schedule-card__ship schedule-card__ship--depart">
            <div className="schedule-card__ship-badge schedule-card__ship-badge--depart app-icon-inherit">
              <AppIcon icon={Icons.ship} size={22} />
            </div>
            <div className="schedule-card__ship-body">
              <div className="schedule-card__ship-label">Departure (POL)</div>
              <Title
                level={4}
                className="schedule-card__ship-code schedule-card__ship-code--depart"
              >
                {item.polPortId}
              </Title>
              <Text className="schedule-card__ship-name">
                {item.polPortName}
              </Text>
              <div className="schedule-card__ship-date">
                <Tag color="blue">ETD {item.etd}</Tag>
              </div>
              <Text className="schedule-card__ship-terminal">
                Terminal: {item.polTerminal}
              </Text>
            </div>
          </div>

          {/* Sea lane connecting both ships */}
          <div className="schedule-card__sea-lane">
            <Text className="schedule-card__sea-lane-days">
              {item.transitTimeDays} days transit
            </Text>
            <div className="schedule-card__sea-lane-track">
              <span className="schedule-card__sea-lane-wave" />
              <span className="schedule-card__sea-lane-mid">
                <AppIcon icon={Icons.anchor} size={16} />
              </span>
              <span className="schedule-card__sea-lane-wave schedule-card__sea-lane-wave--arrive" />
            </div>
            <Text className="schedule-card__sea-lane-hint">
              {item.isDirect
                ? "Direct sea route"
                : `${item.transshipmentCount} transshipment`}
            </Text>
          </div>

          {/* Arrival ship */}
          <div className="schedule-card__ship schedule-card__ship--arrive">
            <div className="schedule-card__ship-badge schedule-card__ship-badge--arrive app-icon-inherit">
              <AppIcon icon={Icons.ship} size={22} />
            </div>
            <div className="schedule-card__ship-body">
              <div className="schedule-card__ship-label">Arrival (POD)</div>
              <Title
                level={4}
                className="schedule-card__ship-code schedule-card__ship-code--arrive"
              >
                {item.podPortId}
              </Title>
              <Text className="schedule-card__ship-name">
                {item.podPortName}
              </Text>
              <div className="schedule-card__ship-date">
                <Tag color="green">ETA {item.eta}</Tag>
              </div>
              <Text className="schedule-card__ship-terminal">
                Terminal: {item.podTerminal}
              </Text>
            </div>
          </div>

          <div className="schedule-card__actions">
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.notebook} size={16} tone="create" />}
              onClick={() => onBookNow(item)}
              block
            >
              Book Shipment
            </AppButton>
            <AppButton
              icon={
                <AppIcon icon={Icons.dollarSign} size={16} tone="download" />
              }
              onClick={() => onViewRates(item)}
              block
            >
              Estimate Rates
            </AppButton>
            <div className="schedule-card__actions-secondary">
              <AppButton
                size="small"
                icon={
                  <AppIcon icon={Icons.calculator} size={14} tone="track" />
                }
                onClick={() => onOpenCarbonModal(item)}
              >
                CO₂
              </AppButton>
              <AppButton
                size="small"
                icon={<AppIcon icon={Icons.ship} size={14} tone="view" />}
                onClick={() => onViewVessel(item.vesselCode)}
              >
                Vessel
              </AppButton>
            </div>
          </div>
        </div>

        {expanded ? (
          <div className="schedule-card__legs">
            <Text strong>Leg-by-Leg Routing</Text>
            {item.legs.map((leg) => (
              <div key={leg.id} className="schedule-card__leg-row">
                <div>
                  <Tag color="cyan">{leg.legType}</Tag>{" "}
                  <Text strong>
                    {leg.polPortId} → {leg.podPortId}
                  </Text>
                </div>
                <Text>
                  {leg.vesselName} ({leg.voyage}
                  {leg.bound})
                </Text>
                <Text type="secondary">
                  ETD {leg.etd} · ETA {leg.eta}
                </Text>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="schedule-card__footer">
        <div className="schedule-card__deadlines">
          <Tooltip title="Container Gate-In Closing">
            <div className="schedule-card__deadline">
              <span className="schedule-card__deadline-icon schedule-card__deadline-icon--gate app-icon-inherit">
                <AppIcon icon={Icons.container} size={14} />
              </span>
              <span>
                <span className="schedule-card__deadline-label">Gate-In</span>
                <span className="schedule-card__deadline-value">
                  {item.deadlines.containerGateIn}
                </span>
              </span>
            </div>
          </Tooltip>
          <Tooltip title="Shipping Instruction Document Closing">
            <div className="schedule-card__deadline">
              <span className="schedule-card__deadline-icon schedule-card__deadline-icon--si app-icon-inherit">
                <AppIcon icon={Icons.clipboardList} size={14} />
              </span>
              <span>
                <span className="schedule-card__deadline-label">
                  SI Cut-Off
                </span>
                <span className="schedule-card__deadline-value">
                  {item.deadlines.siDocClosing}
                </span>
              </span>
            </div>
          </Tooltip>
          <Tooltip title="Verified Gross Mass (VGM) Closing">
            <div className="schedule-card__deadline">
              <span className="schedule-card__deadline-icon schedule-card__deadline-icon--vgm app-icon-inherit">
                <AppIcon icon={Icons.shieldCheck} size={14} />
              </span>
              <span>
                <span className="schedule-card__deadline-label">
                  VGM Cut-Off
                </span>
                <span className="schedule-card__deadline-value">
                  {item.deadlines.vgmClosing}
                </span>
              </span>
            </div>
          </Tooltip>
        </div>
        <AppButton
          type="link"
          size="small"
          icon={
            expanded ? (
              <AppIcon icon={Icons.chevronUp} size={14} />
            ) : (
              <AppIcon icon={Icons.chevronDown} size={14} />
            )
          }
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide routing" : "View routing"}
        </AppButton>
      </div>
    </article>
  );
}

export function ScheduleCardList({
  schedules,
  isLoading,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: ScheduleCardListProps) {
  if (isLoading) {
    return (
      <div className="schedule-empty">
        <Spin size="medium" />
        <Text type="secondary" className="schedule-empty__text">
          Searching sailings…
        </Text>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="schedule-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={4}>
              <Text strong>No sailings found</Text>
              <Text type="secondary">
                Try adjusting your ports, dates, or search type.
              </Text>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div className="schedule-card-list">
      {schedules.map((item) => (
        <ScheduleCard
          key={item.id}
          item={item}
          onBookNow={onBookNow}
          onViewVessel={onViewVessel}
          onViewRates={onViewRates}
          onOpenCarbonModal={onOpenCarbonModal}
        />
      ))}
    </div>
  );
}
