// Modified by Sekar Nagarajan (2026-09-07 18:49)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Tag, Typography } from "antd";

import { AppIcon, Icons, NavBookingIcon } from "../../../components/icons";
import {
  getBookingListStatusColor,
  type BookingListDTO,
} from "../../booking/types/booking-list.types";
import type { PlanningDaySelection } from "../mocks/dashboard.mock";

const { Text, Title } = Typography;

interface PlanningDayBookingsDrawerProps {
  selection: PlanningDaySelection;
  onClose: () => void;
  onViewBooking: (booking: BookingListDTO) => void;
}

export function PlanningDayBookingsDrawer({
  selection,
  onClose,
  onViewBooking,
}: PlanningDayBookingsDrawerProps) {
  const count = selection.bookings.length;

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="sm"
      classNames={{
        header: "dashboard-planning-day-drawer__header-wrap",
        body: "dashboard-planning-day-drawer custom-scroll",
      }}
      title={
        <div className="dashboard-planning-day-drawer__header">
          <div className="dashboard-planning-day-drawer__brand">
            <span className="dashboard-planning-day-drawer__icon app-icon-inherit">
              <AppIcon icon={NavBookingIcon} size={22} />
            </span>
            <div className="dashboard-planning-day-drawer__brand-copy">
              <Text className="dashboard-planning-day-drawer__eyebrow">
                Upcoming day bookings
              </Text>
              <Title
                level={5}
                className="dashboard-planning-day-drawer__heading"
              >
                {selection.dayLabel} · {selection.week}
              </Title>
            </div>
          </div>

          <div className="dashboard-planning-day-drawer__tiles">
            <div className="dashboard-planning-day-tile">
              <span className="dashboard-planning-day-tile__label">Day</span>
              <span className="dashboard-planning-day-tile__value">
                {selection.dayLabel}
              </span>
            </div>
            <div className="dashboard-planning-day-tile">
              <span className="dashboard-planning-day-tile__label">Week</span>
              <span className="dashboard-planning-day-tile__value">
                {selection.week}
              </span>
            </div>
            <div className="dashboard-planning-day-tile dashboard-planning-day-tile--range">
              <span className="dashboard-planning-day-tile__label">Period</span>
              <span className="dashboard-planning-day-tile__value dashboard-planning-day-tile__value--sm">
                {selection.dateRange}
              </span>
            </div>
            <div className="dashboard-planning-day-tile dashboard-planning-day-tile--primary">
              <span className="dashboard-planning-day-tile__label">
                Bookings
              </span>
              <span className="dashboard-planning-day-tile__value">
                {count}
              </span>
            </div>
          </div>
        </div>
      }
    >
      <ul className="dashboard-planning-day-list">
        {selection.bookings.map((booking) => (
          <li
            key={`${booking.id}-${booking.bookingNo}`}
            className="dashboard-planning-day-list__item"
          >
            <div className="dashboard-planning-day-list__copy">
              <Text strong className="dashboard-planning-day-list__no">
                {booking.bookingNo}
              </Text>
              <Text
                type="secondary"
                className="dashboard-planning-day-list__route"
              >
                {booking.origin} → {booking.delivery}
              </Text>
              <div className="dashboard-planning-day-list__tags">
                <Tag color={getBookingListStatusColor(booking.status)}>
                  {booking.status}
                </Tag>
                <Text type="secondary">{booking.teusCount} TEU</Text>
              </div>
            </div>
            <AppButton
              type="primary"
              size="small"
              icon={<AppIcon icon={Icons.eye} size={14} tone="view" />}
              onClick={() => onViewBooking(booking)}
            >
              View
            </AppButton>
          </li>
        ))}
      </ul>
    </AppDrawer>
  );
}
