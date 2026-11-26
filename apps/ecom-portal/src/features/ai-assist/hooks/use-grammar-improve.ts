// Modified by Sekar Nagarajan (2026-09-29 12:30)
import type { GrammarImproveProp } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useTranslation } from "react-i18next";

import {
  checkAiGrammar,
  extractAiAssistError,
} from "../api/ai-assist.api";

/**
 * Wires shared-ui `grammarImprove` to ecom `/api/ai/grammar`.
 * Pass into FormTextarea / AppTextarea / FormRichTextEditor.
 */
export function useGrammarImprove(): GrammarImproveProp {
  const { t } = useTranslation("ai-assist");
  const toast = useToast();

  return {
    improveGrammar: async (text: string): Promise<string> => {
      const trimmed = text.trim();
      if (!trimmed) {
        toast.warning(t("toasts.grammarEmptyInput"));
        return text;
      }

      const response = await checkAiGrammar({ grammartext: trimmed });
      const corrected = response.data.correctedText;

      if (!corrected || typeof corrected !== "string" || !corrected.trim()) {
        toast.warning(t("toasts.grammarEmptyResponse"));
        return text;
      }

      return corrected;
    },
    onError: (error: unknown) => {
      toast.error(extractAiAssistError(error));
    },
    onFormattingLoss: () => {
      toast.info(t("toasts.grammarFormattingLoss"));
    },
  };
}
