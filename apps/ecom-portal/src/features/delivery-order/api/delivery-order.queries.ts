// Modified by Sekar Nagarajan (2026-08-26 14:26)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { doApi } from "./delivery-order.api";
import { doKeys } from "./delivery-order.keys";
import type { DOListFilters } from "../types/delivery-order.types";

export function useDOSummaryQuery(filters: DOListFilters = {}) {
  return useQuery({
    queryKey: doKeys.list(filters),
    queryFn: async () => {
      const res = await doApi.fetchList(filters);
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });
}

export function useDODownloadMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (delOrdNo: string) => {
      const res = await doApi.downloadDocument(delOrdNo);
      if (res.error) throw new Error(res.error.message);
      return { blob: res.data, delOrdNo };
    },
    onSuccess: ({ blob, delOrdNo }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `${delOrdNo}.pdf`,
      });
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Delivery Order ${delOrdNo} downloaded.`);
      queryClient.invalidateQueries({ queryKey: doKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download Delivery Order.");
    },
  });
}
