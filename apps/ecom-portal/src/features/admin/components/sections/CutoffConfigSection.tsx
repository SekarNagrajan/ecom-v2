// Modified by Sekar Nagarajan (2026-11-12 14:40)
/** Cutoff Configuration tab. */
import {
  useCreateCutoffMutation,
  useCutoffConfigsQuery,
  useDeleteCutoffMutation,
  useUpdateCutoffMutation,
} from "../../api/admin.queries";
import { CutoffConfigView } from "../CutoffConfigView";
import { AdminSectionState } from "../shared/AdminSectionState";

export function CutoffConfigSection() {
  const query = useCutoffConfigsQuery();
  const create = useCreateCutoffMutation();
  const update = useUpdateCutoffMutation();
  const remove = useDeleteCutoffMutation();

  return (
    <AdminSectionState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
    >
      <CutoffConfigView
        cutoffConfigs={query.data ?? []}
        onCreate={create.mutateAsync}
        onUpdate={update.mutateAsync}
        onDelete={remove.mutateAsync}
        isSaving={create.isPending || update.isPending}
        isFetching={query.isFetching || remove.isPending}
      />
    </AdminSectionState>
  );
}
