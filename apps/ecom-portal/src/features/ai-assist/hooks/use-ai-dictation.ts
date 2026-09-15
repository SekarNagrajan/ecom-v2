// Modified by Sekar Nagarajan (2026-09-11 18:25)
import type {
  AudioDictationError,
  AudioDictationProp,
} from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";

import {
  extractAiAssistError,
  transcribeAiAudio,
} from "../api/ai-assist.api";

/**
 * Wires shared-ui `audioDictation` to ecom `/api/ai/transcribe`.
 * Pass into FormTextarea / AppTextarea / FormRichTextEditor.
 */
export function useAiDictation(): AudioDictationProp {
  const toast = useToast();

  return {
    transcribe: async (file, signal) => {
      const response = await transcribeAiAudio(file, signal);
      return response.data.text;
    },
    onError: (err: AudioDictationError) => {
      switch (err.kind) {
        case "permission-denied":
          toast.error(
            "Microphone access is blocked. Enable it in your browser to dictate.",
          );
          return;
        case "unsupported":
          toast.error("Voice dictation is not supported in this browser.");
          return;
        case "no-microphone":
          toast.error("No microphone detected. Connect one and try again.");
          return;
        case "recording-failed":
          toast.error("Recording failed. Please try again.");
          return;
        case "transcription-failed":
          toast.error(extractAiAssistError(err.cause));
          return;
        case "max-length-exceeded":
          toast.warning(
            `Transcript truncated by ${err.truncatedChars} characters to fit the field.`,
          );
          return;
      }
    },
  };
}
