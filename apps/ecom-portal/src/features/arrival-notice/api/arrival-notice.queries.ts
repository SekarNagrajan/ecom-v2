// Modified by Sekar Nagarajan (2026-08-25 12:20)
import { useToast } from '@solverminds/shared-ui/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  downloadArrivalNoticeDocument,
  getArrivalNoticeDetail,
  getArrivalNoticeList,
} from './arrival-notice.api';
import { arrivalNoticeKeys } from './arrival-notice.keys';

export function useArrivalNoticeListQuery(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: arrivalNoticeKeys.list(fromDate, toDate),
    queryFn: async () => {
      const res = await getArrivalNoticeList(fromDate, toDate);
      if (res.error) {
        throw new Error(res.error.message || 'Failed to fetch arrival notices');
      }
      return res.data ?? [];
    },
  });
}

export function useArrivalNoticeDetailQuery(anNo: string | null) {
  return useQuery({
    queryKey: arrivalNoticeKeys.detail(anNo ?? ''),
    enabled: Boolean(anNo),
    queryFn: async () => {
      if (!anNo) return null;
      const res = await getArrivalNoticeDetail(anNo);
      if (res.error) {
        throw new Error(res.error.message || 'Failed to fetch arrival notice detail');
      }
      return res.data ?? null;
    },
  });
}

export function useArrivalNoticeDownloadMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (anNo: string) => {
      const res = await downloadArrivalNoticeDocument(anNo);
      if (res.error) {
        throw new Error(res.error.message || 'Failed to download arrival notice document');
      }
      return { blob: res.data, anNo };
    },
    onSuccess: ({ blob, anNo }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `${anNo}.pdf`,
      });
      a.click();
      URL.revokeObjectURL(url);

      queryClient.invalidateQueries({ queryKey: arrivalNoticeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: arrivalNoticeKeys.detail(anNo) });
      toast.success(`Arrival notice ${anNo} document downloaded`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
