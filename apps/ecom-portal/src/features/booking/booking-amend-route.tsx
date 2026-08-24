// Created by Antigravity (2026-08-22 10:25)
import { BookOutlined, CheckCircleOutlined, ContactsOutlined, FileDoneOutlined, InboxOutlined, RocketOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, Result, Space, Spin, Steps, Typography, theme } from 'antd';
import { useEffect, useState } from 'react';
import { CargoStep } from './components/CargoStep';
import { CustomerDetailsStep } from './components/CustomerDetailsStep';
import { ENSStep } from './components/ENSStep';
import { FileUploadStep } from './components/FileUploadStep';
import { InsuranceStep } from './components/InsuranceStep';
import { MasterDetailsStep } from './components/MasterDetailsStep';
import { PreviewStep } from './components/PreviewStep';
import { useBookingWizard } from './hooks/use-booking-wizard';
import { useBookingStore } from './stores/booking.store';

const { Title, Text } = Typography;

export function BookingAmendRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { bookingId } = useParams({ strict: false });
  const { currentStep, setCurrentStep, isSubmitting, handleSubmit, confirmation, handleStartOver } = useBookingWizard(true); // pass isEditMode
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

  const stepsConfig = [
    { title: 'MASTER DETAILS', icon: <RocketOutlined /> },
    { title: 'CUSTOMER DETAILS', icon: <ContactsOutlined /> },
    { title: 'CARGO DETAILS', icon: <BookOutlined /> },
    { title: 'ENS DETAILS', icon: <FileDoneOutlined /> },
    { title: 'INSURANCE', icon: <CheckCircleOutlined /> },
    { title: 'FILE UPLOAD', icon: <InboxOutlined /> },
    { title: 'PREVIEW', icon: <FileDoneOutlined /> },
  ];

  const getStepIcon = (icon: React.ReactNode, index: number, current: number) => {
    const isCompleted = index < current;
    const isActive = index === current;

    let background = token.colorBgContainer;
    let borderColor = token.colorBorder;
    let color = token.colorTextQuaternary;

    if (isCompleted) {
      background = token.colorSuccess;
      borderColor = token.colorSuccess;
      color = token.colorWhite;
    } else if (isActive) {
      background = token.colorPrimary;
      borderColor = token.colorPrimary;
      color = token.colorWhite;
    }

    return (
      <span
        className={isActive ? 'pipeline-stage-current-badge' : undefined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: token.controlHeight,
          height: token.controlHeight,
          borderRadius: '50%',
          background,
          border: `1px solid ${borderColor}`,
          color,
          fontSize: Math.round(token.controlHeight * 0.55),
          lineHeight: 1,
          boxSizing: 'border-box',
        }}
      >
        {icon}
      </span>
    );
  };

  const steps = stepsConfig.map((step, index) => ({
    title: step.title,
    icon: getStepIcon(step.icon, index, currentStep),
  }));

  if (isLoading || !isInitialized) {
    return <Card style={{ textAlign: 'center', padding: 60 }}><Spin size="large" description="Loading Booking Details..." /></Card>;
  }

  if (error) {
    return <Card><Result status="error" title="Failed to load booking for amendment." /></Card>;
  }

  return (
    <Card
      style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' } }}
    >
      <div style={{ padding: '24px 24px 0 24px', flexShrink: 0 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={10}>
            <BookOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              AMEND BOOKING: {bookingId}
            </Title>
          </Space>
          <AppButton onClick={() => navigate({ to: '/app/booking' })}>Back to Dashboard</AppButton>
        </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <style>{`
            @keyframes pipeline-stage-current-pulse {
              0%,
              100% {
                box-shadow: 0 0 0 0 color-mix(in srgb, ${token.colorPrimary} 45%, transparent);
              }
              50% {
                box-shadow: 0 0 0 6px color-mix(in srgb, ${token.colorPrimary} 0%, transparent);
              }
            }
            .pipeline-stage-current-badge {
              animation: pipeline-stage-current-pulse 1.5s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .pipeline-stage-current-badge {
                animation: none;
              }
            }

            /* Remove default Ant Design borders when custom icons are used */
            .custom-booking-steps .ant-steps-item-icon {
              background: transparent !important;
              border: none !important;
              width: ${token.controlHeight}px !important; 
              height: ${token.controlHeight}px !important;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .custom-booking-steps .ant-steps-item-title {
              font-weight: 600 !important;
              margin-top: 4px !important;
              font-size: ${token.fontSizeSM}px !important;
              line-height: 1.2 !important;
            }
            /* Connect lines */
            .custom-booking-steps .ant-steps-item-tail {
              top: ${token.controlHeight / 2}px !important;
            }
            .custom-booking-steps .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
              background-color: ${token.colorBorderSecondary} !important;
            }
          `}</style>
          <div style={{ padding: '0 24px', flexShrink: 0 }}>
            <div style={{ paddingTop: 0, paddingBottom: 0, marginBottom: 8 }}>
              <Steps
                className="custom-booking-steps"
                current={currentStep}
                onChange={setCurrentStep}
                items={steps}
                labelPlacement="vertical"
                style={
                  {
                    '--steps-icon-size': `${token.controlHeight}px`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            {currentStep === 0 && <MasterDetailsStep />}
            {currentStep === 1 && <CustomerDetailsStep />}
            {currentStep === 2 && <CargoStep />}
            {currentStep === 3 && <ENSStep />}
            {currentStep === 4 && <InsuranceStep />}
            {currentStep === 5 && <FileUploadStep />}
            {currentStep === 6 && <PreviewStep onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
          </div>
        </div>
      )}
    </Card>
  );
}
