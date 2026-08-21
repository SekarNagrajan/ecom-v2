import {
  CalendarOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Flex, theme, Tooltip } from 'antd';
import React from 'react';

import { useAppConfig } from '../../../../hooks/use-app-config';
import { useSystemTheme } from '../../../../hooks/use-system-theme';
import type {
  CalendarEventProps,
  CalendarEvent as CalendarEventType,
} from '../calendar-types';

function toLowerCaseValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value.toLowerCase() : undefined;
}

export const CalendarEvent: React.FC<CalendarEventProps> = ({ arg }) => {
  const { token } = theme.useToken();
  const { themeMode } = useAppConfig();
  const systemTheme = useSystemTheme();

  const event = {
    ...arg.event.extendedProps,
    id: arg.event.id,
    title: arg.event.title,
  } as CalendarEventType;
  const resolvedTitle = event.title ?? event.subject ?? '';

  const normalizedPriority = toLowerCaseValue(event.priority);
  const normalizedKind = toLowerCaseValue(event.kind);
  const isMeetingVariant = event.variant === 'meeting';

  const getVariantIcon = () => {
    if (isMeetingVariant || normalizedKind === 'meeting') {
      return <VideoCameraOutlined />;
    }

    if (normalizedKind === 'task') {
      return <CheckSquareOutlined />;
    }

    if (normalizedKind === 'call') {
      return <PhoneOutlined />;
    }

    return <CalendarOutlined />;
  };

  const getColors = () => {
    if (!isMeetingVariant) {
      if (normalizedPriority === 'high') {
        return {
          border: token.colorError,
          background: token.colorErrorBg,
          icon: (
            <ExclamationCircleOutlined style={{ color: token.colorError }} />
          ),
        };
      }

      if (normalizedPriority === 'medium') {
        return {
          border: token.colorWarning,
          background: token.colorWarningBg,
          icon: <ClockCircleOutlined style={{ color: token.colorWarning }} />,
        };
      }

      if (normalizedPriority === 'low') {
        return {
          border: token.colorSuccess,
          background: token.colorSuccessBg,
          icon: <InfoCircleOutlined style={{ color: token.colorSuccess }} />,
        };
      }

      return {
        border: token.colorPrimary,
        background: token.colorPrimaryBg,
        icon: null,
      };
    }

    const isDark =
      themeMode === 'dark' || (themeMode === 'auto' && systemTheme === 'dark');

    return isDark
      ? {
          border: '#7F85F5',
          background: '#323354',
          icon: null,
        }
      : {
          border: '#6264A7',
          background: '#EBEBF2',
          icon: null,
        };
  };

  const colors = getColors();

  return (
    <Tooltip title={resolvedTitle} mouseEnterDelay={0.5}>
      <Flex
        align="center"
        gap={token.marginXXS}
        style={{
          padding: `${token.paddingXXS}px ${token.paddingXS}px`,
          borderRadius: token.borderRadiusSM,
          borderLeft: `3px solid ${colors.border}`,
          backgroundColor: colors.background,
          color: token.colorText,
          fontSize: token.fontSizeSM,
          cursor: 'pointer',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          height: '100%',
          width: '100%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <span style={{ display: 'flex', opacity: 0.7 }}>
          {getVariantIcon()}
        </span>
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 500,
          }}
        >
          {resolvedTitle}
        </div>
        {colors.icon ? (
          <span style={{ display: 'flex', fontSize: 10 }}>{colors.icon}</span>
        ) : null}
      </Flex>
    </Tooltip>
  );
};
