// Modified by Sekar Nagarajan (2026-11-12 14:10)
/** Banners & Assets tab. */
import { useBannersQuery, useCreateBannerMutation } from "../../api/admin.queries";
import { BannerManagerView } from "../BannerManagerView";
import { AdminSectionState } from "../shared/AdminSectionState";

export function BannersSection() {
  const query = useBannersQuery();
  const create = useCreateBannerMutation();

  return (
    <AdminSectionState
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => void query.refetch()}
    >
      <BannerManagerView
        banners={query.data ?? []}
        onCreate={create.mutateAsync}
        isCreating={create.isPending}
        isFetching={query.isFetching}
      />
    </AdminSectionState>
  );
}
