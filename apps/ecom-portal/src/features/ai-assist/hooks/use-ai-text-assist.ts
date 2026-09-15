// Modified by Sekar Nagarajan (2026-09-11 18:25)
import { useAiDictation } from "./use-ai-dictation";
import { useGrammarImprove } from "./use-grammar-improve";
import { useToneRewrite } from "./use-tone-rewrite";

/**
 * Convenience bundle for free-text fields.
 * - Plain FormTextarea / AppTextarea: use `grammarImprove` + `audioDictation`
 * - FormRichTextEditor: also pass `toneRewrite`
 */
export function useAiTextAssist() {
  const grammarImprove = useGrammarImprove();
  const audioDictation = useAiDictation();
  const toneRewrite = useToneRewrite();

  return {
    grammarImprove,
    audioDictation,
    toneRewrite,
    /** Props shared by FormTextarea / AppTextarea */
    textareaAssistProps: {
      grammarImprove,
      audioDictation,
      grammarImproveTooltip: "Improve grammar",
      dictationTooltip: "Dictate with AI",
      dictationRecordingTooltip: "Stop recording",
      dictationTranscribingTooltip: "Transcribing…",
    },
    /** Props for FormRichTextEditor (includes tone rewrite) */
    richTextAssistProps: {
      grammarImprove,
      audioDictation,
      toneRewrite,
      grammarImproveTooltip: "Improve grammar",
      dictationTooltip: "Dictate with AI",
      dictationRecordingTooltip: "Stop recording",
      dictationTranscribingTooltip: "Transcribing…",
      toneRewriteTooltip: "Rewrite with AI",
    },
  };
}
