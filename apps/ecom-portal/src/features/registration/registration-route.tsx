// Modified by Antigravity (2026-08-21)
import { ArrowLeftOutlined, CloudUploadOutlined, FileTextOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { useAntdBreakpoint } from '@solverminds/shared-ui/hooks';
import { Button, Card, Flex, Result, Steps, Typography, theme } from 'antd';
import { useEffect, useRef } from 'react';
import { FormProvider } from 'react-hook-form';

import { CompanyInfoStep } from './components/CompanyInfoStep';
import { FileUploadStep } from './components/FileUploadStep';
import { TermsStep } from './components/TermsStep';
import { UserInfoStep } from './components/UserInfoStep';
import { useRegistrationController } from './hooks/use-registration-controller';

const { Title, Text } = Typography;

interface RegistrationRouteProps {
  onCancel: () => void;
}

export function RegistrationRoute({ onCancel }: RegistrationRouteProps) {
  const { token } = theme.useToken();
  const controller = useRegistrationController({ onCancel });
  const { isMobile } = useAntdBreakpoint();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top of the form container whenever the step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [controller.currentStep]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0 }}>
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #d9d9d9;
          border-radius: 20px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #bfbfbf;
        }
        .pipeline-steps .ant-steps-item-title {
          font-size: 13px !important;
          margin-top: 8px !important;
        }
        .pipeline-steps .ant-steps-item-tail {
          top: 22px !important;
          padding: 0 16px !important;
        }
        .pipeline-steps .ant-steps-item-tail::after {
          height: 3px !important;
          background-color: #e2e8f0 !important;
          border-radius: 4px;
        }
        .pipeline-steps .ant-steps-item-finish .ant-steps-item-tail::after {
          background-color: #22c55e !important;
        }

        /* Remove browser autofill background color */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          transition: background-color 5000s ease-in-out 0s;
          -webkit-text-fill-color: rgba(0, 0, 0, 0.88) !important;
        }

        @keyframes pipeline-stage-current-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 color-mix(in srgb, #4f46e5 45%, transparent);
          }
          50% {
            box-shadow: 0 0 0 6px color-mix(in srgb, #4f46e5 0%, transparent);
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
      `}</style>
      <Flex justify="flex-end" style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onCancel}
          style={{ background: '#ffffff', color: '#000000', borderColor: '#d9d9d9' }}
        >
          Back to Home
        </Button>
      </Flex>

      <Card
        style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        styles={{ body: { padding: isMobile ? '16px' : '24px 40px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } }}
      >
        <Flex vertical gap={24} style={{ flex: 1, minHeight: 0 }}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
              {controller.isSuccess ? 'Registration Complete' : 'Create an Account'}
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              {controller.isSuccess
                ? 'Your registration has been successfully submitted.'
                : 'Register for the SVM E-Com Portal to manage your bookings and shipments.'}
            </Text>
          </div>

          {!controller.isSuccess ? (
            <>
              <Steps
                current={controller.currentStep}
                onChange={(current) => controller.setStep(current)}
                labelPlacement="vertical"
                className="pipeline-steps"
                style={{ marginBottom: 0 }}
                items={[
                  {
                    title: <span style={{ fontWeight: 600, color: controller.currentStep >= 0 ? '#1e293b' : '#64748b' }}>Company Info</span>,
                    icon: (
                      <div className={controller.currentStep === 0 ? 'pipeline-stage-current-badge' : undefined} style={{
                        width: 46, height: 46, minWidth: 46, minHeight: 46, borderRadius: '50%',
                        background: controller.currentStep === 0 ? token.colorPrimary : controller.currentStep > 0 ? '#22c55e' : '#f8fafc',
                        color: controller.currentStep >= 0 ? '#ffffff' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                        border: controller.currentStep > 0 ? 'none' : controller.currentStep === 0 ? '4px solid #e0e7ff' : '2px solid #e2e8f0',
                        boxShadow: controller.currentStep === 0 ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                        margin: '0 auto',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer'
                      }}>
                        <FileTextOutlined />
                      </div>
                    )
                  },
                  {
                    title: <span style={{ fontWeight: 600, color: controller.currentStep >= 1 ? '#1e293b' : '#64748b' }}>User Info</span>,
                    icon: (
                      <div className={controller.currentStep === 1 ? 'pipeline-stage-current-badge' : undefined} style={{
                        width: 46, height: 46, minWidth: 46, minHeight: 46, borderRadius: '50%',
                        background: controller.currentStep === 1 ? token.colorPrimary : controller.currentStep > 1 ? '#22c55e' : '#f8fafc',
                        color: controller.currentStep >= 1 ? '#ffffff' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                        border: controller.currentStep > 1 ? 'none' : controller.currentStep === 1 ? '4px solid #e0e7ff' : '2px solid #e2e8f0',
                        boxShadow: controller.currentStep === 1 ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                        margin: '0 auto',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer'
                      }}>
                        <UserOutlined />
                      </div>
                    )
                  },
                  {
                    title: <span style={{ fontWeight: 600, color: controller.currentStep >= 2 ? '#1e293b' : '#64748b' }}>KYC Upload</span>,
                    icon: (
                      <div className={controller.currentStep === 2 ? 'pipeline-stage-current-badge' : undefined} style={{
                        width: 46, height: 46, minWidth: 46, minHeight: 46, borderRadius: '50%',
                        background: controller.currentStep === 2 ? token.colorPrimary : controller.currentStep > 2 ? '#22c55e' : '#f8fafc',
                        color: controller.currentStep >= 2 ? '#ffffff' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                        border: controller.currentStep > 2 ? 'none' : controller.currentStep === 2 ? '4px solid #e0e7ff' : '2px solid #e2e8f0',
                        boxShadow: controller.currentStep === 2 ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                        margin: '0 auto',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer'
                      }}>
                        <CloudUploadOutlined />
                      </div>
                    )
                  },
                  {
                    title: <span style={{ fontWeight: 600, color: controller.currentStep >= 3 ? '#1e293b' : '#64748b' }}>Terms & Conditions</span>,
                    icon: (
                      <div className={controller.currentStep === 3 ? 'pipeline-stage-current-badge' : undefined} style={{
                        width: 46, height: 46, minWidth: 46, minHeight: 46, borderRadius: '50%',
                        background: controller.currentStep === 3 ? token.colorPrimary : controller.currentStep > 3 ? '#22c55e' : '#f8fafc',
                        color: controller.currentStep >= 3 ? '#ffffff' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                        border: controller.currentStep > 3 ? 'none' : controller.currentStep === 3 ? '4px solid #e0e7ff' : '2px solid #e2e8f0',
                        boxShadow: controller.currentStep === 3 ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                        margin: '0 auto',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer'
                      }}>
                        <SafetyCertificateOutlined />
                      </div>
                    )
                  },
                ]}
              />

              <FormProvider {...controller.form}>
                <form onSubmit={controller.submit} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div ref={scrollRef} className="custom-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#fff', borderRadius: 12, paddingRight: 12 }}>
                    {controller.currentStep === 0 && <CompanyInfoStep />}
                    {controller.currentStep === 1 && <UserInfoStep />}
                    {controller.currentStep === 2 && <FileUploadStep />}
                    {controller.currentStep === 3 && (
                      <TermsStep />
                    )}
                  </div>

                  <Flex justify="space-between" style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                    <Button
                      size="large"
                      onClick={controller.prevStep}
                      disabled={controller.currentStep === 0 || controller.isSubmitting}
                      style={{ borderRadius: 8 }}
                    >
                      Previous
                    </Button>

                    {controller.currentStep < 3 ? (
                      <Button
                        type="primary"
                        size="large"
                        onClick={controller.nextStep}
                        style={{ borderRadius: 8, padding: '0 32px' }}
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={controller.isSubmitting}
                        style={{ borderRadius: 8, padding: '0 32px' }}
                      >
                        Submit Registration
                      </Button>
                    )}
                  </Flex>
                </form>
              </FormProvider>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Result
                status="success"
                title="Successfully Submitted Registration!"
                subTitle="Your registration request has been forwarded to the selected controlling agency. You will receive an email confirmation shortly."
                extra={[
                  <Button type="primary" key="home" size="large" onClick={onCancel} style={{ borderRadius: 8, padding: '0 32px' }}>
                    Back to Home
                  </Button>
                ]}
              />
            </div>
          )}
        </Flex>
      </Card>
    </div>
  );
}
