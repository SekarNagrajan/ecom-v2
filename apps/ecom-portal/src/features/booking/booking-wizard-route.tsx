// Created by Antigravity (2026-08-22 09:40)
import { BookOutlined, CheckCircleOutlined, ContactsOutlined, FileDoneOutlined, RocketOutlined, InboxOutlined } from '@ant-design/icons';
import { Card, Result, Space, Steps, Typography, theme } from 'antd';
import { useBookingWizard } from './hooks/use-booking-wizard';
import { MasterDetailsStep } from './components/MasterDetailsStep';
import { CustomerDetailsStep } from './components/CustomerDetailsStep';
import { CargoStep } from './components/CargoStep';
import { ENSStep } from './components/ENSStep';
import { InsuranceStep } from './components/InsuranceStep';
import { FileUploadStep } from './components/FileUploadStep';
import { PreviewStep } from './components/PreviewStep';
import { AppButton } from '@solverminds/shared-ui';
import { useNavigate } from '@tanstack/react-router';

const { Title, Text } = Typography;

export function BookingWizardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { currentStep, isSubmitting, handleSubmit, confirmation, handleStartOver } = useBookingWizard();

  const steps = [
    { title: 'MASTER DETAILS', icon: <RocketOutlined /> },
    { title: 'CUSTOMER DETAILS', icon: <ContactsOutlined /> },
    { title: 'CARGO DETAILS', icon: <BookOutlined /> },
    { title: 'ENS DETAILS', icon: <FileDoneOutlined /> },
    { title: 'INSURANCE', icon: <CheckCircleOutlined /> },
    { title: 'FILE UPLOAD', icon: <InboxOutlined /> },
    { title: 'PREVIEW', icon: <FileDoneOutlined /> },
  ];

  return (
    <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space align="center" size={10}>
          <BookOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            NEW BOOKING
          </Title>
        </Space>
        <AppButton onClick={() => navigate({ to: '/app/booking' })}>Back to Dashboard</AppButton>
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
        <>
          <div style={{ padding: '24px', background: token.colorFillAlter, borderRadius: 12, marginBottom: 32 }}>
            <Steps current={currentStep} items={steps} size="small" labelPlacement="vertical" />
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
