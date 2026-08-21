import type { AudioDictationError } from '../../../hooks/use-audio-recorder';

/**
 * Opt-in audio dictation configuration accepted by `AppTextarea`,
 * `FormTextarea`, and `RichTextEditor`. Presence of this object enables the
 * mic button.
 *
 * shared-ui handles recording mechanics and surfaces typed `AudioDictationError`
 * values via `onError`. shared-ui never renders toasts or any user-facing copy
 * for these errors — that is the consuming app's responsibility.
 */
export interface AudioDictationProp {
  /**
   * Caller-owned transcription function. Receives the recorded audio `File`
   * and an `AbortSignal` that the button aborts when the host component
   * unmounts or the user starts a new recording before the previous request
   * resolves. Implementations should forward the signal to their HTTP client
   * (e.g. `axios.post(url, body, { signal })`) so cancelled requests don't
   * hold network/CPU. Must resolve with the plain transcript text. If it
   * rejects with anything other than an `AbortError`, the component reports
   * `{ kind: 'transcription-failed', cause }` via `onError`.
   */
  transcribe: (file: File, signal: AbortSignal) => Promise<string>;
  /**
   * Optional sink for typed dictation errors. The component will call this for
   * every error path (permission denied, unsupported browser, missing mic,
   * recording failure, transcription failure, max-length truncation).
   */
  onError?: (error: AudioDictationError) => void;
  /**
   * Optional cap on a single recording in seconds. When exceeded, the
   * component automatically stops recording and proceeds with the captured
   * audio. Defaults to no cap.
   */
  maxDurationSeconds?: number;
}

export interface AudioDictationButtonProps {
  /** Dictation configuration. Presence enables the button. */
  audioDictation: AudioDictationProp;
  /**
   * Called when transcription completes. Receives the transcript text the
   * caller should fold into the underlying field (append / replace / insert).
   */
  onResult: (text: string) => void;
  /**
   * If true, the button is suppressed entirely. Used by parent fields to hide
   * the mic when they are `disabled` or `readOnly`.
   */
  disabled?: boolean;
  /**
   * Optional hover tooltip label. shared-ui ships with no default copy — pass
   * a localized label here if you want one.
   */
  tooltip?: string;
  /**
   * Tooltip label shown while recording. Defaults to `tooltip` when absent.
   */
  recordingTooltip?: string;
  /**
   * Tooltip label shown while a transcription request is in flight. Defaults
   * to `tooltip` when absent.
   */
  transcribingTooltip?: string;
}
