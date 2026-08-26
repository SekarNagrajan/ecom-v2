// Modified by Sekar Nagarajan (2026-08-26 11:45)
import { useQuery } from "@tanstack/react-query";
import { Card, Result, Skeleton, Typography } from "antd";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";

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
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      return {
        masterDetails: {
          origin: "USNYC",
          delivery: "GBFEL",
          cargoReadyDate: "2026-09-01",
          haulageOriginType: "Merchant",
          haulageDestinationType: "Carrier",
          carriageContract: "C-12345",
          onlineBookingNo: bookingId,
        },
        parties: {
          shipperName: "Global Exports LLC",
          consigneeName: "UK Imports Ltd",
          agreementParty: "Global Exports LLC",
          siSubmittingParty: "Global Exports LLC",
        },
        cargo: {
          commodity: "GEN-CGO - General Freight / Merchandise",
          containerType: "40' High Cube Dry",
          containerCount: 2,
          totalWeightKg: 45000,
          isLcl: false,
          isDangerousGoods: false,
          isReefer: false,
          isOog: false,
        },
        ens: {
          euCustomsZone: true,
          blType: "Straight BL",
          ensFilingType: "Single Filing",
          paymentMethod: "Wire Transfer",
          declarantName: "Declarant Co",
          declarantCountry: "GB",
        },
        insurance: {
          isInsuranceRequired: true,
          currency: "USD",
          cargoValue: 100000,
          termsAccepted: true,
        },
      };
    },
    enabled: !!bookingId,
  });

  if (isLoading) {
    return (
      <Card className="booking-panel">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (error || !booking) {
    return <Result status="error" title="Failed to load booking details" />;
  }

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
          <MetaItem label="Commodity" value={booking.cargo.commodity} />
          <MetaItem
            label="Equipment"
            value={`${booking.cargo.containerCount}x ${booking.cargo.containerType}`}
          />
          <MetaItem
            label="Total Weight"
            value={`${booking.cargo.totalWeightKg} kg`}
          />
          <MetaItem
            label="Hazardous"
            value={
              booking.cargo.isDangerousGoods ? (
                <Text type="danger">Yes</Text>
              ) : (
                "No"
              )
            }
          />
          <MetaItem
            label="Reefer"
            value={
              booking.cargo.isReefer ? <Text type="success">Yes</Text> : "No"
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
            <MetaItem
              label="Declarant Country"
              value={booking.ens.declarantCountry}
            />
          </div>
        </Card>
      ) : null}

      {booking.insurance?.isInsuranceRequired ? (
        <Card
          className="booking-panel"
          title={
            <SectionTitle
              icon={<AppIcon icon={Icons.shieldCheck} size={16} />}
            >
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
    </div>
  );
}
