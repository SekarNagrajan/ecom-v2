import { useEffect, useRef, useState } from 'react';

/**
 * Typed, app-agnostic representation of every failure path the audio recorder
 * (and the audio-dictation flow built on top of it) can produce. shared-ui
 * never renders human-readable copy for these — the consuming app picks the
 * surface (toast / inline / modal / silent) and the wording.
 */
export type AudioDictationError =
  | { kind: 'permission-denied'; cause: unknown }
  // No MediaRecorder / getUserMedia on this device or browser.
  | { kind: 'unsupported'; cause?: unknown }
  // navigator returned NotFoundError / OverconstrainedError — no usable mic.
  | { kind: 'no-microphone'; cause: unknown }
  // MediaRecorder failed mid-stream (onerror, abort, etc.).
  | { kind: 'recording-failed'; cause: unknown }
  // The caller-provided transcribe() threw.
  | { kind: 'transcription-failed'; cause: unknown }
  // Append result would have exceeded the consumer's maxLength.
  | { kind: 'max-length-exceeded'; truncatedChars: number };

const SUPPORTED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

function getRecordingMimeType() {
  if (typeof MediaRecorder === 'undefined') {
    return '';
  }
  return (
    SUPPORTED_MIME_TYPES.find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType)
    ) ?? ''
  );
}

function getRecordingExtension(mimeType: string) {
  if (mimeType.includes('ogg')) {
    return 'ogg';
  }
  if (mimeType.includes('mp4')) {
    return 'mp4';
  }
  return 'webm';
}

/**
 * Maps a thrown `getUserMedia` error to an `AudioDictationError` shape.
 * shared-ui only classifies the error — it never produces copy.
 */
function classifyGetUserMediaError(error: unknown): AudioDictationError {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
      return { kind: 'permission-denied', cause: error };
    }
    if (
      error.name === 'NotFoundError' ||
      error.name === 'OverconstrainedError' ||
      error.name === 'DevicesNotFoundError'
    ) {
      return { kind: 'no-microphone', cause: error };
    }
  }
  return { kind: 'recording-failed', cause: error };
}

export interface UseAudioRecorderOptions {
  /**
   * Fires once `MediaRecorder.onstop` has produced a finalized `File`. Use
   * this to chain a recording into immediate transcription/upload work
   * without subscribing to `recordedFile` state.
   */
  onComplete?: (file: File) => void;
  /**
   * Fires whenever the recorder transitions to an error state.
   */
  onError?: (error: AudioDictationError) => void;
  /**
   * Auto-stops the recording when this many seconds have elapsed. The hook
   * captures whatever was recorded up to that point and routes it through
   * the normal `onstop -> onComplete` path. No cap when undefined.
   */
  maxDurationSeconds?: number;
}

export interface UseAudioRecorderResult {
  clearRecording: () => void;
  error: AudioDictationError | null;
  isRecording: boolean;
  isSupported: boolean;
  recordedFile: File | null;
  recordingDurationSeconds: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

/**
 * Pure, UX-agnostic audio recorder hook.
 *
 * - Owns `MediaRecorder` + `getUserMedia` lifecycle, MIME negotiation, and a
 *   1-second duration ticker.
 * - Surfaces failures as typed `AudioDictationError` values; never renders
 *   toasts, modals, or strings.
 * - Cancellation-safe: rapid start/stop cycles, navigations away mid-record,
 *   and component unmounts are all handled without leaking media tracks or
 *   firing setState on an unmounted component.
 * - The default recorded `File` is named `recording.<ext>`. Consumers can
 *   rename the returned `File` if they need a domain-specific filename.
 */
export function useAudioRecorder(
  options?: UseAudioRecorderOptions
): UseAudioRecorderResult {
  const [error, setErrorState] = useState<AudioDictationError | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);

  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Bumped whenever a new startRecording() call happens. Late-resolving
  // getUserMedia / async work compares its captured token against this ref
  // and bails if it has been superseded (rapid start/stop, unmount, etc.).
  const generationRef = useRef(0);

  // Keep latest callback / option references reachable from MediaRecorder
  // events without re-creating the recorder. Synced via useEffect so we
  // never mutate refs during render (React 19 / compiler-friendly).
  const onCompleteRef = useRef(options?.onComplete);
  const onErrorRef = useRef(options?.onError);
  const maxDurationSecondsRef = useRef(options?.maxDurationSeconds);

  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  useEffect(() => {
    onErrorRef.current = options?.onError;
  }, [options?.onError]);

