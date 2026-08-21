import type {
  GridProfile,
  ProfileRenameInput,
  ProfileSaveAsInput,
} from '../types';

// =============================================================================
// 1. Profile Bar Types
// =============================================================================

export interface ProfileBarProps {
  profiles: GridProfile[];
  activeProfileId?: string;
  isLoading?: boolean;
  onProfileSelect: (id: string) => void;
  onProfileRenameRequest?: (profile: GridProfile) => void;
  onProfileSetDefault?: (id: string) => Promise<void> | void;
  onProfileDelete?: (id: string) => Promise<void> | void;
  /**
   * Opens the create-view modal. Rendered as a trailing "+ New view" button
   * outside the scrollable chip area so it stays visible regardless of how
   * many saved views exist. Omit to hide the button.
   */
  onCreateProfileRequest?: () => void;
  /**
   * Persist the current grid state onto the active (non-system) profile.
   * Surfaced in the per-chip dropdown for the active chip only. Omit to
   * suppress the menu entry.
   */
  onProfileSaveActive?: () => Promise<void> | void;
  /**
   * Discard current grid edits and switch back to the local "Default View"
   * (baseline columns / no filters / no sort). Surfaced in the per-chip
   * dropdown for the active chip only. Omit to suppress the menu entry.
   */
  onProfileReset?: () => void;
}

// =============================================================================
// 2. Settings Menu Types
// =============================================================================

/**
 * Settings popover only exposes table-wide actions (export, advanced filters,
 * fullscreen). Per-view actions (save changes, reset, rename, set default,
 * delete) live on the chip itself via its trailing dropdown.
 */
export interface SettingsMenuProps {
  onExportExcel: () => void;
  onExportCsv: () => void;
  onFullScreen: () => void;
  showAdvancedFilters: boolean;
  onAdvancedFiltersChange: (checked: boolean) => void;
  isMobile?: boolean;
  exportExcel?: boolean;
  exportCsv?: boolean;
  advancedFilters?: boolean;
  fullScreen?: boolean;
}

// =============================================================================
// 3. Save Profile Modal Types
// =============================================================================

export type SaveProfileModalMode =
  | { mode: 'create' }
  | {
      mode: 'edit';
      profile: Pick<GridProfile, 'id' | 'name' | 'description'>;
    };

export type SaveProfileModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirmCreate: (
    input: Omit<ProfileSaveAsInput, 'state'>
  ) => Promise<void> | void;
  onConfirmEdit: (input: ProfileRenameInput) => Promise<void> | void;
} & SaveProfileModalMode;
