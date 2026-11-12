// Modified by Sekar Nagarajan (2026-11-12 13:40)
/** Global Configuration tab — a failed load shows an error state with retry instead of spinning forever. */
import {
  useGlobalConfigQuery,
  useUpdateGlobalConfigMutation,
} from "../../api/admin.queries";
import type { GlobalConfig } from "../../types/admin.types";
import { settleMutation } from "../../utils/admin.utils";
import { GlobalConfigAdminView } from "../GlobalConfigAdminView";
import { AdminSectionState } from "../shared/AdminSectionState";

export function GlobalConfigSection() {
  const query = useGlobalConfigQuery();
  const update = useUpdateGlobalConfigMutation();

  return (
    <AdminSectionState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
    >
      {query.data ? (
        <GlobalConfigAdminView
          config={query.data}
          isSaving={update.isPending}
          onSave={(config: GlobalConfig) =>
            settleMutation(() => update.mutateAsync(config))
          }
        />
      ) : null}
    </AdminSectionState>
  );
}
