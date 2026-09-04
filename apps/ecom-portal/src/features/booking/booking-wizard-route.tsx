// Modified by Sekar Nagarajan (2026-08-31 14:46)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { Card, Result, Space, Steps, Typography, theme } from "antd";
import { useState } from "react";
import { AppIcon, Icons, NavBookingIcon } from "../../components/icons";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
} from "../../constants/module-titles";
import { bookingApi } from "./api/booking.api";
import { BookingModuleStyles } from "./components/booking-module-styles";
import { CargoStep } from "./components/CargoStep";
import { CustomerDetailsStep } from "./components/CustomerDetailsStep";
import { ENSStep } from "./components/ENSStep";
import { FileUploadStep } from "./components/FileUploadStep";
import { InsuranceStep } from "./components/InsuranceStep";
import { MasterDetailsStep } from "./components/MasterDetailsStep";
import { PreviewStep } from "./components/PreviewStep";
import { ReferenceInformationStep } from "./components/ReferenceInformationStep";
import { useBookingWizard } from "./hooks/use-booking-wizard";
import { useBookingStore } from "./stores/booking.store";

const { Text } = Typography;

const PIPELINE_ICON_SIZE = 25;

export function BookingWizardRoute() {
  const { token } = theme.useToken();
  const toast = useToast();
  const navigate = useNavigate();
  const payload = useBookingStore((s) => s.payload);
  const [savingDraft, setSavingDraft] = useState(false);
  const {
    currentStep,
    setCurrentStep,
    isSubmitting,
    handleSubmit,
    confirmation,
    handleStartOver,
  } = useBookingWizard();

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const { draftId } = await bookingApi.saveDraft(payload);
      toast.success(`Draft saved (${draftId})`);
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  };

  const stepsConfig = [
    {
      title: WIZARD_STEP_TITLES.masterDetails,
      icon: <AppIcon icon={Icons.settings} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.customerDetails,
      icon: <AppIcon icon={Icons.user} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.cargoDetails,
      icon: <AppIcon icon={Icons.container} size={PIPELINE_ICON_SIZE} />,
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
      icon: <AppIcon icon={Icons.upload} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.references,
      icon: <AppIcon icon={Icons.fileText} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.preview,
      icon: <AppIcon icon={Icons.eye} size={PIPELINE_ICON_SIZE} />,
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
      <BookingModuleStyles />
      <div className="wizard-page-header">
        <ModuleScreenHeader
          icon={NavBookingIcon}
          title={MODULE_TITLES.newBooking}
          marginBottom={0}
          extra={
            <Space wrap className="custom-scroll">
              {!confirmation ? (
                <AppButton
                  icon={<AppIcon icon={Icons.save} size={16} />}
                  loading={savingDraft}
                  disabled={isSubmitting}
                  onClick={() => void handleSaveDraft()}
                >
                  Save Draft
                </AppButton>
              ) : null}

              {
                <AppButton
                  danger
                  icon={
                    <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                  }
                  onClick={() => navigate({ to: "/app/booking" })}
                >
                  Back to Booking
                </AppButton>
              }
            </Space>
          }
        />
      </div>

      {confirmation ? (
        <div className="wizard-confirmation">
          <Result
            status="success"
            icon={<AppIcon icon={Icons.checkCircle} size={60} tone="approve" />}
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
            {currentStep === 6 && <ReferenceInformationStep />}
            {currentStep === 7 && (
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
