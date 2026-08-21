import type { ReactNode } from 'react';

/**
 * Action groups shown in the tone/rewrite dropdown. `tone` covers
 * conversational-style rewrites; `rewrite` covers content transformations
 * like simplify/paraphrase/professional. The consuming app is free to pass
 * any string values — shared-ui does not enforce a specific enum so this
 * component stays reusable across mail, notes, and any other authoring
 * surface.
 */
export type ToneRewriteActionGroup = 'tone' | 'rewrite';

export interface ToneRewriteAction {
  /** Machine-readable action key sent to `rewrite()` (e.g. `friendly`). */
  key: string;
  /** Human-readable label rendered in the dropdown (e.g. "Friendly"). */
  label: string;
  /** Which group this action belongs to. Renders under the matching header. */
  group: ToneRewriteActionGroup;
  /** Optional secondary hint below the label. */
  description?: string;
  /** Optional leading icon. */
  icon?: ReactNode;
}

/**
 * Caller-owned tone/rewrite configuration accepted by `RichTextEditor`
 * (and forwarded through `FormRichTextEditor`). Presence of this object
 * enables the tone/rewrite dropdown button next to Grammar/Dictation.
 */
export interface ToneRewriteProp {
  /** Actions to render in the dropdown, grouped by `group`. */
  actions: ToneRewriteAction[];
  /**
   * Perform the rewrite. Receives the current HTML and the chosen action
   * key; must resolve with the rewritten HTML.
   */
  rewrite: (contentHtml: string, actionKey: string) => Promise<string>;
  /** Optional sink for errors thrown by `rewrite`. */
  onError?: (error: unknown) => void;
}

export interface ToneRewriteButtonProps {
  toneRewrite: ToneRewriteProp;
  currentValue: string;
  onResult: (rewrittenHtml: string) => void;
  disabled?: boolean;
  tooltip?: string;
  /** Icon-only rendering (useful in tight footers). */
  iconOnly?: boolean;
}
