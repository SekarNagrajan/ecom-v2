import type { GetProps, Input } from 'antd';

import type { AudioDictationProp } from '../audio-dictation-button';
import type { GrammarImproveProp } from '../grammar-improve-button';

type AntTextAreaProps = GetProps<typeof Input.TextArea>;

/**
 * Standalone (non-RHF) textarea props. Mirrors AntD's `Input.TextArea` plus an
 * optional `audioDictation` opt-in that surfaces a mic button in the bottom
 * right corner of the field.
 */
export interface AppTextareaProps extends AntTextAreaProps {
  /**
   * When present, the textarea renders a mic button in the bottom-right
   * corner. shared-ui handles recording mechanics and appends the transcript
   * to the current value with a newline separator. All UX side-effects (toast
   * copy, denial UI, analytics) belong to the caller via `audioDictation.onError`.
   */
  audioDictation?: AudioDictationProp;
  /**
   * Tooltip for the dictation mic button. shared-ui ships no default copy —
   * pass a localized string if you want a tooltip.
   */
  dictationTooltip?: string;
  /**
   * Tooltip while recording is in progress. Defaults to `dictationTooltip`.
   */
  dictationRecordingTooltip?: string;
  /**
   * Tooltip while transcription is in flight. Defaults to `dictationTooltip`.
   */
  dictationTranscribingTooltip?: string;
  /**
   * When present, the textarea renders an "Improve Grammar" button in the
   * bottom-right corner (to the left of the dictation mic if both are
   * enabled). Only visible when the field has non-empty content.
   */
  grammarImprove?: GrammarImproveProp;
  /**
   * Tooltip for the grammar improve button. Defaults to "Improve Grammar".
   */
  grammarImproveTooltip?: string;
}
