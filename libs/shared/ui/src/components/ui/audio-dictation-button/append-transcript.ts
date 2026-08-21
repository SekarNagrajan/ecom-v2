import type { AudioDictationError } from '../../../hooks/use-audio-recorder';

export interface AppendTranscriptResult {
  /** The next value to write back to the field. */
  value: string;
  /** Truncation signal — `null` when nothing was dropped. */
  error: AudioDictationError | null;
}

/**
 * Appends a dictated transcript onto an existing string value, separating the
 * two by a newline when the previous value already contains visible
 * characters. When `maxLength` is provided, the appended portion (not the
 * entire transcript) is truncated to fit, and the result reports the number
 * of dropped characters via the `error` field so callers can route the signal
 * to their preferred UX.
 *
 * Rules:
 * - Empty or whitespace-only previous value → no leading newline, the
 *   transcript replaces whatever whitespace was there.
 * - Previous ends with a newline → no extra newline (no double-blank-line).
 * - Otherwise → single '\n' separator.
 */
export function appendTranscript(
  previous: string,
  next: string,
  maxLength?: number
): AppendTranscriptResult {
  const trimmedNext = next.trim();
  if (trimmedNext.length === 0) {
    return { value: previous, error: null };
  }

  // Treat whitespace-only previous values as empty so the user doesn't get a
  // surprise leading blank line from a stray space character.
  const previousHasContent = previous.trim().length > 0;
  const base = previousHasContent ? previous : '';
  const separator = !previousHasContent || base.endsWith('\n') ? '' : '\n';
  const candidate = `${base}${separator}${trimmedNext}`;

  if (maxLength === undefined || candidate.length <= maxLength) {
    return { value: candidate, error: null };
  }

  const remaining = Math.max(0, maxLength - base.length - separator.length);
  if (remaining <= 0) {
    return {
      value: base,
      error: {
        kind: 'max-length-exceeded',
        truncatedChars: trimmedNext.length,
      },
    };
  }

  const truncated = trimmedNext.slice(0, remaining);
  return {
    value: `${base}${separator}${truncated}`,
    error: {
      kind: 'max-length-exceeded',
      truncatedChars: trimmedNext.length - truncated.length,
    },
  };
}
