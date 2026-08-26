// Modified by Sekar Nagarajan (2026-08-25 12:10)
import { useToast } from '@solverminds/shared-ui/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  downloadCRODocument,
  getCRODetail,
  getCROEligibility,
  getCROSummary,
} from './cro.api';
import { croKeys } from './cro.keys';

export function useCROSummaryQuery(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: croKeys.list(fromDate, toDate),
    queryFn: async () => {
      const res = await getCROSummary(fromDate, toDate);
      if (res.error) throw new Error(res.error.message || 'Failed to fetch CRO summary');
      return res.data ?? [];
    },
  });
}

export function useCRODetailQuery(croNo: string | null) {
  return useQuery({
    queryKey: croKeys.detail(croNo ?? ''),
    enabled: Boolean(croNo),
    queryFn: async () => {
      if (!croNo) return null;
      const res = await getCRODetail(croNo);
      if (res.error) throw new Error(res.error.message || 'Failed to fetch CRO detail');
      return res.data ?? null;
    },
  });
}

export function useCROEligibilityQuery(bookingNo: string | null) {
  return useQuery({
    queryKey: croKeys.eligibility(bookingNo ?? ''),
    enabled: Boolean(bookingNo),
    queryFn: async () => {
      if (!bookingNo) return null;
      const res = await getCROEligibility(bookingNo);
      if (res.error) throw new Error(res.error.message || 'Failed to fetch eligibility');
      return res.data ?? null;
    },
  });
}

export function useCRODownloadMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (croNo: string) => {
      const res = await downloadCRODocument(croNo);
      if (res.error) throw new Error(res.error.message || 'Failed to download CRO document');
      return { blob: res.data, croNo };
    },
    onSuccess: ({ blob, croNo }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `${croNo}.pdf`,
      });
      a.click();
      URL.revokeObjectURL(url);

      queryClient.invalidateQueries({ queryKey: croKeys.lists() });
      queryClient.invalidateQueries({ queryKey: croKeys.detail(croNo) });
      toast.success(`CRO ${croNo} document downloaded`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
