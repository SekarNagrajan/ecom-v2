// Modified by Sekar Nagarajan (2026-09-29 12:30)
import type { ToneRewriteProp } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useTranslation } from "react-i18next";

import {
  extractAiAssistError,
  rewriteAiContent,
} from "../api/ai-assist.api";
import type { AiRewriteAction } from "../api/ai-assist.types";
import { getAiRewriteDropdownActions } from "../utils/rewrite-actions";

/**
 * Wires shared-ui `toneRewrite` to ecom `/api/ai/rewrite`.
 * Pass into FormRichTextEditor / RichTextEditor only (not plain FormTextarea).
 */
export function useToneRewrite(): ToneRewriteProp {
  const { t } = useTranslation("ai-assist");
  const toast = useToast();

  return {
    actions: getAiRewriteDropdownActions(t),
    rewrite: async (contentHtml: string, actionKey: string) => {
      const trimmed = contentHtml.replace(/<[^>]*>/g, "").trim();

      if (!trimmed) {
        toast.warning(t("toasts.rewriteEmptyInput"));
        return contentHtml;
      }

      const response = await rewriteAiContent({
        content_html: contentHtml,
        action: actionKey as AiRewriteAction,
      });

      if (!response.ok || !response.rewritten_html?.trim()) {
        toast.warning(t("toasts.rewriteEmptyResponse"));
        return contentHtml;
      }

      return response.rewritten_html;
    },
    onError: (error: unknown) => {
      toast.error(extractAiAssistError(error));
    },
  };
}
