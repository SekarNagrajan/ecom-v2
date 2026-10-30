// Modified by Sekar Nagarajan (2026-08-25 13:00)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  buildCarbonExportFilename,
  type CarbonInput,
} from "../types/carbon.types";
import {
  computeCarbon,
  downloadCarbonDocument,
  getCarbonLookups,
} from "./carbon.api";
import { carbonKeys } from "./carbon.keys";

export function useCarbonLookupsQuery() {
  const { t } = useTranslation("carbon-calculator");

  return useQuery({
    queryKey: carbonKeys.lookups(),
    queryFn: async () => {
      const res = await getCarbonLookups();
      if (res.error) {
        throw new Error(res.error.message || t("errors.lookupsFailed"));
      }
      return (
        res.data ?? {
          ports: [],
          modes: [],
          equipment: [],
          fuelTypes: [],
        }
      );
    },
  });
}

export function useCarbonComputeQuery(input: CarbonInput | null) {
  const { t } = useTranslation("carbon-calculator");

  return useQuery({
    queryKey: carbonKeys.compute(
      input ?? {
        origin: "",
        destination: "",
        cargoWeightKg: 0,
        equipment: "",
        containerCount: 1,
        unit: "kg",
      },
    ),
    enabled: Boolean(input),
    queryFn: async () => {
      if (!input) return null;
      const res = await computeCarbon(input);
      if (res.error) {
        throw new Error(res.error.message || t("errors.computeFailed"));
      }
      return res.data ?? null;
    },
  });
}

export function useCarbonExportMutation() {
  const { t } = useTranslation("carbon-calculator");
  const toast = useToast();

  return useMutation({
    mutationFn: async (input: CarbonInput) => {
      const res = await downloadCarbonDocument(input);
      if (res.error) {
        throw new Error(res.error.message || t("errors.downloadFailed"));
      }
      return { blob: res.data, input };
    },
    onSuccess: ({ blob, input }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: buildCarbonExportFilename(input),
      });
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("toasts.pdfDownloaded"));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
