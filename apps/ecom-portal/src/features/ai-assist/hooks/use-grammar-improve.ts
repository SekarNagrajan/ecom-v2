// Modified by Sekar Nagarajan (2026-09-11 18:25)
import type { GrammarImproveProp } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";

import {
  checkAiGrammar,
  extractAiAssistError,
} from "../api/ai-assist.api";

/**
 * Wires shared-ui `grammarImprove` to ecom `/api/ai/grammar`.
 * Pass into FormTextarea / AppTextarea / FormRichTextEditor.
 */
export function useGrammarImprove(): GrammarImproveProp {
  const toast = useToast();

  return {
    improveGrammar: async (text: string): Promise<string> => {
      const trimmed = text.trim();
      if (!trimmed) {
        toast.warning("Add text before improving grammar.");
        return text;
      }

      const response = await checkAiGrammar({ grammartext: trimmed });
      const corrected = response.data.correctedText;

      if (!corrected || typeof corrected !== "string" || !corrected.trim()) {
        toast.warning(
          "Grammar service returned an empty response. No changes applied.",
        );
        return text;
      }

      return corrected;
    },
    onError: (error: unknown) => {
      toast.error(extractAiAssistError(error));
    },
    onFormattingLoss: () => {
      toast.info(
        "Note: Text formatting (bold, links, lists) will be simplified after grammar correction.",
      );
    },
  };
}
