// Modified by Sekar Nagarajan (2026-09-29 12:30)
import { useTranslation } from "react-i18next";

import { useAiDictation } from "./use-ai-dictation";
import { useGrammarImprove } from "./use-grammar-improve";
import { useToneRewrite } from "./use-tone-rewrite";

/**
 * Convenience bundle for free-text fields.
 * - Plain FormTextarea / AppTextarea: use `grammarImprove` + `audioDictation`
 * - FormRichTextEditor: also pass `toneRewrite`
 */
export function useAiTextAssist() {
  const { t } = useTranslation("ai-assist");
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
      grammarImproveTooltip: t("tooltips.grammarImprove"),
      dictationTooltip: t("tooltips.dictation"),
      dictationRecordingTooltip: t("tooltips.dictationRecording"),
      dictationTranscribingTooltip: t("tooltips.dictationTranscribing"),
    },
    /** Props for FormRichTextEditor (includes tone rewrite) */
    richTextAssistProps: {
      grammarImprove,
      audioDictation,
      toneRewrite,
      grammarImproveTooltip: t("tooltips.grammarImprove"),
      dictationTooltip: t("tooltips.dictation"),
      dictationRecordingTooltip: t("tooltips.dictationRecording"),
      dictationTranscribingTooltip: t("tooltips.dictationTranscribing"),
      toneRewriteTooltip: t("tooltips.toneRewrite"),
    },
  };
}
