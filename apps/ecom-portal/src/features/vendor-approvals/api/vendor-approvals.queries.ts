// Created by Sekar Nagarajan (2026-11-12 23:50)
import { useQuery } from "@tanstack/react-query";

import { vendorApprovalsApi } from "./vendor-approvals.api";

export const vendorApprovalsKeys = {
  all: ["vendor-approvals"] as const,
  list: () => [...vendorApprovalsKeys.all, "list"] as const,
};

export function useVendorApprovalsQuery() {
  return useQuery({
    queryKey: vendorApprovalsKeys.list(),
    queryFn: () => vendorApprovalsApi.list(),
  });
}
