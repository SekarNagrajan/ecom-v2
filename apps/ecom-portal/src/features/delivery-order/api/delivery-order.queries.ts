// Created by Sekar Nagarajan (2026-08-24 14:46)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDOSummary, downloadDODocument } from './delivery-order.api';
import { useToast } from '@solverminds/shared-ui/hooks';

export const doKeys = {
  all: ['delivery-orders'] as const,
  lists: () => [...doKeys.all, 'list'] as const,
  list: (fromDate?: string, toDate?: string) => [...doKeys.lists(), { fromDate, toDate }] as const,
};

export function useDOSummaryQuery(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: doKeys.list(fromDate, toDate),
    queryFn: async () => {
      const res = await getDOSummary(fromDate, toDate);
      if (res.error) throw new Error(res.error.message || 'Failed to fetch DO summary');
      return res.data;
    },
  });
}

export function useDODownloadMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (delOrdNo: string) => {
      const res = await downloadDODocument(delOrdNo);
      if (res.error) throw new Error(res.error.message || 'Failed to download DO document');
      return { blob: res.data, delOrdNo };
    },
    onSuccess: ({ blob, delOrdNo }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `${delOrdNo}.pdf` });
      a.click();
      URL.revokeObjectURL(url);

      // Invalidate the list to refresh the print status
      queryClient.invalidateQueries({ queryKey: doKeys.lists() });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
