// Created by Sekar Nagarajan (2026-09-28 15:22)

export const hotlineKeys = {
  all: ["agency-hotline"] as const,
  contacts: () => [...hotlineKeys.all, "contacts"] as const,
};
