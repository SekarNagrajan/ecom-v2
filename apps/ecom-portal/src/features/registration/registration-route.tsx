// Modified by Sekar Nagarajan (2026-08-25 16:20)
import { AppButton } from "@solverminds/shared-ui";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { Card, Flex, Result, Steps, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { FormProvider } from "react-hook-form";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { AppIcon, Icons } from "../../components/icons";
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

const PIPELINE_STEPS: { title: string; icon: LucideIcon }[] = [
  { title: "Company Info", icon: Icons.fileText },
  { title: "User Info", icon: Icons.user },
  { title: "KYC Upload", icon: Icons.upload },
  { title: "Terms & Conditions", icon: Icons.shieldCheck },
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
  const controller = useRegistrationController({ onCancel });
  const { isMobile } = useAntdBreakpoint();
  const scrollRef = useRef<HTMLDivElement>(null);

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
            Back to Home
          </AppButton>
        </Flex>

        <Card className="reg-page-card">
          <Flex vertical gap={24} className="reg-page__body">
            <div className="reg-page__header">
              <Title level={2} className="reg-page__title">
                {controller.isSuccess
                  ? "Registration Complete"
                  : "Create an Account"}
              </Title>
              <Text type="secondary" className="reg-page__subtitle">
                {controller.isSuccess
                  ? "Your registration has been successfully submitted."
                  : "Register for the SVM E-Com Portal to manage your bookings and shipments."}
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
                  items={PIPELINE_STEPS.map((step, index) => ({
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
                          controller.currentStep
                        )}
                      >
                        <AppIcon icon={step.icon} size={16} />
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
                        size="large"
                        onClick={controller.prevStep}
                        disabled={
                          controller.currentStep === 0 ||
                          controller.isSubmitting
                        }
                      >
                        Previous
                      </AppButton>

                      {controller.currentStep < 3 ? (
                        <AppButton
                          type="primary"
                          size="large"
                          onClick={controller.nextStep}
                        >
                          Next Step
                        </AppButton>
                      ) : (
                        <AppButton
                          type="primary"
                          size="large"
                          htmlType="submit"
                          loading={controller.isSubmitting}
                        >
                          Submit Registration
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
                  title="Successfully Submitted Registration!"
                  subTitle="Your registration request has been forwarded to the selected controlling agency. You will receive an email confirmation shortly."
                  extra={[
                    <AppButton
                      type="primary"
                      key="home"
                      size="large"
                      onClick={onCancel}
                    >
                      Back to Home
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
