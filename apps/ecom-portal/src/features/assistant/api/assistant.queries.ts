// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { useMutation, useQuery } from "@tanstack/react-query";

import type { FeedbackBody } from "../types/assistant.types";
import { getConversation, sendFeedback } from "./assistant.api";
import { assistantKeys } from "./assistant.keys";

export function useAssistantConversationQuery(id: string | null) {
  return useQuery({
    queryKey: assistantKeys.conversation(id ?? ""),
    queryFn: () => getConversation(id!),
    enabled: Boolean(id),
  });
}

export function useAssistantFeedbackMutation() {
  return useMutation({
    mutationFn: (body: FeedbackBody) => sendFeedback(body),
  });
}
