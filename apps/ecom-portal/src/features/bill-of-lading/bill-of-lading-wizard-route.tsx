// Modified by Sekar Nagarajan (2026-08-31 16:36)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Result, Space, Steps, theme } from "antd";
import { useMemo, useState } from "react";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
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
import {
  buildBlWizardSteps,
  getStepIcon,
  renderBlWizardStep,
} from "./config/bl-wizard-steps";
import {
  DEFAULT_BL_WIZARD_CONFIG,
  type BLWizardStepId,
} from "./config/bl-wizard-config";
import { useBLWizard } from "./hooks/use-bl-wizard";
import { useBLWizardConfig } from "./hooks/use-bl-wizard-config";
import type { BLDTO } from "./types/bl.types";

const BL_TERMS_HTML =
  "By proceeding with B/L correction you agree to the carrier terms and conditions for document amendments.";

export function BillOfLadingWizardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const { blNo } = useParams({ strict: false }) as { blNo: string };

  const { data: detail, isLoading, isError, error, refetch } =
    useBLDetailQuery(blNo);
  const { data: wizardConfig = DEFAULT_BL_WIZARD_CONFIG } =
    useBLWizardConfig();

  const wizardSteps = useMemo(
    () => buildBlWizardSteps(wizardConfig),
    [wizardConfig],
  );

  const {
    currentStep,
    setCurrentStep,
    goNext,
    goPrevious,
    draft,
    updateDraft,
    isFirstStep,
    isLastStep,
  } = useBLWizard(detail, wizardSteps.length);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { mutateAsync: updateBl } = useBLUpdateMutation();
  const { mutateAsync: submitBl } = useBLSubmitMutation();

  const goDashboard = () => {
    navigate({ to: "/app/bl" });
  };

  const activeStep = wizardSteps[currentStep];

  const steps = wizardSteps.map((step, index) => ({
    title: step.title,
    icon: getStepIcon(step.icon, index, currentStep, token),
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
    if (
      draft.status === "C" &&
      wizardConfig.enableTermsOnConfirmedEdit &&
      !termsAccepted
    ) {
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
      if (!submitRes.error && submitRes.data) {
        navigate({
          to: `/app/bl/${blNo}/submit-result`,
          state: { submitResult: submitRes.data.submitResult } as never,
        });
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
    onGoToStep: (stepId: BLWizardStepId) => {
      const index = wizardSteps.findIndex((step) => step.id === stepId);
      if (index >= 0) setCurrentStep(index);
    },
    isFirstStep,
    isLastStep,
    isSubmitting,
  };

  const renderStepContent = () => {
    if (isLoading || !draft || !activeStep) {
      return (
        <div className="custom-scroll form-step-scroll">
          <BlLoadingCenter />
        </div>
      );
    }
    return renderBlWizardStep(activeStep, stepProps);
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
                toast.success("Terms accepted — you may continue editing.");
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
