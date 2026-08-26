// Modified by Sekar Nagarajan (2026-08-25 12:10)
export const croKeys = {
  all: ['container-release-orders'] as const,
  lists: () => [...croKeys.all, 'list'] as const,
  list: (fromDate?: string, toDate?: string) =>
    [...croKeys.lists(), { fromDate, toDate }] as const,
  details: () => [...croKeys.all, 'detail'] as const,
  detail: (croNo: string) => [...croKeys.details(), croNo] as const,
  eligibility: (bookingNo: string) =>
    [...croKeys.all, 'eligibility', bookingNo] as const,
};
