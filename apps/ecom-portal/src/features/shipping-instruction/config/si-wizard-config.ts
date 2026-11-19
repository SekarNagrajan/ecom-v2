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
  | "references"
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
  // Modified by Sekar Nagarajan (2026-09-16 15:32) — legacy Enable_SI_Smart_Import
  showSmartImport: boolean;
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

// Modified by Sekar Nagarajan (2026-09-16 15:32)
export const DEFAULT_SI_WIZARD_CONFIG: SIWizardConfig = {
  showRouting: false,
  // Hidden for now — set true to re-enable Insurance step (component kept).
  showInsurance: false,
  showCargoProtect: false,
  showChargesInWizard: false,
  showChargeTab: false,
  // Hidden for now — set true to re-enable ENS Details step (component kept).
  showEns: false,
  showFileUpload: true,
  showExcelImport: true,
  showSmartImport: true,
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
  // Modified by Sekar Nagarajan (2026-08-31 15:42) — References before Preview (booking/BL parity)
  steps.push("references", "preview");
  return steps;
}
