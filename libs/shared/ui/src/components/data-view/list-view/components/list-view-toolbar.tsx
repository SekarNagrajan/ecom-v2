import { SettingOutlined } from '@ant-design/icons';
import { Flex, Typography, Button, Popover, theme } from 'antd';

import { useAppConfig } from '../../../../hooks';
import { AppDrawer } from '../../../ui/dialog';
import { useListViewContext } from '../context';
import type { GridProfile, ProfileOptions, ToolbarOptions } from '../types';
import { ProfileBar } from './profile-bar';
import { SettingsMenu } from './settings-menu';

type ListViewToolbarProps = ProfileOptions & {
  toolbarOptions?: ToolbarOptions;
  onRenameRequest?: (profile: GridProfile) => void;
};

export function ListViewToolbar({
  profiles = [],
  activeProfileId,
  isLoadingProfiles,
  onProfileSelect,
  onProfileDelete,
  onProfileSetDefault,
  enableProfiles,
  toolbarOptions = {},
  onRenameRequest,
}: ListViewToolbarProps) {
  const {
    rowCount,
    isMobile,
    showAdvancedFilters,
    setShowAdvancedFilters,
    isSettingsDrawerOpen,
    setIsSettingsDrawerOpen,
    handleExportCsv,
    handleExportExcel,
    handleFullScreen,
    handleSaveProfile,
    handleResetProfile,
    setIsSaveAsModalOpen,
  } = useListViewContext();

  const { token } = theme.useToken();
  const { density } = useAppConfig();
  const isCompact = density === 'compact';

  const {
    showTotalCount = true,
    showSettings = true,
    exportExcel = true,
    exportCsv = true,
    advancedFilters = true,
    fullScreen = true,
  } = toolbarOptions;

  const settingsContent = (
    <SettingsMenu
      onExportCsv={handleExportCsv}
      onExportExcel={handleExportExcel}
      onFullScreen={handleFullScreen}
      showAdvancedFilters={showAdvancedFilters}
      onAdvancedFiltersChange={setShowAdvancedFilters}
      isMobile={isMobile}
      exportExcel={exportExcel}
      exportCsv={exportCsv}
      advancedFilters={advancedFilters}
      fullScreen={fullScreen}
    />
  );

  return (
    <Flex
      justify="space-between"
      align="center"
      wrap="nowrap"
      gap="small"
      style={{
        padding: `${isCompact ? token.paddingXXS : token.paddingXS}px ${
          token.paddingSM
        }px 0 ${token.paddingSM}px`,
        // Allow the inner profile bar to shrink + scroll horizontally rather
        // than wrapping the settings cluster onto a new line.
        minWidth: 0,
      }}
    >
      {enableProfiles && (
        <ProfileBar
          profiles={profiles ?? []}
          activeProfileId={activeProfileId}
          isLoading={isLoadingProfiles}
          onProfileSelect={(id) => onProfileSelect?.(id)}
          onProfileRenameRequest={onRenameRequest}
          onProfileSetDefault={onProfileSetDefault}
          onProfileDelete={onProfileDelete}
          onCreateProfileRequest={() => setIsSaveAsModalOpen(true)}
          onProfileSaveActive={() => void handleSaveProfile()}
          onProfileReset={handleResetProfile}
        />
      )}

      <Flex
        align="center"
        gap={token.marginSM}
        style={{ marginLeft: 'auto', flexShrink: 0 }}
      >
        {showTotalCount && (
          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
            Total rows: {rowCount}
          </Typography.Text>
        )}

        {showSettings &&
          (isMobile ? (
            <>
              <Button
                icon={<SettingOutlined />}
                size="small"
                onClick={() => setIsSettingsDrawerOpen(true)}
              />
              <AppDrawer
                title="Table Settings"
                placement="bottom"
                onClose={() => setIsSettingsDrawerOpen(false)}
                open={isSettingsDrawerOpen}
                styles={{ body: { padding: token.paddingSM } }}
              >
                {settingsContent}
              </AppDrawer>
            </>
          ) : (
            <Popover
              content={settingsContent}
              trigger="click"
              placement="bottomRight"
              title="Table Settings"
            >
              <Button icon={<SettingOutlined />} size="small" />
            </Popover>
          ))}
      </Flex>
    </Flex>
  );
}
