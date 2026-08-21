import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  MoreOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import {
  Button,
  Divider,
  Dropdown,
  Flex,
  Skeleton,
  Typography,
  theme,
  type MenuProps,
} from 'antd';
import { cloneElement, useState, type ReactElement } from 'react';

import { useConfirm } from '../../../../hooks';
import type { GridProfile } from '../types';
import type { ProfileBarProps } from './types';

const { Text } = Typography;

const CHIP_NAME_MAX_WIDTH = 150;

/**
 * Static — independent of theme tokens — so it's safe to hoist out of the
 * component body and reuse across renders / chips.
 */
const MENU_STYLE: React.CSSProperties = { boxShadow: 'none' };

interface ChipMenuTriggerProps {
  profile: GridProfile;
  isActive: boolean;
  onSave?: () => Promise<void> | void;
  onReset?: () => void;
  onRename?: (profile: GridProfile) => void;
  onSetDefault?: (id: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

function ChipMenuTrigger({
  profile,
  isActive,
  onSave,
  onReset,
  onRename,
  onSetDefault,
  onDelete,
}: ChipMenuTriggerProps) {
  const { token } = theme.useToken();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);

  const items: MenuProps['items'] = [];

  /**
   * Per-view editing actions (save current grid state, discard back to
   * baseline) live ONLY on the currently active chip — they operate on the
   * grid's current state, which logically belongs to the active view.
   */
  if (isActive && onSave) {
    items.push({
      key: 'save',
      icon: <CloudUploadOutlined />,
      label: 'Save changes',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setOpen(false);
        void onSave();
      },
    });
  }
  if (isActive && onReset) {
    items.push({
      key: 'reset',
      icon: <HistoryOutlined />,
      label: 'Reset to default',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setOpen(false);
        onReset();
      },
    });
  }

  // Metadata actions — split visually from the edit actions above.
  const metadataItemsStart = items.length;
  if (onRename) {
    items.push({
      key: 'rename',
      icon: <EditOutlined />,
      label: 'Rename',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setOpen(false);
        onRename(profile);
      },
    });
  }
  if (onSetDefault && !profile.isDefault) {
    items.push({
      key: 'setDefault',
      icon: <StarOutlined />,
      label: 'Set as default',
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setOpen(false);
        void onSetDefault(profile.id);
      },
    });
  }
  if (metadataItemsStart > 0 && items.length > metadataItemsStart) {
    items.splice(metadataItemsStart, 0, { type: 'divider' });
  }

  if (onDelete) {
    if (items.length > 0) {
      items.push({ type: 'divider' });
    }
    items.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setOpen(false);
        confirm.danger({
          title: 'Delete saved view?',
          content: (
            <span>
              <b>{profile.name}</b> will be permanently removed.
            </span>
          ),
          okText: 'Delete',
          onOk: () => onDelete(profile.id),
        });
      },
    });
  }

  if (items.length === 0) return null;

  /**
   * Wrap the dropdown contents in a single elevated container so the optional
   * description block and the action menu share one card (instead of the
   * description floating on a transparent background above a separate menu
   * card). This follows AntD's documented `popupRender` pattern — the menu
   * is cloned with `boxShadow: 'none'` and the outer wrapper supplies the
   * background + radius + shadow.
   *
   * Name is intentionally omitted: it's already visible on the chip itself,
   * so duplicating it inside the dropdown felt noisy.
   */
  const contentStyle: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  const renderPopup = (menu: React.ReactNode) => (
    <div style={contentStyle}>
      {profile.description && (
        <>
          <div
            style={{
              maxWidth: 280,
              padding: `${token.paddingXS}px ${token.paddingSM}px`,
              fontSize: token.fontSizeSM,
              color: token.colorTextSecondary,
              lineHeight: token.lineHeightSM,
              wordBreak: 'break-word',
            }}
          >
            {profile.description}
          </div>
          <Divider style={{ margin: 0 }} />
        </>
      )}
      {cloneElement(menu as ReactElement<{ style?: React.CSSProperties }>, {
        style: MENU_STYLE,
      })}
    </div>
  );

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      popupRender={renderPopup}
    >
      <span
        role="button"
        aria-label={`More options for ${profile.name}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: token.marginXXS,
          marginRight: -token.marginXXS,
          borderRadius: token.borderRadiusSM,
          cursor: 'pointer',
          color: isActive ? 'inherit' : token.colorTextTertiary,
          fontSize: token.fontSizeSM,
          lineHeight: 1,
        }}
      >
        <MoreOutlined />
      </span>
    </Dropdown>
  );
}

interface ProfileChipProps {
  profile: GridProfile;
  isActive: boolean;
  onSelect: (id: string) => void;
  onSave?: () => Promise<void> | void;
  onReset?: () => void;
  onRename?: (profile: GridProfile) => void;
  onSetDefault?: (id: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

function ProfileChip({
  profile,
  isActive,
  onSelect,
  onSave,
  onReset,
  onRename,
  onSetDefault,
  onDelete,
}: ProfileChipProps) {
  const { token } = theme.useToken();

  /**
   * System default view is immutable (no rename/delete/set-default). Metadata
   * actions are also hidden on system. Save changes is hidden on system since
   * there's nothing to persist server-side. We deliberately keep no menu at
   * all on the system chip — including when it's active — because Reset on
   * "already at baseline" is a no-op.
   */
  const showActions =
    !profile.isSystem &&
    Boolean(
      onRename || onSetDefault || onDelete || (isActive && (onSave || onReset))
    );

  return (
    <Button
      type={isActive ? 'primary' : 'default'}
      size="small"
      onClick={() => onSelect(profile.id)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: token.marginXXS,
        flexShrink: 0,
        fontSize: token.fontSizeSM,
        paddingInline: token.paddingXS,
      }}
    >
      {profile.isDefault && (
        <StarFilled
          style={{
            color: token.colorWarning,
            fontSize: token.fontSizeSM,
            flexShrink: 0,
          }}
        />
      )}
      <Text
        ellipsis
        style={{
          maxWidth: CHIP_NAME_MAX_WIDTH,
          color: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
        }}
      >
        {profile.name}
      </Text>
      {showActions && (
        <ChipMenuTrigger
          profile={profile}
          isActive={isActive}
          onSave={onSave}
          onReset={onReset}
          onRename={onRename}
          onSetDefault={onSetDefault}
          onDelete={onDelete}
        />
      )}
    </Button>
  );
}

export function ProfileBar({
  profiles,
  activeProfileId,
  isLoading,
  onProfileSelect,
  onProfileRenameRequest,
  onProfileSetDefault,
  onProfileDelete,
  onCreateProfileRequest,
  onProfileSaveActive,
  onProfileReset,
}: ProfileBarProps) {
  const { token } = theme.useToken();

  const labelStyle: React.CSSProperties = {
    fontSize: token.fontSizeSM,
    flexShrink: 0,
  };

  const scrollContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: token.marginXXS,
    overflowX: 'auto',
    overflowY: 'hidden',
    flex: '1 1 auto',
    minWidth: 0,
    // Thin scrollbar so the chip row stays compact across browsers.
    scrollbarWidth: 'thin',
  };

  /**
   * Trailing "Save as" button — kept outside the scroll container so it never
   * moves off-screen, making the create-view path obvious even when many
   * chips overflow horizontally. Labelled "Save as" (rather than "New view")
   * because it captures the CURRENT grid state (filters / sort / columns) and
   * persists it as a new server-side view.
   */
  const createButton = onCreateProfileRequest ? (
    <Button
      type="dashed"
      size="small"
      icon={<PlusOutlined />}
      onClick={onCreateProfileRequest}
      disabled={isLoading}
      style={{
        flexShrink: 0,
        fontSize: token.fontSizeSM,
        paddingInline: token.paddingXS,
      }}
    >
      Save as
    </Button>
  ) : null;

  if (isLoading) {
    return (
      <Flex
        gap={token.marginXXS}
        align="center"
        style={{ minWidth: 0, flex: '1 1 auto' }}
      >
        <Text type="secondary" style={labelStyle}>
          Views:
        </Text>
        <div style={scrollContainerStyle}>
          <Skeleton.Button active size="small" style={{ width: 96 }} />
          <Skeleton.Button active size="small" style={{ width: 120 }} />
        </div>
        {createButton}
      </Flex>
    );
  }

  return (
    <Flex
      gap={token.marginXXS}
      align="center"
      style={{ minWidth: 0, flex: '1 1 auto' }}
    >
      <Text type="secondary" style={labelStyle}>
        Views:
      </Text>
      <div style={scrollContainerStyle}>
        {profiles.map((profile) => (
          <ProfileChip
            key={profile.id}
            profile={profile}
            isActive={activeProfileId === profile.id}
            onSelect={onProfileSelect}
            onSave={onProfileSaveActive}
            onReset={onProfileReset}
            onRename={onProfileRenameRequest}
            onSetDefault={onProfileSetDefault}
            onDelete={onProfileDelete}
          />
        ))}
      </div>
      {createButton}
    </Flex>
  );
}
