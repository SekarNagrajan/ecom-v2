// Created by Sekar Nagarajan (2026-08-26 15:06)
export const userCreationKeys = {
  all: ["user-creation"] as const,
  lists: () => [...userCreationKeys.all, "list"] as const,
  list: () => [...userCreationKeys.lists()] as const,
  limits: () => [...userCreationKeys.all, "limit"] as const,
  limit: () => [...userCreationKeys.limits()] as const,
};
