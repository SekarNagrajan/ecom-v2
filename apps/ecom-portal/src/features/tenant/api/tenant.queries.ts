// Modified by Sekar Nagarajan (2026-09-08 10:50)
import { queryOptions } from "@tanstack/react-query";

import { fetchPublicTenant } from "./tenant.api";

export const tenantKeys = {
  all: ["tenant"] as const,
  public: () => [...tenantKeys.all, "public"] as const,
};

export const publicTenantQueryOptions = () =>
  queryOptions({
    queryKey: tenantKeys.public(),
    queryFn: fetchPublicTenant,
    staleTime: Infinity,
    retry: 1,
  });
