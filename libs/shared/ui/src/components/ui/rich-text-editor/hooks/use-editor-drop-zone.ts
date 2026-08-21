import { type DragEvent, useEffect, useRef, useState } from 'react';

export type DropZone = 'content' | 'attachment';

export interface UseEditorDropZoneOptions {
  /** Called when a file is dropped on the attachment zone (outside ProseMirror). */
  onDropAttachment?: (file: File) => void;
  /** Called when files are dropped on the editor content zone. */
  onDropContent?: (files: File[], event: DragEvent) => void;
  disabled?: boolean;
  /** Whether any upload handler exists — controls whether visual indicators appear. */
  hasFileHandlers?: boolean;
}

export interface UseEditorDropZoneReturn {
  containerProps: {
    onDragEnter: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDropCapture: (e: DragEvent) => void;
  };
  isDragging: boolean;
  activeZone: DropZone | null;
}

function getTargetElement(target: EventTarget | null): HTMLElement | null {
  if (target instanceof HTMLElement) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

function getDropZone(target: EventTarget | null): DropZone | null {
  const targetElement = getTargetElement(target);
  if (!targetElement) return null;

  const zone = targetElement.closest<HTMLElement>('[data-drop-zone]');
  if (!zone) return null;
  return (zone.dataset.dropZone as DropZone) ?? null;
}

/**
 * Manages drag visual indicators and routes file drops by zone.
 *
 * This hook deliberately avoids stopPropagation() so any editor-level native
 * listeners (e.g. paste handlers) remain unaffected. Drag state cleanup uses
 * capture-phase listeners so state is reset even if lower-level handlers stop
 * bubble-phase propagation.
 */
export function useEditorDropZone({
  onDropAttachment,
  onDropContent,
  disabled = false,
  hasFileHandlers = false,
}: UseEditorDropZoneOptions): UseEditorDropZoneReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [activeZone, setActiveZone] = useState<DropZone | null>(null);
  const dragCounter = useRef(0);

  const showVisuals = hasFileHandlers && !disabled;

  // -----------------------------------------------------------------------
  // Safety net: document-level listeners to guarantee isDragging resets.
  //
  // Capture-phase listeners always fire, even if some nested handler later
  // stops bubble-phase propagation.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!isDragging) return;

    const reset = () => {
      dragCounter.current = 0;
      setIsDragging(false);
      setActiveZone(null);
    };

    document.addEventListener('drop', reset, true);
    document.addEventListener('dragend', reset, true);

    return () => {
      document.removeEventListener('drop', reset, true);
      document.removeEventListener('dragend', reset, true);
    };
  }, [isDragging]);

  // -----------------------------------------------------------------------
  // React handlers — intentionally NO stopPropagation().
  // -----------------------------------------------------------------------

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    if (!showVisuals) return;

    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
    setActiveZone(getDropZone(e.target));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!showVisuals) return;

    const zone = getDropZone(e.target);
    if (zone !== activeZone) {
      setActiveZone(zone);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (!showVisuals) return;

    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
      setActiveZone(null);
    }
  };

  /**
   * Capture-phase handler — fires BEFORE ProseMirror's bubble-phase handler.
   *
   * 1. Always resets drag visual state (guaranteed even if ProseMirror later
   *    calls stopPropagation and React's onDrop never fires).
   * 2. For content-zone drops: routes files through onDropContent.
   * 3. For attachment-zone drops: routes files through onDropAttachment.
   */
  const handleDropCapture = (e: DragEvent) => {
    dragCounter.current = 0;
    setIsDragging(false);
    setActiveZone(null);

    const zone = getDropZone(e.target);

    const droppedFiles = Array.from(e.dataTransfer?.files ?? []);
    if (droppedFiles.length === 0) return;

    // Always suppress browser default file-open behavior for file drops inside
    // the editor container. We only route drops through explicit handlers.
    e.preventDefault();

    if (zone === 'content' && onDropContent && !disabled) {
      onDropContent(droppedFiles, e);
      return;
    }

    if (zone === 'attachment' && onDropAttachment && !disabled) {
      for (const file of droppedFiles) {
        onDropAttachment(file);
      }
    }
  };

  return {
    containerProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDropCapture: handleDropCapture,
    },
    isDragging,
    activeZone,
  };
}
