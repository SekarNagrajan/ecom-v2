// Created by Sekar Nagarajan — translated module + wizard-step titles.
import { useTranslation } from "react-i18next";

import { MODULE_TITLES, WIZARD_STEP_TITLES } from "../constants/module-titles";

type ModuleTitleKey = keyof typeof MODULE_TITLES;
type WizardStepKey = keyof typeof WIZARD_STEP_TITLES;

/**
 * Returns the module titles (same keys as the static `MODULE_TITLES` map) but
 * localized via the `modules` namespace. English is the fallback, so any key
 * without a translation still renders the original label. Drop-in replacement:
 * `const MODULE_TITLES = useModuleTitles();`
 */
export function useModuleTitles(): Record<ModuleTitleKey, string> {
  const { t } = useTranslation("modules");
  const result = {} as Record<ModuleTitleKey, string>;
  for (const key of Object.keys(MODULE_TITLES) as ModuleTitleKey[]) {
    result[key] = t(`titles.${key}`, { defaultValue: MODULE_TITLES[key] });
  }
  return result;
}

/** Localized wizard step titles, mirroring `WIZARD_STEP_TITLES`. */
export function useWizardStepTitles(): Record<WizardStepKey, string> {
  const { t } = useTranslation("modules");
  const result = {} as Record<WizardStepKey, string>;
  for (const key of Object.keys(WIZARD_STEP_TITLES) as WizardStepKey[]) {
    result[key] = t(`steps.${key}`, { defaultValue: WIZARD_STEP_TITLES[key] });
  }
  return result;
}
