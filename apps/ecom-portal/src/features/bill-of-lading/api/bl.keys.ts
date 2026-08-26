// Modified by Sekar Nagarajan (2026-08-24 23:55)
import type { BLListFilters } from '../types/bl.types';

export const blKeys = {
  all: ['bill-of-lading'] as const,
  lists: () => [...blKeys.all, 'list'] as const,
  list: (filters: BLListFilters) => [...blKeys.lists(), filters] as const,
  details: () => [...blKeys.all, 'detail'] as const,
  detail: (blNo: string) => [...blKeys.details(), blNo] as const,
  charges: (blNo: string) => [...blKeys.all, 'charges', blNo] as const,
  mcn: {
    all: ['mcn'] as const,
    lists: () => [...blKeys.mcn.all, 'list'] as const,
    detail: (mcnId: string) => [...blKeys.mcn.all, 'detail', mcnId] as const,
  },
};
