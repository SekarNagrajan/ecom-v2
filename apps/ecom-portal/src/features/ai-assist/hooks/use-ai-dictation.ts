// Modified by Sekar Nagarajan (2026-09-29 12:30)
import type {
  AudioDictationError,
  AudioDictationProp,
} from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useTranslation } from "react-i18next";

import {
  extractAiAssistError,
  transcribeAiAudio,
} from "../api/ai-assist.api";

/**
 * Wires shared-ui `audioDictation` to ecom `/api/ai/transcribe`.
 * Pass into FormTextarea / AppTextarea / FormRichTextEditor.
 */
export function useAiDictation(): AudioDictationProp {
  const { t } = useTranslation("ai-assist");
  const toast = useToast();

  return {
    transcribe: async (file, signal) => {
      const response = await transcribeAiAudio(file, signal);
      return response.data.text;
    },
    onError: (err: AudioDictationError) => {
      switch (err.kind) {
        case "permission-denied":
          toast.error(t("toasts.permissionDenied"));
          return;
        case "unsupported":
          toast.error(t("toasts.unsupported"));
          return;
        case "no-microphone":
          toast.error(t("toasts.noMicrophone"));
          return;
        case "recording-failed":
          toast.error(t("toasts.recordingFailed"));
          return;
        case "transcription-failed":
          toast.error(extractAiAssistError(err.cause));
          return;
        case "max-length-exceeded":
          toast.warning(
            t("toasts.maxLengthExceeded", {
              truncatedChars: err.truncatedChars,
            }),
          );
          return;
        default: {
          const _exhaustive: never = err;
          return _exhaustive;
        }
      }
    },
  };
}
