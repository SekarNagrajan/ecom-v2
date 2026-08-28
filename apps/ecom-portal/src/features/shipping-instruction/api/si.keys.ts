// Created by Sekar Nagarajan (2026-08-26 12:19)
export const siKeys = {
  all: ["shipping-instruction"] as const,
  lists: () => [...siKeys.all, "list"] as const,
  list: () => [...siKeys.lists()] as const,
  details: () => [...siKeys.all, "detail"] as const,
  detail: (id: string) => [...siKeys.details(), id] as const,
  config: () => [...siKeys.all, "config"] as const,
};
