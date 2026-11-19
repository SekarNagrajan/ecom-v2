// Modified by Sekar Nagarajan (2026-10-19 19:20)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavBookingIcon } from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type {
  BookingListDTO,
  BookingListStatus,
} from "../../types/booking-list.types";
import { getBookingListStatusColor } from "../../types/booking-list.types";
import { getBookingStatusLabel } from "../../utils/booking-status";
import { BookingDetailsViewer } from "./BookingDetailsViewer";
import { HaulageTrackingGrid } from "./HaulageTrackingGrid";

const { Title, Text } = Typography;

interface BookingViewDrawerProps {
  booking: BookingListDTO;
  onClose: () => void;
}

interface LifecycleStep {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming" | "error";
}

function dash(value?: string | number | null): string {
  if (value === undefined || value === null) return "—";
  const text = String(value).trim();
  return text === "" ? "—" : text;
}

/** Date-only rendering (portal date format), no time part. */
function dateOnly(value?: string | null): ReactNode {
  return value && value.trim() !== "" ? <FormattedDate value={value} /> : "—";
}

/** Split "CODE - Name" port labels; a bare code yields no separate name. */
function splitPort(value?: string | null): { code: string; name: string } {
  const raw = (value ?? "").trim();
  const parts = raw.split(" - ");
  if (parts.length < 2) return { code: raw, name: "" };
  return { code: parts[0].trim(), name: parts.slice(1).join(" - ").trim() };
}

/**
 * Draft → Submitted → Confirmed → In Transit → Completed. Awaiting
 * Acceptance sits at the Submitted stage; Rejected / Cancelled replace the
 * next step with a red terminal marker.
 */
function buildLifecycle(
  status: BookingListStatus,
  t: (key: string) => string,
): LifecycleStep[] {
  const base: { key: BookingListStatus; label: string }[] = [
    { key: "Draft", label: t("status.draft") },
    { key: "Submitted", label: t("status.submitted") },
    { key: "Confirmed", label: t("status.confirmed") },
    { key: "In Transit", label: t("status.inTransit") },
    { key: "Completed", label: t("status.completed") },
  ];

  let currentIndex: number;
  switch (status) {
    case "Draft":
      currentIndex = 0;
      break;
    case "Submitted":
    case "Awaiting Acceptance":
      currentIndex = 1;
      break;
    case "Confirmed":
      currentIndex = 2;
      break;
    case "In Transit":
      currentIndex = 3;
      break;
    case "Completed":
      currentIndex = 5;
      break;
    case "Rejected":
    case "Cancelled":
      currentIndex = 2;
      break;
    default:
      currentIndex = -1;
  }

  const terminal =
    status === "Rejected" || status === "Cancelled"
      ? { key: status, label: getBookingStatusLabel(status, t) }
      : null;

  return base.map((step, index) => {
    if (terminal && index === currentIndex) {
      return { key: terminal.key, label: terminal.label, state: "error" };
    }
    if (index < currentIndex) return { ...step, state: "done" };
    if (index === currentIndex) return { ...step, state: "current" };
    return { ...step, state: "upcoming" };
  });
}

