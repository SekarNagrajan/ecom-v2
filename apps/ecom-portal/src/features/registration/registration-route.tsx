// Modified by Sekar Nagarajan (2026-09-11 11:43)
import { AppButton } from "@solverminds/shared-ui";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { Card, Flex, Result, Steps, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { CompanyInfoStep } from "./components/CompanyInfoStep";
import { FileUploadStep } from "./components/FileUploadStep";
import { RegistrationModuleStyles } from "./components/registration-module-styles";
import { TermsStep } from "./components/TermsStep";
import { UserInfoStep } from "./components/UserInfoStep";
import { useRegistrationController } from "./hooks/use-registration-controller";

const { Title, Text } = Typography;

interface RegistrationRouteProps {
  onCancel: () => void;
}

const PIPELINE_STEP_META: { icon: LucideIcon; size: number }[] = [
  { icon: Icons.fileText, size: 20 },
  { icon: Icons.user, size: 20 },
  { icon: Icons.upload, size: 20 },
  { icon: Icons.shieldCheck, size: 20 },
];

function pipelineIconClass(stepIndex: number, currentStep: number): string {
  const parts = ["reg-pipeline-icon", "app-icon-inherit"];
  if (currentStep === stepIndex) {
    parts.push("reg-pipeline-icon--current", "pipeline-stage-current-badge");
  } else if (currentStep > stepIndex) {
    parts.push("reg-pipeline-icon--done");
  }
  return parts.join(" ");
}

export function RegistrationRoute({ onCancel }: RegistrationRouteProps) {
  const { t } = useTranslation(["registration", "common"]);
  const controller = useRegistrationController({ onCancel });
  const { isMobile } = useAntdBreakpoint();
  const scrollRef = useRef<HTMLDivElement>(null);

  const pipelineSteps = [
    { title: t("steps.companyInfo"), ...PIPELINE_STEP_META[0] },
    { title: t("steps.userInfo"), ...PIPELINE_STEP_META[1] },
    { title: t("steps.kycUpload"), ...PIPELINE_STEP_META[2] },
    { title: t("steps.terms"), ...PIPELINE_STEP_META[3] },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [controller.currentStep]);

  return (
    <FeaturePageShell>
      <RegistrationModuleStyles />
      <div className="reg-page">
        <Flex justify="flex-end" className="reg-page__toolbar">
          <AppButton
            icon={<AppIcon icon={Icons.arrowLeft} size={16} />}
            onClick={onCancel}
          >
            {t("common:actions.backHome")}
          </AppButton>
        </Flex>

        <Card className="reg-page-card">
          <Flex vertical gap={16} className="reg-page__body">
            <div className="reg-page__header">
              <Title level={2} className="reg-page__title">
                {controller.isSuccess
                  ? t("header.complete")
                  : t("header.createAccount")}
              </Title>
              <Text type="secondary" className="reg-page__subtitle">
                {controller.isSuccess
                  ? t("header.subtitleSuccess")
                  : t("header.subtitleRegister")}
              </Text>
            </div>

            {!controller.isSuccess ? (
              <>
                <Steps
                  current={controller.currentStep}
                  onChange={(current) => controller.setStep(current)}
                  labelPlacement="vertical"
                  className="pipeline-steps"
                  size={isMobile ? "small" : "default"}
                  items={pipelineSteps.map((step, index) => ({
                    title: (
                      <span
                        className={
                          controller.currentStep >= index
                            ? "reg-pipeline-title reg-pipeline-title--active"
                            : "reg-pipeline-title"
                        }
                      >
                        {step.title}
                      </span>
                    ),
                    icon: (
                      <div
                        className={pipelineIconClass(
                          index,
                          controller.currentStep,
                        )}
                      >
                        <AppIcon icon={step.icon} size={step.size} />
                      </div>
                    ),
                  }))}
                />

                <FormProvider {...controller.form}>
                  <form onSubmit={controller.submit} className="reg-form">
                    <div
                      ref={scrollRef}
                      className="reg-form__scroll custom-scroll"
                    >
                      {controller.currentStep === 0 && <CompanyInfoStep />}
                      {controller.currentStep === 1 && <UserInfoStep />}
                      {controller.currentStep === 2 && <FileUploadStep />}
                      {controller.currentStep === 3 && <TermsStep />}
                    </div>

                    <Flex className="form-step-footer form-step-footer--split">
                      <AppButton
                        size="medium"
                        onClick={controller.prevStep}
                        disabled={
                          controller.currentStep === 0 ||
                          controller.isSubmitting
                        }
                      >
                        {t("common:actions.previous")}
                      </AppButton>

                      {controller.currentStep < 3 ? (
                        <AppButton
                          type="primary"
                          size="medium"
                          onClick={controller.nextStep}
                        >
                          {t("common:actions.next")}
                        </AppButton>
                      ) : (
                        <AppButton
                          type="primary"
                          size="medium"
                          htmlType="submit"
                          loading={controller.isSubmitting}
                        >
                          {t("actions.submitRegistration")}
                        </AppButton>
                      )}
                    </Flex>
                  </form>
                </FormProvider>
              </>
            ) : (
              <div className="reg-success custom-scroll">
                <Result
                  status="success"
                  title={t("success.title")}
                  subTitle={t("success.subTitle")}
                  extra={[
                    <AppButton
                      type="primary"
                      key="home"
                      size="medium"
                      onClick={onCancel}
                    >
                      {t("common:actions.backHome")}
                    </AppButton>,
                  ]}
                />
              </div>
            )}
          </Flex>
        </Card>
      </div>
    </FeaturePageShell>
  );
}
