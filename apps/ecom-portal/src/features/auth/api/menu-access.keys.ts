// Created by Sekar Nagarajan (2026-08-27 12:00)

export const menuAccessKeys = {
  all: ['menu-access'] as const,
  categories: () => [...menuAccessKeys.all, 'categories'] as const,
};
