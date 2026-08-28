// Modified by Sekar Nagarajan (2026-08-28 11:15)
import { useQuery } from "@tanstack/react-query";
import { Card, Result, Skeleton, Typography } from "antd";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import { bookingApi } from "../../api/booking.api";
import { bookingKeys } from "../../api/booking.keys";
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

  return (
    <div className="booking-stack">
      <Card
        className="booking-panel"
        title={
          <SectionTitle icon={<AppIcon icon={Icons.ship} size={16} />}>
            Master Details
          </SectionTitle>
        }
      >
        <div className="booking-meta-grid booking-meta-grid--3">
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

      <Card
        className="booking-panel"
        title={
          <SectionTitle icon={<AppIcon icon={Icons.boxes} size={16} />}>
            Cargo & Equipment
          </SectionTitle>
        }
      >
        <div className="booking-meta-grid booking-meta-grid--3">
          {(cargo?.containers ?? []).map((c, i) => (
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
          ))}
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

      {booking.ens?.euCustomsZone ? (
        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.fileText} size={16} />}>
              ENS Details
            </SectionTitle>
          }
        >
          <div className="booking-meta-grid booking-meta-grid--3">
            <MetaItem label="BL Type" value={booking.ens.blType} />
            <MetaItem label="Filing Type" value={booking.ens.ensFilingType} />
            <MetaItem
              label="Declarant Name"
              value={booking.ens.declarantName}
            />
          </div>
        </Card>
      ) : null}

      {booking.insurance?.isInsuranceRequired ? (
        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.shieldCheck} size={16} />}>
              Insurance Details
            </SectionTitle>
          }
        >
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
        </Card>
      ) : null}

      {(booking.documents?.length ?? 0) > 0 ? (
        <Card
          className="booking-panel"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.inbox} size={16} />}>
              Documents
            </SectionTitle>
          }
        >
          <div className="booking-meta-grid">
            {booking.documents!.map((d) => (
              <MetaItem key={d.id} label={d.type} value={d.fileName} />
            ))}
          </div>
        </Card>
      ) : null}

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
          <ul className="booking-activity-list custom-scroll">
            {activity.map((event) => (
              <li key={event.id} className="booking-activity-list__item">
                <Text strong className="booking-activity-list__action">
                  {event.action}
                </Text>
                <Text type="secondary" className="booking-activity-list__meta">
                  {event.by} · {event.at}
                </Text>
                {event.note ? (
                  <Text className="booking-activity-list__note">
                    {event.note}
                  </Text>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
