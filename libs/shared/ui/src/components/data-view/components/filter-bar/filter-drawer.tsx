import { DeleteOutlined } from '@ant-design/icons';
import { Flex, Typography, theme } from 'antd';

import { useAntdBreakpoint } from '../../../../hooks';
import { AppButton } from '../../../ui/button';
import { AppDrawer } from '../../../ui/dialog';
import {
  useDraftFilters,
  useDraftSorts,
  useDataViewActions,
} from '../../context/data-view-context';
import { FilterSection } from './filter-section';
import { SortSection } from './sort-section';

const { Text, Title } = Typography;

export interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function FilterDrawer({ open, onClose }: FilterDrawerProps) {
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();

  const draftFilters = useDraftFilters();
  const draftSorts = useDraftSorts();
  const actions = useDataViewActions();

  const handleApply = () => {
    actions.applyDrafts();
    onClose();
  };

  const handleClearAll = () => {
    actions.clearAllAndApply();
    onClose();
  };

  const totalDraftCount = draftFilters.length + draftSorts.length;

  return (
    <AppDrawer
      title={
        <Flex vertical gap={token.marginXXS}>
          <Title level={5} style={{ margin: 0 }}>
            View Options
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, fontWeight: 'normal' }}
          >
            Configure how your data is displayed
          </Text>
        </Flex>
      }
      dialogSize="md"
      open={open}
      destroyOnHidden
      onClose={onClose}
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          background: token.colorBgLayout,
        },
        footer: {
          padding: 0,
        },
      }}
      footer={
        <Flex
          gap={token.paddingXS}
          justify="space-between"
          wrap="wrap"
          align="center"
          style={{
            padding: token.padding,
            background: token.colorBgContainer,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <AppButton
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
            danger
            type="text"
            disabled={totalDraftCount === 0}
            title={isMobile ? 'Clear all' : undefined}
          >
            {isMobile ? null : 'Clear All'}
          </AppButton>
          <Flex gap={token.paddingXS} wrap="wrap" justify="flex-end">
            <AppButton danger onClick={onClose}>
              Cancel
            </AppButton>
            <AppButton type="primary" onClick={handleApply}>
              Apply {totalDraftCount > 0 ? `(${totalDraftCount})` : ''}
            </AppButton>
          </Flex>
        </Flex>
      }
    >
      <Flex vertical style={{ height: '100%', overflowY: 'auto' }}>
        <SortSection />
        <FilterSection />
      </Flex>
    </AppDrawer>
  );
}
