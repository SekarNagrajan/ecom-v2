import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface UploadPlaceholderSelector {
  id: string | number;
}

export const uploadPlaceholderPluginKey = new PluginKey<DecorationSet>(
  'upload-placeholder'
);

export function findUploadPlaceholderPos(
  state: EditorState,
  id: string | number
): number | null {
  const decorations = uploadPlaceholderPluginKey.getState(state);
  if (!decorations) return null;

  const match = decorations.find(
    undefined,
    undefined,
    (spec) => spec.id === id
  );
  if (match.length === 0) return null;

  return match[0]?.from ?? null;
}

function createPlaceholderWidget(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'upload-placeholder';

  const content = document.createElement('div');
  content.className = 'upload-placeholder-content';

  const icon = document.createElement('span');
  icon.className = 'upload-placeholder-icon';
  icon.textContent = '\u231B';

  const text = document.createElement('span');
  text.className = 'upload-placeholder-text';
  text.textContent = 'Uploading\u2026';

  const progress = document.createElement('progress');
  progress.className = 'upload-placeholder-progress';
  progress.max = 100;

  content.append(icon, text, progress);
  wrapper.appendChild(content);
  return wrapper;
}

function updateWidgetProgress(widget: HTMLElement, percent: number) {
  const progress = widget.querySelector<HTMLProgressElement>(
    'progress.upload-placeholder-progress'
  );
  if (!progress) return;
  progress.value = Math.min(100, Math.max(0, percent));
}

export const UploadPlaceholder = Extension.create({
  name: 'uploadPlaceholder',

  addProseMirrorPlugins() {
    const widgetRegistry = new Map<string | number, HTMLElement>();

    return [
      new Plugin<DecorationSet>({
        key: uploadPlaceholderPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, set) {
            set = set.map(tr.mapping, tr.doc);

            const action = tr.getMeta(uploadPlaceholderPluginKey);
            if (!action) return set;

            if (action.add) {
              const widget = createPlaceholderWidget();
              widgetRegistry.set(action.add.id, widget);
              const decoration = Decoration.widget(action.add.pos, widget, {
                id: action.add.id,
              });
              set = set.add(tr.doc, [decoration]);
            } else if (action.remove) {
              const decorations = set.find(
                undefined,
                undefined,
                (spec) => spec.id === action.remove.id
              );
              widgetRegistry.delete(action.remove.id);
              set = set.remove(decorations);
            } else if (action.progress) {
              const widget = widgetRegistry.get(action.progress.id);
              if (widget) {
                updateWidgetProgress(widget, action.progress.percent);
              }
            }

            return set;
          },
        },
        props: {
          decorations(state) {
            return uploadPlaceholderPluginKey.getState(state);
          },
        },
      }),
    ];
  },
});
