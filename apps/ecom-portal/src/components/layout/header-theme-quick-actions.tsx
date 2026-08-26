// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { AppButton, AppSelect } from '@solverminds/shared-ui';
import { Divider, Flex, Popover, Typography, theme } from 'antd';

import { COLOR_OPTIONS, FONT_FAMILY_OPTIONS, INTER_FONT_STACK } from '../../features/theme/constants';
import { type useThemePreferencesController } from '../../features/theme/hooks/use-theme-preferences-controller';
import { AppIcon, Icons } from '../icons';

const { Text } = Typography;

interface HeaderThemeQuickActionsProps {
  onOpenFullPreferences: () => void;
  preferencesController: ReturnType<typeof useThemePreferencesController>;
}

export function HeaderThemeQuickActions({
  onOpenFullPreferences,
  preferencesController,
}: HeaderThemeQuickActionsProps) {
  const { token } = theme.useToken();
  const { currentConfig, updatePreference } = preferencesController;

  if (!currentConfig) {
    return null;
  }

  const content = (
    <Flex vertical gap={token.marginSM} style={{ width: 280 }}>
      <Flex align="center" gap={token.marginXS}>
        <AppIcon icon={Icons.palette} size={16} />
        <Text strong style={{ fontSize: token.fontSizeSM }}>Primary Color</Text>
      </Flex>
      <Flex gap={token.marginXS} wrap="wrap">
        {COLOR_OPTIONS.map((option) => {
          const isSelected = currentConfig.primaryColor === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className="app-icon-inherit primary-surface"
              aria-label={option.label}
              title={option.label}
              onClick={() => updatePreference('primaryColor', option.value)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: isSelected ? `2px solid ${token.colorTextHeading}` : '2px solid transparent',
                backgroundColor: option.value,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                boxShadow: isSelected ? `0 0 0 2px ${option.value}40` : '0 1px 3px rgba(0,0,0,0.12)',
                transition: 'transform 0.2s ease',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {isSelected ? <AppIcon icon={Icons.check} size={11} /> : null}
            </button>
          );
        })}
      </Flex>

      <Divider style={{ margin: `${token.marginXS}px 0` }} />

      <Flex align="center" gap={token.marginXS}>
        <AppIcon icon={Icons.type} size={16} />
        <Text strong style={{ fontSize: token.fontSizeSM }}>Font Family</Text>
      </Flex>
      <AppSelect
        size="middle"
        options={FONT_FAMILY_OPTIONS.map((opt) => ({
          ...opt,
          label: <span style={{ fontFamily: opt.value }}>{opt.label}</span>,
        }))}
        value={currentConfig.fontFamily}
        onChange={(value) => {
          updatePreference('fontFamily', value as typeof currentConfig.fontFamily);
          if (value === INTER_FONT_STACK) {
            updatePreference('baseFontSize', 28);
          }
        }}
      />

      <AppButton type="link" size="small" onClick={onOpenFullPreferences} style={{ padding: 0, alignSelf: 'flex-start' }}>
        All appearance settings
      </AppButton>
    </Flex>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight" arrow={false}>
      <AppButton
        type="text"
        shape="circle"
        aria-label="Quick theme settings"
        icon={<AppIcon icon={Icons.palette} size={16} />}
        style={{ color: token.colorTextSecondary }}
      />
    </Popover>
  );
}
