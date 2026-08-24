// Created by Antigravity (2026-08-24 11:18)
import { FileTextOutlined, CheckCircleOutlined, ContactsOutlined, RocketOutlined, DollarCircleOutlined, FileDoneOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, Result, Space, Steps, Typography, theme, message } from 'antd';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSIDetails } from './api/si.api';
import { MasterDetailsStep } from './components/MasterDetailsStep';
import { PartiesStep } from './components/PartiesStep';
import { CargoStep } from './components/CargoStep';
import { ChargesStep } from './components/ChargesStep';
import { PreviewStep } from './components/PreviewStep';

const { Title, Text } = Typography;

export function ShippingInstructionWizardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const params = useParams({ from: '/app/shipping-instruction/wizard/$id' });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  const { data: siDetails, isLoading } = useQuery({
    queryKey: ['siDetails', params.id],
    queryFn: async () => {
      const res = await fetchSIDetails(params.id);
      return res.data;
    }
  });

  const stepsConfig = [
    { title: 'MASTER DETAILS', icon: <RocketOutlined /> },
    { title: 'PARTIES', icon: <ContactsOutlined /> },
    { title: 'CARGO DETAILS', icon: <FileTextOutlined /> },
    { title: 'CHARGES', icon: <DollarCircleOutlined /> },
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

  const handleNext = () => {
    if (currentStep < stepsConfig.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Mocking API call
    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmation(true);
      message.success('Shipping Instruction submitted successfully to ESL');
    }, 1500);
  };

  const renderStepContent = () => {
    if (isLoading) return <div style={{ padding: 24 }}>Loading SI details...</div>;
    if (!siDetails) return null;

    const commonProps = {
      data: siDetails,
      onNext: handleNext,
      onPrevious: handlePrevious,
      onSubmit: handleSubmit,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === stepsConfig.length - 1,
      isSubmitting
    };

    switch (currentStep) {
      case 0:
        return <MasterDetailsStep {...commonProps} />;
      case 1:
        return <PartiesStep {...commonProps} />;
      case 2:
        return <CargoStep {...commonProps} />;
      case 3:
        return <ChargesStep {...commonProps} />;
      case 4:
        return <PreviewStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Card
      style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' } }}
    >
      <div style={{ padding: '24px 24px 0 24px', flexShrink: 0 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={10}>
            <FileTextOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              SHIPPING INSTRUCTION {siDetails?.bookingNo ? `- ${siDetails.bookingNo}` : ''}
            </Title>
          </Space>
          <AppButton onClick={() => navigate({ to: '/app/shipping-instruction' })}>Back to Dashboard</AppButton>
        </div>
      </div>

      {confirmation ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: token.colorSuccess }} />}
            title="Shipping Instruction Submitted Successfully"
            subTitle={
              <div>
                Your Shipping Instruction has been forwarded to the carrier via EDI.
                <div style={{ marginTop: 12, fontSize: 16 }}>
                  SI Reference: <Text copyable strong style={{ fontSize: 18, color: token.colorPrimary }}>{siDetails?.siNo || 'SIN-GENERATED-123'}</Text>
                </div>
              </div>
            }
            extra={[
              <AppButton type="primary" key="dashboard" onClick={() => navigate({ to: '/app/shipping-instruction' })}>
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
                style={{ '--steps-icon-size': `${token.controlHeight}px` } as React.CSSProperties}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'hidden', backgroundColor: token.colorBgLayout }}>
            {renderStepContent()}
          </div>
        </div>
      )}
    </Card>
  );
}
