// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { useAntdBreakpoint } from '@solverminds/shared-ui/hooks';
import { theme } from 'antd';
import React, { useState } from 'react';

import { useThemePreferences } from '../../features/theme/providers/theme-preferences-provider';
import { AppIcon, Icons } from '../icons';
import { UserAvatar } from '../shared/user-avatar';
import { getUserFullName, getUserInitials } from '../shared/user-name.utils';
import { AccountPreferencesDrawer } from './account-preferences-drawer';

interface UserMenuProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    roleName?: string;
  };
  onLogout?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@solverminds.com',
    roleName: 'System Administrator',
  },
  onLogout,
}) => {
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const preferencesController = useThemePreferences();
  const fullName = getUserFullName(user.firstName, user.lastName);
  const roleName = user.roleName || 'Administrator';
  const initials = getUserInitials(fullName);

  const showStatusDot =
    preferencesController.saveStatus === 'dirty' ||
    preferencesController.saveStatus === 'saving' ||
    preferencesController.saveStatus === 'error';

  const statusDotColor =
    preferencesController.saveStatus === 'error'
      ? token.colorError
      : token.colorPrimary;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          preferencesController.markSessionBaseline();
          setDrawerOpen(true);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: token.marginSM,
          padding: 0,
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: token.colorText,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {!isMobile ? (
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              rowGap: token.paddingXXS,
              minWidth: 0,
              textAlign: 'right',
            }}
          >
            <span
              style={{
                fontSize: token.fontSize,
                lineHeight: 1.2,
                fontWeight: token.fontWeightStrong,
                color: token.colorText,
                whiteSpace: 'nowrap',
              }}
            >
              {fullName}
            </span>
            <span
              style={{
                fontSize: token.fontSizeSM,
                lineHeight: 1.2,
                color: token.colorTextSecondary,
                whiteSpace: 'nowrap',
              }}
            >
              {roleName}
            </span>
          </span>
        ) : null}

        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
          }}
        >
          <UserAvatar
            initials={initials}
            icon={<AppIcon icon={Icons.user} size={18} />}
            style={{ cursor: 'pointer' }}
          />
          {showStatusDot ? (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: token.paddingXS,
                height: token.paddingXS,
                borderRadius: '50%',
                background: statusDotColor,
                boxShadow: `0 0 0 2px ${token.colorBgContainer}`,
              }}
            />
          ) : null}
        </span>
      </button>

      <AccountPreferencesDrawer
        email={user.email || 'admin@solverminds.com'}
        fullName={fullName}
        onClose={() => {
          setDrawerOpen(false);
          void preferencesController.flushPendingChanges();
        }}
        onLogout={onLogout}
        open={drawerOpen}
        preferencesController={preferencesController}
        roleName={roleName}
      />
    </>
  );
};
