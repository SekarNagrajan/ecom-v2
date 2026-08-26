// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Result, Space, Steps, theme } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
  formatModuleScreenTitle,
} from "../../constants/module-titles";
import { checkVoyageClosed } from "./api/bl.api";
import {
  useBLDetailQuery,
  useBLSubmitMutation,
  useBLUpdateMutation,
} from "./api/bl.queries";
import { BlLoadingCenter } from "./components/bl-loading-center";
import { BlModuleStyles } from "./components/bl-module-styles";
import { ChargesStep } from "./components/steps/ChargesStep";
import { ContainersCargoStep } from "./components/steps/ContainersCargoStep";
import { MasterDetailsStep } from "./components/steps/MasterDetailsStep";
import { PartiesStep } from "./components/steps/PartiesStep";
import { PreviewStep } from "./components/steps/PreviewStep";
import { useBLWizard } from "./hooks/use-bl-wizard";
import type { BLDTO } from "./types/bl.types";

const BL_TERMS_HTML =
  "By proceeding with B/L correction you agree to the carrier terms and conditions for document amendments.";

const PIPELINE_ICON_SIZE = 25;

export function BillOfLadingWizardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { blNo } = useParams({ strict: false }) as { blNo: string };

  const { data: detail, isLoading, isError, error, refetch } =
    useBLDetailQuery(blNo);
  const {
    currentStep,
    setCurrentStep,
    goNext,
    goPrevious,
    draft,
    updateDraft,
  } = useBLWizard(detail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { mutateAsync: updateBl } = useBLUpdateMutation();
  const { mutateAsync: submitBl } = useBLSubmitMutation();

  const goDashboard = () => {
    navigate({ to: "/app/bl" });
  };

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
      icon: <AppIcon icon={Icons.bookOpen} size={PIPELINE_ICON_SIZE} />,
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

  const ensureEditAllowed = async () => {
    if (!draft) return false;
    const { closed } = await checkVoyageClosed(blNo);
    if (closed) {
      confirm.warning({
        title: "Voyage Closed",
        content: "This voyage is closed. B/L edit is not permitted.",
      });
      goDashboard();
      return false;
    }
    if (draft.status === "C" && !termsAccepted) {
      setTermsOpen(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!draft) return;
    const allowed = await ensureEditAllowed();
    if (!allowed) return;
    setIsSubmitting(true);
    try {
      const updateRes = await updateBl({ blNo, payload: draft });
      if (updateRes.error) return;
      const submitRes = await submitBl(blNo);
      if (!submitRes.error) {
        navigate({ to: `/app/bl/${blNo}` });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepProps = {
    data: draft as BLDTO,
    onNext: goNext,
    onPrevious: goPrevious,
    onSubmit: handleSubmit,
    onUpdate: updateDraft,
    onCancel: goDashboard,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === stepsConfig.length - 1,
    isSubmitting,
  };

  const renderStepContent = () => {
    if (isLoading || !draft) {
      return (
        <div className="custom-scroll form-step-scroll">
          <BlLoadingCenter />
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return <MasterDetailsStep {...stepProps} />;
      case 1:
        return <PartiesStep {...stepProps} />;
      case 2:
        return <ContainersCargoStep {...stepProps} />;
      case 3:
        return <ChargesStep {...stepProps} />;
      case 4:
        return <PreviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  if (isError) {
    return (
      <FeaturePageShell>
        <BlModuleStyles />
        <Card className="wizard-page-card">
          <div className="wizard-page-header">
            <ModuleScreenHeader
              icon={Icons.fileCheck}
              title={formatModuleScreenTitle(MODULE_TITLES.billOfLading, blNo)}
              marginBottom={0}
            />
          </div>
          <div className="wizard-confirmation">
            <Result
              status="error"
              title="Failed to load B/L"
              subTitle={
                error instanceof Error
                  ? error.message
                  : "Could not load Bill of Lading for edit."
              }
              extra={
                <Space>
                  <AppButton type="primary" onClick={() => refetch()}>
                    Retry
                  </AppButton>
                  <AppButton onClick={goDashboard}>Back to Dashboard</AppButton>
                </Space>
              }
            />
          </div>
        </Card>
      </FeaturePageShell>
    );
  }

  if (!isLoading && draft?.status === "I") {
    return (
      <FeaturePageShell>
        <BlModuleStyles />
        <Card className="wizard-page-card">
          <div className="wizard-page-header">
            <ModuleScreenHeader
              icon={Icons.fileCheck}
              title={formatModuleScreenTitle(MODULE_TITLES.billOfLading, blNo)}
              marginBottom={0}
            />
          </div>
          <div className="wizard-confirmation">
            <Result
              status="info"
              title="B/L Issued"
              subTitle="This Bill of Lading has been issued and cannot be edited."
              extra={
                <AppButton onClick={() => navigate({ to: `/app/bl/${blNo}` })}>
                  View B/L
                </AppButton>
              }
            />
          </div>
        </Card>
      </FeaturePageShell>
    );
  }

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="wizard-page-card">
        <div className="wizard-page-header">
          <ModuleScreenHeader
            icon={Icons.fileCheck}
            title={formatModuleScreenTitle(MODULE_TITLES.billOfLading, blNo)}
            marginBottom={0}
            extra={
              <AppButton onClick={goDashboard}>Back to Dashboard</AppButton>
            }
          />
        </div>

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
      </Card>

      <AppModal
        title="B/L Correction — Terms and Conditions"
        open={termsOpen}
        onCancel={() => setTermsOpen(false)}
        footer={
          <>
            <AppButton onClick={() => setTermsOpen(false)}>Decline</AppButton>
            <AppButton
              type="primary"
              onClick={() => {
                setTermsAccepted(true);
                setTermsOpen(false);
              }}
            >
              I Agree
            </AppButton>
          </>
        }
      >
        <div
          className="bl-terms-body custom-scroll"
          dangerouslySetInnerHTML={{ __html: BL_TERMS_HTML }}
        />
      </AppModal>
    </FeaturePageShell>
  );
}
