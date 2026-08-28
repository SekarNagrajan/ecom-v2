// Modified by Sekar Nagarajan (2026-08-28 11:15)
import { useQuery } from "@tanstack/react-query";

import { fetchBLConfig } from "../api/bl.api";
import { blKeys } from "../api/bl.keys";
import { DEFAULT_BL_WIZARD_CONFIG } from "../config/bl-wizard-config";

export function useBLWizardConfigQuery() {
  return useQuery({
    queryKey: blKeys.config(),
    queryFn: async () => {
      const res = await fetchBLConfig();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? DEFAULT_BL_WIZARD_CONFIG;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/** @deprecated Use `useBLWizardConfigQuery` */
export const useBLWizardConfig = useBLWizardConfigQuery;
