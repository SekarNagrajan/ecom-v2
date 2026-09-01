// Modified by Sekar Nagarajan (2026-09-01 12:22)
import { useQuery } from "@tanstack/react-query";
import { Card, Result, Skeleton, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import { bookingApi } from "../../api/booking.api";
import { bookingKeys } from "../../api/booking.keys";
import type { BookingActivityEvent } from "../../types/booking.types";
import { migrateLegacyCargo } from "../../types/booking.types";

const { Title, Text } = Typography;

interface BookingDetailsViewerProps {
  bookingId?: string;
}

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="booking-meta-item">
      <span className="booking-meta-item__label">{label}</span>
      <span className="booking-meta-item__value">{value}</span>
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="booking-section-title">
      {icon}
      <Title level={5} className="booking-panel__title">
        {children}
      </Title>
    </span>
  );
}

type ActivityTone =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "muted";

function getActivityStepVisual(action: string): {
  icon: LucideIcon;
  tone: ActivityTone;
} {
  const key = action.toLowerCase();
              if (key.includes("cancel") || key.includes("reject")) {
    return { icon: Icons.circleX, tone: "error" };
  }
  if (key.includes("confirm") || key.includes("approv")) {
    return { icon: Icons.checkCircle, tone: "success" };
  }
  if (key.includes("amend") || key.includes("edit") || key.includes("update")) {
    return { icon: Icons.squarePen, tone: "warning" };
  }
  if (key.includes("submit") || key.includes("sent") || key.includes("forward")) {
    return { icon: Icons.send, tone: "info" };
  }
  if (key.includes("creat") || key.includes("draft") || key.includes("new")) {
    return { icon: Icons.filePlus, tone: "primary" };
  }
  return { icon: Icons.history, tone: "muted" };
}

