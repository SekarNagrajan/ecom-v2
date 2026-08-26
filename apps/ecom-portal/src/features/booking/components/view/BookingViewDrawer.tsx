// Modified by Sekar Nagarajan (2026-08-26 11:45)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type { BookingListDTO } from "../../types/booking-list.types";
import { BookingDetailsViewer } from "./BookingDetailsViewer";
import { HaulageTrackingGrid } from "./HaulageTrackingGrid";

const { Title, Text } = Typography;

interface BookingViewDrawerProps {
  booking: BookingListDTO;
  onClose: () => void;
}

function statusColor(status: BookingListDTO["status"]) {
  if (status === "Confirmed") return "success";
  if (status === "Awaiting Acceptance") return "processing";
  return "error";
}

export function BookingViewDrawer({
  booking,
  onClose,
}: BookingViewDrawerProps) {
  const navigate = useNavigate();

  const handleAmend = () => {
    onClose();
    navigate({ to: `/app/booking/${booking.id}/amend` });
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="lg"
      classNames={{ body: "booking-drawer-body custom-scroll" }}
      title={
        <div className="booking-drawer-title">
          <AppIcon icon={Icons.bookOpen} size={22} />
          <div>
            <Title level={4} className="booking-drawer-title__text">
              {formatModuleScreenTitle("View Booking", booking.bookingNo)}
            </Title>
            <Text type="secondary" className="booking-drawer-title__meta">
              Online Ref: <strong>{booking.onlineRefNo}</strong>
              {booking.agencyRefNo ? (
                <>
                  {" "}
                  · Agency: <strong>{booking.agencyRefNo}</strong>
                </>
              ) : null}
            </Text>
            <div className="booking-drawer-title__tags">
              <Tag color={statusColor(booking.status)}>{booking.status}</Tag>
              {booking.dgStatus === "Y" ? (
                <Tag color="error">Dangerous Goods</Tag>
              ) : (
                <Tag color="default">Non-DG</Tag>
              )}
            </div>
          </div>
        </div>
      }
      extra={
        <div className="booking-drawer-actions custom-scroll">
          <Tooltip title="Amend This Booking">
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
              onClick={handleAmend}
            >
              Amend Booking
            </AppButton>
          </Tooltip>
        </div>
      }
    >
      {/* Route hero */}
      <div className="booking-route-strip">
        <div className="booking-route-port booking-route-port--origin">
          <div className="booking-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            Origin (POL)
          </div>
          <Title
            level={4}
            className="booking-route-port__code booking-route-port__code--origin"
          >
            {booking.origin}
          </Title>
        </div>

        <div className="booking-route-connector">
          <span className="booking-route-connector__label">Port to Port</span>
          <div className="booking-route-connector__line">
            <span className="booking-route-connector__dot booking-route-connector__dot--origin" />
            <span className="booking-route-connector__track" />
            <AppIcon icon={Icons.arrowRight} size={14} />
            <span className="booking-route-connector__track" />
            <span className="booking-route-connector__dot booking-route-connector__dot--delivery" />
          </div>
          <AppIcon icon={Icons.ship} size={16} />
        </div>

        <div className="booking-route-port booking-route-port--delivery">
          <div className="booking-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            Delivery (POD)
          </div>
          <Title
            level={4}
            className="booking-route-port__code booking-route-port__code--delivery"
          >
            {booking.delivery}
          </Title>
        </div>
      </div>

      {/* Summary chips */}
      <div className="booking-summary-chips">
        <div className="booking-summary-chip">
          <span className="booking-summary-chip__icon booking-summary-chip__icon--ref app-icon-inherit">
            <AppIcon icon={Icons.badgeCheck} size={14} />
          </span>
          <span>
            <span className="booking-summary-chip__label">Booking No</span>
            <span className="booking-summary-chip__value">
              {booking.bookingNo}
            </span>
          </span>
        </div>
        <div className="booking-summary-chip">
          <span className="booking-summary-chip__icon booking-summary-chip__icon--date app-icon-inherit">
            <AppIcon icon={Icons.calendar} size={14} />
          </span>
          <span>
            <span className="booking-summary-chip__label">Created</span>
            <span className="booking-summary-chip__value">
              {booking.createdDate}
            </span>
          </span>
        </div>
        <div className="booking-summary-chip">
          <span className="booking-summary-chip__icon booking-summary-chip__icon--date app-icon-inherit">
            <AppIcon icon={Icons.clock} size={14} />
          </span>
          <span>
            <span className="booking-summary-chip__label">Submitted</span>
            <span className="booking-summary-chip__value">
              {booking.submittedDate}
            </span>
          </span>
        </div>
        <div className="booking-summary-chip">
          <span className="booking-summary-chip__icon booking-summary-chip__icon--teu app-icon-inherit">
            <AppIcon icon={Icons.boxes} size={14} />
          </span>
          <span>
            <span className="booking-summary-chip__label">TEUs</span>
            <span className="booking-summary-chip__value">
              {booking.teusCount}
            </span>
          </span>
        </div>
        {booking.confirmedDate ? (
          <div className="booking-summary-chip">
            <span className="booking-summary-chip__icon booking-summary-chip__icon--ref app-icon-inherit">
              <AppIcon icon={Icons.checkCircle} size={14} />
            </span>
            <span>
              <span className="booking-summary-chip__label">Confirmed</span>
              <span className="booking-summary-chip__value">
                {booking.confirmedDate}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      <BookingDetailsViewer bookingId={booking.id} />
      <HaulageTrackingGrid bookingId={booking.id} />
    </AppDrawer>
  );
}
