// Created by Sekar Nagarajan (2026-11-12 12:40)
/** Module Creation tab — self-contained data wiring around the existing view (redesigned in Phase 5). */
import {
  useCreateMenuMutation,
  useMenuConfigsQuery,
  useUpdateMenuConfigsMutation,
} from "../../api/admin.queries";
import type { MenuConfig, MenuCreatePayload } from "../../types/admin.types";
import { settleMutation } from "../../utils/admin.utils";
import { MenuManagementView } from "../MenuManagementView";
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
      <MenuManagementView
        menus={query.data ?? []}
        onSave={(menus: MenuConfig[]) =>
          settleMutation(() => updateMenus.mutateAsync(menus))
        }
        onCreate={(data: MenuCreatePayload) =>
          settleMutation(() => createMenu.mutateAsync(data))
        }
      />
    </AdminSectionState>
  );
}
