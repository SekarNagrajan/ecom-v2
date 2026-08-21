import { createContext, use } from 'react';

export interface ListViewContextValue {
  // State
  rowCount: number;
  currentPage: number;
  pageSize: number;

  // UI State
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  isSettingsDrawerOpen: boolean;
  setIsSettingsDrawerOpen: (open: boolean) => void;
  isSaveAsModalOpen: boolean;
  setIsSaveAsModalOpen: (open: boolean) => void;
  isMobile: boolean;

  // Handlers
  handleExportCsv: () => void;
  handleExportExcel: () => void;
  handleFullScreen: () => void;
  handleSaveProfile: () => Promise<void> | void;
  handleResetProfile: () => void;
}

export const ListViewContext = createContext<ListViewContextValue | null>(null);

export const useListViewContext = () => {
  const context = use(ListViewContext);
  if (!context) {
    throw new Error(
      'useListViewContext must be used within a ListViewProvider'
    );
  }
  return context;
};
