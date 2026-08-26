// Modified by Sekar Nagarajan (2026-08-26 14:50)
export const arrivalNoticeKeys = {
  all: ["arrival-notices"] as const,
  lists: () => [...arrivalNoticeKeys.all, "list"] as const,
  list: (fromDate?: string, toDate?: string) =>
    [...arrivalNoticeKeys.lists(), { fromDate, toDate }] as const,
  details: () => [...arrivalNoticeKeys.all, "detail"] as const,
  detail: (anNo: string) => [...arrivalNoticeKeys.details(), anNo] as const,
};
