// Modified by Sekar Nagarajan (2026-08-26 12:38)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Result, Steps, Typography, theme } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
  formatModuleScreenTitle,
} from "../../constants/module-titles";
import { useSiDetailQuery } from "./api/si.queries";
import { CargoStep } from "./components/CargoStep";
import { ChargesStep } from "./components/ChargesStep";
import { MasterDetailsStep } from "./components/MasterDetailsStep";
import { PartiesStep } from "./components/PartiesStep";
import { PreviewStep } from "./components/PreviewStep";
import { SiLoadingCenter } from "./components/si-loading-center";
import { SiModuleStyles } from "./components/si-module-styles";
import { useSiWizard } from "./hooks/use-si-wizard";

const { Text } = Typography;

const PIPELINE_ICON_SIZE = 25;

export function ShippingInstructionWizardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const params = useParams({ from: "/app/shipping-instruction/wizard/$id" });
  const { data: siDetails, isLoading, isError } = useSiDetailQuery(params.id);

  const {
    currentStep,
    setCurrentStep,
    confirmationSiNo,
    isSubmitting,
    handleNext,
    handlePrevious,
    handleSubmit,
  } = useSiWizard(params.id);

  const stepsConfig = [
    {
      title: WIZARD_STEP_TITLES.masterDetails,
      icon: <AppIcon icon={Icons.rocket} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.parties,
      icon: <AppIcon icon={Icons.contact} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.cargoDetails,
      icon: <AppIcon icon={Icons.fileText} size={PIPELINE_ICON_SIZE} />,
    },
    {
      title: WIZARD_STEP_TITLES.charges,
      icon: <AppIcon icon={Icons.dollarSign} size={PIPELINE_ICON_SIZE} />,
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

  const goDashboard = () => {
    navigate({ to: "/app/shipping-instruction" });
  };

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="custom-scroll form-step-scroll">
          <SiLoadingCenter />
        </div>
      );
    }
    if (isError || !siDetails) {
      return (
        <div className="custom-scroll form-step-scroll">
          <Result
            status="error"
            title="Unable to load Shipping Instruction"
            extra={
              <AppButton type="primary" onClick={goDashboard}>
                Back to Dashboard
              </AppButton>
            }
          />
        </div>
      );
    }

    const commonProps = {
      data: siDetails,
      onNext: () => handleNext(stepsConfig.length),
      onPrevious: handlePrevious,
      onSubmit: handleSubmit,
      onCancel: goDashboard,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === stepsConfig.length - 1,
      isSubmitting,
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
    <FeaturePageShell>
      <SiModuleStyles />
      <Card className="wizard-page-card">
        <div className="wizard-page-header">
          <ModuleScreenHeader
            icon={Icons.clipboardList}
            title={formatModuleScreenTitle(
              MODULE_TITLES.shippingInstruction,
              siDetails?.bookingNo,
            )}
            marginBottom={0}
            extra={
              <AppButton onClick={goDashboard}>Back to Dashboard</AppButton>
            }
          />
        </div>

        {confirmationSiNo ? (
          <div className="wizard-confirmation">
            <Result
              status="success"
              icon={
                <AppIcon icon={Icons.checkCircle} size={16} tone="approve" />
              }
              title="Shipping Instruction Submitted Successfully"
              subTitle={
                <div>
                  Your Shipping Instruction has been forwarded to the carrier
                  via EDI.
                  <div className="si-confirmation__ref">
                    SI Reference:{" "}
                    <Text copyable strong className="si-confirmation__ref-value">
                      {confirmationSiNo}
                    </Text>
                  </div>
                </div>
              }
              extra={[
                <AppButton type="primary" key="dashboard" onClick={goDashboard}>
                  Go to Dashboard
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

            <div className="wizard-step-content">{renderStepContent()}</div>
          </div>
        )}
      </Card>
    </FeaturePageShell>
  );
}
