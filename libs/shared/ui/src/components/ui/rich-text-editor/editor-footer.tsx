import { useTiptap } from '@tiptap/react';
import { theme, Typography } from 'antd';

import type { EditorFooterProps } from './types';

const { Text } = Typography;

/**
 * Editor footer component showing character and word counts
 * Uses Tiptap composable API to access editor from context
 */
export function EditorFooter({
  showCharacterCount = false,
  showWordCount = false,
  characterLimit,
}: EditorFooterProps) {
  const { token } = theme.useToken();
  const { editor } = useTiptap();

  if (!showCharacterCount && !showWordCount) {
    return null;
  }

  // Early return if editor is not ready
  if (!editor) {
    return null;
  }

  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  const isOverLimit = characterLimit && characterCount > characterLimit;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: token.marginSM,
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        borderTop: `${token.lineWidth}px solid ${token.colorBorder}`,
        backgroundColor: token.colorBgContainer,
      }}
    >
      {showCharacterCount && (
        <Text
          type={isOverLimit ? 'danger' : 'secondary'}
          style={{ fontSize: token.fontSizeSM }}
        >
          {characterLimit
            ? `${characterCount} / ${characterLimit} characters`
            : `${characterCount} characters`}
        </Text>
      )}

      {showWordCount && (
        <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </Text>
      )}
    </div>
  );
}
