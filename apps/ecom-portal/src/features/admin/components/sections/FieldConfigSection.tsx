// Modified by Sekar Nagarajan (2026-11-12 14:10)
/** Field Configuration tab. */
import {
  useFieldConfigsQuery,
  useUpdateFieldConfigsMutation,
} from "../../api/admin.queries";
import type { FieldConfig } from "../../types/admin.types";
import { settleMutation } from "../../utils/admin.utils";
import { FieldConfigView } from "../FieldConfigView";
import { AdminSectionState } from "../shared/AdminSectionState";

export function FieldConfigSection() {
  const query = useFieldConfigsQuery();
  const update = useUpdateFieldConfigsMutation();

  return (
    <AdminSectionState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
    >
      <FieldConfigView
        fields={query.data ?? []}
        isSaving={update.isPending}
        isFetching={query.isFetching}
        onSave={(fields: FieldConfig[]) =>
          settleMutation(() => update.mutateAsync(fields))
        }
      />
    </AdminSectionState>
  );
}
