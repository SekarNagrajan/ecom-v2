import type { FieldValues } from 'react-hook-form';

import type { RichTextEditorProps } from '../../ui/rich-text-editor/types';
import type { BaseControlledFieldProps } from '../common/types';

export type FormRichTextEditorProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & Omit<RichTextEditorProps, 'value' | 'onChange'>;
