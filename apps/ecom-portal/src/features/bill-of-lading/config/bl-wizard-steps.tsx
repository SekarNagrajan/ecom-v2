// Modified by Sekar Nagarajan (2026-08-28 11:15)
import type { GlobalToken } from "antd/es/theme/interface";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../constants/module-titles";
import { BlLoadingCenter } from "../components/bl-loading-center";
import { BlCargoProtectStep } from "../components/steps/bl-cargo-protect-step";
import { BlChargeTabStep } from "../components/steps/bl-charge-tab-step";
import { BlEnsStep } from "../components/steps/bl-ens-step";
import { BlFileUploadStep } from "../components/steps/bl-file-upload-step";
import { BlInsuranceStep } from "../components/steps/bl-insurance-step";
import { ChargesStep } from "../components/steps/charges-step";
import { ContainersCargoStep } from "../components/steps/ContainersCargoStep";
import type { BLWizardStepProps } from "../components/steps/MasterDetailsStep";
import { MasterDetailsStep } from "../components/steps/MasterDetailsStep";
import { PartiesStep } from "../components/steps/PartiesStep";
import { PreviewStep } from "../components/steps/PreviewStep";
import { ReferenceStep } from "../components/steps/ReferenceStep";
import { RoutingStep } from "../components/steps/routing-step";
import {
  buildBlWizardStepIds,
  type BLWizardConfig,
  type BLWizardStepId,
} from "./bl-wizard-config";

const PIPELINE_ICON_SIZE = 25;

export interface BLWizardStepDefinition {
  id: BLWizardStepId;
  title: string;
  icon: ReactNode;
  Component: React.ComponentType<BLWizardStepProps>;
}

const STEP_COMPONENTS: Record<
  BLWizardStepId,
  React.ComponentType<BLWizardStepProps>
> = {
  master: MasterDetailsStep,
  parties: PartiesStep,
  routing: RoutingStep,
  cargo: ContainersCargoStep,
  insurance: BlInsuranceStep,
  cargoProtect: BlCargoProtectStep,
  charges: ChargesStep,
  ens: BlEnsStep,
  chargeTab: BlChargeTabStep,
  files: BlFileUploadStep,
  references: ReferenceStep,
  preview: PreviewStep,
};

const STEP_ICONS: Record<BLWizardStepId, ReactNode> = {
  master: <AppIcon icon={Icons.settings} size={PIPELINE_ICON_SIZE} />,
  parties: <AppIcon icon={Icons.user} size={PIPELINE_ICON_SIZE} />,
  routing: <AppIcon icon={Icons.route} size={PIPELINE_ICON_SIZE} />,
  cargo: <AppIcon icon={Icons.container} size={PIPELINE_ICON_SIZE} />,
  insurance: <AppIcon icon={Icons.shield} size={PIPELINE_ICON_SIZE} />,
  cargoProtect: <AppIcon icon={Icons.boxes} size={PIPELINE_ICON_SIZE} />,
  charges: <AppIcon icon={Icons.dollarSign} size={PIPELINE_ICON_SIZE} />,
  ens: <AppIcon icon={Icons.filePlus} size={PIPELINE_ICON_SIZE} />,
  chargeTab: <AppIcon icon={Icons.fileCheck} size={PIPELINE_ICON_SIZE} />,
  files: <AppIcon icon={Icons.inbox} size={PIPELINE_ICON_SIZE} />,
  references: <AppIcon icon={Icons.fileText} size={PIPELINE_ICON_SIZE} />,
  preview: <AppIcon icon={Icons.eye} size={PIPELINE_ICON_SIZE} />,
};

const STEP_TITLES: Record<BLWizardStepId, string> = {
  master: WIZARD_STEP_TITLES.masterDetails,
  parties: WIZARD_STEP_TITLES.parties,
  routing: WIZARD_STEP_TITLES.routing,
  cargo: WIZARD_STEP_TITLES.cargoDetails,
  insurance: WIZARD_STEP_TITLES.insurance,
  cargoProtect: "Cargo Protect",
  charges: WIZARD_STEP_TITLES.charges,
  ens: WIZARD_STEP_TITLES.ensDetails,
  chargeTab: "Charge Summary",
  files: WIZARD_STEP_TITLES.fileUpload,
  references: WIZARD_STEP_TITLES.references,
  preview: WIZARD_STEP_TITLES.preview,
};

export function buildBlWizardSteps(
  config: BLWizardConfig,
): BLWizardStepDefinition[] {
  return buildBlWizardStepIds(config).map((id) => ({
    id,
    title: STEP_TITLES[id],
    icon: STEP_ICONS[id],
    Component: STEP_COMPONENTS[id],
  }));
}

export function getStepIcon(
  icon: ReactNode,
  index: number,
  current: number,
  token: GlobalToken,
): ReactNode {
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
}

export function renderBlWizardStep(
  definition: BLWizardStepDefinition,
  stepProps: BLWizardStepProps,
): ReactNode {
  const { Component } = definition;
  return <Component {...stepProps} />;
}

export function renderBlWizardStepContent(
  steps: BLWizardStepDefinition[],
  currentStep: number,
  stepProps: BLWizardStepProps,
  loading: boolean,
): ReactNode {
  if (loading || !stepProps.data) {
    return (
      <div className="custom-scroll form-step-scroll">
        <BlLoadingCenter />
      </div>
    );
  }

  const definition = steps[currentStep];
  if (!definition) return null;

  const { Component } = definition;
  return (
    <Component
      {...stepProps}
      isFirstStep={currentStep === 0}
      isLastStep={currentStep === steps.length - 1}
    />
  );
}

export type { BLWizardStepProps };
