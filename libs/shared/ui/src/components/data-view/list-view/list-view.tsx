// Modified by Sekar Nagarajan (2026-11-12 23:50)
import {
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  ColumnAutoSizeModule,
  CsvExportModule,
  DateEditorModule,
  DateFilterModule,
  ModuleRegistry,
  NumberEditorModule,
  NumberFilterModule,
  QuickFilterModule,
  RenderApiModule,
  RowSelectionModule,
  RowStyleModule,
  SelectEditorModule,
  TextEditorModule,
  TextFilterModule,
  ValidationModule,
} from 'ag-grid-community';
import {
  CellSelectionModule,
  CellStyleModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  CustomEditorModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  GridStateModule,
  MasterDetailModule,
  MenuModule,
  PaginationModule,
  PivotModule,
  RichSelectModule,
  RowApiModule,
  RowGroupingModule,
  ScrollApiModule,
  ServerSideRowModelApiModule,
  ServerSideRowModelModule,
  SetFilterModule,
  SideBarModule,
  UndoRedoEditModule,
} from 'ag-grid-enterprise';
import { Flex, theme as antdTheme } from 'antd';

import type { DataViewItem } from '../data-view-item';
import { ListViewGrid } from './components/list-view-grid';
import { ListViewPagination } from './components/list-view-pagination';
import { ListViewToolbar } from './components/list-view-toolbar';
import { SaveProfileModal } from './components/save-profile-modal';
import { ListViewContext, type ListViewContextValue } from './context';
import { useListViewLogic } from './hooks/use-list-view-logic';
import { initAgGridLicense } from './init-ag-grid-license';
import type { ListViewProps } from './types';

/**
 * The licence is applied here, inside the lazily loaded ListView chunk, so `ag-grid-enterprise`
 * is never pulled into the host app's entry bundle. The key is injected at build time by the
 * consuming app through `define: { __AG_GRID_LICENSE_KEY__ }` (see apps/ecom-portal/vite.config.ts);
 * when it is absent (tests, Storybook) AG Grid simply runs unlicensed.
 */
initAgGridLicense(
  typeof __AG_GRID_LICENSE_KEY__ === 'string' ? __AG_GRID_LICENSE_KEY__ : undefined
);

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowSelectionModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ServerSideRowModelModule,
  ServerSideRowModelApiModule,
  RowGroupingModule,
  MasterDetailModule,
  RowApiModule,
  GridStateModule,
  PaginationModule,
  PivotModule,
  CellSelectionModule,
  CellStyleModule,
  CustomEditorModule,
  SideBarModule,
  ScrollApiModule,
  UndoRedoEditModule,
  ColumnsToolPanelModule,
  FiltersToolPanelModule,
  SetFilterModule,
  MenuModule,
  ClipboardModule,
  CsvExportModule,
  ExcelExportModule,
  RichSelectModule,
  ValidationModule,
  ColumnAutoSizeModule,
  TextEditorModule,
  SelectEditorModule,
  NumberEditorModule,
  DateEditorModule,
  CheckboxEditorModule,
  QuickFilterModule,
  ColumnApiModule,
  RenderApiModule,
  RowStyleModule,
]);

export const ListView = <TData extends DataViewItem>(props: ListViewProps<TData>) => {
  const { state, refs, handlers } = useListViewLogic<TData>(props);
  const { token } = antdTheme.useToken();
  const isAutoHeight = props.gridOptions?.domLayout === 'autoHeight';

  const showToolbarProp = props.showToolbar ?? true;
  const showToolbar = showToolbarProp !== false;
  const toolbarOptions = typeof showToolbarProp === 'object' ? showToolbarProp : {};

  const {
    rowCount,
    currentPage,
    pageSize,
    showAdvancedFilters,
    setShowAdvancedFilters,
    isSettingsDrawerOpen,
    setIsSettingsDrawerOpen,
    isSaveAsModalOpen,
    setIsSaveAsModalOpen,
    editingProfile,
    isMobile,
    gridApi,
    setGridApi,
    setRowCount,
    setCurrentPage,
    setPageSize,
  } = state;

  const { gridRef, containerRef, initialStateRef } = refs;

  const {
    handleExportCsv,
    handleExportExcel,
    handleFullScreen,
    handleSaveProfile,
    handleConfirmSaveAs,
    handleResetProfile,
    openRenameModal,
    closeRenameModal,
  } = handlers;

  const contextValue: ListViewContextValue = {
    rowCount,
    currentPage,
    pageSize,
    showAdvancedFilters,
    setShowAdvancedFilters,
    isSettingsDrawerOpen,
    setIsSettingsDrawerOpen,
    isSaveAsModalOpen,
    setIsSaveAsModalOpen,
    isMobile,
    handleExportCsv,
    handleExportExcel,
    handleFullScreen,
    handleSaveProfile,
    handleResetProfile,
  };

  const renameHandler = props.enableProfiles ? props.onProfileRename : undefined;
  const noopEditConfirm = async () => {
    /* no-op when rename callback is missing */
  };

  return (
    <ListViewContext value={contextValue}>
      <Flex
        vertical
        gap={token.marginXS}
        style={{
          height: isAutoHeight ? 'auto' : '100%',
          width: '100%',
          background: 'inherit',
          ...props.style,
        }}
        className={props.className}
        ref={containerRef}
      >
        {showToolbar &&
          (props.enableProfiles === true ? (
            <ListViewToolbar
              enableProfiles={true}
              profiles={props.profiles}
              activeProfileId={props.activeProfileId}
              isLoadingProfiles={props.isLoadingProfiles}
              onProfileSelect={props.onProfileSelect}
              onProfileReset={props.onProfileReset}
              onProfileSaveAs={props.onProfileSaveAs}
              onProfileSave={props.onProfileSave}
              onProfileRename={props.onProfileRename}
              onProfileSetDefault={props.onProfileSetDefault}
              onProfileDelete={props.onProfileDelete}
              onRenameRequest={renameHandler ? openRenameModal : undefined}
              toolbarOptions={toolbarOptions}
            />
          ) : (
            <ListViewToolbar enableProfiles={false} toolbarOptions={toolbarOptions} />
          ))}
        <ListViewGrid
          props={props}
          gridRef={gridRef}
          initialStateRef={initialStateRef}
          setGridApi={setGridApi}
          setRowCount={setRowCount}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
          showAdvancedFilters={showAdvancedFilters}
        />
        <ListViewPagination
          gridApi={gridApi}
          pagination={props.pagination}
          pageSizeOptions={props.pageSizeOptions}
          setCurrentPage={setCurrentPage}
          setPageSize={setPageSize}
          disabled={props.loading}
        />

        {props.enableProfiles && (
          <>
            <SaveProfileModal
              mode="create"
              open={isSaveAsModalOpen}
              onCancel={() => setIsSaveAsModalOpen(false)}
              onConfirmCreate={handleConfirmSaveAs}
              onConfirmEdit={noopEditConfirm}
            />
            {editingProfile && (
              <SaveProfileModal
                mode="edit"
                profile={editingProfile}
                open={true}
                onCancel={closeRenameModal}
                onConfirmCreate={async () => {
                  /* unreachable in edit mode */
                }}
                onConfirmEdit={async (input) => {
                  await renameHandler?.(input);
                  closeRenameModal();
                }}
              />
            )}
          </>
        )}
      </Flex>
    </ListViewContext>
  );
};
