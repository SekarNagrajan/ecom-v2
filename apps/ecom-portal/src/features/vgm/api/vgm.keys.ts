// Created by Sekar Nagarajan (2026-08-26 12:48)
export const vgmKeys = {
  all: ["vgm"] as const,
  searches: () => [...vgmKeys.all, "search"] as const,
  search: (type: "bookno" | "blno", referenceNo: string) =>
    [...vgmKeys.searches(), type, referenceNo] as const,
};
