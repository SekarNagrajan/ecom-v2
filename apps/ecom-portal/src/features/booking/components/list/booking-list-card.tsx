// Modified by Sekar Nagarajan (2026-09-15 12:05)
import { Tag } from "antd";
import type { MouseEvent } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import { ModuleRecordCardShell } from "../../../../components/shared/record-card";
import type { BookingListDTO } from "../../types/booking-list.types";
import { getBookingListStatusColor } from "../../types/booking-list.types";

export interface BookingListCardProps {
  booking: BookingListDTO;
  isSelected?: boolean;
  onView: (booking: BookingListDTO) => void;
  onAmend: (booking: BookingListDTO) => void;
  onDuplicate: (booking: BookingListDTO) => void;
  onDownloadPdf: (booking: BookingListDTO) => void;
  onCancel: (booking: BookingListDTO) => void;
}

interface MetaField {
  key: string;
  label: string;
  value: string;
  // icon: ReactNode;
}

export function BookingListCard({
  booking,
  isSelected,
  onView,
  onAmend,
  onDuplicate,
  onDownloadPdf,
  onCancel,
}: BookingListCardProps) {
  const lane = `${booking.origin} → ${booking.delivery}`;

  const stop = (fn: () => void) => (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    fn();
  };

  const metaFields: MetaField[] = [
    {
      key: "onlineRef",
      label: "Online Ref",
      value: booking.onlineRefNo || "—",
      // icon: <AppIcon icon={Icons.fileText} size={14} />,
    },
    {
      key: "agencyRef",
      label: "Agency Ref",
      value: booking.agencyRefNo || "—",
      // icon: <AppIcon icon={Icons.building} size={14} />,
    },
    {
      key: "teus",
      label: "TEUs",
      value: String(booking.teusCount ?? 0),
      // icon: <AppIcon icon={Icons.container} size={14} />,
    },
    {
      key: "dg",
      label: "DG",
      value: booking.dgStatus || "—",
      // icon: <AppIcon icon={Icons.alertTriangle} size={14} />,
    },
    {
      key: "created",
      label: "Created",
      value: booking.createdDate || "—",
      // icon: <AppIcon icon={Icons.calendar} size={14} />,
    },
    {
      key: "submitted",
      label: "Submitted",
      value: booking.submittedDate || "—",
      // icon: <AppIcon icon={Icons.clock} size={14} />,
    },
  ];

  return (
    <ModuleRecordCardShell
      isSelected={isSelected}
      onClick={() => onView(booking)}
      contentStyle={{ gap: 0, padding: 0 }}
      containerProps={{ className: "booking-record-card" }}
    >
      <div className="booking-record-card__body">
        <div className="booking-record-card__header">
          <div className="booking-record-card__title-row">
            <span
              className="booking-record-card__title"
              title={booking.bookingNo}
            >
              {booking.bookingNo}
            </span>
            <Tag
              className="booking-record-card__status module-status-tag"
              color={getBookingListStatusColor(booking.status)}
            >
              {booking.status}
            </Tag>
          </div>
          <div className="booking-record-card__lane" title={lane}>
            <AppIcon icon={Icons.mapPin} size={14} />
            <span>{lane}</span>
          </div>
        </div>

        <div className="booking-record-card__meta">
          {metaFields.map((field) => (
            <div key={field.key} className="booking-record-card__meta-item">
              <span className="booking-record-card__meta-icon">
                {field.icon}
              </span>
              <div className="booking-record-card__meta-copy">
                <span className="booking-record-card__meta-label">
                  {field.label}
                </span>
                <span
                  className="booking-record-card__meta-value"
                  title={field.value}
                >
                  {field.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="booking-record-card__footer"
        onClick={(event) => event.stopPropagation()}
      >
        <ListActionsRow>
          <ListActionButton
            title="View Booking"
            icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
            onClick={stop(() => onView(booking))}
          />
          <ListActionButton
            title="Amendment (Edit)"
            icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
            onClick={stop(() => onAmend(booking))}
          />
          <ListActionButton
            title="Duplicate Booking"
            icon={<AppIcon icon={Icons.copy} size={16} tone="create" />}
            tone="create"
            onClick={stop(() => void onDuplicate(booking))}
          />
          <ListActionButton
            title="Download PDF"
            icon={<AppIcon icon={Icons.fileText} size={16} tone="download" />}
            tone="download"
            onClick={stop(() => void onDownloadPdf(booking))}
          />
          <ListActionButton
            title="Cancel Booking"
            icon={<AppIcon icon={Icons.circleX} size={16} tone="reject" />}
            danger
            onClick={stop(() => onCancel(booking))}
          />
        </ListActionsRow>
      </div>
    </ModuleRecordCardShell>
  );
}
