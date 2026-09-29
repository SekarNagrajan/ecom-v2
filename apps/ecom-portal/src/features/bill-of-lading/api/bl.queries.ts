// Modified by Sekar Nagarajan (2026-08-24 23:56)
import { useToast } from '@solverminds/shared-ui/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  batchPrintBL,
  cancelBL,
  downloadBLDocument,
  downloadMCNManifest,
  fetchBLCharges,
  fetchBLDetail,
  fetchBLFromSI,
  fetchBLList,
  fetchMCNDetail,
  fetchMCNList,
  issueBL,
  saveBLDraft,
  submitBL,
  updateBL,
  verifyBL,
} from './bl.api';
import { blKeys } from './bl.keys';
import type { BLDTO, BLListFilters, BLPrintType } from '../types/bl.types';

export function useBLListQuery(filters: BLListFilters = {}) {
  return useQuery({
    queryKey: blKeys.list(filters),
    queryFn: async () => {
      const res = await fetchBLList(filters);
      if (res.error) throw new Error(res.error.message);
      return { rows: res.data ?? [], totalCount: res.meta?.totalCount ?? 0 };
    },
  });
}

export function useBLDetailQuery(blNo: string, enabled = true) {
  return useQuery({
    queryKey: blKeys.detail(blNo),
    queryFn: async () => {
      const res = await fetchBLDetail(blNo);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    enabled: Boolean(blNo) && enabled,
  });
}

export function useBLChargesQuery(blNo: string, enabled = false) {
  return useQuery({
    queryKey: blKeys.charges(blNo),
    queryFn: async () => {
      const res = await fetchBLCharges(blNo);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    enabled: Boolean(blNo) && enabled,
  });
}

export function useBLFromSIQuery(siNo: string, enabled = false) {
  return useQuery({
    queryKey: [...blKeys.all, 'from-si', siNo],
    queryFn: async () => {
      const res = await fetchBLFromSI(siNo);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    enabled: Boolean(siNo) && enabled,
  });
}

export function useBLPrintMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      blNo,
      type,
      appVersion,
    }: {
      blNo: string;
      type: BLPrintType;
      appVersion?: '1' | '2';
    }) => {
      const res = await downloadBLDocument(blNo, type, appVersion);
      if (res.error) throw new Error(res.error.message);
      return { blob: res.data, blNo, type };
    },
    onSuccess: ({ blob, blNo, type }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `${blNo}-${type}.pdf`,
      });
      a.click();
      URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: blKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blKeys.detail(blNo) });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useBLBatchPrintMutation() {
  const { t } = useTranslation('bill-of-lading');
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (blNos: string[]) => {
      const res = await batchPrintBL(blNos);
      if (res.error) throw new Error(res.error.message);
      return { blob: res.data, blNos };
    },
    onSuccess: ({ blob }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: 'bl-batch-print.pdf',
      });
      a.click();
      URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: blKeys.lists() });
      toast.success(t('toasts.batchPrintDownloaded'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useBLVerifyMutation() {
  const { t } = useTranslation('bill-of-lading');
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: verifyBL,
    onSuccess: (res, blNo) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(t('toasts.acceptedAndConfirmed'));
      queryClient.invalidateQueries({ queryKey: blKeys.detail(blNo) });
      queryClient.invalidateQueries({ queryKey: blKeys.lists() });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useBLCancelMutation() {
  const { t } = useTranslation('bill-of-lading');
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: cancelBL,
    onSuccess: (res, blNo) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(t('toasts.submittedCancelled'));
      queryClient.invalidateQueries({ queryKey: blKeys.detail(blNo) });
      queryClient.invalidateQueries({ queryKey: blKeys.lists() });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useBLSubmitMutation() {
  const { t } = useTranslation('bill-of-lading');
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: submitBL,
    onSuccess: (res, blNo) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(t('toasts.submittedSuccessfully'));
      queryClient.invalidateQueries({ queryKey: blKeys.detail(blNo) });
      queryClient.invalidateQueries({ queryKey: blKeys.lists() });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useBLIssueMutation() {
  const { t } = useTranslation('bill-of-lading');
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: issueBL,
    onSuccess: (res, blNo) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(t('toasts.issued'));
      queryClient.invalidateQueries({ queryKey: blKeys.detail(blNo) });
      queryClient.invalidateQueries({ queryKey: blKeys.lists() });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useBLSaveDraftMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ blNo, payload }: { blNo: string; payload: Partial<BLDTO> }) =>
      saveBLDraft(blNo, payload),
    onSuccess: (res, { blNo }) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      queryClient.setQueryData(blKeys.detail(blNo), res.data);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useBLUpdateMutation() {
  const { t } = useTranslation('bill-of-lading');
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ blNo, payload }: { blNo: string; payload: Partial<BLDTO> }) =>
      updateBL(blNo, payload),
    onSuccess: (res, { blNo }) => {
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(t('toasts.saved'));
      queryClient.invalidateQueries({ queryKey: blKeys.detail(blNo) });
      queryClient.invalidateQueries({ queryKey: blKeys.lists() });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useMCNListQuery() {
  return useQuery({
    queryKey: blKeys.mcn.lists(),
    queryFn: async () => {
      const res = await fetchMCNList();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });
}

export function useMCNDetailQuery(mcnId: string, enabled = true) {
  return useQuery({
    queryKey: blKeys.mcn.detail(mcnId),
    queryFn: async () => {
      const res = await fetchMCNDetail(mcnId);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    enabled: Boolean(mcnId) && enabled,
  });
}

export function useMCNPrintMutation() {
  const { t } = useTranslation('bill-of-lading');
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ mcnId, manifestType }: { mcnId: string; manifestType?: string }) => {
      const res = await downloadMCNManifest(mcnId, manifestType);
      if (res.error) throw new Error(res.error.message);
      return { blob: res.data, mcnId };
    },
    onSuccess: ({ blob, mcnId }) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `${mcnId}-manifest.pdf`,
      });
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('toasts.manifestDownloaded'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
