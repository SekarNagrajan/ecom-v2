// Modified by Sekar Nagarajan (2026-08-26 11:54)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Card, Result, Steps, Typography, theme } from "antd";
import { AppIcon, Icons } from "../../components/icons";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
} from "../../constants/module-titles";
import { CargoStep } from "./components/CargoStep";
import { CustomerDetailsStep } from "./components/CustomerDetailsStep";
import { ENSStep } from "./components/ENSStep";
import { FileUploadStep } from "./components/FileUploadStep";
import { InsuranceStep } from "./components/InsuranceStep";
import { MasterDetailsStep } from "./components/MasterDetailsStep";
import { PreviewStep } from "./components/PreviewStep";
import { useBookingWizard } from "./hooks/use-booking-wizard";

const { Text } = Typography;

const PIPELINE_ICON_SIZE = 25;

export function BookingWizardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    isSubmitting,
    handleSubmit,
    confirmation,
    handleStartOver,
  } = useBookingWizard();

  const stepsConfig = [
    {
      title: WIZARD_STEP_TITLES.masterDetails,
      icon: <AppIcon icon={Icons.rocket} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.customerDetails,
      icon: <AppIcon icon={Icons.contact} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.cargoDetails,
      icon: <AppIcon icon={Icons.bookOpen} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.ensDetails,
      icon: <AppIcon icon={Icons.fileCheck} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.insurance,
      icon: <AppIcon icon={Icons.checkCircle} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.fileUpload,
      icon: <AppIcon icon={Icons.inbox} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.preview,
      icon: <AppIcon icon={Icons.fileCheck} size={PIPELINE_ICON_SIZE} />,
    },
  ];

  const getStepIcon = (
    icon: React.ReactNode,
    index: number,
    current: number,
  ) => {
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
        className={[
          "wizard-step-icon",
          isActive ? "pipeline-stage-current-badge" : undefined,
          "app-icon-inherit",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background,
          border: `2px solid ${borderColor}`,
          color,
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
    <Card className="wizard-page-card">
      <div className="wizard-page-header">
        <ModuleScreenHeader
          icon={Icons.bookOpen}
          title={MODULE_TITLES.newBooking}
          marginBottom={0}
          extra={
            <AppButton onClick={() => navigate({ to: "/app/booking" })}>
              Back to Dashboard
            </AppButton>
          }
        />
      </div>

      {confirmation ? (
        <div className="wizard-confirmation">
          <Result
            status="success"
            icon={<AppIcon icon={Icons.checkCircle} size={16} tone="approve" />}
            title="Booking Submitted Successfully"
            subTitle={
              <div>
                Your booking request has been forwarded to the carrier.
                <div
                  style={{
                    marginTop: token.marginSM,
                    fontSize: token.fontSizeLG,
                  }}
                >
                  Booking Reference:{" "}
                  <Text
                    copyable
                    strong
                    style={{
                      fontSize: token.fontSizeHeading5,
                      color: token.colorPrimary,
                    }}
                  >
                    {confirmation.bookingReference}
                  </Text>
                </div>
              </div>
            }
            extra={[
              <AppButton
                type="primary"
                key="dashboard"
                onClick={() => navigate({ to: "/app/booking" })}
              >
                Go to Dashboard
              </AppButton>,
              <AppButton key="new" onClick={handleStartOver}>
                Create Another Booking
              </AppButton>,
            ]}
          />
        </div>
      ) : (
        <div className="wizard-page-body">
          <div className="wizard-steps-scroll">
            <div className="wizard-steps-inner">
              <Steps
                className="custom-booking-steps"
                current={currentStep}
                onChange={setCurrentStep}
                items={steps}
                labelPlacement="vertical"
              />
            </div>
          </div>

          <div className="wizard-step-content">
            {currentStep === 0 && <MasterDetailsStep />}
            {currentStep === 1 && <CustomerDetailsStep />}
            {currentStep === 2 && <CargoStep />}
            {currentStep === 3 && <ENSStep />}
            {currentStep === 4 && <InsuranceStep />}
            {currentStep === 5 && <FileUploadStep />}
            {currentStep === 6 && (
              <PreviewStep
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
