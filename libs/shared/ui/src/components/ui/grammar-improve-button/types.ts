/**
 * Opt-in grammar improvement configuration accepted by `AppTextarea`,
 * `FormTextarea`, and `RichTextEditor`. Presence of this object enables the
 * "Improve Grammar" button inside the field.
 *
 * shared-ui handles button rendering, loading state, and positioning. The
 * consuming app owns the API call (via `improveGrammar`) and all UX
 * side-effects (toasts, error messages) via `onError`.
 */
export interface GrammarImproveProp {
  /**
   * Caller-owned grammar improvement function. Receives the current plain text
   * content and must resolve with the corrected text. If it rejects, the
   * component reports the error via `onError`.
   */
  improveGrammar: (text: string) => Promise<string>;
  /**
   * Optional sink for errors that occur during grammar improvement. The
   * component calls this when `improveGrammar` rejects.
   */
  onError?: (error: unknown) => void;
  /**
   * Optional callback fired when the field contains rich text formatting
   * (bold, italic, links, lists, headings) that will be simplified after
   * grammar correction. Use to show a warning toast or UI hint.
   */
  onFormattingLoss?: () => void;
}

export interface GrammarImproveButtonProps {
  /** Grammar configuration. Presence enables the button. */
  grammarImprove: GrammarImproveProp;
  /**
   * The current field value. The button only renders when this is a non-empty
   * string (after stripping HTML tags for rich text).
   */
  currentValue: string;
  /**
   * Called when grammar improvement completes. Receives the corrected text the
   * caller should apply to the underlying field.
   */
  onResult: (correctedText: string) => void;
  /**
   * If true, the button is suppressed entirely. Used by parent fields to hide
   * the button when they are `disabled` or `readOnly`.
   */
  disabled?: boolean;
  /**
   * Optional hover tooltip label. Defaults to "Improve Grammar".
   */
  tooltip?: string;
  /**
   * When true, always renders as an icon-only button regardless of viewport
   * size. Used by `AppTextarea` where horizontal space is limited and the
   * button must fit within the reserved `paddingRight`.
   */
  iconOnly?: boolean;
}
