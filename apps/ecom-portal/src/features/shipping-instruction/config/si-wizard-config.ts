// Created by Sekar Nagarajan (2026-08-28 11:47)
/** Tenant SI wizard flags — mirrors legacy GeneralConf.* from SIBookingDetails.jsp. */

export type SIWizardStepId =
  | "master"
  | "parties"
  | "routing"
  | "cargo"
  | "insurance"
  | "cargoProtect"
  | "charges"
  | "ens"
  | "chargeTab"
  | "files"
  | "preview";

export interface SIWizardConfig {
  showRouting: boolean;
  showInsurance: boolean;
  showCargoProtect: boolean;
  showChargesInWizard: boolean;
  showChargeTab: boolean;
  showEns: boolean;
  showFileUpload: boolean;
  showExcelImport: boolean;
  enableNvocc: boolean;
  enableT2LFiling: boolean;
  enableTensDocumentation: boolean;
  enableAesNumber: boolean;
  enableUaeBlType: boolean;
  enableOogDetails: boolean;
  seawayLoiMandatory: boolean;
  maxFileSizeMb: number;
  allowedFileExtensions: string[];
}

// Modified by Sekar Nagarajan (2026-08-28 15:10)
export const DEFAULT_SI_WIZARD_CONFIG: SIWizardConfig = {
  showRouting: false,
  showInsurance: false,
  showCargoProtect: true,
  showChargesInWizard: false,
  showChargeTab: false,
  showEns: true,
  showFileUpload: true,
  showExcelImport: true,
  enableNvocc: true,
  enableT2LFiling: true,
  enableTensDocumentation: true,
  enableAesNumber: true,
  enableUaeBlType: true,
  enableOogDetails: true,
  seawayLoiMandatory: true,
  maxFileSizeMb: 10,
  allowedFileExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".xls", ".xlsx"],
};

export function buildSiWizardStepIds(config: SIWizardConfig): SIWizardStepId[] {
  const steps: SIWizardStepId[] = ["master", "parties"];
  if (config.showRouting) steps.push("routing");
  steps.push("cargo");
  if (config.showInsurance) steps.push("insurance");
  if (config.showCargoProtect) steps.push("cargoProtect");
  if (config.showChargesInWizard) steps.push("charges");
  if (config.showEns) steps.push("ens");
  if (config.showChargeTab) steps.push("chargeTab");
  if (config.showFileUpload) steps.push("files");
  steps.push("preview");
  return steps;
}