function ActivitySteps({ events }: { events: BookingActivityEvent[] }) {
  return (
    <ol className="booking-activity-steps custom-scroll">
      {events.map((event, index) => {
        const visual = getActivityStepVisual(event.action);
        const isLast = index === events.length - 1;
        return (
          <li
            key={event.id}
            className={[
              "booking-activity-steps__item",
              isLast ? "booking-activity-steps__item--last" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="booking-activity-steps__rail" aria-hidden>
              <span
                className={`booking-activity-steps__icon booking-activity-steps__icon--${visual.tone} app-icon-inherit`}
              >
                <AppIcon icon={visual.icon} size={14} />
              </span>
              {!isLast ? (
                <span className="booking-activity-steps__connector" />
              ) : null}
            </div>
            <div className="booking-activity-steps__body">
              <Text strong className="booking-activity-steps__action">
                {event.action}
              </Text>
              <Text type="secondary" className="booking-activity-steps__meta">
                {event.by} · {event.at}
              </Text>
              {event.note ? (
                <Text className="booking-activity-steps__note">{event.note}</Text>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function BookingDetailsViewer({ bookingId }: BookingDetailsViewerProps) {
  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: bookingKeys.detail(String(bookingId ?? "")),
    queryFn: async () => {
      const data = await bookingApi.getBookingById(String(bookingId));
      return {
        ...data,
        cargo: data.cargo ? migrateLegacyCargo(data.cargo) : null,
      };
    },
    enabled: !!bookingId,
  });

  const { data: activity = [], isLoading: activityLoading } = useQuery({
    queryKey: bookingKeys.activity(String(bookingId ?? "")),
    queryFn: () => bookingApi.getBookingActivity(String(bookingId)),
    enabled: !!bookingId,
  });

  if (isLoading) {
    return (
      <Card className="booking-panel">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (error || !booking || !booking.masterDetails || !booking.parties) {
    return <Result status="error" title="Failed to load booking details" />;
  }

  const cargo = booking.cargo;
  const documents = booking.documents ?? [];
  const insuranceRequired = Boolean(booking.insurance?.isInsuranceRequired);

  return (
    <div className="booking-stack booking-view-sections">
      {/* Row 1: Master Details | Parties */}
      <div className="booking-view-row booking-view-row--2">
        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.ship} size={16} />}>
              Master Details
            </SectionTitle>
          }
        >
          <div className="booking-meta-grid">
            <MetaItem label="Origin" value={booking.masterDetails.origin} />
            <MetaItem label="Delivery" value={booking.masterDetails.delivery} />
            <MetaItem
              label="Cargo Ready Date"
              value={booking.masterDetails.cargoReadyDate}
            />
            <MetaItem
              label="Haulage Origin"
              value={booking.masterDetails.haulageOriginType}
            />
            <MetaItem
              label="Haulage Destination"
              value={booking.masterDetails.haulageDestinationType}
            />
            <MetaItem
              label="Carriage Contract"
              value={booking.masterDetails.carriageContract || "N/A"}
            />
          </div>
        </Card>

        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.users} size={16} />}>
              Parties
            </SectionTitle>
          }
        >
          <div className="booking-meta-grid">
            <MetaItem label="Shipper" value={booking.parties.shipperName} />
            <MetaItem label="Consignee" value={booking.parties.consigneeName} />
            <MetaItem
              label="Notify 2"
              value={booking.parties.notifyParty2Name || "N/A"}
            />
            <MetaItem
              label="Agreement Party"
              value={booking.parties.agreementParty}
            />
            <MetaItem
              label="SI Submitting Party"
              value={booking.parties.siSubmittingParty}
            />
          </div>
        </Card>
      </div>

      {/* Row 2: Cargo & Equipment | Insurance */}
      <div className="booking-view-row booking-view-row--2">
        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.boxes} size={16} />}>
              Cargo & Equipment
            </SectionTitle>
          }
        >
          <div className="booking-meta-grid">
            {(cargo?.containers ?? []).length === 0 ? (
              <Text type="secondary">No cargo lines recorded.</Text>
            ) : (
              (cargo?.containers ?? []).map((c, i) => (
                <MetaItem
                  key={c.id}
                  label={`Container ${i + 1}`}
                  value={`${c.quantity}x ${c.containerType} · ${c.commodities
                    .map((m) =>
                      [
                        m.hsCode,
                        m.commodity || m.description,
                        `${m.packageQuantity} ${m.packageType}`,
                        `${m.weight} kg`,
                        `${m.volume} m³`,
                        m.marksAndNumbers ? `Marks: ${m.marksAndNumbers}` : "",
                      ]
                        .filter(Boolean)
                        .join(" · "),
                    )
                    .join("; ")}`}
                />
              ))
            )}
            <MetaItem
              label="Hazardous"
              value={
                (cargo?.containers ?? []).some((c) =>
                  c.commodities.some((m) => m.isDangerousGoods),
                ) ? (
                  <Text type="danger">Yes</Text>
                ) : (
                  "No"
                )
              }
            />
          </div>
        </Card>

        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.shieldCheck} size={16} />}>
              Insurance Details
            </SectionTitle>
          }
        >
          {insuranceRequired && booking.insurance ? (
            <div className="booking-meta-grid">
              <MetaItem
                label="Cargo Value"
                value={`${booking.insurance.cargoValue} ${booking.insurance.currency}`}
              />
              <MetaItem
                label="Terms Accepted"
                value={booking.insurance.termsAccepted ? "Yes" : "No"}
              />
            </div>
          ) : (
            <Text type="secondary">Insurance not required for this booking.</Text>
          )}
        </Card>
      </div>

      {/* ENS full-width when present */}
      {booking.ens?.euCustomsZone ? (
        <div className="booking-view-row booking-view-row--1">
          <Card
            className="booking-panel"
            title={
              <SectionTitle icon={<AppIcon icon={Icons.fileText} size={16} />}>
                ENS Details
              </SectionTitle>
            }
          >
            <div className="booking-meta-grid">
              <MetaItem label="BL Type" value={booking.ens.blType} />
              <MetaItem label="Filing Type" value={booking.ens.ensFilingType} />
              <MetaItem
                label="Declarant Name"
                value={booking.ens.declarantName}
              />
            </div>
          </Card>
        </div>
      ) : null}

      {/* Row 3: Documents */}
      <div className="booking-view-row booking-view-row--1">
        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.inbox} size={16} />}>
              Documents
            </SectionTitle>
          }
        >
          {documents.length === 0 ? (
            <Text type="secondary">No documents uploaded.</Text>
          ) : (
            <div className="booking-meta-grid">
              {documents.map((d) => (
                <MetaItem key={d.id} label={d.type} value={d.fileName} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Activity — vertical icon steps */}
      <div className="booking-view-row booking-view-row--1">
        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.history} size={16} />}>
              Activity
            </SectionTitle>
          }
        >
          {activityLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : activity.length === 0 ? (
            <Text type="secondary">No activity recorded.</Text>
          ) : (
            <ActivitySteps events={activity} />
          )}
        </Card>
      </div>
    </div>
  );
}
