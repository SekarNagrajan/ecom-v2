import { AppSelect } from '@solverminds/shared-ui';
import { type CustomCellEditorProps, useGridCellEditor } from 'ag-grid-react';
import { useRef, useState } from 'react';

interface ImportSelectEditorParams {
  options?: Array<{
    label: string;
    value: string;
  }>;
}

export function ImportSelectCellEditor<TData extends object>({
  colDef,
  eGridCell,
  onValueChange,
  stopEditing,
  value,
}: CustomCellEditorProps<TData, string>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(true);
  const editorParams = (colDef.cellEditorParams ??
    {}) as ImportSelectEditorParams;
  const options = editorParams.options ?? [];

  useGridCellEditor({
    getValidationElement: () => rootRef.current ?? eGridCell,
  });

  const finishEditing = () => {
    requestAnimationFrame(() => {
      stopEditing();
    });
  };

  const handleChange = (nextValue: unknown) => {
    const resolvedValue =
      typeof nextValue === 'string' ? nextValue : String(nextValue ?? '');
    onValueChange(resolvedValue);
    setOpen(false);
    finishEditing();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      finishEditing();
    }
  };

  return (
    <div ref={rootRef}>
      <AppSelect
        autoFocus
        open={open}
        options={options}
        showSearch
        style={{
          width: Math.max(220, eGridCell.getBoundingClientRect().width),
        }}
        value={
          typeof value === 'string' && value.length > 0 ? value : undefined
        }
        onChange={handleChange}
        onOpenChange={handleOpenChange}
      />
    </div>
  );
}
