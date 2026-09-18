// Modified by Sekar Nagarajan (2026-09-17 22:40)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Tag, Typography } from "antd";

import { AppIcon, Icons, NavBookingIcon } from "../../../components/icons";
import {
  getBookingListStatusColor,
  type BookingListDTO,
} from "../../booking/types/booking-list.types";
import type {
  PlanningBookingDTO,
  PlanningDaySelection,
} from "../mocks/dashboard.mock";

const { Text, Title } = Typography;

interface PlanningDayBookingsDrawerProps {
  selection: PlanningDaySelection;
  onClose: () => void;
  onViewBooking: (booking: BookingListDTO) => void;
}

function BookingAttentionCues({ booking }: { booking: PlanningBookingDTO }) {
  if (!booking.missingSIFlag && !booking.pendingPaymentFlag) return null;
  return (
    <div className="dashboard-planning-day-cues" role="list">
      {booking.missingSIFlag ? (
        <span
          className="dashboard-planning-day-cue dashboard-planning-day-cue--si"
          role="listitem"
        >
          Needs shipping instruction
        </span>
      ) : null}
      {booking.pendingPaymentFlag ? (
        <span
          className="dashboard-planning-day-cue dashboard-planning-day-cue--pay"
          role="listitem"
        >
          Payment still due
        </span>
      ) : null}
    </div>
  );
}

export function PlanningDayBookingsDrawer({
  selection,
  onClose,
  onViewBooking,
}: PlanningDayBookingsDrawerProps) {
  const pendingSi = selection.bookings.filter((b) => b.missingSIFlag).length;
  const pendingPay = selection.bookings.filter(
    (b) => b.pendingPaymentFlag,
  ).length;

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
              {(pendingSi > 0 || pendingPay > 0) && (
                <div className="dashboard-planning-day-drawer__summary">
                  {pendingSi > 0 ? (
                    <span className="dashboard-planning-day-cue dashboard-planning-day-cue--si">
                      {pendingSi} SI pending
                    </span>
                  ) : null}
                  {pendingPay > 0 ? (
                    <span className="dashboard-planning-day-cue dashboard-planning-day-cue--pay">
                      {pendingPay} payment pending
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      }
    >
      <ul className="dashboard-planning-day-list">
        {selection.bookings.map((booking) => (
          <li
            key={`${booking.id}-${booking.bookingNo}`}
            className={[
              "dashboard-planning-day-list__item",
              booking.missingSIFlag || booking.pendingPaymentFlag
                ? "dashboard-planning-day-list__item--attention"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
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
                <Tag
                  className="module-status-tag"
                  color={getBookingListStatusColor(booking.status)}
                >
                  {booking.status}
                </Tag>
                <Text type="secondary">{booking.teusCount} TEU</Text>
              </div>
            </div>
            <div className="dashboard-planning-day-list__aside">
              <BookingAttentionCues booking={booking} />
              <AppButton
                type="primary"
                size="small"
                icon={<AppIcon icon={Icons.eye} size={14} tone="view" />}
                onClick={() => onViewBooking(booking)}
              >
                View
              </AppButton>
            </div>
          </li>
        ))}
      </ul>
    </AppDrawer>
  );
}
