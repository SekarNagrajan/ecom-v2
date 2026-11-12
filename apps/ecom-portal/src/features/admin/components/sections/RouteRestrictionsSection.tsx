// Created by Sekar Nagarajan (2026-11-12 12:40)
/** Route Restrictions tab — an empty list renders a blank state instead of nothing. */
import {
  useServiceRestrictionsQuery,
  useUpdateServiceRestrictionsMutation,
} from "../../api/admin.queries";
import type { ServiceRestriction } from "../../types/admin.types";
import { settleMutation } from "../../utils/admin.utils";
import { ServiceRestrictionsView } from "../ServiceRestrictionsView";
import { AdminSectionState } from "../shared/AdminSectionState";

export function RouteRestrictionsSection() {
  const query = useServiceRestrictionsQuery();
  const update = useUpdateServiceRestrictionsMutation();
  const restrictions = query.data ?? [];

  return (
    <AdminSectionState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
      isEmpty={!query.isLoading && restrictions.length === 0}
      emptyTitle="No route restrictions configured"
      emptyMessage="Service-loop lane restrictions will appear here once they exist on the server."
    >
      <ServiceRestrictionsView
        restrictions={restrictions}
        onSave={(items: ServiceRestriction[]) =>
          settleMutation(() => update.mutateAsync(items))
        }
      />
    </AdminSectionState>
  );
}
