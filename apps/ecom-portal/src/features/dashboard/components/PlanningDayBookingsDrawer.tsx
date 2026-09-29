// Modified by Sekar Nagarajan (2026-09-18 12:01)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavBookingIcon } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
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

/** Split "AEJEA - JEBEL ALI" into code + display name. */
function splitPortLabel(value: string): { code: string; name: string } {
  const parts = value
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return { code: "—", name: "—" };
  if (parts.length === 1) return { code: parts[0], name: parts[0] };
  const [code, ...nameParts] = parts;
  return {
    code,
    name: titleCasePortName(nameParts.join(" ")),
  };
}

function titleCasePortName(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word.length <= 2
        ? word.toUpperCase()
        : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function BookingAttentionCues({
  booking,
  siPendingLabel,
  paymentDueLabel,
}: {
  booking: PlanningBookingDTO;
  siPendingLabel: string;
  paymentDueLabel: string;
}) {
  if (!booking.missingSIFlag && !booking.pendingPaymentFlag) return null;
  return (
    <div className="dashboard-planning-day-cues" role="list">
      {booking.missingSIFlag ? (
        <span
          className="dashboard-planning-day-cue dashboard-planning-day-cue--si"
          role="listitem"
        >
          {siPendingLabel}
        </span>
      ) : null}
      {booking.pendingPaymentFlag ? (
        <span
          className="dashboard-planning-day-cue dashboard-planning-day-cue--pay"
          role="listitem"
        >
          {paymentDueLabel}
        </span>
      ) : null}
    </div>
  );
}

function PlanningBookingCard({
  booking,
  onViewBooking,
}: {
  booking: PlanningBookingDTO;
  onViewBooking: (booking: BookingListDTO) => void;
}) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const origin = splitPortLabel(booking.origin);
  const delivery = splitPortLabel(booking.delivery);
  const needsAttention =
    Boolean(booking.missingSIFlag) || Boolean(booking.pendingPaymentFlag);

  return (
    <li
      className={[
        "dashboard-planning-day-card",
        needsAttention ? "dashboard-planning-day-card--attention" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="dashboard-planning-day-card__accent" aria-hidden />
      <div className="dashboard-planning-day-card__body">
        <div className="dashboard-planning-day-card__identity">
          <Text strong className="dashboard-planning-day-card__booking-no">
            {booking.bookingNo}
          </Text>
          <div
            className="dashboard-planning-day-card__route"
            aria-label={t("planningDrawer.route")}
          >
            <div className="dashboard-planning-day-card__leg">
              <Text className="dashboard-planning-day-card__port-code">
                {origin.code}
              </Text>
              <Text
                type="secondary"
                className="dashboard-planning-day-card__port-name"
              >
                {origin.name}
              </Text>
            </div>
            <span className="dashboard-planning-day-card__arrow" aria-hidden>
              →
            </span>
            <div className="dashboard-planning-day-card__leg">
              <Text className="dashboard-planning-day-card__port-code">
                {delivery.code}
              </Text>
              <Text
                type="secondary"
                className="dashboard-planning-day-card__port-name"
              >
                {delivery.name}
              </Text>
            </div>
          </div>
          <BookingAttentionCues
            booking={booking}
            siPendingLabel={t("planningDrawer.siPending")}
            paymentDueLabel={t("planningDrawer.paymentDue")}
          />
        </div>

        <div className="dashboard-planning-day-card__meta">
          <div className="dashboard-planning-day-card__field">
            <Text className="dashboard-planning-day-card__field-label">
              {t("planningDrawer.status")}
            </Text>
            <Tag
              className="module-status-tag"
              color={getBookingListStatusColor(booking.status)}
            >
              {booking.status}
            </Tag>
          </div>
          <div className="dashboard-planning-day-card__field">
            <Text className="dashboard-planning-day-card__field-label">
              {t("planningDrawer.capacity")}
            </Text>
            <Text strong className="dashboard-planning-day-card__capacity">
              {t("planningDrawer.capacityTeu", { count: booking.teusCount })}
            </Text>
          </div>
        </div>

        <div className="dashboard-planning-day-card__action">
          <AppButton
            type="primary"
            size="middle"
            icon={<AppIcon icon={Icons.eye} size={14} tone="view" />}
            onClick={() => onViewBooking(booking)}
          >
            {t("planningDrawer.viewDetails")}
          </AppButton>
        </div>
      </div>
    </li>
  );
}

export function PlanningDayBookingsDrawer({
  selection,
  onClose,
  onViewBooking,
}: PlanningDayBookingsDrawerProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);

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
                {t("planningDrawer.eyebrow")}
              </Text>
              <Title
                level={5}
                className="dashboard-planning-day-drawer__heading"
              >
                {selection.dayLabel} · {selection.week}
              </Title>
            </div>
          </div>
        </div>
      }
    >
      {selection.bookings.length === 0 ? (
        <ModuleEmptyState
          variant="blank"
          title={t("planningDrawer.empty")}
          artSize="sm"
        />
      ) : (
        <ul className="dashboard-planning-day-list">
          {selection.bookings.map((booking) => (
            <PlanningBookingCard
              key={`${booking.id}-${booking.bookingNo}`}
              booking={booking}
              onViewBooking={onViewBooking}
            />
          ))}
        </ul>
      )}
    </AppDrawer>
  );
}
