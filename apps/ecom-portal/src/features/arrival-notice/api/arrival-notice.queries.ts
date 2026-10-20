// Modified by Sekar Nagarajan (2026-09-29 12:35)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { arnApi } from "./arrival-notice.api";
import { arrivalNoticeKeys } from "./arrival-notice.keys";

export function useArrivalNoticeListQuery(fromDate?: string, toDate?: string) {
  const { t } = useTranslation("arrival-notice");

  return useQuery({
    queryKey: arrivalNoticeKeys.list(fromDate, toDate),
    queryFn: async () => {
      const res = await arnApi.fetchList({ fromDate, toDate });
      if (res.error) {
        throw new Error(res.error.message || t("errors.fetchList"));
      }
      return res.data ?? [];
    },
  });
}

export function useArrivalNoticeDetailQuery(anNo: string | null) {
  const { t } = useTranslation("arrival-notice");

  return useQuery({
    queryKey: arrivalNoticeKeys.detail(anNo ?? ""),
    enabled: Boolean(anNo),
    queryFn: async () => {
      if (!anNo) return null;
      const res = await arnApi.fetchDetail(anNo);
      if (res.error) {
        throw new Error(res.error.message || t("errors.fetchDetail"));
      }
      return res.data ?? null;
    },
  });
}

export function useArrivalNoticeDownloadMutation() {
  const { t } = useTranslation("arrival-notice");
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (anNo: string) => {
      const res = await arnApi.downloadDocument(anNo);
      if (res.error) {
        throw new Error(res.error.message || t("errors.download"));
      }
      return { blob: res.data, anNo };
    },
    onSuccess: ({ blob, anNo }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `${anNo}.pdf`,
      });
      a.click();
      URL.revokeObjectURL(url);

      queryClient.invalidateQueries({ queryKey: arrivalNoticeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: arrivalNoticeKeys.detail(anNo),
      });
      toast.success(t("toasts.documentDownloaded", { anNo }));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
