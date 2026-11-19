// Created by Sekar Nagarajan (2026-09-28 16:17)
export const accessibilityKeys = {
  all: ["accessibility"] as const,
  me: () => [...accessibilityKeys.all, "me"] as const,
};
