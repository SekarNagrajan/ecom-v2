// Modified by Sekar Nagarajan (2026-11-12 15:10)
/** Module Creation tab. */
import {
  useCreateMenuMutation,
  useMenuConfigsQuery,
  useUpdateMenuConfigsMutation,
} from "../../api/admin.queries";
import type { MenuConfig, MenuCreatePayload } from "../../types/admin.types";
import { settleMutation } from "../../utils/admin.utils";
import { ModuleCreationView } from "../ModuleCreationView";
import { AdminSectionState } from "../shared/AdminSectionState";

export function ModuleCreationSection() {
  const query = useMenuConfigsQuery();
  const updateMenus = useUpdateMenuConfigsMutation();
  const createMenu = useCreateMenuMutation();

  return (
    <AdminSectionState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
    >
      <ModuleCreationView
        menus={query.data ?? []}
        isSaving={updateMenus.isPending || createMenu.isPending}
        isFetching={query.isFetching}
        onCreate={(data: MenuCreatePayload) => createMenu.mutateAsync(data).then(() => undefined)}
        onSaveAll={(menus: MenuConfig[]) =>
          settleMutation(() => updateMenus.mutateAsync(menus))
        }
      />
    </AdminSectionState>
  );
}
