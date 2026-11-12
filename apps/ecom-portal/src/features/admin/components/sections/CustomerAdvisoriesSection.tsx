// Created by Sekar Nagarajan (2026-11-12 12:40)
/** Customer Advisories tab. */
import {
  useCreateAdvisoryMutation,
  useCustomerAdvisoriesQuery,
} from "../../api/admin.queries";
import { CustomerAdvisoryView } from "../CustomerAdvisoryView";
import { AdminSectionState } from "../shared/AdminSectionState";

export function CustomerAdvisoriesSection() {
  const query = useCustomerAdvisoriesQuery();
  const create = useCreateAdvisoryMutation();

  return (
    <AdminSectionState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
    >
      <CustomerAdvisoryView
        advisories={query.data ?? []}
        onCreate={create.mutateAsync}
      />
    </AdminSectionState>
  );
}
