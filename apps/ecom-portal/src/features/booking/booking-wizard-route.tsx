// Created by Antigravity (2026-08-22 09:40)
import { BookOutlined, CheckCircleOutlined, ContactsOutlined, FileDoneOutlined, InboxOutlined, RocketOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { useNavigate } from '@tanstack/react-router';
import { Card, Result, Space, Steps, Typography, theme } from 'antd';
import { CargoStep } from './components/CargoStep';
import { CustomerDetailsStep } from './components/CustomerDetailsStep';
import { ENSStep } from './components/ENSStep';
import { FileUploadStep } from './components/FileUploadStep';
import { InsuranceStep } from './components/InsuranceStep';
import { MasterDetailsStep } from './components/MasterDetailsStep';
import { PreviewStep } from './components/PreviewStep';
import { useBookingWizard } from './hooks/use-booking-wizard';

const { Title, Text } = Typography;

export function BookingWizardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, isSubmitting, handleSubmit, confirmation, handleStartOver } = useBookingWizard();

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
              NEW BOOKING
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
            title="Booking Submitted Successfully"
            subTitle={
              <div>
                Your booking request has been forwarded to the carrier.
                <div style={{ marginTop: 12, fontSize: 16 }}>
                  Booking Reference: <Text copyable strong style={{ fontSize: 18, color: token.colorPrimary }}>{confirmation.bookingReference}</Text>
                </div>
              </div>
            }
            extra={[
              <AppButton type="primary" key="dashboard" onClick={() => navigate({ to: '/app/booking' })}>
                Go to Dashboard
              </AppButton>,
              <AppButton key="new" onClick={handleStartOver}>
                Create Another Booking
              </AppButton>,
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
