// Modified by Sekar Nagarajan (2026-09-08 14:58)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Flex, Tag, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavBookingIcon } from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type { BookingListDTO } from "../../types/booking-list.types";
import { getBookingListStatusColor } from "../../types/booking-list.types";
import { getBookingStatusLabel } from "../../utils/booking-status";
import { BookingDetailsViewer } from "./BookingDetailsViewer";
import { HaulageTrackingGrid } from "./HaulageTrackingGrid";

const { Title, Text } = Typography;

interface BookingViewDrawerProps {
  booking: BookingListDTO;
  onClose: () => void;
}

export function BookingViewDrawer({
  booking,
  onClose,
}: BookingViewDrawerProps) {
  const { t } = useTranslation(["booking", "common", "modules"]);
  const navigate = useNavigate();

  const handleEdit = () => {
    onClose();
    navigate({ to: `/app/booking/${booking.id}/amend` });
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="lg"
      classNames={{
        body: "booking-drawer-body custom-scroll",
        footer: "booking-drawer-footer-bar",
      }}
      title={
        <div className="booking-drawer-title">
          <AppIcon icon={NavBookingIcon} size={22} />
          <div className="booking-drawer-title__copy">
            <Title level={4} className="booking-drawer-title__text">
              {formatModuleScreenTitle(t("modules:titles.viewBooking"), booking.bookingNo)}
            </Title>
            <div className="booking-drawer-title__row">
              <Text type="secondary" className="booking-drawer-title__meta">
                {t("labels.onlineRef")}: <strong>{booking.onlineRefNo}</strong>
                {booking.agencyRefNo ? (
                  <>
                    {" "}
                    · {t("labels.agency")}: <strong>{booking.agencyRefNo}</strong>
                  </>
                ) : null}
              </Text>
              <div className="booking-drawer-title__tags">
                <Tag color={getBookingListStatusColor(booking.status)}>
                  {getBookingStatusLabel(booking.status, t)}
                </Tag>
                {booking.dgStatus === "Y" ? (
                  <Tag color="error">{t("labels.dangerousGoods")}</Tag>
                ) : (
                  <Tag color="default">{t("labels.nonDg")}</Tag>
                )}
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <Flex
          justify="flex-end"
          align="center"
          gap="small"
          wrap
          className="booking-drawer-actions custom-scroll"
        >
          <Tooltip title={t("actions.editAmendTooltip")}>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
              onClick={handleEdit}
            >
              {t("common:actions.edit")}
            </AppButton>
          </Tooltip>
        </Flex>
      }
    >
      <div className="booking-route-strip">
        <div className="booking-route-port booking-route-port--origin">
          <div className="booking-route-port__label">
            <AppIcon icon={Icons.mapPin} size={14} />
            {t("labels.originPol")}
          </div>
          <Title
            level={4}
            className="booking-route-port__code booking-route-port__code--origin"
          >
            {booking.origin}
          </Title>
        </div>

        <div className="booking-route-connector">
          <span className="booking-route-connector__label">{t("labels.portToPort")}</span>
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
            {t("labels.deliveryPod")}
          </div>
          <Title
            level={4}
            className="booking-route-port__code booking-route-port__code--delivery"
          >
            {booking.delivery}
          </Title>
        </div>
      </div>

      <div className="booking-summary-chips">
        <div className="booking-summary-chip">
          <span className="booking-summary-chip__icon booking-summary-chip__icon--ref app-icon-inherit">
            <AppIcon icon={Icons.badgeCheck} size={14} />
          </span>
          <span>
            <span className="booking-summary-chip__label">{t("columns.bookingNo")}</span>
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
            <span className="booking-summary-chip__label">{t("columns.created")}</span>
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
            <span className="booking-summary-chip__label">{t("columns.submitted")}</span>
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
            <span className="booking-summary-chip__label">{t("columns.teus")}</span>
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
              <span className="booking-summary-chip__label">{t("columns.confirmed")}</span>
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
