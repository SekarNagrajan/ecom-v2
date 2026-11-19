/** Tenant booking wizard flags — hide optional steps without removing their implementations. */

export type BookingWizardStepId =
  "master" | "parties" | "cargo" | "ens" | "insurance" | "files" | "references" | "preview";

export interface BookingWizardConfig {
  showEns: boolean;
  showInsurance: boolean;
}

/** Flip these to re-enable ENS / Insurance steps in the booking wizard. */
export const DEFAULT_BOOKING_WIZARD_CONFIG: BookingWizardConfig = {
  showEns: false,
  showInsurance: false,
};

export function buildBookingWizardStepIds(
  config: BookingWizardConfig = DEFAULT_BOOKING_WIZARD_CONFIG,
): BookingWizardStepId[] {
  const steps: BookingWizardStepId[] = ["master", "parties", "cargo"];
  if (config.showEns) steps.push("ens");
  if (config.showInsurance) steps.push("insurance");
  steps.push("files", "references", "preview");
  return steps;
}

export function getBookingWizardStepIndex(
  stepId: BookingWizardStepId,
  config: BookingWizardConfig = DEFAULT_BOOKING_WIZARD_CONFIG,
): number {
  return buildBookingWizardStepIds(config).indexOf(stepId);
}

export function getBookingWizardLastStepIndex(
  config: BookingWizardConfig = DEFAULT_BOOKING_WIZARD_CONFIG,
): number {
  return buildBookingWizardStepIds(config).length - 1;
}