  useEffect(() => {
    maxDurationSecondsRef.current = options?.maxDurationSeconds;
  }, [options?.maxDurationSeconds]);

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined';

  const clearTimer = () => {
    if (durationIntervalRef.current !== null) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const stopStreamTracks = () => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
  };

  // Detach handlers + stop the underlying MediaRecorder so the browser
  // releases its resources without firing our React callbacks. Used when we
  // need to discard an in-flight recording (clearRecording, unmount). The
  // public stopRecording path keeps handlers attached so onstop -> onComplete
  // still fires for the captured audio.
  const detachRecorder = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop();
        } catch {
          // Best-effort — the recorder may already be torn down.
        }
      }
    }
    mediaRecorderRef.current = null;
  };

  const setError = (next: AudioDictationError | null) => {
    setErrorState(next);
    if (next) {
      onErrorRef.current?.(next);
    }
  };

  const clearRecording = () => {
    // Discard any superseded async work from the previous recording session.
    generationRef.current += 1;
    clearTimer();
    detachRecorder();
    stopStreamTracks();
    chunksRef.current = [];
    startedAtRef.current = null;
    setErrorState(null);
    setIsRecording(false);
    setRecordedFile(null);
    setRecordingDurationSeconds(0);
  };

  const startRecording = async () => {
    if (!isSupported) {
      setError({ kind: 'unsupported' });
      return;
    }

    clearRecording();
    const generation = generationRef.current;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (cause) {
      if (generation !== generationRef.current) {
        return;
      }
      setError(classifyGetUserMediaError(cause));
      return;
    }

    // Another start/stop/unmount happened while we were waiting on
    // getUserMedia — release the stream we just grabbed and bail.
    if (generation !== generationRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    try {
      const mimeType = getRecordingMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      startedAtRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Guard against late-firing onstop after a clearRecording() / unmount.
        if (generation !== generationRef.current) {
          return;
        }
        const effectiveMimeType =
          mediaRecorder.mimeType || mimeType || 'audio/webm';
        const extension = getRecordingExtension(effectiveMimeType);
        const recordingBlob = new Blob(chunksRef.current, {
          type: effectiveMimeType,
        });

        const file = new File([recordingBlob], `recording.${extension}`, {
          type: effectiveMimeType,
          lastModified: Date.now(),
        });

        setRecordedFile(file);
        setIsRecording(false);
        clearTimer();
        stopStreamTracks();
        // Detach handlers now that the session has completed cleanly.
        detachRecorder();
        onCompleteRef.current?.(file);
      };

      mediaRecorder.onerror = (event) => {
        if (generation !== generationRef.current) {
          return;
        }
        const cause = (event as unknown as { error?: unknown }).error ?? event;
        clearRecording();
        setError({ kind: 'recording-failed', cause });
      };

      // 1 second tick — updates the visible duration counter and enforces
      // the optional maxDurationSeconds cap from inside the same timer.
      durationIntervalRef.current = window.setInterval(() => {
        if (!startedAtRef.current) {
          return;
        }
        const seconds = Math.max(
          1,
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
        setRecordingDurationSeconds(seconds);

        const cap = maxDurationSecondsRef.current;
        if (
          cap !== undefined &&
          seconds >= cap &&
          mediaRecorderRef.current?.state === 'recording'
        ) {
          mediaRecorderRef.current.stop();
        }
      }, 1000); // 1 second tick

      mediaRecorder.start();
      setIsRecording(true);
    } catch (cause) {
      clearRecording();
      setError({ kind: 'recording-failed', cause });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Unmount cleanup — bump generation so any late-resolving async work
  // bails, detach handlers + stop the recorder + release tracks.
  useEffect(() => {
    return () => {
      generationRef.current += 1;
      clearTimer();
      detachRecorder();
      stopStreamTracks();
    };
    // detachRecorder/stopStreamTracks/clearTimer are stable closures over refs
    // — intentionally not in deps to avoid re-running cleanup on every render.
  }, []);

  return {
    clearRecording,
    error,
    isRecording,
    isSupported,
    recordedFile,
    recordingDurationSeconds,
    startRecording,
    stopRecording,
  };
}
