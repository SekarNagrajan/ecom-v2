import { HighlightOutlined } from '@ant-design/icons';
import { Button, Dropdown, Grid, Tooltip, Typography, theme ,type  MenuProps } from 'antd';
import { useEffect, useRef, useState } from 'react';

import type {
  ToneRewriteAction,
  ToneRewriteActionGroup,
  ToneRewriteButtonProps,
} from './types';

const { useBreakpoint } = Grid;

const GROUP_HEADINGS: Record<ToneRewriteActionGroup, string> = {
  tone: 'Change tone',
  rewrite: 'Rewrite',
};

function groupActions(actions: ToneRewriteAction[]) {
  const buckets: Record<ToneRewriteActionGroup, ToneRewriteAction[]> = {
    tone: [],
    rewrite: [],
  };
  for (const action of actions) {
    buckets[action.group].push(action);
  }
  return buckets;
}

/**
 * Shared "Tone / Rewrite" dropdown used inside `RichTextEditor` (and any
 * caller that wants an inline rewrite affordance). Rendering strategy
 * mirrors `GrammarImproveButton`:
 *
 * - Only visible when the field has non-empty plain-text content.
 * - Compact icon-only mode on mobile / when `iconOnly` is set.
 * - Loading state is owned by this component so the caller only sees the
 *   final result via `onResult`.
 * - shared-ui is UX-agnostic: the caller decides how to render error toasts
 *   via `toneRewrite.onError`.
 */
export function ToneRewriteButton({
  toneRewrite,
  currentValue,
  onResult,
  disabled = false,
  tooltip = 'Rewrite',
  iconOnly = false,
}: ToneRewriteButtonProps) {
  const { token } = theme.useToken();
  const screen = useBreakpoint();
  const isMobile = Object.keys(screen).length > 0 ? !screen.md : false;
  const compact = iconOnly || isMobile;
  const [isRewriting, setIsRewriting] = useState(false);
  const valueAtClickRef = useRef<string>('');
  const latestValueRef = useRef(currentValue);

  useEffect(() => {
    latestValueRef.current = currentValue;
  }, [currentValue]);

  const plainText = currentValue.replace(/<[^>]*>/g, '').trim();
  const hasContent = plainText.length > 0;

  if (!hasContent || disabled) {
    return null;
  }

  const buckets = groupActions(toneRewrite.actions);

  const handleSelect = async (actionKey: string) => {
    if (isRewriting) return;

    valueAtClickRef.current = currentValue;
    setIsRewriting(true);

    try {
      const rewritten = await toneRewrite.rewrite(currentValue, actionKey);

      if (latestValueRef.current !== valueAtClickRef.current) {
        return;
      }

      const trimmed = rewritten?.trim();
      if (!trimmed) {
        return;
      }

      onResult(rewritten);
    } catch (error) {
      toneRewrite.onError?.(error);
    } finally {
      setIsRewriting(false);
    }
  };

  const menuItems: MenuProps['items'] = [];
  const activeGroups: ToneRewriteActionGroup[] = [];
  if (buckets.tone.length > 0) activeGroups.push('tone');
  if (buckets.rewrite.length > 0) activeGroups.push('rewrite');

  activeGroups.forEach((group, index) => {
    menuItems.push({
      key: `${group}-header`,
      type: 'group',
      label: GROUP_HEADINGS[group],
      children: buckets[group].map((action) => ({
        key: action.key,
        label: (
          <div>
            <div>{action.label}</div>
            {action.description ? (
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {action.description}
              </Typography.Text>
            ) : null}
          </div>
        ),
        icon: action.icon,
        onClick: () => {
          void handleSelect(action.key);
        },
      })),
    });
    if (index < activeGroups.length - 1) {
      menuItems.push({ type: 'divider', key: `${group}-divider` });
    }
  });

  const trigger = (
    <Button
      type="text"
      size="small"
      icon={<HighlightOutlined />}
      loading={isRewriting}
      disabled={isRewriting}
      style={{ fontSize: token.fontSizeSM }}
    >
      {compact ? null : 'Rewrite'}
    </Button>
  );

  const dropdown = (
    <Dropdown
      menu={{
        items: menuItems,
        style: {
          maxHeight: 280,
          overflowY: 'auto',
        },
      }}
      trigger={['click']}
      placement="topRight"
      disabled={isRewriting}
    >
      {trigger}
    </Dropdown>
  );

  if (compact) {
    return <Tooltip title={tooltip}>{dropdown}</Tooltip>;
  }

  return dropdown;
}