export function BookingViewDrawer({ booking, onClose }: BookingViewDrawerProps) {
  const { t } = useTranslation(["booking", "common", "modules"]);
  const navigate = useNavigate();
  const lifecycle = buildLifecycle(booking.status, t);
  const origin = splitPort(booking.origin);
  const delivery = splitPort(booking.delivery);

  const handleEdit = () => {
    onClose();
    navigate({ to: `/app/booking/${booking.id}/amend` });
  };

  const facts: { key: string; label: string; value: ReactNode }[] = [
    { key: "bookingNo", label: t("columns.bookingNo"), value: dash(booking.bookingNo) },
    { key: "onlineRef", label: t("columns.onlineRef"), value: dash(booking.onlineRefNo) },
    { key: "agencyRef", label: t("columns.agencyRef"), value: dash(booking.agencyRefNo) },
    { key: "teus", label: t("columns.teus"), value: dash(booking.teusCount) },
    { key: "created", label: t("columns.created"), value: dateOnly(booking.createdDate) },
    { key: "submitted", label: t("columns.submitted"), value: dateOnly(booking.submittedDate) },
    { key: "confirmed", label: t("columns.confirmed"), value: dateOnly(booking.confirmedDate) },
  ];

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
          <span className="booking-drawer-title__icon">
            <AppIcon icon={NavBookingIcon} size={20} />
          </span>
          <div className="booking-drawer-title__copy">
            <Title level={4} className="booking-drawer-title__text">
              {formatModuleScreenTitle(t("modules:titles.viewBooking"), booking.bookingNo)}
            </Title>
            <Text type="secondary" className="booking-drawer-title__meta booking-drawer-title__meta--row">
              <span className="booking-drawer-title__meta-item">
                {t("labels.onlineRef")}: <strong>{dash(booking.onlineRefNo)}</strong>
              </span>
              {booking.agencyRefNo ? (
                <span className="booking-drawer-title__meta-item">
                  {t("labels.agency")}: <strong>{booking.agencyRefNo}</strong>
                </span>
              ) : null}
            </Text>
          </div>
        </div>
      }
      footer={
        <div className="booking-drawer-actions custom-scroll">
          <Tooltip title={t("actions.editAmendTooltip")}>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
              onClick={handleEdit}
            >
              {t("common:actions.edit")}
            </AppButton>
          </Tooltip>
        </div>
      }
    >
      <section className="booking-view-hero" aria-label={t("modules:titles.viewBooking")}>
        {/* Status + lifecycle */}
        <div className="booking-view-hero__status">
          <div className="booking-view-hero__tags">
            <Tag
              className="booking-view-hero__tag"
              color={getBookingListStatusColor(booking.status)}
            >
              {getBookingStatusLabel(booking.status, t)}
            </Tag>
            {booking.dgStatus === "Y" ? (
              <Tag className="booking-view-hero__tag" color="error">
                {t("labels.dangerousGoods")}
              </Tag>
            ) : (
              <Tag className="booking-view-hero__tag" color="default">
                {t("labels.nonDg")}
              </Tag>
            )}
          </div>

          <ol className="booking-status-stepper" aria-label={t("labels.statusProgress")}>
            {lifecycle.map((step, index) => (
              <li
                key={step.key}
                className={`booking-status-stepper__step is-${step.state}`}
                aria-current={step.state === "current" ? "step" : undefined}
              >
                <span className="booking-status-stepper__dot app-icon-inherit">
                  {step.state === "done" ? (
                    <AppIcon icon={Icons.check} size={12} />
                  ) : step.state === "error" ? (
                    <AppIcon icon={Icons.x} size={12} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <span className="booking-status-stepper__label">{step.label}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Route */}
        <div className="booking-view-route">
          <div className="booking-view-route__stop">
            <span className="booking-view-route__eyebrow app-icon-inherit">
              <AppIcon icon={Icons.mapPin} size={12} />
              {t("labels.originPol")}
            </span>
            <span className="booking-view-route__code">{dash(origin.code)}</span>
            {origin.name ? <span className="booking-view-route__name">{origin.name}</span> : null}
          </div>
          <div className="booking-view-route__connector" aria-hidden>
            <span className="booking-view-route__track" />
            <span className="booking-view-route__ship app-icon-inherit">
              <AppIcon icon={Icons.ship} size={14} />
            </span>
            <span className="booking-view-route__track" />
            <span className="booking-view-route__label">{t("labels.portToPort")}</span>
          </div>
          <div className="booking-view-route__stop booking-view-route__stop--dest">
            <span className="booking-view-route__eyebrow app-icon-inherit">
              <AppIcon icon={Icons.mapPin} size={12} />
              {t("labels.deliveryPod")}
            </span>
            <span className="booking-view-route__code">{dash(delivery.code)}</span>
            {delivery.name ? (
              <span className="booking-view-route__name">{delivery.name}</span>
            ) : null}
          </div>
        </div>

        {/* Key references */}
        <dl className="booking-view-facts">
          {facts.map((fact) => (
            <div key={fact.key} className="booking-view-fact">
              <dt className="booking-view-fact__label">{fact.label}</dt>
              <dd className="booking-view-fact__value">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <BookingDetailsViewer bookingId={booking.id} />
      <HaulageTrackingGrid bookingId={booking.id} />
    </AppDrawer>
  );
}
