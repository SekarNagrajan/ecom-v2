// Modified by Sekar Nagarajan (2026-08-31 15:42)
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../constants/module-titles";
import { CargoStep } from "../components/CargoStep";
import { ChargesStep } from "../components/ChargesStep";
import { MasterDetailsStep } from "../components/MasterDetailsStep";
import { PartiesStep } from "../components/PartiesStep";
import { PreviewStep } from "../components/PreviewStep";
import { ReferenceStep } from "../components/ReferenceStep";
import { SiCargoProtectStep } from "../components/steps/si-cargo-protect-step";
import { SiChargeTabStep } from "../components/steps/si-charge-tab-step";
import { SiEnsStep } from "../components/steps/si-ens-step";
import { SiFileUploadStep } from "../components/steps/si-file-upload-step";
import { SiInsuranceStep } from "../components/steps/si-insurance-step";
import { SiRoutingStep } from "../components/steps/si-routing-step";
import type { SIWizardStepProps } from "../types/si.types";
import {
  buildSiWizardStepIds,
  type SIWizardConfig,
  type SIWizardStepId,
} from "./si-wizard-config";

const PIPELINE_ICON_SIZE = 25;

export interface SIWizardStepDefinition {
  id: SIWizardStepId;
  title: string;
  icon: ReactNode;
  Component: React.ComponentType<SIWizardStepProps>;
}

const STEP_COMPONENTS: Record<
  SIWizardStepId,
  React.ComponentType<SIWizardStepProps>
> = {
  master: MasterDetailsStep as React.ComponentType<SIWizardStepProps>,
  parties: PartiesStep as React.ComponentType<SIWizardStepProps>,
  routing: SiRoutingStep,
  cargo: CargoStep as React.ComponentType<SIWizardStepProps>,
  insurance: SiInsuranceStep,
  cargoProtect: SiCargoProtectStep,
  charges: ChargesStep as React.ComponentType<SIWizardStepProps>,
  ens: SiEnsStep,
  chargeTab: SiChargeTabStep,
  files: SiFileUploadStep,
  references: ReferenceStep as React.ComponentType<SIWizardStepProps>,
  preview: PreviewStep as React.ComponentType<SIWizardStepProps>,
};

const STEP_ICONS: Record<SIWizardStepId, ReactNode> = {
  master: <AppIcon icon={Icons.settings} size={PIPELINE_ICON_SIZE} />,
  parties: <AppIcon icon={Icons.user} size={PIPELINE_ICON_SIZE} />,
  routing: <AppIcon icon={Icons.route} size={PIPELINE_ICON_SIZE} />,
  cargo: <AppIcon icon={Icons.container} size={PIPELINE_ICON_SIZE} />,
  insurance: <AppIcon icon={Icons.shield} size={PIPELINE_ICON_SIZE} />,
  cargoProtect: <AppIcon icon={Icons.boxes} size={PIPELINE_ICON_SIZE} />,
  charges: <AppIcon icon={Icons.dollarSign} size={PIPELINE_ICON_SIZE} />,
  ens: <AppIcon icon={Icons.fileCheck} size={PIPELINE_ICON_SIZE} />,
  chargeTab: <AppIcon icon={Icons.fileCheck} size={PIPELINE_ICON_SIZE} />,
  files: <AppIcon icon={Icons.inbox} size={PIPELINE_ICON_SIZE} />,
  references: <AppIcon icon={Icons.fileText} size={PIPELINE_ICON_SIZE} />,
  preview: <AppIcon icon={Icons.eye} size={PIPELINE_ICON_SIZE} />,
};

const STEP_TITLES: Record<SIWizardStepId, string> = {
  master: WIZARD_STEP_TITLES.masterDetails,
  parties: WIZARD_STEP_TITLES.parties,
  routing: WIZARD_STEP_TITLES.routing,
  cargo: WIZARD_STEP_TITLES.cargoDetails,
  insurance: WIZARD_STEP_TITLES.insurance,
  cargoProtect: WIZARD_STEP_TITLES.cargoProtect,
  charges: WIZARD_STEP_TITLES.charges,
  ens: WIZARD_STEP_TITLES.ensDetails,
  chargeTab: WIZARD_STEP_TITLES.chargeSummary,
  files: WIZARD_STEP_TITLES.fileUpload,
  references: WIZARD_STEP_TITLES.references,
  preview: WIZARD_STEP_TITLES.preview,
};

export function buildSiWizardSteps(
  config: SIWizardConfig,
): SIWizardStepDefinition[] {
  return buildSiWizardStepIds(config).map((id) => ({
    id,
    title: STEP_TITLES[id],
    icon: STEP_ICONS[id],
    Component: STEP_COMPONENTS[id],
  }));
}
