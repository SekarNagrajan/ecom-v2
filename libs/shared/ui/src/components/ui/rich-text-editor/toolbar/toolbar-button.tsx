import type { Editor } from '@tiptap/react';
import { Tooltip } from 'antd';

import { AppButton } from '../../button';
import type { ToolbarButtonConfig } from './toolbar-config';

interface ToolbarButtonProps {
  config: ToolbarButtonConfig;
  editor: Editor;
}

export function ToolbarButton({ config, editor }: ToolbarButtonProps) {
  const isActive = config.isActive(editor);

  return (
    <Tooltip title={config.tooltip}>
      <AppButton
        type={isActive ? 'primary' : 'text'}
        icon={config.icon}
        onClick={() => config.action(editor)}
        disabled={config.canExecute ? !config.canExecute(editor) : false}
        size="small"
        aria-label={config.ariaLabel}
        aria-pressed={isActive}
      >
        {config.label}
      </AppButton>
    </Tooltip>
  );
}
