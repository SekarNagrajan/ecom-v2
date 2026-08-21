import { AudioOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Spin, Tooltip, theme } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { useAudioRecorder } from '../../../hooks/use-audio-recorder';
import type { AudioDictationButtonProps } from './types';

type ButtonState = 'idle' | 'recording' | 'transcribing';

/**
 * Internal shared mic button used by `AppTextarea`, `FormTextarea`, and
 * `RichTextEditor`. Owns the three visual states (idle / recording /
 * transcribing) and the record -> transcribe -> emit-result lifecycle. The
 * component is intentionally UX-agnostic — it surfaces every error path via
 * the caller-provided `audioDictation.onError` callback and never renders
 * toasts, modals, or copy strings beyond an optional caller-supplied tooltip.
 *
 * Production-safety guarantees:
 * - In-flight transcription requests are aborted on unmount and on a new
 *   record click, so navigating away mid-record/transcribe never wastes
 *   network/CPU or fires setState on a torn-down component.
 * - The latest transcribe / onResult / onError callbacks are tracked via
 *   effect-synced refs (no ref mutation during render).
 * - Visual state is derived from the recorder's `isRecording` flag plus a
 *   single local `isTranscribing` boolean — no duplicated state to drift.
 *
 * Positioning is the parent's responsibility. The button itself only emits a
 * small square Button — wrap it in an absolutely-positioned container.
 */
export function AudioDictationButton({
  audioDictation,
  onResult,
  disabled = false,
  tooltip,
  recordingTooltip,
  transcribingTooltip,
}: AudioDictationButtonProps) {
  const { token } = theme.useToken();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Latest-callback refs. Synced via effects so we never mutate refs during
  // render — keeps the component compatible with React 19's stricter
  // rendering rules and the React Compiler.
  const transcribeRef = useRef(audioDictation.transcribe);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(audioDictation.onError);

  useEffect(() => {
    transcribeRef.current = audioDictation.transcribe;
  }, [audioDictation.transcribe]);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = audioDictation.onError;
  }, [audioDictation.onError]);

  // Holds the AbortController used for the in-flight transcription request.
  // Aborted when (a) the component unmounts, (b) a new recording starts, or
  // (c) the transcription completes normally.
  const transcribeAbortRef = useRef<AbortController | null>(null);

  const abortInFlight = () => {
    if (transcribeAbortRef.current) {
      transcribeAbortRef.current.abort();
      transcribeAbortRef.current = null;
    }
  };

  const recorder = useAudioRecorder({
    maxDurationSeconds: audioDictation.maxDurationSeconds,
    onComplete: (file) => {
      // Abort any prior in-flight transcription before starting a new one.
      abortInFlight();
      const controller = new AbortController();
      transcribeAbortRef.current = controller;
      setIsTranscribing(true);

      transcribeRef
        .current(file, controller.signal)
        .then((text) => {
          if (controller.signal.aborted) {
            return;
          }
          const trimmed = text.trim();
          if (trimmed.length > 0) {
            onResultRef.current(trimmed);
          }
        })
        .catch((cause: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          onErrorRef.current?.({ kind: 'transcription-failed', cause });
        })
        .finally(() => {
          if (transcribeAbortRef.current === controller) {
            transcribeAbortRef.current = null;
          }
          if (!controller.signal.aborted) {
            setIsTranscribing(false);
          }
        });
    },
    onError: (err) => {
      // Recorder failures land here as typed AudioDictationError. We forward
      // them to the consumer and reset the optimistic 'starting' flag in
      // lock-step so the UI returns to idle.
      setIsStarting(false);
      onErrorRef.current?.(err);
    },
  });

  // Cancel any in-flight transcription on unmount.
  useEffect(() => {
    return () => {
      abortInFlight();
    };
  }, []);

  if (!recorder.isSupported || disabled) {
    return null;
  }

  // Derived UI state: 'transcribing' wins over 'recording' wins over 'idle'.
  // `isStarting` covers the brief window between click and getUserMedia
  // resolving so the user gets immediate visual feedback.
  const state: ButtonState = isTranscribing
    ? 'transcribing'
    : recorder.isRecording || isStarting
    ? 'recording'
    : 'idle';

  const handleClick = () => {
    if (state === 'transcribing') {
      return;
    }
    if (state === 'recording') {
      setIsStarting(false);
      if (recorder.isRecording) {
        // Stay in 'recording' until onComplete fires and we flip to
        // 'transcribing'. This avoids a flicker between stop-click and the
        // transcription request landing.
        recorder.stopRecording();
      } else {
        // User cancelled during the brief "starting" window before
        // getUserMedia resolved. Invalidate the pending start so the
        // recorder doesn't surprise-start a moment later.
        recorder.clearRecording();
      }
      return;
    }
    setIsStarting(true);
    recorder.startRecording().finally(() => {
      // Whether or not the recorder actually started, drop the optimistic
      // flag — `recorder.isRecording` is now the source of truth.
      setIsStarting(false);
    });
  };

  const icon =
    state === 'transcribing' ? (
      <Spin size="small" />
    ) : state === 'recording' ? (
      <StopOutlined />
    ) : (
      <AudioOutlined />
    );

  const activeTooltip =
    state === 'transcribing'
      ? transcribingTooltip ?? tooltip
      : state === 'recording'
      ? recordingTooltip ?? tooltip
      : tooltip;

  const buttonStyle =
    state === 'recording'
      ? { color: token.colorError }
      : { color: token.colorTextSecondary };

  const button = (
    <Button
      type="text"
      size="small"
      shape="circle"
      icon={icon}
      onClick={handleClick}
      disabled={state === 'transcribing'}
      aria-pressed={state === 'recording'}
      aria-label={tooltip ?? 'Record audio'}
      aria-busy={state === 'transcribing'}
      style={buttonStyle}
    />
  );

  if (!activeTooltip) {
    return button;
  }

  return <Tooltip title={activeTooltip}>{button}</Tooltip>;
}
