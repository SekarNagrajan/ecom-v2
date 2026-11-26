// Created by Sekar Nagarajan (2026-11-12 13:20)
/**
 * Blocks tab / sidebar navigation and browser unload while a Control Panel section has unsaved
 * edits (TanStack `useBlocker` also intercepts search-param-only navigation, i.e. tab changes).
 */
import { NavigationBlocker } from "../../../../components/shared/navigation-blocker";

export interface AdminUnsavedGuardProps {
  isDirty: boolean;
  /** Return true to proceed with the navigation after saving. */
  onSave?: () => Promise<boolean> | boolean;
  onDiscard?: () => void;
}

export function AdminUnsavedGuard({ isDirty, onSave, onDiscard }: AdminUnsavedGuardProps) {
  return (
    <NavigationBlocker
      shouldBlock={isDirty}
      onSave={onSave}
      onDiscard={onDiscard}
      title="Unsaved Changes"
      message={
        onSave
          ? "This section has unsaved changes. Save them, discard them, or stay to keep editing."
          : "This section has unsaved changes. Stay to keep editing, or discard them and leave."
      }
    />
  );
}
