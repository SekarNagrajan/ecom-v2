import {
  FileExcelOutlined,
  FileTextOutlined,
  FullscreenOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  ConfigProvider,
  Flex,
  Menu,
  Switch,
  Typography,
  theme,
  type MenuProps,
} from 'antd';

import type { SettingsMenuProps } from './types';

const { Text } = Typography;

function buildMenuItems(params: {
  onExportExcel?: () => void;
  onExportCsv?: () => void;
  onFullScreen?: () => void;
  showAdvancedFilters: boolean;
  onAdvancedFiltersChange: (value: boolean) => void;
  exportExcel: boolean;
  exportCsv: boolean;
  advancedFilters: boolean;
  fullScreen: boolean;
}): MenuProps['items'] {
  const items: MenuProps['items'] = [];

  if (params.exportExcel || params.exportCsv) {
    const exportChildren: NonNullable<MenuProps['items']> = [];
    if (params.exportExcel) {
      exportChildren.push({
        key: 'excel',
        icon: <FileExcelOutlined />,
        label: 'Export to Excel',
        onClick: params.onExportExcel,
      });
    }
    if (params.exportCsv) {
      exportChildren.push({
        key: 'csv',
        icon: <FileTextOutlined />,
        label: 'Export to CSV',
        onClick: params.onExportCsv,
      });
    }
    items.push({
      key: 'export',
      type: 'group',
      label: 'Export',
      children: exportChildren,
    });
  }

  if (params.advancedFilters || params.fullScreen) {
    const viewChildren: NonNullable<MenuProps['items']> = [];
    if (params.advancedFilters) {
      viewChildren.push({
        key: 'filters',
        icon: <TableOutlined />,
        label: (
          <Flex
            justify="space-between"
            align="center"
            style={{ width: '100%' }}
          >
            <Text style={{ fontSize: 'inherit' }}>Advanced filters</Text>
            <Switch
              size="small"
              checked={params.showAdvancedFilters}
              onChange={(checked) => params.onAdvancedFiltersChange(checked)}
              onClick={(_, e) => e.stopPropagation()}
            />
          </Flex>
        ),
        onClick: () =>
          params.onAdvancedFiltersChange(!params.showAdvancedFilters),
      });
    }
    if (params.fullScreen) {
      viewChildren.push({
        key: 'fullscreen',
        icon: <FullscreenOutlined />,
        label: 'Toggle full screen',
        onClick: params.onFullScreen,
      });
    }
    if (items.length > 0) {
      items.push({ type: 'divider' });
    }
    items.push({
      key: 'view',
      type: 'group',
      label: 'Grid',
      children: viewChildren,
    });
  }

  return items;
}

export function SettingsMenu(props: SettingsMenuProps) {
  const {
    onExportExcel,
    onExportCsv,
    onFullScreen,
    showAdvancedFilters,
    onAdvancedFiltersChange,
    isMobile,
    exportExcel = true,
    exportCsv = true,
    advancedFilters = true,
    fullScreen = true,
  } = props;

  const { token } = theme.useToken();

  const menuItems = buildMenuItems({
    onExportExcel,
    onExportCsv,
    onFullScreen,
    showAdvancedFilters,
    onAdvancedFiltersChange,
    exportExcel,
    exportCsv,
    advancedFilters,
    fullScreen,
  });

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            // Compact rhythm so the popover doesn't feel oversized in the toolbar.
            itemHeight: 28,
            itemMarginBlock: 2,
            itemMarginInline: 0,
            itemPaddingInline: token.paddingSM,
            iconMarginInlineEnd: token.marginXS,
            groupTitleFontSize: token.fontSizeSM,
            groupTitleLineHeight: 1.4,
            fontSize: token.fontSizeSM,
          },
        },
      }}
    >
      <div style={{ width: isMobile ? '100%' : 200 }}>
        <Menu
          selectable={false}
          mode="inline"
          items={menuItems}
          style={{ border: 'none', background: 'transparent' }}
          inlineIndent={0}
        />
      </div>
    </ConfigProvider>
  );
}
