// Created by Antigravity (2026-08-22 10:25)
import { Card, Descriptions, Typography, Result, Skeleton, theme } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../../api/booking.api';
import { useMemo } from 'react';

const { Title, Text } = Typography;

interface BookingDetailsViewerProps {
  bookingId?: string;
}

export function BookingDetailsViewer({ bookingId }: BookingDetailsViewerProps) {
  const { token } = theme.useToken();
  
  // This is a mocked query since we don't have the real API yet.
  // In a real scenario, this would fetch the booking details by ID.
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      // Mocking the response based on our BookingPayload structure
      return {
        masterDetails: {
          origin: 'USNYC',
          delivery: 'GBFEL',
          cargoReadyDate: '2026-09-01',
          haulageOriginType: 'Merchant',
          haulageDestinationType: 'Carrier',
          carriageContract: 'C-12345',
          onlineBookingNo: bookingId,
        },
        parties: {
          shipperName: 'Global Exports LLC',
          consigneeName: 'UK Imports Ltd',
          agreementParty: 'Global Exports LLC',
          siSubmittingParty: 'Global Exports LLC',
        },
        cargo: {
          commodity: 'GEN-CGO - General Freight / Merchandise',
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
          blType: 'Straight BL',
          ensFilingType: 'Single Filing',
          paymentMethod: 'Wire Transfer',
          declarantName: 'Declarant Co',
          declarantCountry: 'GB',
        },
        insurance: {
          isInsuranceRequired: true,
          currency: 'USD',
          cargoValue: 100000,
          termsAccepted: true,
        }
      };
    },
    enabled: !!bookingId,
  });

  if (isLoading) return <Card><Skeleton active paragraph={{ rows: 10 }} /></Card>;
  
  if (error || !booking) {
    return <Result status="error" title="Failed to load booking details" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card title={<Title level={5} style={{ margin: 0 }}>Master Details</Title>}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Origin">{booking.masterDetails.origin}</Descriptions.Item>
          <Descriptions.Item label="Delivery">{booking.masterDetails.delivery}</Descriptions.Item>
          <Descriptions.Item label="Cargo Ready Date">{booking.masterDetails.cargoReadyDate}</Descriptions.Item>
          <Descriptions.Item label="Haulage Origin">{booking.masterDetails.haulageOriginType}</Descriptions.Item>
          <Descriptions.Item label="Haulage Destination">{booking.masterDetails.haulageDestinationType}</Descriptions.Item>
          <Descriptions.Item label="Carriage Contract">{booking.masterDetails.carriageContract || 'N/A'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={<Title level={5} style={{ margin: 0 }}>Parties</Title>}>
        <Descriptions column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Shipper">{booking.parties.shipperName}</Descriptions.Item>
          <Descriptions.Item label="Consignee">{booking.parties.consigneeName}</Descriptions.Item>
          <Descriptions.Item label="Agreement Party">{booking.parties.agreementParty}</Descriptions.Item>
          <Descriptions.Item label="SI Submitting Party">{booking.parties.siSubmittingParty}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={<Title level={5} style={{ margin: 0 }}>Cargo & Equipment</Title>}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Commodity">{booking.cargo.commodity}</Descriptions.Item>
          <Descriptions.Item label="Equipment Description">{booking.cargo.containerCount}x {booking.cargo.containerType}</Descriptions.Item>
          <Descriptions.Item label="Total Weight">{booking.cargo.totalWeightKg} kg</Descriptions.Item>
          <Descriptions.Item label="Hazardous">{booking.cargo.isDangerousGoods ? <Text type="danger">Yes</Text> : 'No'}</Descriptions.Item>
          <Descriptions.Item label="Reefer">{booking.cargo.isReefer ? <Text type="success">Yes</Text> : 'No'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {booking.ens?.euCustomsZone && (
        <Card title={<Title level={5} style={{ margin: 0 }}>ENS Details</Title>}>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="BL Type">{booking.ens.blType}</Descriptions.Item>
            <Descriptions.Item label="Filing Type">{booking.ens.ensFilingType}</Descriptions.Item>
            <Descriptions.Item label="Declarant Name">{booking.ens.declarantName}</Descriptions.Item>
            <Descriptions.Item label="Declarant Country">{booking.ens.declarantCountry}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {booking.insurance?.isInsuranceRequired && (
        <Card title={<Title level={5} style={{ margin: 0 }}>Insurance Details</Title>}>
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Cargo Value">{booking.insurance.cargoValue} {booking.insurance.currency}</Descriptions.Item>
            <Descriptions.Item label="Terms Accepted">{booking.insurance.termsAccepted ? 'Yes' : 'No'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
}
