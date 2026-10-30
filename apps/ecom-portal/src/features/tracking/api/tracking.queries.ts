// Modified by Sekar Nagarajan (2026-10-19)
import { useMutation } from '@tanstack/react-query';

import type { ShareTrackingMailInput } from '../types/tracking.types';
import { trackingApi } from './tracking.api';

export function useShareTrackingMailMutation() {
  return useMutation({
    mutationFn: (input: ShareTrackingMailInput) =>
      trackingApi.shareTrackingByMail(input),
  });
}
