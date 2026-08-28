// Created by Sekar Nagarajan (2026-08-28 11:50)
import { useQuery } from "@tanstack/react-query";

import { fetchSiWizardConfig } from "../api/si.api";
import { siKeys } from "../api/si.keys";
import { DEFAULT_SI_WIZARD_CONFIG } from "../config/si-wizard-config";

export function useSiWizardConfigQuery() {
  return useQuery({
    queryKey: siKeys.config(),
    queryFn: async () => {
      const res = await fetchSiWizardConfig();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? DEFAULT_SI_WIZARD_CONFIG;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/** @deprecated Prefer useSiWizardConfigQuery */
export const useSiWizardConfig = useSiWizardConfigQuery;
