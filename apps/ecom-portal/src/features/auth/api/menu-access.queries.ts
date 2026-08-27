// Created by Sekar Nagarajan (2026-08-27 12:00)
import { queryOptions, useQuery } from '@tanstack/react-query';

import { fetchMenuCategories } from './menu-access.api';
import { menuAccessKeys } from './menu-access.keys';

export const menuCategoriesQueryOptions = queryOptions({
  queryKey: menuAccessKeys.categories(),
  queryFn: fetchMenuCategories,
  staleTime: 1000 * 60 * 30, // 30 minutes
  gcTime: 1000 * 60 * 60, // 1 hour
  meta: { persist: true },
});

export function useMenuCategories() {
  return useQuery(menuCategoriesQueryOptions);
}
