// Created by Sekar Nagarajan (2026-08-26 14:26)
import type { DOListFilters } from "../types/delivery-order.types";

export const doKeys = {
  all: ["delivery-orders"] as const,
  lists: () => [...doKeys.all, "list"] as const,
  list: (filters: DOListFilters = {}) =>
    [...doKeys.lists(), filters] as const,
};
