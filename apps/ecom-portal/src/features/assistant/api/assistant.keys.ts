// Modified by Sekar Nagarajan (2026-10-20 13:05)
export const assistantKeys = {
  all: ["assistant"] as const,
  conversation: (id: string) =>
    [...assistantKeys.all, "conversation", id] as const,
};
