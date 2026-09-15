// Modified by Sekar Nagarajan (2026-09-11 18:25)
import type { ToneRewriteProp } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";

import {
  extractAiAssistError,
  rewriteAiContent,
} from "../api/ai-assist.api";
import type { AiRewriteAction } from "../api/ai-assist.types";
import { AI_REWRITE_DROPDOWN_ACTIONS } from "../utils/rewrite-actions";

/**
 * Wires shared-ui `toneRewrite` to ecom `/api/ai/rewrite`.
 * Pass into FormRichTextEditor / RichTextEditor only (not plain FormTextarea).
 */
export function useToneRewrite(): ToneRewriteProp {
  const toast = useToast();

  return {
    actions: AI_REWRITE_DROPDOWN_ACTIONS,
    rewrite: async (contentHtml: string, actionKey: string) => {
      const trimmed = contentHtml.replace(/<[^>]*>/g, "").trim();

      if (!trimmed) {
        toast.warning("Add message content before rewriting.");
        return contentHtml;
      }

      const response = await rewriteAiContent({
        content_html: contentHtml,
        action: actionKey as AiRewriteAction,
      });

      if (!response.ok || !response.rewritten_html?.trim()) {
        toast.warning(
          "Rewrite returned an empty response. No changes applied.",
        );
        return contentHtml;
      }

      return response.rewritten_html;
    },
    onError: (error: unknown) => {
      toast.error(extractAiAssistError(error));
    },
  };
}
