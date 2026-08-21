import { EditOutlined } from '@ant-design/icons';
import { Button, Grid, Tooltip, theme } from 'antd';
import { useEffect, useRef, useState } from 'react';

import type { GrammarImproveButtonProps } from './types';

const { useBreakpoint } = Grid;
const FORMATTING_TAGS = /<(strong|em|b|i|a|ul|ol|li|h[1-6])\b/i;

/**
 * Internal shared "Improve Grammar" button used by `AppTextarea`,
 * `FormTextarea`, and `RichTextEditor`. Renders only when the field has
 * non-empty content.
 *
 * On mobile (below `md` breakpoint), renders as an icon-only button with a
 * tooltip. On desktop, renders with a text label.
 *
 * Positioning is the parent's responsibility — wrap this in an
 * absolutely-positioned container.
 */
export function GrammarImproveButton({
  grammarImprove,
  currentValue,
  onResult,
  disabled = false,
  tooltip = 'Improve Grammar',
  iconOnly = false,
}: GrammarImproveButtonProps) {
  const { token } = theme.useToken();
  const screen = useBreakpoint();
  const isMobile = Object.keys(screen).length > 0 ? !screen.md : false;
  const compact = iconOnly || isMobile;
  const [isImproving, setIsImproving] = useState(false);
  const valueAtClickRef = useRef<string>('');

  // Track latest value via effect-synced ref so the async handler can detect
  // race conditions (user edited while API was in flight).
  const latestValueRef = useRef(currentValue);
  useEffect(() => {
    latestValueRef.current = currentValue;
  }, [currentValue]);

  const plainText = currentValue.replace(/<[^>]*>/g, '').trim();
  const hasContent = plainText.length > 0;

  if (!hasContent || disabled) {
    return null;
  }

  const handleClick = async () => {
    if (isImproving) return;

    valueAtClickRef.current = currentValue;
    setIsImproving(true);

    // Warn about formatting loss before calling the API
    if (FORMATTING_TAGS.test(currentValue)) {
      grammarImprove.onFormattingLoss?.();
    }

    try {
      const corrected = await grammarImprove.improveGrammar(plainText);

      // Race condition guard: discard result if user edited during the API call
      if (latestValueRef.current !== valueAtClickRef.current) {
        return;
      }

      onResult(corrected);
    } catch (error) {
      grammarImprove.onError?.(error);
    } finally {
      setIsImproving(false);
    }
  };

  const button = (
    <Button
      type="text"
      size="small"
      icon={<EditOutlined />}
      onClick={handleClick}
      loading={isImproving}
      disabled={isImproving}
      style={{ fontSize: token.fontSizeSM }}
    >
      {compact ? null : 'Improve Grammar'}
    </Button>
  );

  if (compact) {
    return <Tooltip title={tooltip}>{button}</Tooltip>;
  }

  return button;
}
