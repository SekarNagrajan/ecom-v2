// Created by Sekar Nagarajan (2026-08-28 11:10)
/** Tenant BL wizard flags — mirrors legacy GeneralConf.* (mock until REST config exists). */

export type BLWizardStepId =
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

export interface BLWizardConfig {
  // Modified by Sekar Nagarajan (2026-08-28 15:10)
  showRouting: boolean;
  showInsurance: boolean;
  showCargoProtect: boolean;
  showChargesInWizard: boolean;
  showChargeTab: boolean;
  showEns: boolean;
  showExcelImport: boolean;
  showNnPrint: boolean;
  showChargeSummary: boolean;
  hideAgencyRefColumn: boolean;
  showReadyToConfirm: boolean;
  enableStripePayment: boolean;
  enableTermsOnConfirmedEdit: boolean;
  enableBlTypeSelection: boolean;
  enableTelexRelease: boolean;
  enableT2LFiling: boolean;
  enableNvocc: boolean;
  enableTensDocumentation: boolean;
  enableZipCode: boolean;
  enableAesNumber: boolean;
  enableAfricaReqsMandatory: boolean;
  enableUaeBlType: boolean;
  enableOogDetails: boolean;
  showNonRatedBlMsg: boolean;
  seawayLoiMandatory: boolean;
  maxFileSizeMb: number;
  allowedFileExtensions: string[];
}

// Modified by Sekar Nagarajan (2026-08-28 15:10)
export const DEFAULT_BL_WIZARD_CONFIG: BLWizardConfig = {
  showRouting: false,
  showInsurance: false,
  showCargoProtect: true,
  showChargesInWizard: false,
  showChargeTab: false,
  showEns: true,
  showExcelImport: true,
  showNnPrint: true,
  showChargeSummary: true,
  hideAgencyRefColumn: false,
  showReadyToConfirm: true,
  enableStripePayment: true,
  enableTermsOnConfirmedEdit: true,
  enableBlTypeSelection: true,
  enableTelexRelease: true,
  enableT2LFiling: true,
  enableNvocc: true,
  enableTensDocumentation: true,
  enableZipCode: true,
  enableAesNumber: true,
  enableAfricaReqsMandatory: false,
  enableUaeBlType: true,
  enableOogDetails: true,
  showNonRatedBlMsg: true,
  seawayLoiMandatory: true,
  maxFileSizeMb: 10,
  allowedFileExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".xls", ".xlsx"],
};

// Modified by Sekar Nagarajan (2026-08-28 15:10)
export function buildBlWizardStepIds(config: BLWizardConfig): BLWizardStepId[] {
  const steps: BLWizardStepId[] = ["master", "parties"];
  if (config.showRouting) steps.push("routing");
  steps.push("cargo");
  if (config.showInsurance) steps.push("insurance");
  if (config.showCargoProtect) steps.push("cargoProtect");
  if (config.showChargesInWizard) steps.push("charges");
  if (config.showEns) steps.push("ens");
  if (config.showChargeTab) steps.push("chargeTab");
  steps.push("files", "preview");
  return steps;
}
