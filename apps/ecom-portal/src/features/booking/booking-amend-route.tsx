// Created by Antigravity (2026-08-22 10:25)
import { BookOutlined, RocketOutlined, ContactsOutlined, FileDoneOutlined, InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Result, Space, Steps, Typography, theme, Spin } from 'antd';
import { useBookingWizard } from './hooks/use-booking-wizard';
import { MasterDetailsStep } from './components/MasterDetailsStep';
import { CustomerDetailsStep } from './components/CustomerDetailsStep';
import { CargoStep } from './components/CargoStep';
import { ENSStep } from './components/ENSStep';
import { InsuranceStep } from './components/InsuranceStep';
import { FileUploadStep } from './components/FileUploadStep';
import { PreviewStep } from './components/PreviewStep';
import { AppButton } from '@solverminds/shared-ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useBookingStore } from './stores/booking.store';
import { bookingApi } from './api/booking.api';
import { useQuery } from '@tanstack/react-query';

const { Title, Text } = Typography;

export function BookingAmendRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { bookingId } = useParams({ strict: false });
  const { currentStep, isSubmitting, handleSubmit, confirmation, handleStartOver } = useBookingWizard(true); // pass isEditMode
  const { initializeFromBooking } = useBookingStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Mock fetching booking to amend
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-amend', bookingId],
    queryFn: async () => {
      // Mock data representing existing booking
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

  useEffect(() => {
    if (booking && !isInitialized) {
      // Need to safely cast because types might not perfectly match between strict schemas and mock
      initializeFromBooking(booking as any);
      setIsInitialized(true);
    }
  }, [booking, isInitialized, initializeFromBooking]);

  const steps = [
    { title: 'MASTER DETAILS', icon: <RocketOutlined /> },
    { title: 'CUSTOMER DETAILS', icon: <ContactsOutlined /> },
    { title: 'CARGO DETAILS', icon: <BookOutlined /> },
    { title: 'ENS DETAILS', icon: <FileDoneOutlined /> },
    { title: 'INSURANCE', icon: <CheckCircleOutlined /> },
    { title: 'FILE UPLOAD', icon: <InboxOutlined /> },
    { title: 'PREVIEW', icon: <FileDoneOutlined /> },
  ];

  if (isLoading || !isInitialized) {
    return <Card style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /><div>Loading Booking Details...</div></Card>;
  }

  if (error) {
    return <Card><Result status="error" title="Failed to load booking for amendment." /></Card>;
  }

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space align="center" size={10}>
          <BookOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            AMEND BOOKING: {bookingId}
          </Title>
        </Space>
        <AppButton onClick={() => navigate({ to: '/app/booking' })}>Back to Dashboard</AppButton>
      </div>

      {confirmation ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: token.colorSuccess }} />}
            title="Booking Amendment Submitted Successfully"
            subTitle={
              <div>
                Your amendment request has been forwarded to the carrier.
                <div style={{ marginTop: 12, fontSize: 16 }}>
                  Booking Reference: <Text copyable strong style={{ fontSize: 18, color: token.colorPrimary }}>{confirmation.bookingReference}</Text>
                </div>
              </div>
            }
            extra={[
              <AppButton type="primary" key="dashboard" onClick={() => navigate({ to: '/app/booking' })}>
                Go to Dashboard
              </AppButton>
            ]}
          />
        </div>
      ) : (
        <>
          <div style={{ padding: '24px', background: token.colorFillAlter, borderRadius: 12, marginBottom: 32 }}>
            <Steps current={currentStep} items={steps} size="small" />
          </div>

          <div style={{ padding: '0 24px' }}>
            {currentStep === 0 && <MasterDetailsStep />}
            {currentStep === 1 && <CustomerDetailsStep />}
            {currentStep === 2 && <CargoStep />}
            {currentStep === 3 && <ENSStep />}
            {currentStep === 4 && <InsuranceStep />}
            {currentStep === 5 && <FileUploadStep />}
            {currentStep === 6 && <PreviewStep onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
          </div>
        </>
      )}
    </Card>
  );
}
