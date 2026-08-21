import { Input, theme } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { forwardRef, useId, useRef, type ChangeEvent } from 'react';

import { AudioDictationButton } from '../audio-dictation-button';
import { appendTranscript } from '../audio-dictation-button/append-transcript';
import { GrammarImproveButton } from '../grammar-improve-button';
import type { AppTextareaProps } from './types';

/**
 * Standalone textarea component built on AntD's `Input.TextArea`. The only
 * thing it adds on top of the underlying primitive is an optional, opt-in
 * audio dictation mic button anchored in the bottom-right corner of the
 * field. All behavior is delegated to the caller — when no `audioDictation`
 * prop is passed this component is a drop-in replacement for
 * `Input.TextArea`.
 */
export const AppTextarea = forwardRef<TextAreaRef, AppTextareaProps>(
  function AppTextarea(
    {
      audioDictation,
      dictationTooltip,
      dictationRecordingTooltip,
      dictationTranscribingTooltip,
      grammarImprove,
      grammarImproveTooltip,
      value,
      defaultValue,
      onChange,
      maxLength,
      disabled,
      readOnly,
      style,
      ...rest
    },
    ref
  ) {
    const { token } = theme.useToken();
    const reactId = useId();
    const innerRef = useRef<TextAreaRef | null>(null);

    // Callback ref — keeps a local handle (for reading the current value in
    // uncontrolled dictation) while forwarding the AntD TextArea ref upward
    // to support both function refs and ref objects.
    const setRef = (node: TextAreaRef | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const dictationEnabled =
      audioDictation !== undefined && !disabled && !readOnly;
    const grammarEnabled =
      grammarImprove !== undefined && !disabled && !readOnly;
    const hasOverlay = dictationEnabled || grammarEnabled;

    // Resolve current string value for both dictation and grammar handlers
    const getCurrentString = (): string => {
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      const liveValue =
        innerRef.current?.resizableTextArea?.textArea?.value ?? '';
      return (
        liveValue ||
        (typeof defaultValue === 'string'
          ? defaultValue
          : typeof defaultValue === 'number'
          ? String(defaultValue)
          : '')
      );
    };

    const fireSyntheticChange = (newValue: string) => {
      if (onChange) {
        const target = { value: newValue } as HTMLTextAreaElement;
        const syntheticEvent = {
          target,
          currentTarget: target,
          type: 'change',
          preventDefault: () => undefined,
          stopPropagation: () => undefined,
        } as unknown as ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      } else if (innerRef.current?.resizableTextArea?.textArea) {
        innerRef.current.resizableTextArea.textArea.value = newValue;
      }
    };

    const handleDictationResult = (text: string) => {
      if (!audioDictation) return;
      const currentStr = getCurrentString();
      const result = appendTranscript(currentStr, text, maxLength);
      if (result.value !== currentStr) {
        fireSyntheticChange(result.value);
      }
      if (result.error) {
        audioDictation.onError?.(result.error);
      }
    };

    const handleGrammarResult = (correctedText: string) => {
      fireSyntheticChange(correctedText);
    };

    // Reserve right-side padding so text wraps before reaching the overlay
    // buttons. Both grammar and dictation render as icon-only inside textareas,
    // each needing ~controlHeight width. When both are present, double it + gap.
    const singleButtonSlot = token.controlHeight + token.paddingXS;
    const overlayPadding =
      dictationEnabled && grammarEnabled
        ? singleButtonSlot * 2 + token.paddingXXS
        : dictationEnabled || grammarEnabled
        ? singleButtonSlot
        : 0;

    const textarea = (
      <Input.TextArea
        {...rest}
        ref={setRef}
        id={rest.id ?? reactId}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        style={
          overlayPadding > 0
            ? { ...style, paddingRight: overlayPadding }
            : style
        }
      />
    );

    if (!hasOverlay) {
      return textarea;
    }

    return (
      <div
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
        }}
      >
        {textarea}
        <div
          style={{
            position: 'absolute',
            bottom: token.paddingXS,
            right: token.paddingXS,
            zIndex: 1,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: token.paddingXXS,
          }}
        >
          {grammarEnabled ? (
            <GrammarImproveButton
              grammarImprove={grammarImprove}
              currentValue={getCurrentString()}
              onResult={handleGrammarResult}
              tooltip={grammarImproveTooltip}
              iconOnly
            />
          ) : null}
          {dictationEnabled ? (
            <AudioDictationButton
              audioDictation={audioDictation}
              onResult={handleDictationResult}
              tooltip={dictationTooltip}
              recordingTooltip={dictationRecordingTooltip}
              transcribingTooltip={dictationTranscribingTooltip}
            />
          ) : null}
        </div>
      </div>
    );
  }
);
